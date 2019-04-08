/**
 * @file NetworkStatsAgent
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * Agent that continuously updates network stats information on the Prisma server.
 */
module.exports = class NetworkStatsAgent {
  /**
   * Create a NetworkStatsAgent object.
   * @param {Object} The Prisma binding object.
   * @constructor
   */
  constructor(prisma) {
    // The Prisma binding object.
    this.prisma = prisma;

    this.blocks = [];
    this.numTransactions = 0;
    this.dailyNetworkStats = {
      date: this.getCurrentUTCDate(),
      numBlocks: 0,
      numTransactions: 0
    };
  }

  /**
   * Start updating network stats.
   * @public
   */
  start() {
    const selectionSet = `{
      node {
        height
        timestamp
        transactions {
          id
        }
      }
    }`;
    
    // If an error occurs, we simply log it, since we want the NetworkStatsAgent to keep running.
    this.prisma.subscription
      .block({ where: { mutation_in: ['CREATED'] } }, selectionSet)
      .then(subscription => this.subscriptionHandler(subscription))
      .catch(error => console.log(error));
  }

  /**
   * Handler for the block subscription, which adds a network stats object to the Prisma server for
   * every block.
   * @param {Object} subscription The subscription object.
   * @private
   */
  async subscriptionHandler(subscription) {
    let result;
    do {
      // Get next subscription result (IteratorResult<BlockSubscriptionPayload>).
      result = await subscription.next();

      // Add a block object for this block to the blocks[] array.
      const {node} = result.value.block;
      const block = {
        height: node.height,
        timestamp: new Date(node.timestamp),
        numTransactions: node.transactions.length
      };
      this.blocks.push(block);

      // Update the number of transactions in all blocks[].
      this.numTransactions += block.numTransactions;

      // Remove blocks that have expired. The expiration is currently set to 10 minutes, so we
      // calculate network stats based on the past 10 minutes. We do this so that the stats will
      // reflect recent network activity, rather than being averaged across several hours.
      const expireInOne10MinutesMs = 600000;
      const expiredDate = new Date(block.timestamp.getTime() - expireInOne10MinutesMs);
      while (this.blocks[0].timestamp < expiredDate) {
        this.numTransactions -= this.blocks[0].numTransactions;
        this.blocks.shift();
      }

      // Add a new network stats object to the Prisma server.
      if (this.blocks.length >= 2) {
        const numBlocks = this.blocks[this.blocks.length-1].height - this.blocks[0].height;
        const seconds = (this.blocks[this.blocks.length-1].timestamp - this.blocks[0].timestamp) / 1000;
        const networkStats = {
          duration: 'MINUTES_10',
          secondsPerBlock: seconds / numBlocks,
          transactionsPerSecond: this.numTransactions / seconds
        };
        // Use update instead of upsert, since subscription does not trigger on upsert. Seems
        // like the following issue, which was supposedly resolved:
        // https://github.com/prisma/prisma/issues/2532
        this.prisma.mutation
          // .upsertNetworkStats(
          //   {
          //     where: { duration: 'MINUTES_10' },
          //     create: networkStats,
          //     update: networkStats
          //   },
          //   '{ duration }'
          // )
          .updateNetworkStats(
            {
              where: { duration: 'MINUTES_10' },
              data: networkStats
            },
            '{ duration }'
          )
          .catch(error => console.log(error));
      }

      // Create/update the daily network stats object on the Prisma server.
      const date = this.getCurrentUTCDate();
      if (date.getTime() !== this.dailyNetworkStats.date.getTime()) {
        // We should overwrite this.dailyNetworkStats.date record with recalculated data from the past 24 hours, since blocks seem to be missed!!!
        this.dailyNetworkStats.date = date;
        this.dailyNetworkStats.numBlocks = 0;
        this.dailyNetworkStats.numTransactions = 0;
      }
      this.dailyNetworkStats.numBlocks++;
      this.dailyNetworkStats.numTransactions += block.numTransactions;
      this.prisma.mutation
        .upsertDailyNetworkStats(
          {
            where: { date: this.dailyNetworkStats.date },
            create: this.dailyNetworkStats,
            update: this.dailyNetworkStats
          },
          '{ date }'
        )
        .catch(error => console.log(error));
    }
    while (!result.done);
  }

  /**
   * Returns the current UTC date with a time of 00:00:00.000 (midnight).
   * @return {Object} the current UTC date with a time of 00:00:00.000 (midnight).
   * @private
   */
  getCurrentUTCDate() {
    const date = new Date();
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
};
