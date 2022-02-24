import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "./index.css";

console.log(`
#####      ##     #####    ######   #####    ######   ######   ######  
##  ##    ####    ##  ##   ##       ##  ##   ##       ##       ##      
##  ##   ##  ##   ##  ##   ##       ##  ##   ##       ##       ##      
#####    ######   #####    ####     #####    ####     ####     ####    
####     ##  ##   ####     ##       ##  ##   ##       ##       ##      
## ##    ##  ##   ## ##    ##       ##  ##   ##       ##       ##      
##  ##   ##  ##   ##  ##   ######   #####    ######   ######   ##     

drrobot409@gmail.com\n\nhttps://github.com/RAREBEEF\n\nhttps://velog.io/@drrobot409
`);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
