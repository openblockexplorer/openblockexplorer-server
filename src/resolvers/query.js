/**
 * @file query
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const axios = require('axios');

/**
 * GraphQL resolver for blocks query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function blocks(parent, args, context, info) {
  return context.db.query.blocks({ first: args.first, orderBy: args.orderBy }, info);
}

/**
 * GraphQL resolver for blocksConnection query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function blocksConnection(parent, args, context, info) {
  return context.db.query.blocksConnection(args, info);
}

/**
 * GraphQL resolver for block query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function block(parent, args, context, info) {
  return context.db.query.block({ where: { height: args.height } }, info);
}

/**
 * GraphQL resolver for transactions query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function transactions(parent, args, context, info) {
  return context.db.query.transactions({ first: args.first, orderBy: args.orderBy }, info);
}

/**
 * GraphQL resolver for transaction query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function transaction(parent, args, context, info) {
  return context.db.query.transaction({ where: { hash: args.hash.slice(2) } }, info);
}

/**
 * GraphQL resolver for searchGetType query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function searchGetType(parent, args, context, info) {
  // Pass the query string to the resolver for SearchGetTypeResult.type.
  return args.query;
}

/**
 * GraphQL resolver for searchAutoComplete query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function searchAutoComplete(parent, args, context, info) {
  // TODO: move repeated code to get the type of a search query into a common function.
  if (args.query.startsWith("0x")) {
    return context.db.query.transactions(
      { where: { hash_starts_with: args.query.slice(2) },
        first: args.first,
        orderBy: 'hash_ASC'
      },
      '{ hash }'
    );
  }
  else if (Number.isInteger(Number(args.query))) {
    const height = args.query;
    const heightLow = height * 10;
    const heightHigh = heightLow + 9;
    return context.db.query.blocks(
      { where: { height_gte: heightLow, height_lte: heightHigh },
        first: args.first,
        orderBy: 'height_ASC'
      },
      '{ height }'
    );
  }
  else
    return [];
}

/**
 * GraphQL resolver for daily network stats query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function dailyNetworkStatses(parent, args, context, info) {
  return context.db.query.dailyNetworkStatses(
    { last: args.last, skip: args.skip, orderBy: args.orderBy }, info);
}

/**
 * GraphQL resolver for network stats query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function networkStats(parent, args, context, info) {
  return context.db.query.networkStats({ where: { duration: 'MINUTES_10' } }, info);
}

/**
 * GraphQL resolver for price query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function price(parent, args, context, info) {
  return context.db.query.price({ where: { currency: 'DFN' } }, info);
}

/**
 * GraphQL resolver for candles query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
async function candles(parent, args, context, info) {
  // Until the DFINITY network launches, use the ETH price divided by 15 as a simulated DFN price.
  const startDate = new Date(args.start);
  const endDate = new Date(args.end);
  const url =
    `https://api.nomics.com/v1/candles?key=${process.env.NOMICS_API_KEY}&interval=1d&currency=ETH&start=${dateToRfc3339(startDate)}&end=${dateToRfc3339(endDate)}`;
  const candles = await axios.get(url)
    .then(res => {
      const candles = res.data.map((candle) => {
        return {
          timestamp: new Date(candle.timestamp),
          open: parseFloat(candle.open) / 15,
          high: parseFloat(candle.high) / 15,
          low: parseFloat(candle.low) / 15,
          close: parseFloat(candle.close) / 15,
          volume: parseFloat(candle.volume)
        };
      });
      return candles;
    });
    // Do not catch errors, let them propagate to the client.
  return candles;
}

/**
 * Return a string for the date in RFC 3339 (URI escaped) format.
 * @param {Object} date The date to create the string for.
 * @return {String} A string for the date in RFC 3339 (URI escaped) format.
 * @private
 */
function dateToRfc3339(date) {
  // Use toISOString(), removing the fraction of seconds (i.e, after decimal point).
  const isoNoFraction = date.toISOString().split('.')[0] + 'Z'

  // Escape all ':' characters.
  return isoNoFraction.replace(/:/g, '%3A');
}

module.exports = {
  blocks,
  blocksConnection,
  block,
  transactions,
  transaction,
  searchGetType,
  searchAutoComplete,
  dailyNetworkStatses,
  networkStats,
  price,
  candles
};
