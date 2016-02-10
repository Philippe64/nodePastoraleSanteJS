"use strict";
/**
 * Get data from request (get or post)
 * send them back in rcvdData object
 */
function getDataFromReq(request, cbk) {
	
	/** gestionnaire des url (parse..) decodage querystring */
	var url = require("url");	
	
	/** gestionnaire des demandes recues par module formidable
	 *  traite les demandes post et post file
	*/
	var formidable = require("formidable");
	
	
	logger.log("Récupération des éléments reçus, method : ",request.method.toLowerCase());
	// get data from req get mode in object
	var rcvdData = "";
    if (request.method.toLowerCase() === "get") {
        // url.query return object each property is a parametrer of the queryString
		rcvdData = url.parse(request.url, true).query;
		cbk(null, rcvdData, null);
	}
	// for parsing request getting post data and loaded file
	var form = new formidable.IncomingForm();
	form.encoding = "utf-8";
	form.parse(request,	
		function (err, fields, files) {
			if (!err) {
				// if post data from req
				if (request.method.toLowerCase() == "post") {
					rcvdData = fields;
					cbk(err, rcvdData, files);
				}
			}
			cbk(err, rcvdData, files);
		}
	);
}
module.exports = getDataFromReq;
