"use strict";

// gestionaire des appels 
var requestHandlers = require("./requestHandlers");

// definition des gestionnaires de traitement
var handle = {
    "\/"						: requestHandlers.pastorale_sante						
    ,"\/favicon.ico"			: requestHandlers.ico
}

module.exports = handle;
