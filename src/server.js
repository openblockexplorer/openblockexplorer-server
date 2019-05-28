/**
 * @file server
 * @copyright Copyright (c) 2018-2019 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const BlockProducer = require('./BlockProducer');
const NetworkStatsAgent = require('./NetworkStatsAgent');
const PriceAgent = require('./PriceAgent');
const Query = require('./resolvers/query');
// Do not expose mutations on deployed server.
// const Mutation = require('./resolvers/mutation');
const Subscription = require('./resolvers/subscription');
const Block = require('./resolvers/Block');
const SearchGetTypeResult = require('./resolvers/SearchGetTypeResult');
const SearchAutoCompleteResult = require('./resolvers/SearchAutoCompleteResult');

const resolvers = {
  Query,
  // Do not expose mutations on deployed server.
  // Mutation,
  Subscription,
  Block,
  SearchGetTypeResult,
  SearchAutoCompleteResult
};

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  //endpoint: 'https://dfinity-explorer-p-54a68e4bba.herokuapp.com/dfinity-explorer-service-a/dev',
  endpoint: 'https://prisma.dfinityexplorer.org/prisma-service/dev',
  secret: process.env.PRISMA_SECRET,
  // Setting debug to true means that all requests made by Prisma binding instance to Prisma
  // API will be logged to the console. Set to false for production.
  debug: false
});

// --- Notes on application server ---
// To view the application server's most recent logs:
//  $ heroku logs
//
// To view 1500 lines of logs:
//  $ heroku logs -n 1500
//
// To display recent logs and leave the session open for real-time logs to stream in:
//  $ heroku logs --tail
//
// --- Notes on Prisma service ---
// To deploy Prisma service changes after changing datamodel.prisma, run:
//  $ prisma deploy
//
// To deploy a new Prisma service if there are problems using prisma deploy, run:
//  $ prisma deploy -n
//
// To check Prisma server errors, open an SSH bash session into the Heroku container:
//  $ heroku run bash -a dfinity-explorer-p-54a68e4bba
//
// To restart the Prisma server dyno:
//  $ heroku restart -a dfinity-explorer-p-54a68e4bba
//
// To upgrade the Prisma CLI version:
//  $ npm i -g prisma
//
// To upgrade the Prisma server version:
//  https://github.com/prisma/prisma-cloud-feedback/issues/202
//
// --- Notes on using GraphQL Playground with Prisma server ---
// The easiest way to obtain an API token is by using the prisma token command from the Prisma CLI:
//  $ prisma token
// Next, open the Prisma server URL in a browser:
//  https://dfinity-explorer-p-54a68e4bba.herokuapp.com/dfinity-explorer-service-a/dev
// Put this into the HTTP HEADERS field of GraphQL Playground:
//  {
//    "Authorization": "Bearer [token]"
//  }
// For more details, see:
//  https://www.prisma.io/docs/reference/prisma-api/concepts-utee3eiquo#authentication
//
// --- Notes on using GraphQL Playground to delete blocks and transactions ---
// mutation {
//   deleteManyTransactions(where: { block: { height_lt: 1600000 } }) {
//     count
//   }
// }
// mutation {
//   deleteManyBlocks(where: { height_lt: 1600000 }) {
//     count
//   }
// }

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

// Continuously update network stats information on the Prisma server.
const networkStatsAgent = new NetworkStatsAgent(prisma);
networkStatsAgent.start();

// Continuously update DFN price information on the Prisma server.
const priceAgent = new PriceAgent(prisma);
priceAgent.start();
