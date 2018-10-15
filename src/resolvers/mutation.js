/**
 * @file mutation
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

// Do not expose mutations on deployed server.

/**
 * GraphQL resolver for createBlock mutation.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the mutation.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the mutation.
 * @return {Object} The scalar/object resolver result.
 */
// function createBlock(parent, args, context, info) {
//   return context.db.mutation.createBlock({
//     data: {
//       height: args.height,
//       timestamp: args.timestamp
//     }
//   }, info);
// }

/**
 * GraphQL resolver for createTransaction mutation.
 * @param {Object} parent The result object of the parent resolver.
 * @param {Object} args The parameters for the mutation.
 * @param {Object} context Object shared by all resolvers that gets passed through resolver chain.
 * @param {Object} info An AST representation of the mutation.
 * @return {Object} The scalar/object resolver result.
 */
// function createTransaction(parent, args, context, info) {
//   return context.db.mutation.createTransaction({
//     data: {
//       hash: args.hash,
//       amount: args.amount,
//       block: { connect: { id: args.blockId} }
//     }
//   }, info);
// }

// module.exports = {
//   createBlock,
//   createTransaction
// };
