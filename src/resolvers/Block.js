/**
 * @file Block
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * GraphQL resolver for Block.numTransactions.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar or object resolver result.
 */
async function numTransactions(parent, args, context, info) {
  // Get transactions count.
  const transactionsConnection = await context.db.query.transactionsConnection(
    { where: { block: { id: parent.id } } },
    '{ aggregate { count } }'
  );
  return transactionsConnection.aggregate.count;
}

module.exports = {
  numTransactions
};