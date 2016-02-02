"use strict";

/** gestionnaire de fichiers */
var fs = require("fs");

// outil de gestion des paths
var path = require("path");

// gestionnaire de sessions
var sessionManager = require("./session");


/** reg expression pour valider le path 	
	\d  digit caractere 0-9
	\w  alpha num caractere A-Za-z0-9
	_    underscore caractere
	\.  point caractere 	
 */
var ext = /[\w\d_-]+\.[\w\d]+$/;

/** liste des contentType Valides */
var ContentType = {
	 ".txt"		: "tewt/plain"
	,".text"    : "tewt/plain"
    ,".inc" 	: "text/html"
	,".html" 	: "text/html"
	,".htm" 	: "text/html"
	,".shtml" 	: "text/html"
    ,".css" 	: "text/css"
    ,".js" 		: "application/javascript"
	,".njs"		: "application/javascript"
    ,".png" 	: "image/png"
    ,".gif" 	: "image/gif"
    ,".jpg" 	: "image/jpeg"
	,".ico"		: "image/x-icon"
    ,".pdf"     : "application/pdf"
};

//appel pastoraleSante from router.js (use handle.js module)
function pastorale_sante(response, request, pathAppli, pathName) {
    
    //var dirAppli = "./pastoraleSante";
    var dirAppli = Application.dirApplication;
    
	logger.info("Le gestionnaire 'pastoraleSante' est appelé., dirAppli : ", dirAppli);

	// extraction du chemin de l'appli
	logger.info ("reqH pathName :  " + pathName); 
    
    logger.log("fichier demandé : ",path.join(dirAppli,pathName));
	
	var pathDirName = path.dirname(pathName);
	logger.log ("pathDirName : ", pathDirName);
	var arrayDir = pathDirName.split("\/");
	var parentDir = arrayDir[arrayDir.length-1];
	logger.log ("parentDir : ", parentDir);


	//logger.log(CIA_SessionVariablesInit);njs
	var extension = path.extname(pathName).toLowerCase();
	logger.log("extension : " , extension);

	
	// appel initial
	if (pathName === '' || pathName === '\/') {
		//sessionManager get session id if existing or new one
		var user_session = sessionManager.lookupOrCreate(request);
		logger.log("session id : " , user_session.id);
        user_session.currentPage = {};
		Application.sessions[user_session.id] = user_session;
        // set session cookie header
        var cookieToSendBack = [];
        var cookieSession = user_session.getSetCookieHeaderValue();
        cookieToSendBack.push(cookieSession);
		
		// nom de l'appliction
		var strRacineWeb = (pathAppli[0] == "/") ? pathAppli.substring(1): pathAppli;
		if (strRacineWeb.indexOf("/") > 0) {
			strRacineWeb = substring(0, strRacineWeb.indexOf("/"))
		}
		// --------------------------------
        response.setHeader("Set-Cookie", cookieToSendBack);
        response.writeHead(302, { 'location': '../default.html' });
		response.end();
		// fin du bloc nsi appel initial
		// la main a été rendu au browser via response.write et response.end		
	}

	// appel page .njs ou .html
	// si page njs, appel module njs
	else if (extension === ".js" && parentDir === "njs") {
		logger.log("Récupération des paramètres reçus");
		// get data from req get / post
        var rcvdData = {};
        var SID = "";
		var getDataFromReq = require("./getDataFromReq");
		getDataFromReq(request,
			function prepareHtmlToSendBack(err, rcvdData, files) {
				if (err) {
					logger.error("erreur in form.parse : ", err.message);
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
				}
				else {
					// get user_session, if session empty  redirect to root page
					var user_session = sessionManager.lookupOrCreate(request, { "sessionID": SID, "path" : "/", "domain": request.headers.host });
					logger.log("session_id: " , user_session.id);
					if (user_session.length ===0) {
						logger.log("Page HTML : ", pathName, " nouvelle session vide crée : ", user_session.id, " !!??.. redirect to /");
						var redirectPath = "http://" + request.headers["host"] + "/";
						response.writeHead(302, { 'Location': redirectPath });
						response.end();
					}
					else {						
						//appel de la page njs
						var requiredPage = path.join(dirAppli,pathName);
				        logger.log("njs file path : " ,requiredPage , "  fullpath :", path.resolve(requiredPage));

						user_session["requiredPage"] = requiredPage;
						user_session["rcvdData"] = rcvdData;
						
						var requirePath =  path.join(dirAppli,pathName);
						var pageClass = require(requirePath);
						pageClass(request,response,user_session,
							function fnSendBackHTMLPage(err, result) {
								// if problem in module process return 500 (internal error) and reasons
								if (err) {
									response.writeHead(500, { 'Content-Type': 'text/html' });
									response.end("<html><head></head><body>Internal error</body></html>");
								}
										// return the html page to browser
								else {
									//logger.log("resultat : ", result);
									response.writeHead(200, {"Content-Type": "application/json"});
									response.end(result);
								}
							}
						);
					}
				}
			}
		);
	}
		// html images js css .....
	else if (ext.test(path.join(dirAppli,pathName))) {
        fs.stat(path.join(dirAppli, pathName), 
			function (err,stats) {				
				if (!err){
					var exists = true;
				}				
				if (exists) {
					var lastModified = new Date(stats.mtime);
					if (ContentType[extension]){
						response.writeHead(200, {
							'Content-Type'	: ContentType[extension]
							,'Last-Modified': lastModified
						});
						fs.createReadStream(path.join(dirAppli, pathName)).pipe(response);
					}
					else{
						response.writeHead(404, {'Content-Type': 'text/html'});
						response.end("<html><head></head><body>The requested file type: " + extension + " is not supported</body></html>");
					} 
				}
				else {
				logger.error("err: " , err.message);
				var result = "reqH fichier inconnu : " + path.join(dirAppli, pathName);																										
					logger.info(result);
					response.writeHead(404, {'Content-Type': 'text/html'});
					//response.write(result);
					response.end();
				}
			}
		);
	}
	// file not allowed 
	else{
		logger.error("reqH fichier inconnu : ", path.join(dirAppli, pathName));
        response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
		
	}
}

// demande de Favicon
function ico(response, request, pathAppli, pathName) {

    pathName = '.' + pathName;
	logger.log ("pathName :  " + pathName); 
	var extension = path.extname(pathName);
	var blnExists = false;
	if (ext.test(pathName)) {
		// verif si fichier existe
        fs.stat(pathName, 
			function (err,stats) {
				logger.log ("err: " , err);
				if (!err){
					blnExists = true;
				}				
				if (blnExists) {
					var lastModified = new Date(stats.mtime);
					logger.log('blnExists :', blnExists)
					if (ContentType[extension]){
						response.writeHead(200, {
							'Content-Type'	: ContentType[extension]
							,'Last-Modified': lastModified
						});
						fs.createReadStream(path.join(pathName)).pipe(response);
					}
					else{
						response.writeHead(404, {'Content-Type': 'text/html'});
						response.end("<html><head></head><body>The requested file type: " + extension + " is not supported</body></html>");
					} 
				}
				else {
					logger.log("reqH fichier inconnu : ", pathName);
					response.writeHead(404, {'Content-Type': 'text/html'});
					fs.createReadStream(err.message).pipe(response);
				}
			});
	}
	else{
		logger.error("reqH fichier inconnu : ",  pathName);
        response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
		
	}
}




exports.pastorale_sante = pastorale_sante;
exports.ico = ico;
