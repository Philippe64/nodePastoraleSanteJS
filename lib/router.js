"use strict";


function route(handle, uri, response, request, port) {
	logger.log("Début du traitement de l'URL " + uri);
	/** extract appli from pathName 
    * on peut utiliser aplliName.hostName:port/ ou hostname:port/appli/ 
	* cas des appels  nsi.cia-it.net:7777/ le serveur ne gère qu'une Appli
    *  ou cia-it.net:7777/nsi/ le serveur peut gèrer plusieurs applis
	* recherche du 1er / à partir de la position 2
	* et extraction de pathName
	*/
	var posAppli	= uri.indexOf("\/", 1);
	var pathAppli	= uri.substr(0, posAppli + 1);
	var pathName	= uri.substring(posAppli+1);
	var hostName	= request.headers.host;
    
    var dirAppli    = Application.dirApplication;
    
    var pathHandle = "/";
	logger.log("HostName : ", hostName,"   posAppli : ", posAppli, "   pathAppli : ", pathAppli, 'pathName : ', pathName);
	/** 
	 * si appel nsi.cia-it.net on ne tient pas compte de ce pathAppli
	 */
	if(
        hostName.toLowerCase() ===  "localhost:" + port ||
        hostName.toLowerCase() ===  "localhost:8889" ||
        hostName.toLowerCase() ===  "127.0.0.1:" + port  ||
        hostName.toLowerCase() ===  "127.0.0.1:8889" 
    ){
		
        if (pathAppli != dirAppli +'/'){
			pathName		= pathAppli+pathName;
		}

		//  *********
		logger.log("HostName : ", hostName,"   posAppli : ", posAppli, "   pathAppli : ", pathAppli, 'pathName : ', pathName);
	}
    
    /** * Recherche d'un gestionnaire (function) pour traiter la demande */
    /**  handle[uri] donne la fonction a appeler pour traite l'URL */
	logger.log("uri : " + uri.toLowerCase() + " handle: " +  handle[uri.toLowerCase()]  + " pathAppli :" +  handle[pathAppli.toLowerCase()]);
    if (typeof handle[uri.toLowerCase()] === 'function') {
        /**  on demande au gestionnaire d'handle de traiter la réponse */
        handle[uri.toLowerCase()](response, request, pathAppli, pathName);
    } else if(typeof handle[pathHandle.toLowerCase()] === 'function'){
        handle[pathHandle.toLowerCase()](response, request, pathAppli, pathName);
	} 
    /** si pas de gestionnaire renvoi 404 au browser */
	 else {
		logger.log("Aucun gestionnaire associé à " + pathName);
		response.writeHead(404, {"Content-Type": "text/plain;charset=utf-8"});
		response.write("404 Non trouvé");
		response.end();
	}
}

exports.route = route;
