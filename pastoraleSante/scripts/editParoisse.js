"use strict";

// get querystring param
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&')); 


// encode decode HTML
function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

// I needed the opposite function today, so adding here too:
function htmlUnescape(value){
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

// get Paroisse info et hosto info en //
function GetDatas() {
    // lock Paroisse async Function
    lockParoisse(
        function(err,data){ 
            // get info paroisse async function
            GetData();
            // get info hosto async function
            if (qs['action'].toLowerCase() === "readupdate"){
                GetHosto();
            }
        }           
    ) 
}




// Get Paroisse Info
var editorParoisse, editorHosto;
// Allow some non-standard markup  
CKEDITOR.config.htmlEncodeOutput=true; 
CKEDITOR.config.pasteFromWordRemoveStyles = false;
CKEDITOR.config.pasteFromWordRemoveFontStyles = false;   
CKEDITOR.config.removePlugins  = 'closebtn';
//CKEDITOR.config.extraPlugins =  'colorbutton,cia_inlinesave,cia_export2pdf,pastefromword,dialogadvtab,colordialog';
CKEDITOR.config.extraPlugins = 'colorbutton,cia_inlinesave,pastefromword,dialogadvtab,tableresize,colordialog,font';


// lock Paroisse 
function lockParoisse(cbk){ 
    
    // 1. Instantiate XHR - Start 

    var xhr; 
    if (window.XMLHttpRequest) 
        xhr = new XMLHttpRequest(); 
    else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    else 
        throw new Error("Ajax is not supported by your browser");
    // 1. Instantiate XHR - End
    
    // 2. Handle Response from Server - Start
    xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200 && xhr.status < 300) {
                var JSONresponse = JSON.parse(xhr.responseText);
                if(cbk){
                    cbk(null,JSONresponse);
                }
            }
        }   
    }
    // 2. Handle Response from Server - End

    // 3. Specify your action, location and Send to the server - Start   
    var params = 'action=lockParoisse&paroisseId=' + qs['paroisseId'] ;

    if(qs['scriptServer'] === "php"){
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
    }
    else{
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
    }
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    // 3. Specify your action, location and Send to the server - End
    
}

// lock Paroisse 
function unLockParoisse(cbk){ 
        
    // 1. Instantiate XHR - Start 
    var xhr; 
    if (window.XMLHttpRequest) 
        xhr = new XMLHttpRequest(); 
    else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    else 
        throw new Error("Ajax is not supported by your browser");
    // 1. Instantiate XHR - End
    
    // 2. Handle Response from Server - Start
    xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200 && xhr.status < 300) {
                var JSONresponse = JSON.parse(xhr.responseText);
                if(cbk){
                    cbk(null,JSONresponse);
                }
            }
        }   
    }
    // 2. Handle Response from Server - End

    // 3. Specify your action, location and Send to the server - Start   
    var params = 'action=unLockParoisse&paroisseId=' + qs['paroisseId'] ;

    if(qs['scriptServer'] === "php"){
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
    }
    else{
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
    }
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    // 3. Specify your action, location and Send to the server - End
    
}

function GetData() {
    // 1. Instantiate XHR - Start 
    var xhr; 
    if (window.XMLHttpRequest) 
        xhr = new XMLHttpRequest(); 
    else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    else 
        throw new Error("Ajax is not supported by your browser");
    // 1. Instantiate XHR - End
    
    // 2. Handle Response from Server - Start
    xhr.onreadystatechange = function () {
       var infoParoisse = document.getElementById( 'infoParoisse' );  
        if (xhr.readyState < 4)
            infoParoisse.innerHTML = "Loading...";
        else if (xhr.readyState === 4) {
            if (xhr.status == 200 && xhr.status < 300) {
                var JSONresponse = JSON.parse(xhr.responseText);
                var info =JSONresponse["answer"]
                infoParoisse.innerHTML =  htmlUnescape(JSONresponse["answer"]);
                document.getElementById("h1Elem").innerText = "Paroisse : " + qs["paroisse"]  + "   (" + qs['paroisseId']+ ")" ;
                var btn = document.getElementById("updView");
                btn.style.visibility = "hidden";
               
               
               // The inline editor should be enabled on an element with "contenteditable" attribute set to "true".
                // Otherwise CKEditor will start in read-only mode.
                CKEDITOR.disableAutoInline = true;
                
                if (qs['action'].toLowerCase() === "readupdate"){
                    infoParoisse.setAttribute( 'contenteditable', true );
                    btn.innerText = "visualiser";
                    btn.style.visibility = "visible";
                    CKEDITOR.inline( 
                        'infoParoisse', {
                            // when ready check if data changed
                            on: {
                                instanceReady: function(ev) {
                                    editorParoisse = ev.editor;
                                    var elemsH1 = infoParoisse.getElementsByTagName("h1");
                                    var elemsSpan = elemsH1[0].getElementsByTagName("span");
                                    if ( elemsSpan[0].innerText=="modele" ){
                                        elemsSpan[0].innerText =  qs["paroisse"] ;                                
                                    };
                                    elemsH1[0].style.textAlign = "center";
                                    //periodicData();
                                }
                            } 
                        }
                    );
                }
            }
        }
    }
    // 2. Handle Response from Server - End

    // 3. Specify your action, location and Send to the server - Start   
    var params = 'action=readParoisse&paroisseId=' + qs['paroisseId'];
    if(qs['scriptServer'] === "php"){
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
    }
    else{
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
    }
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    // 3. Specify your action, location and Send to the server - End
}

