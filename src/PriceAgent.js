/**
 * @file PriceAgent
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const axios = require('axios');

/**
 * Agent that adds DFN price information to the Prisma server at regular intervals.
 */
module.exports = class PriceAgent {
  /**
   * Create a PriceAgent object.
   * @param {Object} The Prisma binding object.
   * @constructor
   */
  constructor(prisma) {
    // The Prisma binding object.
    this.prisma = prisma;

    // The frequency at which to add price information.
    this.intervalTimeMs = 10000;
  }

  /**
   * Start adding price information.
   * @public
   */
  start() {
    // Add new price information using intervals.
    setInterval(() => { this.addPrice() }, this.intervalTimeMs);
  }

  /**
   * Add a new price to the Prisma server.
   * @private
   */
  addPrice() {
    // Until the DFINITY network launches, use the ETH price divided by 15 as a simulated DFN price.
    // If an error occurs, we simply log it, since we want the agent to keep running.
    const url =
      `https://api.nomics.com/v1/markets/prices?key=${process.env.NOMICS_API_KEY}&currency=ETH`;
    axios.get(url)
      .then(res => {
        const binance = res.data.find(obj => {
          return obj.exchange === 'binance'
        });
        if (binance != undefined) {
          const dfnPrice = parseFloat(binance.price) / 15;
          const price = {
            timestamp: binance.timestamp,
            price: dfnPrice
          };
          this.prisma.mutation
            .createPrice({ data: price }, '{ id }');
        }
        else
          console.log("Exchange data not found.");
      })
      .catch(error => {
        // Just log the error.
        console.log(error);
      });
  }
};
