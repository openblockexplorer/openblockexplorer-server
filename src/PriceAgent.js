/**
 * @file PriceAgent
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const axios = require('axios');

/**
 * Agent that continuously updates DFN price information on the Prisma server.
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
    setInterval(() => { this.updatePrice() }, this.intervalTimeMs);
  }

  /**
   * Update the price object on the Prisma server.
   * @private
   */
  updatePrice() {
    // Until the DFINITY network launches, use the ETH price divided by 30 as a simulated DFN price.
    // If an error occurs, we simply log it, since we want the agent to keep running.
    const url =
      `https://api.nomics.com/v1/markets/prices?key=${process.env.NOMICS_API_KEY}&currency=ETH`;
    axios.get(url)
      .then(res => {
        const binance = res.data.find(obj => {
          return obj.exchange === 'binance'
        });
        if (binance != undefined) {
          // Create/update the price object on the Prisma server. If an error occurs, we simply log
          // it, since we want the PriceAgent to keep running.
          const dfnPrice = parseFloat(binance.price) / 30;
          const price = {
            currency: 'DFN',
            price: dfnPrice
          };
          // Use update instead of upsert, since subscription does not trigger on upsert. Seems
          // like the following issue, which was supposedly resolved:
          // https://github.com/prisma/prisma/issues/2532
          this.prisma.mutation
            // .upsertPrice(
            //   {
            //     where: { currency: 'DFN' },
            //     create: price,
            //     update: price
            //   },
            //   '{ currency }'
            // )
            .updatePrice(
              {
                where: { currency: 'DFN' },
                data: price
              },
              '{ currency }'
            )
            .catch(error => console.log(error));
        }
        else
          console.log("Exchange data not found.");
      })
      .catch(error => console.log(error));
  }
};
