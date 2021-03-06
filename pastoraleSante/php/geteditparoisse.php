﻿<?php
    /*
    Doyenne sante

    Display , update , print to pdf information in html from ifoParoisse directory
    each paroisse is identified by a num xxx
    eac description paroisse file in name infoxxx.htext , where xxx is paroisse #

    Three action :
        Read : get content of infoParoiss.htxt and sendback
        Save : rewrite content of infoParoisse from info parameter
        export2pdf: get content of infoParoiss.htxt, convert it in pdf file and sendback

    */
    ini_set("error_log", "./pastoraleSante_errorfile.log");

    // for collecting duration
    $bench = array();
    $bench["start_proc"] = microtime_float();
    $mode = "query";

error_log ('main Program');

    //get data from post
    $action          = (isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : ''));
    $paroisseId      = (isset($_POST['paroisseId']) ? $_POST['paroisseId'] : (isset($_GET['paroisseId']) ? $_GET['paroisseId'] : ''));
    $info            = (isset($_POST['info']) ? $_POST['info'] : (isset($_GET['info']) ? $_GET['info'] : ''));
    $user            = $_SERVER['REMOTE_USER'];
error_log ('action ' . $action . 'pour user : '.$user);
  //
  // check if user Allowed
  if($action === "ifUserAllowed"){
        error_log ('ifUserAllowed pour :'.$user );
        $resifUserAllowed  = checkIfUserAllowed($user);
        $response =  $resifUserAllowed;
  }
	// check if Locked
	if($action === "ifLockedParoisse"){
        error_log ('checkIfLockedParoisse');
        $resIfLockedParoisse  = checkIfLockedParoisse($paroisseId);
        $response =  $resIfLockedParoisse;
	}
	// lock paroisse
	else if($action === "lockParoisse"){
		error_log ('lockParoisse');
        $resLockParoisse  = lockParoisse($paroisseId);
        $response =  $resLockParoisse;
	}
	// inlock Paroisse
	else if($action === "unLockParoisse"){
		error_log ('unLockParoisse');
        $resUnLockParoisse  = unLockParoisse($paroisseId);
        $response =  $resUnLockParoisse;
	}
    // action = read Paroisse
    else if ($action == "readParoisse"){
        error_log ('get dataParoisse');
        $resGetData  = getDataParoisse($paroisseId);
        $response =  $resGetData;
    }
    // action = read Hosto
    else if ($action == "readHosto"){
        error_log ('get dataHosto');
        $resGetData  = getDataHosto($paroisseId);
        $response =  $resGetData;
    }
    // update Data Paroisse
    else if ($action == 'saveParoisse') {
        error_log ('save dataParoisse');
        $resSaveData = saveDataParoisse($paroisseId,$info);
        $response =  $resSaveData;
    }
    // update Data Hosto
    else if ($action == 'saveHosto') {
        error_log ('save dataHosto');
        $resSaveData = saveDataHosto($paroisseId,$info);
        $response =  $resSaveData;
    }
    //export to PDF
    else if ($action === 'pdf') {
		error_log ('export pdf');
		$resExport2pdf = export2pdf($paroisseId,$info);
         error_log ($resExport2pdf);
        $response = $resExport2pdf;
	}
    //Build Tooltip content
    else if ($action === 'tooltip') {
		 error_log ('buildTooltip');
        $resBldTooltip = buildTooltip($paroisseId);
        $response = $resBldTooltip;
    }


    // sendback $response data as json

	//$bench["deb_json"] = microtime_float();
	set_time_limit (360);

	$output = json_encode($response);
	// save to file for pagination $rows Array


	//$bench["fin_json"] = microtime_float();

	//$bench["deb_echo"] = microtime_float();

	echo $output;

	//$bench["fin_echo"] = microtime_float();

	$bench["end_proc"] = microtime_float();

	if($mode != "init") {
		/*error_log($_SERVER["REMOTE_ADDR"]. "  ".
			'  size of Output : ' . strlen($output));
		error_log ($_SERVER["REMOTE_ADDR"]. "  ".
			'  debut json : '.$bench["deb_json"].
			'  fin json   : '.$bench["fin_json"].
			'  duree json : '.($bench["fin_json"] - $bench["deb_json"])." seconds");
		error_log ($_SERVER["REMOTE_ADDR"]. "  ".
			'  debut echo : '.$bench["deb_echo"].
			'  fin echo   : '.$bench["fin_echo"].
			'  duree echo : '.($bench["fin_echo"] - $bench["deb_echo"])." seconds");
        */
		error_log ($_SERVER["REMOTE_ADDR"]. "  ".
			'  debut proc : '.$bench["start_proc"].
			'  fin proc   : '.$bench["end_proc"].
			'  duree proc : '.($bench["end_proc"] - $bench["start_proc"])." seconds");
	}

  /* ******************************************************************** */
  // check if User Allowed
  function checkIfUserAllowed($user) {
    $blnUserAllowed = false;
    if (strtolower($user) === 'claudy' ||
        strtolower($user) === 'philippe' ||
        strtolower($user) === 'florence' ||
        strtolower($user) === 'alain'
        ){
          $blnUserAllowed = true;
      }
      else{
        $blnUserAllowed = false;
      }
      $res = array(
          'status' => "success",
          'reason' => "cookie has been set",
          'answer' => $blnUserAllowed
      );
        return $res;
  }
  // check if locked paroisse
	function checkIfLockedParoisse($paroisseId) {
        $pathToFile = "../datasParoisse/infoParoisse/"."info". $paroisseId . ".lck";
        error_log("checkIfLockedParoisse" . realpath($pathToFile));
        $blnExist = file_exists ($pathToFile);
        // fichier existe
        if ($blnExist) {
            clearstatcache();
            $intDate = filemtime ($pathToFile );
            error_log("checkIfLockedParoisseintDate via filemtime : " . $pathToFile . "  ".$intDate);
            $mDate = date("Y-m-d",$intDate);
            error_log("checkIfLockedParoisse mDate : " . $pathToFile . "  ".$mDate);
            $toDay = date("Y-m-d");
            error_log("checkIfLockedParoisse toDay : ".$toDay);
            // chek if date fichier anterieure à la journée en cours
            if ($mDate < $toDay){
                 error_log("checkIfLockedParoisse mDate : " . $pathToFile . "  ".$mDate. " fichier perimé, on supprime");
                // si périmé on supprime le fichier
                $blnUnlink = unlink ($pathToFile);
                // si problème dans unlink (ne devrait pas être)
                if (!$blnUnlink) {
                    $err = error_get_last();
                    $res = array(
                        'status' => "failed",
                        'reason' => $err['message'],
                        'answer' => ""
                    );
                }
                // le fichier a été supprimé
                else{
                    $res = array(
                        'status' => "success",
                        'reason' => "file :".$pathToFile." hes been destroyed",
                        'answer' => false
                    );
                }
            }
            // fichier existe et non perimé
            else{
                $res = array(
                    'status' => "failed",
                    'reason' => "file :".$pathToFile." already existing",
                    'answer' => true
                );
            }
        }
        // fichier n'existe pas
        else{
            $res = array(
                'status' => "success",
                'reason' => "file :".$pathToFile." not yet exist",
                'answer' => false
            );
        }
        return $res;
	}

    // lock paroisse
	function lockParoisse($paroisseId){
        $pathToFile = "../datasParoisse/infoParoisse/"."info". $paroisseId . ".lck";
        error_log("Lock paroisse" . $pathToFile);
        $myfile = fopen("$pathToFile", "w");
        if (!$myfile){
            $err = error_get_last();
            $res = array(
                'status' => "failed",
                'reason' => $err['message'],
                'answer' => ""
            );
        }
        else{
            $ret = fwrite($myfile,"");
            if(!$ret) {
                $err = error_get_last();
                $res = array(
                    'status' => "failed",
                    'reason' => $err['message'],
                    'answer' => ""
                );
            }
            else{
                $res = array(
                    'status' => "success",
                    'reason' => "",
                    'answer' => ""
                );
            }
            fclose($myfile);
        }
        return $res;
	}

    // unLock paroisse
	function unLockParoisse($paroisseId){
		$pathToFile = "../datasParoisse/infoParoisse/"."info". $paroisseId . ".lck";
        error_log("unLock paroisse" . $pathToFile);
        $blnUnlink = unlink ($pathToFile);
        if (!$blnUnlink) {
            $err = error_get_last();
            $res = array(
                'status' => "failed",
                'reason' => $err['message'],
                'answer' => ""
            );
        }
        else{
            $res = array(
                'status' => "success",
                'reason' => "",
                'answer' => "file :".$pathToFile." hes been destroyed"
            );
        }
        return $res;
	}

    // get data Paroisse
	function getDataParoisse($paroisseId){
		$pathToFile = "../datasParoisse/infoParoisse/"."info". $paroisseId . ".htext";
        if (file_exists($pathToFile)) {
            $myfile = fopen("$pathToFile", "r");
            if (!$myfile) {
                $err = error_get_last();
                $res = array(
                    'status' => "failed",
                    'reason' => $err['message'],
                    'answer' => ""
                );
            }
            else{
                $html = fread($myfile,filesize($pathToFile));
                if(!$html) {
                    $err = error_get_last();
                    $res = array(
                        'status' => "failed",
                        'reason' => $err['message'],
                        'answer' => ""
                    );
                }
                else{
                    $res = array(
                        'status' => "success",
                        'reason' => "",
                        'answer' => $html
                    );
                }
            }
            fclose($myfile);
        }
        else{
            $pathToFile = "../datasParoisse/infoParoisse/"."modele.htext";
            if (file_exists($pathToFile)) {
                $myfile = fopen("$pathToFile", "r");
                if (!$myfile){
                    $err = error_get_last();
                    $res = array(
                        'status' => "failed",
                        'reason' => $err['message'],
                        'answer' => ""
                    );
                }
                else{
                    $html = fread($myfile,filesize($pathToFile));
                    if(!$html) {
                        $err = error_get_last();
                        $res = array(
                            'status' => "failed",
                            'reason' => $err['message'],
                            'answer' => ""
                        );
                    }
                    else{
                        $res = array(
                            'status' => "success",
                            'reason' => "",
                            'answer' => $html
                        );
                    }
                }
                fclose($myfile);
            }
            else{
                $res = array(
                    'status' => "failed",
                    'reason' => "Ficher modele.htext absent ????? " ,
                    'answer' => "Ficher modele.htext absent ????? "
                );
            }
        }

        return $res;
    }

    // get data Hosto
	function getDataHosto($paroisseId){
		$pathToFile = "../datasParoisse/hostoParoisse/"."hosto". $paroisseId . ".htext";
        if (file_exists($pathToFile)) {
            $myfile = fopen("$pathToFile", "r");
            if (!$myfile) {
                $err = error_get_last();
                $res = array(
                    'status' => "failed",
                    'reason' => $err['message'],
                    'answer' => ""
                );
            }
            else{
                $html = fread($myfile,filesize($pathToFile));
                if(!$html) {
                    $err = error_get_last();
                    $res = array(
                        'status' => "failed",
                        'reason' => $err['message'],
                        'answer' => ""
                    );
                }
                else{
                    $res = array(
                        'status' => "success",
                        'reason' => "",
                        'answer' => $html
                    );
                }
            }
            fclose($myfile);
        }
        else{
            $res = array(
                'status' => "success",
                'reason' => "fichier hosto absent",
                'answer' => ""
            );
        }

        return $res;
    }

    // save data Paroisse
	function saveDataParoisse($paroisseId, $info){
        $pathToFile = "../datasParoisse/infoParoisse/"."info". $paroisseId . ".htext";
        error_log("save data " . $pathToFile);
        $myfile = fopen("$pathToFile", "w");
        if (!$myfile){
            $err = error_get_last();
            $res = array(
                'status' => "failed",
                'reason' => $err['message'],
                'answer' => ""
            );
        }
        else{
            $ret = fwrite($myfile,$info);
            if(!$ret) {
                $err = error_get_last();
                $res = array(
                    'status' => "failed",
                    'reason' => $err['message'],
                    'answer' => ""
                );
            }
            else{
                $res = array(
                    'status' => "success",
                    'reason' => "",
                    'answer' => ""
                );
            }
            fclose($myfile);
        }

        return $res;
	}

    // save data Hosto
	function saveDataHosto($paroisseId, $info){
        $pathToFile = "../datasParoisse/hostoParoisse/"."hosto". $paroisseId . ".htext";
        error_log("save data " . $pathToFile);
        $myfile = fopen("$pathToFile", "w");
        if (!$myfile){
            $err = error_get_last();
            $res = array(
                'status' => "failed",
                'reason' => $err['message'],
                'answer' => ""
            );
        }
        else{
            $ret = fwrite($myfile,$info);
            if(!$ret) {
                $err = error_get_last();
                $res = array(
                    'status' => "failed",
                    'reason' => $err['message'],
                    'answer' => ""
                );
            }
            else{
                $res = array(
                    'status' => "success",
                    'reason' => "",
                    'answer' => ""
                );
            }
            fclose($myfile);
        }

        return $res;
	}

    // export2pdf
    function export2pdf($paroisseId,$info){
		$pathToFile = "../datasParoisse/infoParoisse/" . "info" . $paroisseId . ".pdf";
        // margin in mm
        $margin_top     = 10;
        $margin_right   = 5;
        $margin_left    = 5;
        $margin_bottom  = 10;
        $margin_header  = 0;
        $margin_footer  = 0;
        error_log ("export2pdf start");
       // J'ai essaye plusieurs modules pour convertir en PDf
       // seul mpdf60 donne à peu pres satisfaction avec les tableaux.
        require_once('../mpdf60/mpdf.php');
        // see http://mpdf1.com/manual/index.php?tid=184 for explanation of parameters

        $mpdf=new mPDF('utf-8','A4','','', $margin_left , $margin_right , $margin_top , $margin_bottom , $margin_header ,$margin_footer);

        $mpdf->SetDisplayMode('fullpage');
        $mpdf->list_indent_first_level = 0;  // 1 or 0 - whether to indent the first level of a list
        $mpdf->WriteHTML($info);
        $mpdf->Output($pathToFile, 'F');

/*
        require_once("../dompdf/dompdf_config.inc.php");
        $dompdf = new DOMPDF();
        $dompdf->set_paper("A4", "portrait");
        $dompdf->load_html($info);
        $dompdf->render();
        //$dompdf->output($pathToFile, 'F');
        $output = $dompdf->output();
        file_put_contents($pathToFile, $output);
 */

   /*     $marges = array($margin_left,$margin_top, $margin_right, $margin_bottom);
        require_once('../html2pdf/vendor/autoload.php');
        try{
            $html2pdf = new HTML2PDF('P','A4','fr',true,'UTF-8',$marges);
            $html2pdf->WriteHTML($info);
            //$html2pdf->Output($pathToFile,'F');
            $html2pdf->Output($pathToFile);
            error_log("output done");
        }
        catch(HTML2PDF_exception $e){
            //die($e);
           error_log ($e);

        }
        */

	}

        // build Tooltip
    function buildTooltip($paroisseId){
        $strHTML = "";
		$pathToFile = "../datasParoisse/hostoParoisse/" . "hosto" . $paroisseId . ".htext";
       if ( file_exists($pathToFile)) {
            $data = file($pathToFile);
            //catch error on read file in array
            if(!$data) {
                $err = error_get_last();
                $strHTML .= '<p>' . ' ' . '</p>';
                $res = array(
                    'status' => "failed",
                    'reason' => $err['message'],
                    'answer' => $strHTML
                );
            }
            // send back data
            else{
                $strHTML = $data;
                $res = array(
                    'status' => "success",
                    'reason' => $data,
                    'answer' => $strHTML
                );
            }

        }
        // file not exist
        else{
            $strHTML .= '<p>' . ' ' . '</p>';
            $res = array(
                'status' => "failed",
                'reason' => "file not exist",
                'answer' => $strHTML
            );
        }
        return $res;
	}


	// return #µsec from unix time
	function microtime_float()
    {
		list($usec, $sec) = explode(" ", microtime());
		return ((float)$usec + (float)$sec);
    }

?>
