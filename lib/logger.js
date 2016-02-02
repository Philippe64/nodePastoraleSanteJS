'use strict';
debugger

var fs = require('fs');
var path = require('path');
console.log("current Path :", path.resolve("./"));
var pathTrace = path.join("./lib","db.json");
console.log("pathTrace : ",path.resolve(pathTrace));
console.log("dirname: ",__dirname);
var stats = "";
try{
    stats = fs.statSync('db.json'); 
    if(stats.isFile()){
        try{
            fs.unlinkSync('db.json')
        }
        catch(err){
            console.log('unlink err :' , err.message);
        }
    }
}
catch(err){
    console.log('stat err :' , err.message);
}  		
        




const low = require('lowdb')
const storage = require('lowdb/file-async')
const db = low('db.json', { storage })



// default level
var levelTrace = "info";
// check if level is passed as argument
if (process.argv.length > 2) {
    if (process.argv[2].toLowerCase() === 'log' ||
        process.argv[2].toLowerCase() === 'trace' ||
        process.argv[2].toLowerCase() === 'debug' ||
        process.argv[2].toLowerCase() === 'info' ||
        process.argv[2].toLowerCase() === 'warn' ||
        process.argv[2].toLowerCase() === 'error') {
        levelTrace = process.argv[2];
    }
}
console.log("logger levelTrace : ",levelTrace);

var log_conf = {
    // specify time format (l = 3 digit millisecond)
    dateformat : "yyyy-mm-dd'T'HH:MM:ss:l",
    // specify order of level
    // example if levelTrace = info and logger.log("hello"),message will not be print
    methods : ['log', 'trace', 'debug', 'info', 'warn', 'error'],
    // specify level of trace
    level: levelTrace,
    // get the specified index of stack as file information. It is userful for development package.
    stackIndex : 0,	
    //if true then the object's non-enumerable properties will be shown too. Defaults to false	
    inspectOpt : {
        showHidden : true, 
        depth : 2 //tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
    },
    transport : function(data) {
        //console.log(data.output);
        db('logtrace').push({ data: data.output});
    }
}


 exports.logger = require('tracer').console(log_conf);   



    

