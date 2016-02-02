"use strict";

var http = require("http");
var url = require("url");

function start(fnRoute, handle, port) {
    /** * listener sur demande d'url au serveur */ 
    /**   qui route l'url recue */
  function onRequest(request, response) {
    var uri = url.parse(request.url).pathname;
    logger.log("Requête reçue pour le chemin " + uri + "  from request.url : " + request.url);
    /** routage demande */
	fnRoute(handle, uri, response, request, port);  
  }
  /** creation serveur à l'ecoute sur port 80(linux) ou 8889(windows) via nginx qui route vers  port 7777 */
  http.createServer(onRequest).listen(7777);
  console.log("Démarrage du serveur, port " , port);
}

exports.start = start;
