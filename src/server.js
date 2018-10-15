/**
 * @file server
 * @copyright Copyright (c) 2018 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const BlockProducer = require('./BlockProducer');
const Query = require('./resolvers/query');
// Do not expose mutations on deployed server.
// const Mutation = require('./resolvers/mutation');
const Subscription = require('./resolvers/subscription');
const Block = require('./resolvers/Block');

const resolvers = {
  Query,
  // Do not expose mutations on deployed server.
  // Mutation,
  Subscription,
  Block
};

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'https://dfinity-explorer.herokuapp.com/dfinity-explorer/dev',
  secret: process.env.PRISMA_SECRET,
  // Setting debug to true means that all requests made by Prisma binding instance to Prisma
  // API will be logged to the console. Set to false for production.
  debug: false
});

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  },
  context: req => ({
    ...req,
    db: prisma,
  })
});

server.start(() => console.log('The server is running on port 4000...'));

// Add simulated blocks to the Prisma server at 3.5 second intervals.
const blockProducer = new BlockProducer(prisma);
blockProducer.start();
