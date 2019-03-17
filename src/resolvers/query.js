/**
 * @file query
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
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
 * GraphQL resolver for price query.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar/object resolver result.
 */
function price(parent, args, context, info) {
  return context.db.query.prices({ first: 1 }, info)[0];
}

module.exports = {
  blocks,
  block,
  transactions,
  transaction,
  searchGetType,
  searchAutoComplete,
  price
};
