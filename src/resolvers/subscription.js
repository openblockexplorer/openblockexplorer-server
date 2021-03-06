/**
 * @file subscription
 * @copyright Copyright (c) 2018-2019 Dylan Miller and openblockexplorer contributors
 * @license MIT License
 */

/**
 * GraphQL resolver for block subscription.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the subscription.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the subscription.
 * @return {Object} The scalar/object resolver result.
 */
function blockSubscribe(parent, args, context, info) {
  return context.db.subscription.block(
    { where: { mutation_in: ['CREATED'] } },
    info
  );
}
const block = { subscribe: blockSubscribe };

/**
 * GraphQL resolver for transaction subscription.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the subscription.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the subscription.
 * @return {Object} The scalar/object resolver result.
 */
function transactionSubscribe(parent, args, context, info) {
  return context.db.subscription.transaction(
    { where: { mutation_in: ['CREATED'] } },
    info
  );
}
const transaction = { subscribe: transactionSubscribe };

/**
 * GraphQL resolver for network stats subscription.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the subscription.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the subscription.
 * @return {Object} The scalar/object resolver result.
 */
function networkStatsSubscribe(parent, args, context, info) {
  return context.db.subscription.networkStats(
    { where: { mutation_in: ['UPDATED'] },
      node: { duration: 'MINUTES_10' }
    },
    info
  );
}
const networkStats = { subscribe: networkStatsSubscribe };

/**
 * GraphQL resolver for price subscription.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the subscription.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the subscription.
 * @return {Object} The scalar/object resolver result.
 */
function priceSubscribe(parent, args, context, info) {
  return context.db.subscription.price(
    { where: { mutation_in: ['UPDATED'] },
      node: { currency: 'DFN' }
    },
    info
  );
}
const price = { subscribe: priceSubscribe };

module.exports = {
   block,
   transaction,
   networkStats,
   price
};
