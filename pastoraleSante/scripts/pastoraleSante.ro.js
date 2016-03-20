"use strict"

// define global variables on window.load
function initWin(){
   window.scriptServer = "php";
   window.scriptServer = "njs";
}

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

// tooltip on area element
function areaOver(areaElem){
	buildTip (areaElem,
        function(err,done){
            if (done){
                tooltip.pop(areaElem,"#tipArea");
            }
        }
    );
}
function areaOut(areaElem){
    console.log ("tooltip hide on " +  areaElem.getAttribute("alt"));
	tooltip.hide();
}

// click on area element
function areaClick(areaElem){
	var elem = areaElem;
    var tipId = ""
	if(areaElem.tagName.toLowerCase() === "span"){
		tipId = areaElem.id;
		elem = document.getElementById(tipId.substring(2));
	}

	var paroisse = elem.getAttribute("alt");
	var paroisseId = elem.id;
	console.log(" click on Id : " +paroisseId + "  paroisse = " +paroisse);
     // prepare panel for display infoParoisse
    buildInfo (paroisseId, paroisse);

    // Affichage infoParoisse
    showModal();

}

// Build the tip
function buildTip	(areaElem , cbk)	{
	var paroisse = areaElem.getAttribute("alt");
	var paroisseId = areaElem.id;
    var tipContent = document.getElementById("tipContent");
    var tipToDisplay = "";
    var strHTML = "";

    if(document.getElementById("tipArea")){
      tipToDisplay =  document.getElementById("tipArea");
      tipToDisplay.innerHTML = "";
    }
    else{
	   tipToDisplay = document.createElement("div");
	   tipToDisplay.id = "tipArea";
       tipContent.appendChild(tipToDisplay);
    }
    strHTML += '<img src="./datasParoisse/imageParoisse/img' + paroisseId + '.jpg" style="float:right;margin-left:12px;width:75px;height:75px;" alt="" />';
    strHTML += '<h3>'+ paroisse + '</h3>';
    //console.log ("getToolTipContent :" + paroisse + "  id: " + paroisseId);
    getTooltipContent(paroisseId,
        function(err,JSONResponse){
            if(!err){
                var dataHosto =JSONResponse["answer"];
                strHTML += dataHosto;
                strHTML += '<p>Clicker <span id="sp'+ paroisseId+'" class="clickIci" onclick="areaClick(this)"> ICI </span> pour voir le contenu de la fiche de cette paroisse</p>'
                tipToDisplay.innerHTML = strHTML;
                // execute callBack
                cbk( null,true);
            }
            else{
                 cbk( err,false);
            }
        }
    );
}
function getTooltipContent(paroisseId,cbk){
  var paramsToSend = 'action=tooltip&paroisseId=' + paroisseId;
  callAjax(paramsToSend,
    function(err,JSONResponse){
      cbk(null,JSONResponse);
    }
  );
}

// display detailled info in overlay
function buildInfo(paroisseId, paroisse){

	//  Calculate size of overlay
	function viewport()	{
		var e = window	, a = 'inner';
		if ( !( 'innerWidth' in window ) )	{
			a = 'client';
			e = document.documentElement || document.body;
		}
		return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
	}

	var xy = viewport();

	// creation overlay pour affichage contenu iframe
	var ovl = document.createElement("div");
	ovl.id = "overlay";

	// creation iframe container
	var mapPanel = document.createElement("div");
	mapPanel.id = "mapPanel";
	mapPanel.style.width = parseInt(xy.width*90/100) + "px";
	mapPanel.style.height =parseInt(xy.height*90/100)  + "px";
	mapPanel.className = "mapPanel";
	//mapPanel.setAttribute("onclick","closeModal()");
	ovl.appendChild(mapPanel);

	var labelFor = document.createElement("label");
	labelFor.setAttribute("for","mapPanel");

	var imgClose =  document.createElement("img");
	imgClose.setAttribute("class", "my_btn_close");
	imgClose.setAttribute("alt","Fermer");
	imgClose.setAttribute("title","Fermer la fenêtre");
	imgClose.setAttribute("src","./images/close_pop.png");
	imgClose.setAttribute("onclick","closeModal()");
	labelFor.appendChild(imgClose);
	mapPanel.appendChild(labelFor);

	// Creation Iframe contenant la google maps
	var iframe = document.createElement("iframe");
	iframe.name = "displayInfo";
	iframe.width  = "100%";
	iframe.height = "100%";
	var action = "readonly";

	iframe.src="./editParoisse.html?action=" + action + "&paroisseId=" + paroisseId + "&paroisse=" + paroisse + "&scriptServer=" + scriptServer;
	iframe.sandbox = "allow-forms allow-scripts allow-same-origin allow-popups ";

	mapPanel.appendChild(iframe);

	ovl.appendChild(mapPanel);

	document.body.appendChild(ovl);

}

function showModal() {
	document.getElementById("overlay").style.display="block";
	document.getElementById("mapPanel").style.display="block";
    //document.getElementById("tipArea").style.display = "none";
    tooltip.hide();
    
}
function closeModal() {
    function overlayRemove(){
        // get overlay element and remove it
        var overlay = document.getElementById("overlay");
        overlay.parentNode.removeChild(overlay);
    }
    overlayRemove();    
}



// attach event for window on load
window.addEventListener("load",
    function load(event){
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        initWin();
    }
    ,false
);

