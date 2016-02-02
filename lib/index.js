'use strict';

/** chargement module Serveur */
var server = require('./server');

/** chargement module routage en fonction de l'URL */
var router = require("./router");

/** object singleton , on utilise l'objet handle comme tableau associatif
 *	des differentes routes possibles
*/
var handle = require("./handle");


/** chargement module Gestion Fichiers */
var fs = require('fs');
var path = require('path');

/** 
 * Module d'utilitaire  (inspect..)
 */
var util = require('util');

/**	chargement module gestion console 
 *  si  le niveau de trace est passé dans l'appel
	et si le niveau est valide 
	il est transmis au tracer, sinon log par default
	il est defini "global" pour être appele dans tous les modules dependants 
 */
debugger;
global.logger = require('./logger.js').logger;
logger.log ("Début Application : " , __dirname );

// definition de l'objet global
global.Application = {};

// definition du répertoire de l'Application from config.json
var config = {};
try{
    config = JSON.parse(fs.readFileSync ("./config.json", "utf8"));
}
catch(err){
    console.log ("error reading config.json :", err.message);
}

logger.log("config : ", util.inspect(config));
if (config["dirAppli"]){
    Application.dirApplication = config["dirAppli"];
}
var port ;
if (config["port"]){
    port = config["port"];
}else{
    port = "7777";
}


/** format number to len digits et fill let with pad  car
 *	@param {number] [len] length of fonal string.
 *	@param {string} [pad] car to insert at left position
 */ 
Number.prototype.padLeft = function (len, pad) {
    pad = typeof pad === "undefined" ? "0" : pad + "";
    var str = this + "";
    while (str.length < len) {
        str = pad + str;
    }
    return str;
}

// initilize application
var requirePath = path.join(Application.dirApplication, "njs", "initApplication.js");
var initApplication = require(requirePath).initApplication;
initApplication(startAppli);
    

function startAppli (err,oApplication){
        if(err){
            console.log(err.message);
        }
        else{
           // Merge Application object with oApplication
           var oTemp = Object.assign(Application,oApplication);           
           Application = oTemp;
           logger.log("Application : ", util.inspect(Application));
           /** Start server */  
            debugger
            server.start(router.route, handle, port); 
        }
    }