function GetHosto() {
    // 1. Instantiate XHR - Start 
    var xhr; 
    if (window.XMLHttpRequest) 
        xhr = new XMLHttpRequest(); 
    else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    else 
        throw new Error("Ajax is not supported by your browser");
    // 1. Instantiate XHR - End
    
    // 2. Handle Response from Server - Start
    xhr.onreadystatechange = function () {
       var infoHosto = document.getElementById( 'infoHosto' );  
        if (xhr.readyState < 4)
            infoHosto.innerHTML = "Loading...";
        else if (xhr.readyState === 4) {
            if (xhr.status == 200 && xhr.status < 300) {
                var JSONresponse = JSON.parse(xhr.responseText);
                var info =JSONresponse["answer"]
                infoHosto.innerHTML =  htmlUnescape(JSONresponse["answer"]);               
               
               // The inline editor should be enabled on an element with "contenteditable" attribute set to "true".
                // Otherwise CKEditor will start in read-only mode.
                CKEDITOR.disableAutoInline = true;                
                if (qs['action'].toLowerCase() === "readupdate"){
                    infoHosto.setAttribute( 'contenteditable', true );
                    //btn.innerText = "visualiser";
                    //btn.style.visibility = "visible";
                    CKEDITOR.inline( 
                        'infoHosto', {
                            // when ready check if data changed
                            on: {
                                instanceReady: function(ev) {
                                    editorHosto = ev.editor;                                                        
                                }
                            } 
                        }
                    );
                }
            }
        }
    }
    // 2. Handle Response from Server - End

    // 3. Specify your action, location and Send to the server - Start   
    var params = 'action=readHosto&paroisseId=' + qs['paroisseId'];
    if(qs['scriptServer'] === "php"){
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
    }
    else{
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
    }
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    // 3. Specify your action, location and Send to the server - End
}



// check if content has been updated evey n milliseconds 
var periodicData = ( function(){    var data, oldData;

    return function() {
        if ( ( data = editor.getData() ) !== oldData ) {
            oldData = data;
            //console.log( data );
            // Do sth with your data...
            updateMessage();
            SaveData();
        }

        setTimeout( periodicData, 30000 );
    };
})();

var nbModif = 0;
function updateMessage () {
    var message = document.getElementById("message");
    nbModif +=1;
    message.innerHTML =  nbModif +" modifications";
}

// Save Paroisse & hosto Info
function SaveData() {
    var cbkMain;
    // get cbk function if any
    if(arguments.length === 1){
        cbkMain = arguments[0];
    } 
	SaveDataParoisse(
        function(err,done){
            if (!err){
               SaveDataHosto(
                   function(err,data){
                       if(!err){
                           if(cbkMain){
                               cbkMain(err,data);
                           }
                       }
                   }
               ); 
            }
        }
    );
}

// Save Paroisse Info
function SaveDataParoisse() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }    
    
    // 1. Instantiate XHR - Start 
    var xhr; 
    if (window.XMLHttpRequest) 
        xhr = new XMLHttpRequest(); 
    else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    else 
        throw new Error("Ajax is not supported by your browser");
    // 1. Instantiate XHR - End
    
    // 2. Handle Response from Server - Start
    xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200 && xhr.status < 300) {
                var JSONresponse = JSON.parse(xhr.responseText);
                if(cbk){
                    cbk(null,JSONresponse);
                }
            }
        }   
    }
    // 2. Handle Response from Server - End

    // 3. Specify your action, location and Send to the server - Start   
    var infoCorrected = document.getElementById('infoParoisse').innerHTML;
    var infoCorrectedEncoded = encodeURIComponent(infoCorrected);
    var params = 'action=saveParoisse&paroisseId=' + qs['paroisseId'] +'&info=' + infoCorrectedEncoded ;
    if(qs['scriptServer'] === "php"){
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
    }
    else{
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
    }
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    // 3. Specify your action, location and Send to the server - End
}


