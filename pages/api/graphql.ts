import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '../../graphql/schemas';
import { resolvers } from '../../graphql/resolvers';
import { connectMongoose } from '../../mongoose/mongoose-connection';

// Connect to MongoDB
connectMongoose();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { req };
  },
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  },
});

const startServer = apolloServer.start();

export default async function handler(req: any, res: any) {
  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
