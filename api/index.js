import 'colors';
import { ApolloServer } from 'apollo-server';
import { typeDefs } from './src/schema.js';
import { resolvers } from './src/resolvers.js';


const API_PORT = process.env.API_PORT

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen({port: API_PORT  || 4000})
    .then(({ url }) => {
        console.log(`🚀  Server ready at: `.green + `${url}`.yellow);
        console.log(
            '🚀  Query at: '.magenta + 'https://studio.apollographql.com/sandbox/explorer'.yellow
        )
    })
    .catch((err) => {
        console.log(`${err}`.red);
    }); 