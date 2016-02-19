**Gestion des infos de santé pour La Pastorale Santé**
======================================================

 

**Présentation de l’application:**
==================================

L’application a pour object de fournir des informations sur une paroisse,
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

**Installation de l’application:**
==================================

L'application est composée de deux parties, une qui est un serveur NodeJS,
l'autre qui est une application WEB , qui dialogue soit avec le serveur NodeJS,
soit avec un serveur HTTP autre.

Le repertoire **LIB** est le répertoire qui contient le serveur NodeJS.

Le repertoire** pastoraleSante** contient l'application WEB proprement dite.

 

### Serveur NodeJS: 

S'assurer que l'application NodeJS a bien été installé
([nodejs.org](<https://nodejs.org/>)) Une fois le Zip téléchargé et décompressé,
faire **npm install**

Avec votre éditeur json favori mettre à jour les propriétés nomAppl, dirAppli,
et port d'ecoute dans le fichier config.json

Démarrer le serveur via la commande :   *node index.js info   , *où info est le
niveau de log que l’on souhaîte.

Ouvrir ensuite le navigateur à l’adresse :* http://localhost:port/,  *et la
carte* *des doyennées de Paris s’affichera.

 

### Application Web pastoraleSante :

L’application sait dialoguer avec le serveur NodeJS  et les scripts côté serveur
sont dans le répertoire *: njs*,  
soit avec un serveur HTTP Apache ou IIS ou autre.. , dans ce cas , les scripts
serveurs sont en PHP et situés dans le répertoire : *php*. Dans ce cas PHP doiot
être actif sur le derveur HTTP.

Dans le cas du serveur NodeJS le répertoire de l’application peut être placé où
l’on veut, son chemin doit être indiqué dans le fichier* config.json.*

 
