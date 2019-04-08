/**
 * @file NetworkStatisticsAgent
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * Agent that adds network statistics information to the Prisma server for every block.
 */
module.exports = class NetworkStatisticsAgent { // Rename to NetworkStatsAgent!!!
  /**
   * Create a NetworkStatisticsAgent object.
   * @param {Object} The Prisma binding object.
   * @constructor
   */
  constructor(prisma) {
    // The Prisma binding object.
    this.prisma = prisma;

    this.blocks = [];
    this.numTransactions = 0;
    this.dailyNetworkStatistics = {
      date: this.getCurrentUTCDate(),
      numBlocks: 0,
      numTransactions: 0
    };
  }

  /**
   * Start adding network statistics.
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
    
    // If an error occurs, we simply log it, since we want the NetworkStatisticsAgent to keep
    // running.
    this.prisma.subscription
      .block({ where: { mutation_in: ['CREATED'] } }, selectionSet)
      .then(subscription => this.subscriptionHandler(subscription))
      .catch(error => console.log(error));
  }

  /**
   * Handler for the block subscription, which adds a network statistics object to the Prisma server
   * for every block.
   * @param {Object} subscription The subscription object.
   * @private
   */
  async subscriptionHandler(subscription) {
    let result;
    do {
      // Get next subscription result (IteratorResult<NetworkStatisticsSubscriptionPayload>).
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
      // calculate network statistics based on the past 10 minutes. We do this so that the
      // statistics will reflect recent network activity, rather than being averaged across several
      // hours.
      const expireInOne10MinutesMs = 600000;
      const expiredDate = new Date(block.timestamp.getTime() - expireInOne10MinutesMs);
      while (this.blocks[0].timestamp < expiredDate) {
        this.numTransactions -= this.blocks[0].numTransactions;
        this.blocks.shift();
      }

      // Add a new network statistics object to the Prisma server. If an error occurs, we simply log
      // it, since we want the NetworkStatisticsAgent to keep running.
      if (this.blocks.length >= 2) {
        const numBlocks = this.blocks[this.blocks.length-1].height - this.blocks[0].height;
        const seconds = (this.blocks[this.blocks.length-1].timestamp - this.blocks[0].timestamp) / 1000;
        const networkStatistics = {
          secondsPerBlock: seconds / numBlocks,
          transactionsPerSecond: this.numTransactions / seconds,
          block: { connect: { height: block.height} }
        };
        // It's overkill to create a new object for every block. We should change this to a single "current" or "10minutes" object!!!
        // The same goes for price data, no need to create so many objects, just have one single object and update it!!!
        // Change the subscriptions to key off of update instead of creation!!!
        //!!!this.prisma.mutation
        //!!!  .createNetworkStatistics({ data: networkStatistics }, '{ secondsPerBlock }');
        //!!!  .catch(error => console.log(error));
      }

      // Create/update the daily network statistics object on the Prisma server. If an error occurs,
      // we simply log it, since we want the NetworkStatisticsAgent to keep running.
      const date = this.getCurrentUTCDate();
      if (date.getTime() !== this.dailyNetworkStatistics.date.getTime()) {
        // We should overwrite this.dailyNetworkStatistics.date record with recalculated data from the past 24 hours, in case any blocks were missed!!!
        // It actually does seem like blocks are sometimes missed!!!
        this.dailyNetworkStatistics.date = date;
        this.dailyNetworkStatistics.numBlocks = 0;
        this.dailyNetworkStatistics.numTransactions = 0;
      }
      this.dailyNetworkStatistics.numBlocks++;
      this.dailyNetworkStatistics.numTransactions += block.numTransactions;
      this.prisma.mutation
        .upsertDailyNetworkStatistics(
          {
            where: { date: this.dailyNetworkStatistics.date },
            create: this.dailyNetworkStatistics,
            update: this.dailyNetworkStatistics
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
