"use strict";

var http = require("http");
var util = require("util");

/** chargement module routage*/
var fnRoute = require("./router.js").route;

/**
 * Demarre le serveur http sur le port demandé
 * param1 port
 */ 
function start(port) {
    /** 
     *  listener sur demande d'url au serveur 
     *  qui route l'url demandée
     */
    function onRequest(request, response) {
        console.log ("onRequest ");
        /** routage demande */
       logger.log("request: ", util.inspect(request));        
	   fnRoute(request,response);  
     }
     
    /** creation serveur à l'ecoute sur port 80(linux) ou 8889(windows) ou port */
    http.createServer(onRequest).listen(port);
    console.log("Démarrage du serveur, port " , port);
}

exports.start = start;
