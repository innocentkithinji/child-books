import React from 'react';
import GoogleFontLoader from "react-google-font-loader";
import './css/content.css';

const PageContent = ({token, full_content, onClick}) => {
    return <div style={{flex: '1 1 auto', width: "100%"}}>
        <GoogleFontLoader
            fonts={[
                {
                    font: 'Young Serif',
                    weights: [300, 400, 500, 700],
                },
                {
                    font: 'Open Sans',
                    weights: [400, 700],
                },
                // Add more fonts as needed
            ]}
        />
        <button className="textButton" onClick={() => onClick(token)}>
            {full_content.slice(token.position[0], token.position[1] + 1)}
        </button>
    </div>
    // );
};

export default PageContent;