// Save Hosto Info
function SaveDataHosto() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }    
    
    // 1. Instantiate XHR - Start 

    var xhr; 
    if (window.XMLHttpRequest) 
        xhr = new XMLHttpRequest(); 
    else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    else 
        throw new Error("Ajax is not supported by your browser");
    // 1. Instantiate XHR - End
    
    // 2. Handle Response from Server - Start
    xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200 && xhr.status < 300) {
                var JSONresponse = JSON.parse(xhr.responseText);
                if(cbk){
                    cbk(null,JSONresponse)
                }
            }
        }   
    }
    // 2. Handle Response from Server - End

    // 3. Specify your action, location and Send to the server - Start   

    var infoCorrected = document.getElementById('infoHosto').innerHTML;
    var infoCorrectedEncoded = encodeURIComponent(infoCorrected);
    var params = 'action=saveHosto&paroisseId=' + qs['paroisseId'] +'&info=' + infoCorrectedEncoded ;
    if(qs['scriptServer'] === "php"){
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
    }
    else{
        xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
    }
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    // 3. Specify your action, location and Send to the server - End
}


// Save Paroisse Info
function export2pdf() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }    
    
    // 1. Instantiate XHR - Start 
   
        var xhr; 
        if (window.XMLHttpRequest) 
            xhr = new XMLHttpRequest(); 
        else if (window.ActiveXObject) 
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        else 
            throw new Error("Ajax is not supported by your browser");
        // 1. Instantiate XHR - End
        
        // 2. Handle Response from Server - Start
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status == 200 && xhr.status < 300) {
                    var JSONresponse = JSON.parse(xhr.responseText);
                    // create an hidden link if not exist
                    if (!document.getElementById("linkpdf")) {
                        var linkpdf = document.createElement("a");                
                        linkpdf.setAttribute("id", "linkpdf")
                        linkpdf.style.visibility = "hidden";
                        document.body.appendChild(linkpdf);
                    }
                    else{
                        var linkpdf = document.getElementById("linkpdf");
                    }
                    // set attibute download & href
                    linkpdf.setAttribute("download", qs['paroisse']+".pdf")
                    linkpdf.href="./infoParoisse/info"+ qs['paroisseId']+".pdf";
                    // do click on this link
                    linkpdf.click();
                
                }           
            }   
        }
        // 2. Handle Response from Server - End

        // 3. Specify your action, location and Send to the server - Start 
        // get data to save  
        var infoCorrected = document.getElementById('infoParoisse').innerHTML;
        var infoCorrectedEncoded = encodeURIComponent(infoCorrected);
        var params = 'action=pdf&paroisseId=' + qs['paroisseId']  + '&info=' + infoCorrectedEncoded ;
        if(qs['scriptServer'] === "php"){
            xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.'+ qs['scriptServer'] ,true);
        }
        else{
            xhr.open('POST', './'+ qs['scriptServer'] + '/geteditparoisse.js' ,true);
        }
        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
        // 3. Specify your action, location and Send to the server - End
   
}


function updview(btn){
    var infoParoisse = document.getElementById('infoParoisse');
    var infoHosto = document.getElementById('infoHosto');
    var infoHostoLabel = document.getElementById('infoHostoLabel');
    if(infoParoisse.getAttribute('contenteditable') == "true"){
        infoParoisse.setAttribute( 'contenteditable', "false" );
        infoHosto.setAttribute( 'contenteditable', "false" );
       

        CKEDITOR.instances.infoParoisse.destroy();
        //CKEDITOR.instances.infoHosto.destroy();
        
        infoParoisse.innerHTML = infoParoisse.innerText;
        
        infoHosto.style.display = "none";
        infoHostoLabel.style.display = "none"
        btn.innerText = "Mettre à jour";        
    }
    else {
        infoParoisse.setAttribute( 'contenteditable', "true" );
        infoHosto.setAttribute( 'contenteditable', "true" );
        //CKEDITOR.instances.infoParoisse.activeEnterMode = true;
        CKEDITOR.disableAutoInline = true;
        CKEDITOR.inline( 
            'infoParoisse', {
                // when ready check if data changed
                on: {
                    instanceReady: function() { 
                        var elemsH1 = infoParoisse.getElementsByTagName("h1");                       
                        elemsH1[0].style.textAlign = "center";
                    }
                } 
            }
        );
        infoHostoLabel.style.display = "block";
        infoHosto.style.display = "block";
        /*
        CKEDITOR.inline( 
            'infoHosto'
        );
        */
        btn.innerText = "Visualiser";        
    }
}

window.onload = GetDatas;

