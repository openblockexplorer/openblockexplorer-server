/**
 * @file NetworkStatisticsAgent
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * Agent that adds network statistics information to the Prisma server for every block.
 */
module.exports = class NetworkStatisticsAgent {
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

      // Add a new network statistics object to the Prisma server.
      if (this.blocks.length >= 2) {
        const numBlocks = this.blocks[this.blocks.length-1].height - this.blocks[0].height;
        const seconds = (this.blocks[this.blocks.length-1].timestamp - this.blocks[0].timestamp) / 1000;
        const networkStatistics = {
          secondsPerBlock: seconds / numBlocks,
          transactionsPerSecond: this.numTransactions / seconds,
          block: { connect: { height: block.height} }
        };
        this.prisma.mutation
          .createNetworkStatistics({ data: networkStatistics }, '{ secondsPerBlock }');
      }
    }
    while (!result.done);
  }
};
