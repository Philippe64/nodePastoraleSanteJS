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
// Gestion appel Ajax
function callAjax(paramsToSend,cbk){
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
              var JSONResponse = JSON.parse(xhr.responseText);
              if(cbk){
                  cbk(null,JSONResponse)
              }
          }
      }
  }
  // 2. Handle Response from Server - End

  // 3. Specify your action, location and Send to the server - Start

 var scriptServer = qs['scriptServer'];
 if(scriptServer === "php"){
      xhr.open('POST', './'+ scriptServer + '/geteditparoisse.'+ scriptServer ,true);
  }
  else{
      xhr.open('POST', './'+ scriptServer + '/geteditparoisse.js' ,true);
  }

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(paramsToSend);
  // 3. Specify your action, location and Send to the server - End
}

// get Paroisse info et hosto info en //
function GetDatas() {
    function showHourglass(){
        var hourGlass = document.getElementById("hourGlass");
        hourGlass.style.display = "block";
    }
    function hideHourglass(){
        var hourGlass = document.getElementById("hourGlass");
        hourGlass.style.display = "none";
    }
    // lock Paroisse async Function
    showHourglass();
    lockParoisse(
        function(err,data){
            // get info paroisse async function
            GetData(
                function(err,data){
                    // get info hosto async function
                    if (qs['action'].toLowerCase() === "readupdate"){
                        GetHosto(
                            function(err,data){
                                hideHourglass();
                            }
                        );
                    }
                    else{
                      document.getElementById('infoHostoLabel').style.display = "none";
                      hideHourglass();
                    }
                }
            );
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
  if (qs['action'].toLowerCase() !== "readupdate"){
    cbk(null,null);
    return;
  }

  var paramsToSend = 'action=lockParoisse&paroisseId=' + qs['paroisseId'];
  callAjax(paramsToSend,
    function (err,JSONResponse){
      cbk(err,JSONResponse);
    }
  );
}

// lock Paroisse
function unLockParoisse(cbk){
  var paramsToSend = 'action=unLockParoisse&paroisseId=' + qs['paroisseId'];
  callAjax(paramsToSend,
    function (err,JSONResponse){
      cbk(err,JSONResponse);
    }
  );
}

function GetData() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }
    var paramsToSend = 'action=readParoisse&paroisseId=' + qs['paroisseId'];
    callAjax(paramsToSend,
      function (err,JSONResponse){
        var info =JSONResponse["answer"]
        infoParoisse.innerHTML =  htmlUnescape(info);
        document.getElementById("h1Elem").innerText = "Paroisse : " + qs["paroisse"]  + "   (" + qs['paroisseId']+ ")" ;
        var btn = document.getElementById("updView");
        btn.style.visibility = "hidden";

       // The inline editor should be enabled on an element with "contenteditable" attribute set to "true".
        // Otherwise CKEditor will start in read-only mode.
        CKEDITOR.disableAutoInline = true;

        if (qs['action'].toLowerCase() === "readupdate"){
            infoParoisse.setAttribute( 'contenteditable', true );
            btn.innerText = "Vous êtes en mode Mise à jour ...Cliquer ici pour Visualiser";
            btn.style.visibility = "visible";
            CKEDITOR.inline(
                'infoParoisse', {
                    // when ready check if data changed
                    on: {
                        instanceReady: function(ev) {
                            editorParoisse = ev.editor;
                            var elemsH1 = infoParoisse.getElementsByTagName("h1");
                             if (elemsH1.length >0){
                                var elemsSpan = elemsH1[0].getElementsByTagName("span");
                                if (elemsSpan.length >0){
                                    if ( elemsSpan[0].innerText=="modele" ){
                                        elemsSpan[0].innerText =  qs["paroisse"] ;
                                    };
                                    elemsH1[0].style.textAlign = "center";
                                }
                            }
                            if(cbk){
                                cbk (null,true) ;
                            }
                        }
                    }
                }
            );
        }
        else{
          cbk (null,true) ;
        }
      }
    );
}

function GetHosto() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }
    var infoHosto = document.getElementById( 'infoHosto' );
    infoHosto.innerHTML = "Loading...";
    var paramsToSend = 'action=readHosto&paroisseId=' + qs['paroisseId'];
    callAjax(paramsToSend,
      function (err,JSONResponse){
        var info =JSONResponse["answer"];
        infoHosto.innerHTML =  htmlUnescape(JSONResponse["answer"]);

       // The inline editor should be enabled on an element with "contenteditable" attribute set to "true".
        // Otherwise CKEditor will start in read-only mode.
        CKEDITOR.disableAutoInline = true;
        if (qs['action'].toLowerCase() === "readupdate"){
            infoHosto.setAttribute( 'contenteditable', true );
            CKEDITOR.inline(
                'infoHosto', {
                    // when ready check if data changed
                    on: {
                        instanceReady: function(ev) {
                            editorHosto = ev.editor;
                            if(cbk){
                                cbk (null,true) ;
                            }
                        }
                    }
                }
            );
        }
      }
    );
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
    var infoCorrected = document.getElementById('infoParoisse').innerHTML;
    var infoCorrectedEncoded = encodeURIComponent(infoCorrected);
    var paramsToSend = 'action=saveParoisse&paroisseId=' + qs['paroisseId'] +'&info=' + infoCorrectedEncoded ;
    callAjax(paramsToSend,
      function (err,JSONResponse){
        if(cbk){
            cbk(null,JSONResponse);
        }
      }
    );
}


// Save Hosto Info
function SaveDataHosto() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }
    var infoCorrected = document.getElementById('infoHosto').innerHTML;
    var infoCorrectedEncoded = encodeURIComponent(infoCorrected);
    var paramsToSend = 'action=saveHosto&paroisseId=' + qs['paroisseId'] +'&info=' + infoCorrectedEncoded ;
    callAjax(paramsToSend,
      function (err,JSONResponse){
        if(cbk){
            cbk(null,JSONResponse);
        }
      }
    );
}


// Save Paroisse Info
function export2pdf() {
    // get cbk function if any
    if(arguments.length === 1){
        var cbk = arguments[0];
    }
    var infoCorrected = document.getElementById('infoParoisse').innerHTML;
    var infoCorrectedEncoded = encodeURIComponent(infoCorrected);
    var paramsToSend= 'action=pdf&paroisseId=' + qs['paroisseId']  + '&info=' + infoCorrectedEncoded
    callAjax(paramsToSend,
      function (err,JSONResponse){
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
        linkpdf.href="./datasParoisse/infoParoisse/info"+ qs['paroisseId']+".pdf";
        // do click on this link
        linkpdf.click();
        if(cbk){
          cbk(null,JSONResponse);
        }
      }
    );
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
        btn.innerText = "Vous êtes en mode Visualisation ...Cliquer ici pour Mettre à jour";
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
        btn.innerText ="Vous êtes en mode Mise à jour ...Cliquer ici pour Visualiser";
    }
}

window.addEventListener("load", GetDatas);
