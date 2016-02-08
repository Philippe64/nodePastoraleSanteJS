"use strict";
/** gestionnaire de fichiers */

var fs = require("fs");
var path = require("path");
var dirAppli = Application.dirApplication;

function getEditParoisse (request, user_session, fnSendBackData) {
    
	logger.log("Récupération des éléments reçus");
	// get data from req get / post
	var rcvdData = {};
	logger.log("dirname : " , __dirname)
    var pathToFile = path.join(dirAppli,"/infoParoisse/modele.htext");
	var fields = user_session["rcvdData"];
	var action = fields['action'];
	var paroisseId = fields["paroisseId"];
                
    logger.log("action : ", action, "  paroisseId : " , paroisseId );
	// check if Locked
	if(action === "ifLockedParoisse"){
		checkIfLockedParoisse(paroisseId,
			function(err,data){
				if(err){
					var resultat = {};
					resultat["status"] = "succes";
					resultat["reason"] = err.message;
					resultat["answer"] = false;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "File Locked";
					resultat["answer"] = true;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}
	
	else if(action === "lockParoisse"){
		lockParoisse(paroisseId,
			function(err,data){
				if(err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = data;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}
	
	
	else if(action === "unLockParoisse"){
		unLockParoisse(paroisseId,
			function(err,data){
				if(err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = data;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}
	
	// get data Paroisse
	else if (action === "readParoisse") {
		getDataParoisse(paroisseId,
			function(err,data){
				if(err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = data;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
						
	}
				
	// get data Hosto
	else if (action === "readHosto") {
		getDataHosto(paroisseId,
			function(err,data){
				if(err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = data;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);			
	}				
	// update Data
	else if  (action === "saveParoisse") {
		var dataToSave = fields["info"];
		saveDataParoisse(paroisseId,dataToSave,
			function(err,done){
				if (err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}
	
	else if  (action === "saveHosto") {
		var dataToSave = fields["info"];
		saveDataHosto(paroisseId,dataToSave,
			function(err,done){
				if (err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}
	
    //export to PDF
	else if  (action === "pdf") {
		var dataToSave = fields["info"];
		export2pdf(paroisseId,dataToSave,
			function(err,done){
				if (err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "";
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}
	
    //Build Tooltip
	else if  (action === "tooltip") {
		buildTooltip(paroisseId,
			function(err,data){
				if (err){
					var resultat = {};
					resultat["status"] = "failed";
					resultat["reason"] = err.message;
					resultat["answer"] = "";
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
				else{
					var resultat = {};
					resultat["status"] = "success";
					resultat["reason"] = "tooltip";
					resultat["answer"] = data;
					var myJSON = JSON.stringify(resultat);
					fnSendBackData(null,myJSON);
				}
			}
		);
	}

	/** ***********************************************************************************/
    // check if locked paroisse
	function checkIfLockedParoisse(paroisseId, cbk){
		var pathToFile = path.join(dirAppli, "infoParoisse", "info"+ paroisseId + ".lck");
        logger.log ("pathToFile : ",path.resolve(pathToFile));
		fs.stat(pathToFile,
			function(err,stats){
				if(!err){
					cbk(null,true);
				}
				else{
                	cbk(err,false);	
				}
			}
		);
	}
	
    // lock paroisse
	function lockParoisse(paroisseId, cbk){
		var pathToFile = path.join(dirAppli, "infoParoisse", "info"+ paroisseId + ".lck");
        logger.log ("pathToFile : ",path.resolve(pathToFile));
		fs.stat(pathToFile,
			function(err,stats){
				if(!err){
					cbk(err,"Paroisse already locked");
				}
				else{
					fs.writeFile(pathToFile,"",
						function (err,data){
							cbk(err,data);
						}
					);
				}
			}
		);
	}
	
    // unLock paroisse
	function unLockParoisse(paroisseId, cbk){
		var pathToFile = path.join(dirAppli, "infoParoisse", "info"+ paroisseId + ".lck");
        logger.log ("pathToFile : ",path.resolve(pathToFile));
		fs.stat(pathToFile,
			function(err,stats){
				if(err){
					cbk(err,"Paroisse "+ paroisseId + "  not locked");
				}
				else{
					fs.unlink(pathToFile,
						function (err,data){
							cbk(err,data);
						}
					);
				}
			}
		);
	}
	
	
	// get data Paroisse
	function getDataParoisse(paroisseId, cbk){		
        var pathToFile = path.join(dirAppli, "infoParoisse", "info"+ paroisseId + ".htext");
        logger.log ("pathToFile : ",path.resolve(pathToFile));
		fs.stat(pathToFile,
			function(err,stats){
				if(!err){
					fs.readFile(pathToFile,"utf-8",
						function (err,data){
							cbk(err,data);
						}
					);
				}
				else{
					var pathToModele =  path.join(dirAppli, "infoParoisse", "modele.htext");
					fs.readFile(pathToModele,"utf-8",
						function (err,data){
							cbk(err,data);
						}
					);	
				}				
			}
		);
	}
	
	// get data Hosto
	function getDataHosto(paroisseId, cbk){
		var pathToFile = path.join(dirAppli, "hostoParoisse", "hosto"+ paroisseId + ".htext");
		fs.stat(pathToFile,
			function(err,stats){
				if(!err){
					fs.readFile(pathToFile,"utf-8",
						function (err,data){
                            logger.log ("dataHosto : " + data)
							cbk(err,data);
						}
					);
				}
				else{
                    cbk(err,"");	
				}
				
			}
		);
	}
	
	
    // save data Paroisse
	function saveDataParoisse(paroisseId, dataToSave, cbk){
		var pathToFile = path.join(dirAppli ,"infoParoisse", "info"+ paroisseId + ".htext");
		fs.writeFile(pathToFile,dataToSave,
			function (err,data){
				cbk(err,data);
			}
		);
	}
    
	   // save data Hosto
	function saveDataHosto(paroisseId, dataToSave, cbk){
		var pathToFile = path.join(dirAppli ,"hostoParoisse", "hosto"+ paroisseId + ".htext");
		fs.writeFile(pathToFile,dataToSave,
			function (err,data){
				cbk(err,data);
			}
		);
	}
    
    // export2pdf
    function export2pdf(paroisseId, dataToSave, cbk){
		var pathToFile = path.join(dirAppli ,"infoParoisse", "info"+ paroisseId + ".pdf");
        var pdf = require('html-pdf');
        // check https://github.com/marcbachmann/node-html-pdf for options description
        var options = { 
            format: 'Letter',
            "border": {
                "top": "1cm",            // default is 0, units: mm, cm, in, px
                "right": "0.5cm",
                "bottom": "1cm",
                "left": "0.5cm"
            }
  
        };
		pdf.create(dataToSave, options).toFile(pathToFile,
			function (err,data){
				cbk(err,data);
			}
		);	
	}
    
        
    // build Tooltip
    function buildTooltip(paroisseId, cbk){
        var strHTML = "";
		var pathToFile = path.join(dirAppli ,"hostoParoisse", "hosto"+ paroisseId + ".htext");
        fs.stat(pathToFile,
			function(err,stats){
                // file found
				if(!err){
					fs.readFile(pathToFile,"utf-8",
						function (err,data){
                            if(!err){
                                logger.info("data : " , data);
                                strHTML = data;
                            }
							cbk(null,strHTML);
						}
					);
				}
                // file not found
				else{
                    strHTML += '<p>' + ' ' + '</p>';
					cbk(null,strHTML);	
				}
			}
		);
	}
    	
}

module.exports = getEditParoisse;
	 