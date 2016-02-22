Welcome to the nodePastoraleSanteJS wiki!
=========================================

Vous trouverez ici la description technique de l'application

Nous allons la decrire en trois sections :

1.  NodeJS serveur

2.  PHP serveur

3.  Application Web PastoraleSante

Partie NodeJS serveur
---------------------

Le serveur a été bati suivant le modèle décrit par
[http://nodebeginner.org/](<nodeBeginner>) ou sa traduction en
Français[http://nodejs.developpez.com/tutoriels/javascript/node-js-livre-debutant/](<Node%20livre%20du%20débutant>)  
Il n'utilise pas le framework express. D'une façon générale, j'essaye autant que
faire ce peut, de coder en pure vanilla js.

L'architecture est la suivante :
--------------------------------

###     Un module point d'entré : *lib/index.js*:

qui initialise le traitement et appelle le module *server*.  
Ce module *index.js* crée deux global object  
1- logger

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/**
 * chargement module gestion console 
 * il est defini "global" pour être appelé dans tous les modules dependants 
 */ 
global.logger = require('./logger.js').logger; 
logger.log ("Début Application : " , __dirname ););
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

2- Application

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/** 
 * definition de l'objet global Application 
 * il stocke entre autre les paramètres du config.json 
 * et des paramètres propres à l'application : 
 * voir module pastoraleSante/njs/initApplication.js
 */ 
global.Application = {};
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

###      le module serveur : *lib/serveur.js*

qui démarre le serveur http et quand il reçoit une requête:**(onRequest)**
appelle le module *routeur .*      
Le serveur écoute sur le **port** indiqué dans *lib/config.json*

###     module routeur : *lib/routeur/js*    
qui analyse l’url de la request et utilise le module *handle* pour determiner le path du module à appeler.
### module handle : *lib/handle.js*
 qui contient les différentes routes de traitement en fonction l’url    
Les différents modules de traitement ont la charge de renvoyer au client la
réponse.

-   Le module *ico* qui traite la demande favicon.ico

-   Le module *handleRequest* qui est un des modules appelé par le routeur et
    qui traite toutes les autres demandes

###     module handleRequest : *lib/requestHandlers.js, fonction handleRequest*

Il traite les demande de pages de l'application **pastoraleSante**, dont le
chemin au répertoire les contenant, a été défini dans le fichier *config.json*
si heberge sous windows le chemin est le chemin absolu du repertoire par exemple
c:/pastoraleSante ou tout autre adresse ou
c:/nodePastoraleSanteJS/pastoraleSante Si hebergé sous linux, c'est le chemin à
partir de root, par exemple /home/user/pastoraleSante/ ou toute autre adresse ou
/home/user/nodePastoraleSanteJS/pastoraleSante/

-   La page demandée n'est pas spécifiée **./** On commence par vérifier à
    l'aide du module *sesh* , si un objet *user\_session* a déjà été créé
    pour ce client, dans le cas contraire, un objet *user\_session* est crée et
    son id est inclus dans la réponse au client dans un cookie session.
    le module retourne une réponse de redirection vers la page
    **./default.html** du répertoire pastoraleSante.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /**
     *  gestionnaire de sessions
     * Attention les sessions sont detruites à l'arret du serveur
    */
    var sessionManager = require("sesh");

    .../...  get cookie session
	// set session cookie header
    var cookieToSendBack = [];
    var cookieSession = user_session.getSetCookieHeaderValue();
    cookieToSendBack.push(cookieSession);

	.../... send back response  redirect to default.html
	response.writeHead(302, {
	     'Set-Cookie' : cookieToSendBack 
	     ,'location' : '../default.html' 
	   }
	);
	response.end();
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 


-   La page demandée a pour extension **.js** On vérifie alors si le répertoire
    parent de cette page est **njs** (ex : *./njs/geteditparoisse.js*), si
    oui , cela signifie que cette page est un script javascript à exécuter côté
    serveur . On vérifie la présence du cookie session , sinon redirection vers
    page **./** qui reinitilisera la session (cf ci-dessus).

-   on utilise le module *getDataFromReq* pour récupérer les valeurs des
    paramètres passés (*get* ou\* post*) lors de l’envoi d’un formulaire d’une
    requête ajax. Ces paramètres sont stockés dans l’objet *user\_session*

-   L’exécution du module **njs/*.js** est lancé avec en paramètres : 
        l'objet *request*, 
        l'objet  *user\_session* et
        une fonction *callBack* qui renverra le réponse à retourner au client.  

    Les scripts serveur , s'interdisent de renvoyer directement une réponse au
    client, pour quelques motifs que ce soient. C'est toujours le module
    requestHandlers.js qui renvoie la séponse au client.

-   La page demandée a toute autre extension , y compris les pages **.js**
    hormis celles du répertoire **njs** :  
    La page est renoyée au client si elle existe, sinon réponse erreur 404.

### module ico :  *lib/requestHandlers.js, fonction ico*

le fichier *favicon.ico* de l'application pastoraleSante est envoyé au client.

Les scripts serveur :
---------------------

Actuellement seulement deux scripts  (répertoire pastoraleSante/njs) sont utilisés.

### initApplication.js

qui en fait un module, mais relatif à l’application.  
Il consiste à enrichir l’objet **global.Application** défini dans le module
*index.js,* Il est destiné à contenir des données propres à l’application dont
pourrait avoir besoin les autres modules.  
Il contient entre autre la propriété *dirAppl*i du fichier config.json, sour le
nom *dirApplication,* qui pourra donc être utilisé dans tous les modules comme
*Application.dirApplication*.

### getEditParoisse.js

C’est le script principal de l’application. il répond à toutes les demandes
*ajax* de l’application.  
Les paramètres de la demande sont récupérés de l’objet *user\_session.*  
En faction d’un des paramètres : *action* , différentes fonctions sont appelées,
qui retournent toutes via la fonction *calback* passée en paramètre un objet
*json* , avec trois propriétés : *status* (failed/succes) , et *answer,* que le
script client originaire de la demande traitera en:
 
    JSONresponse = JSON.parse(xhr.responseText);
    
Pour la génération des pdf il utilise le module **html-pdf**

     var pdf = require('html-pdf');
     // check https://github.com/marcbachmann/node-html-pdf for options description

### modules spécifiques

En plus des modules standards de NodeJS : **server, fs, path, url, util,
require..**, le serveur utilise des modules non standards: 

1. **tracer** : npm
install tracer , module remplacant la methode console et qui est utilisé par le
module *.lib/logger.js* voir : [https://github.com/baryon/tracer](<https://github.com/baryon/tracer>) 
2. **lowdb** : npm install lowdb , mini base json pour stocker les traces et qui est utilisé par le même module *lib/logger.js*, voir : [https://github.com/typicode/lowdb](<ttps://github.com/typicode/lowdb>) 
3. **sesh** : npm install sesh , gestionnaire léger de session, utilisé par le module *lib/requestHandlers.js* voir, : [https://github.com/marak/session.js](<https://github.com/marak/session.js>) 
4. **formidable** : npm install formidable ,permet de récupérer de l'objet request, les paramètres et/ou fichiers envoyés par "post" ce module est utilisé par le module *lib/getDataFromReq.js*, qui
recupére les data via get ou post, voir: [https://github.com/felixge/node-formidable](<https://github.com/felixge/node-formidable>)
5. **html-pdf**  : npm install -g html-pdf , genere un fichier pdf à partir de code en html, est utilisé par le module *pastoraleSante/njs/geteditparoisse.js* voir
[https://github.com/marcbachmann/node-html-pdf](<https://github.com/marcbachmann/node-html-pdf>)

Partie PHP serveur
------------------

Rien de particulier, il faut indiquer au serveur Apache ou IIS le **chemin du
repertoire pastoraleSante**.  
Le seul module qui se sert de PHP :
*pastoraleSante/php/geteditparoisse.php*  , passe l'instruction:

    ini\_set("error\_log", "./pastoraleSante\_errorfile.log"); 
pour indiquerl'adresse du fichier log.   
Comme pour le serveur nodeJS il exploite les données transmises  par post ou get des appels ajax.    
Ce module est le strict portage en php du module *njs/geteditparoisse.js*    
Pour la génération du pdf il utilise la classe  **mpdf60** voir [http://mpdf1.com/manual/index.php?tid=184](<http://mpdf1.com/manual/index.php?tid=184>)

     require_once('../mpdf60/mpdf.php');
     // see http://mpdf1.com/manual/index.php?tid=184 for explanation of parameters   

Partie Application Web Pastorale Sante
--------------------------------------

### **objet de l'application :**

L’application a pour objet de fournir des informations sur une paroisse,
informations nécéssaires à l’organisation catholique “**Pastorale Santé**”.

Cette application a été initiée pour les Doyennés (ensemble de paroisses) de
Paris.

 A partir d'une carte des paroisses, l'utilisateur en survolant la carte avec la
souris, verra des infobulles (tooltip), lui donnant une information succinte sur
chaque paroisse.

![](<./lib/imagesReadmeWiki/pastoraleSante-01.png>)

Il pourra alors cliqué sur le nom de la paroisse ou sur le bouton "clicker ici"
dans l'infobulle, et une fenêtre s'affichera avec les informations existantes
déjà saisies pour cette paroisse. Si l'utilisateur qui ce sera fait reconnaitre
pour acceder à l'application, est autorisé à modifier ces informations, il
pourra alors le faire directement dans la fenêtre. Il pourra également mettre à
jour les nom des hopitaux de la paroisse dans l'espace prévu à cet effet, ces
noms apparaitront dans les info bulles.

![](<./lib/imagesReadmeWiki//pastoraleSante_02.png>)
### **description technique l'application :**

le répertoire de l'application est **pastoraleSante**
### **La page d'acceuil est default.html**
le script associé est   *./scripts/pastoraleSante.js*.
Le contenu de la page est essentiellement une image map

    <img src="./images/CarteDoyennes2014.png" width="2141" height="1513"  usemap="#map"  >
		<map name="map">
		   <!-- #$-:Image map file created by GIMP Image Map plug-in -->
		   <!-- #$-:GIMP Image Map plug-in by Maurits Rijk -->
		   <!-- #$-:Please do not edit lines starting with "#$" -->
		   <!-- #$VERSION:2.3 -->
		   <!-- #$AUTHOR:claudy     -->
		   <area shape="rect" coords="893,224,1010,267" alt="Ste geneviève des grandes carrières"   id="001"  onmouseover= "areaOver(this)" onclick="areaClick(this)" />		
		   <area shape="rect" coords="658,407,770,443" alt="St François de Sales"   id="002"  onmouseover= "areaOver(this)" onclick="areaClick(this)" />	
                    .../...
		   <area shape="rect" coords="1040,723,1126,740" alt="St. Eustache"  id="107"  onmouseover= "areaOver(this)" onclick="areaClick(this)"  />
		</map>
          
- l'attribut *shape=rect*  défini chaque area par un rectangle    
- l'attribur *coords* defini les cordordonnées : gauche, top, droit et bottom du rectangle, elles
sont exprimées en pixel relatif à la taille réelle de l'image.    
Comme la probabilité que l'affichage de l'image dans le browser soit égale à la taille de l'image, tel que defini par les attributs *width* et *height* du tag img et de la definition css de l'image

    img[usemap] {
			border: none;
			height: auto;
			max-width: 100%;
			width: auto;
		}
nous utiliserons le script rwdImageMaps.js , qui re-calcule les coordonnées en fonction de la taille de l'image dans le browser. voir script *script/rwdImageMaps.js*
- l'attribut *alt* donne le nom de la paroisse associé à cette area
- l'attribut *id*  donne une clef unique à chaque paroisse (gestion manuelle).
- l'attribut *onmouseover* renvoie à la fonction *areaOver* du module *pastoraleSante.js*
- l'attribut *onclick* renvoie à la fonction *areaClick* du module *pastoraleSante.js*

La div dont l'id est *tipContent* en bas de page sert de container au tooltip.
    
	<div id="tipContent" style="display:none;"></div>
    
### **Le script pastoraleSante.js**
**Important :** en tête du script se trouve la définition de deux variables globales    

    window.blnUserAllowed= true;
    //window.blnUserAllowed = false;
    window.scriptServer = "php";
    //window.scriptServer = "njs"; 
   
 - la variable * **blnUserAllowed** * indique si l'utilisateur est autorisé ou non,  à modifier les informations des paraoisses.
 - la variable * **scriptServer** * indique si le serveur HTTP est *nodeJS* ou *php*
 
 le contenu de ces variables peut être transmis soit par *cookie* , soit par *queryString*, ou tout autre méthode à la convenance de l'installeur.

**fonction areOver(areaElem):**
Permet d'afficher un tooltip.    
On utilise le script *tooltip/src/tooltip.js* voir : [www.menucool.com](<www.menucool.com>)   
**Attention Cette fonction n'est pas gratuite** (20 usd par domaine). voir : [http://www.menucool.com/tooltip/javascript-tooltip#license](< toolTip licence>)   
Si l'on utilise sans payer : licence developper, de temps en temps s'affiche un tooltip de rappel
   
Cette fontion appele la fonction asynchrone *buildTip*.    
-  cette fonction *buildtip* est asynchrone car elle fait un appel *ajax* pour alimenter une partie du contenue du tooltip: la partie *Hopital*    
 En retour (fonction callback) on affiche le tooltip
 
 **fonction areClick(areaElem):**    
 Sur click dans un tooltip ou directement sur l'area determinant la paroisse, cette fonction affiche une *div modal*    
 Cette div contient un *iframe* dont la source est la page *./editParoisse.html*, page à laquelle on passe un *queryString* indiquant le numero de la paroise, le libelle de la paroisse et l'action autorisée pour la mise à jour des données : *readonly* ou *readupdate* en fonction de la variable globale  *blnUserAllowed*    
 A cette page est associé un script * **script/editParoisse.js** *    
 A cette div est associée une image (croix rouge) qui permet de fermer la div.
~~~~~~  
     "onclick","closeModal()"
~~~~~~
        
 On surveille la fermeture intempestive de la page (fermeture de l'onglet ou du browser)
 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~        
     // attach event for window unload page
     window.addEventListener("beforeunload", unloadPage);
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
 
 ### **La Page de mise à jour des données:  ./editParoisse.html **       
 le script associé est   *./scripts/editParoisse.js*.
 
  Cette page contient deux div containers : *id= "infoParoisse"*  et *id="infoHosto"*
  le script alimente via ajax les infos en provenance des repertoires *./infoParoisse* et *./hostoParoisse*
  Les données sont stockées sous forme de fichiers htext (html) ; un fichier par paroisse
  **info\*\*\*.htext** et **hosto\*\*\*.htext ** ou **\*\*\*** représente l'identifiant de la paroisse.    
  A l'ouverture de la page, le script lance une demande ajax de création d'un fichier verrou : **hosto\*\*\*.lck ** qui interdit une demande de mise à jour par une autre personne sur la même paroisse.    
  Le verrou est supprimé lors de la fermeture de la page par la croix rouge.    
  Durant toute l'initilisation de la page , un sablier tourne.
 
  Via le module de traitement de texte **ckeditor** voir : [http://ckeditor.com/](<ckeditor>), les informations peuvent être mise à jour si la personne est autorisée à saisir (paramètre *readupdate* ou *readonly* de la querystring)    
  
  ckeditor utilise des plugin specifiques : *./pastoraleSante/ckeditor/plugins*, non prévus dans le mode *inline* de l'editor.
  ~~~~
       CKEDITOR.config.extraPlugins = 'colorbutton,cia_inlinesave,pastefromword,dialogadvtab,tableresize,colordialog,font';
  ~~~~       
 ![](<./lib/imagesReadmeWiki/pastoraleSante-03.png>)   
   
 - Le bouton *pdf*  genere un fichier pdf des info paroisse.
 - La *coche verte* sert à sauvegarder les mises à jour 
 - La croix rouge sert à quitter et sauvegarder les données   
 
Le bouton en haut à gauche permet de passer du mode *mise à jour* au mode *visualisation*

### **Le script editParoisse.js**

A l'initialisation de la page, le script
- Passe un appel ajax pour creer le fichier *.lck* : **action=lockParoisse**
- Pose le sablier, 
- Instancie les deux CKEDITOR (un pour chaque div *infoParoisse* et *hostoParoisse*)
- Fait deux appels Ajax pour remplir chacune des div depuis les fichiers htext    
**action=readParoisse** et **action=readHosto**
- Supprime le sablier quand les intances de ckeditor et les datas sont prets.
- Fait deux appels Ajax quand la sauvegarde est demandée : **action=saveParoisse** et **action=saveHosto**
- Fait un appel ajax sur demande d'edition d'un pdf : **action=pdf** , en retour de l'appel on crée un lien dynamique caché avec pour source le nom du fichier pdf créé **./infoParoisse/info\*\*\*.pdf** et active le lien , ce qui permet son téléchargement.
- fait un appel ajax pour supprimer **action=action=unLockParoisse** le fichier *.lck*

**Attention** : en cas d'abandon de la page : fermeture du browser ou de l'onglet , malgre le message d'avertissement, le fichier *.lck* restera vivant.
Si cette même paroisse est demandée en mise à jour, il faudra attendre 24h pour pouvoir y acceder.
voir la fonction :  **checkIfLockedParoisse** du fichier script **geteditparoisse.js ou php**
