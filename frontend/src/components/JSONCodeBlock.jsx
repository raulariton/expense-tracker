import React from 'react';
import { CopyBlock } from "react-code-blocks";
import '../styles/JSONCodeBlock.css';

const JSONCodeBlock = ({ jsonData }) => {
  return (
    <div className="code-block">
      <CopyBlock
      language={"json"}
      text={JSON.stringify(jsonData, null, 2)}
      codeBlock={true}
      customStyle={{
          flex: '1',
          width: "100%",
          height: "100%",
      }}
      />
    </div>
  );
};

export default JSONCodeBlock;