"use strict";
/** 
 * route vers le module concerné en fonction de l'url
 * recherche appliName dans le hostName et l'url
 * on peut utiliser aplliName.hostName:port/ ou hostname:port/appli/ ou hostname:port/
 * cas des appels sur le même serveur avec des nom d'applis different (dev, test, prod)  nsi.cia-it.net:7777/ 
 *  ou cia-it.net:7777/nsi/ 
 * Utilisation du module handle pour connaitre le module à appeler en fonction de l'url , nettoyé eventuellement de l'appliName
 * et extraction de pathName
 */
function route(request,response) {
	
	
    var url = require("url");
    var util = require("util");
    
    var handle = require("./handle");
    
    // attention !!
    //request.url ne donne que la partie droite de l'uri
    // request host donne la partie gauche 
    // uri = somme des deux 
    // cependant attention 
    //console.log("request", util.inspect(request));
    var uri = request.url;
    logger.log("request.url : " ,uri);
    var fulluri = "http://" + request.headers.host + uri;
    logger.log("Router Début du traitement de l'URL " + fulluri);
    var uriParsed = url.parse(fulluri);
    //console.log("uriParsed ", util.inspect(uriParsed));
    
    
    var port        = uriParsed.port;
    var d_s      = uriParsed.hostname.split(".");
    var dsl = d_s.length
    var domain      = "";
    var subdomain   = "";
    var ipNum = false;
    if (dsl <= 2){
        // toto.com ou localhost
        domain = uriParsed.hostname;        
    }
    // ip adresse
    else if(dsl == 4){
        for (var i=0; i<d_s.length;i++){
            if (!isNaN(parseInt(d_s[i]))) {
                ipNum = true;
            }
            else {
               break;
            }
        }
        if(ipNum){
            domain = uriParsed.hostname;  
        }
    }
    else if (dsl > 2 && !ipNum ){
        domain    = d_s[dsl-2]+"."+d_s[dsl-1];
        
        for (var i=0; i<d_s.length-2;i++){
            subdomain += d_s[i];
            if (i<d_s.length-3){
                subdomain+= ".";
            }
        }       
    }
    
   logger.log("domain : ", domain, "  subdomain : ", subdomain);
    
    var appliName = "";
    var subdomains = subdomain.split(".");
    if(subdomains[subdomains.length-1]  == "www"){
        appliName = subdomains[subdomains.length-2];
    }else{
        appliName = subdomains[subdomains.length-1];
    }
    // check if this subdomain est un bien le nom de l'appli
    // cas de plusieurs Appli utilisant le m^me serveur
    if (appliName.toLowerCase() != Application["nomApplication"].toLowerCase()){
            appliName = "";
    }
    console.log ("appliName" , appliName);
    var pathName = "";
    // check if 1st path of url  is nomApplication
    // if yes , remove nomApplication du pathName
    //console.log("urls: ", util.inspect(urls),"   nomAppli: ",Application["nomApplication"]);
    if (appliName ==""){
        var urls = uri.substr(1).split("\/");
        logger.log("urls: ", util.inspect(urls),"   nomAppli: ",Application["nomApplication"]);
        if (urls.length>0){
            if (urls[0].toLowerCase()!= Application["nomApplication"].toLowerCase()){
                appliName = "";
                pathName = uri;
            }
            else {
                appliName =  urls[0].toLowerCase();
                for (var i=1; i < urls.length; i++){
                    pathName += "\/" + urls[i];
                }
            }
        }
    }
    var ipCaller = request.headers['x-forwarded-for'] || 
     request.connection.remoteAddress || 
     request.socket.remoteAddress ||
     request.connection.socket.remoteAddress;
    
    console.log("AppliName:", appliName, "  pathName :", pathName, "   ipCaller: " , ipCaller);

	//var pathName	= uri.substring(posAppli+1);
	var hostName	= request.headers.host;  
    var dirAppli    = Application.dirApplication;
     
    var pathHandle = "/";
	
    /** * Recherche d'un gestionnaire (function) pour traiter la demande */
    /**  handle[uri] donne la fonction a appeler pour traite l'URL */
;
    if (typeof handle[uri.toLowerCase()] === 'function') {
        /**  on demande au gestionnaire d'handle de traiter la réponse */
        handle[uri.toLowerCase()](response, request, pathName);
    } else if(typeof handle[pathHandle.toLowerCase()] === 'function'){
        handle[pathHandle.toLowerCase()](response, request, pathName);
	} 
    /** si pas de gestionnaire renvoi 404 au browser */
	 else {
		logger.log("Aucun gestionnaire associé à " + pathName);
		response.writeHead(404, {"Content-Type": "text/plain;charset=utf-8"});
		response.write(" router 404 Non trouvé");
		response.end();
	}
}

exports.route = route;
