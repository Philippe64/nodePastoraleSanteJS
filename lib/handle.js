"use strict";

// gestionaire des appels 
var requestHandlers = require("./requestHandlers");

// definition des gestionnaires de traitement
var handle = {
    "\/"						: requestHandlers.handleRequest						
    ,"\/favicon.ico"			: requestHandlers.ico
}

module.exports = handle;
