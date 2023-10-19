// import {useReactiveVar} from "@apollo/client";
import {token} from "../client/apollo";


const Token = () => {
    const currentToken = token();
    return (
        <div style={{justifyContent: "center", alignContent: "center", flex: '1 1 auto'}}>
            <div style={{position: "relative", top: "50%"}}>
                {currentToken ? <div>
                    <h1>Token Details:</h1>
                    <h2>Value: <span>{currentToken.value}</span></h2>
                    <h2>Position: ({currentToken.position[0]}, {currentToken.position[1]})</h2>
                </div> : null}
            </div>
        </div>
    );
}


export default Token;