/**
 * @file SearchGetTypeResult
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * GraphQL resolver for SearchGetTypeResult.type.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar or object resolver result.
 */
async function type(parent, args, context, info) {
  const query = parent;
  // In the future, we might need to perform queries on the database in order to determine the type.
  if (query.startsWith("0x"))
    return 'Transaction';
  else if (Number.isInteger(Number(query)))
    return 'Block';
  else
    return '';
}

module.exports = {
  type
};