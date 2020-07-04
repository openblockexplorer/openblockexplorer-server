/**
 * @file SearchAutoCompleteResult
 * @copyright Copyright (c) 2018 Dylan Miller and openblockexplorer contributors
 * @license MIT License
 */

/**
 * GraphQL resolver for SearchAutoCompleteResult.items.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the query.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the query.
 * @return {Object} The scalar or object resolver result.
 */
async function items(parent, args, context, info) {
  if (parent.length) {
    if (parent[0].hash) {
      // Return an array of the transaction hashes.
      return parent.map(transaction => "0x" + transaction.hash);
    }
    else if (parent[0].height) {
      // Return an array of the block heights.
      return parent.map(block => block.height.toString());
    }
  }
  return [];
}

module.exports = {
  items
};