'use strict';

/** chargement module Gestion Fichiers */
var fs = require('fs');
var path = require('path');

/**
 * Module d'utilitaire  (inspect..)
 */
var util = require('util');
debugger;
/**
 * chargement module gestion console
 * il est defini "global" pour être appelé dans tous les modules dependants
 */
global.logger = require('./logger.js').logger;
logger.log ("Début Application : " , __dirname );

/**
 *   definition de l'objet global Application
 *   il stock entre autre les paramètres du config.json
 *   et des paramètres propres à l'application:
 *   voir module pastoraleSante/njs/initApplication.js
 */
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
if (config["nomAppli"]){
    Application.nomApplication = config["nomAppli"];
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
/**
 * Initilisation de l'application
 * appel du module initApplication (situe dans Application/njs/initApplication)
 * param1 function calback startAppli
 */

 /** chargement module Serveur */
 var server = require('./server');
 
// initilize application
// appel du module
var requirePath = path.join(Application.dirApplication, "njs", "initApplication.js");
var initApplication = require(requirePath).initApplication;
initApplication(startAppli);

/**
 * Fonction callBack appele en retour du module initApplication
 * param1  err objet , si present throw error
 * param2 objet a fusionner avec l'objet global Apllication
 * Appele le module server en lui passant la valeur du port
 */
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
            console.log ("index port :", port);
            server.start(port);
        }
    }
