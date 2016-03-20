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
    // hide hosto info on page
    document.getElementById('infoHostoLabel').style.display = "none";
    // sablier
    showHourglass();
    // Get Paroisse Info
    GetData(
        function(err,data){
            hideHourglass();
            
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
            cbk (null,true) ;
        }
    )
}




// Export to PDF Paroisse Info
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


window.addEventListener("load", GetDatas);
