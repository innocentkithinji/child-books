import {ApolloClient, InMemoryCache, makeVar} from "@apollo/client";


export const token = makeVar({});

export const apolloClient = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URL,
    cache: new InMemoryCache()
});


