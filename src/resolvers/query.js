/**
 * @file query
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

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
 * GraphQL resolver for block query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function block(parent, args, context, info) {
  return context.db.query.block({ where: { id: args.id } }, info);
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
  return context.db.query.transaction({ where: { id: args.id } }, info);
}

module.exports = {
  blocks,
  block,
  transactions,
  transaction
};
