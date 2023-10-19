import './App.css';
import AppLayout from './components/AppLayout.js';
import {ApolloProvider} from '@apollo/client';
import {apolloClient} from "./client/apollo";

function App() {
    console.log(process.env)
    return (
        <div className="App">
            <ApolloProvider client={apolloClient}>
                <AppLayout/>
            </ApolloProvider>
        </div>
    );
}

export default App;
