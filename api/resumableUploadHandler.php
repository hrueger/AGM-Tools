<?php
session_start();
require_once("library.php");
require_once("db.inc.php");


echo "___________________________________________\n";
var_dump($_POST);
echo "\n";
var_dump($_GET);
echo "\n";
var_dump($_FILES);
echo "\n";
echo "___________________________________________\n\n\n";


if (isset($_POST["fid"])) {
    $_SESSION["fid"] = $_POST["fid"];
}
if (isset($_POST["pid"])) {
    $_SESSION["pid"] = $_POST["pid"];
}


function _log($str) {

    // log to the output
    $log_str = date('d.m.Y').": {$str}\r\n";
    echo $log_str;

    // log to file
    if (($fp = fopen('upload_log.txt', 'a+')) !== false) {
        fputs($fp, $log_str);
        fclose($fp);
    }
}

function rrmdir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (filetype($dir . "/" . $object) == "dir") {
                    rrmdir($dir . "/" . $object); 
                } else {
                    unlink($dir . "/" . $object);
                }
            }
        }
        reset($objects);
        rmdir($dir);
    }
}

function createFileFromChunks($temp_dir) {
    
    
    if (($_POST["totalChunk"]-$_POST["chunkIndex"])==1) {
    // create the final destination file 
		
		$db = connect();
        
        $pid = $_SESSION["pid"];
        $fid = $_SESSION["fid"];
        $_SESSION["pid"] = "";
        $_SESSION["fid"] = "";

		$fpath = getFolderPath( $db, $fid );
        $prepath = getSetting( $db, "SETTING_FILES_DIRECT_PATH" , true);
        $fileName = $_FILES["chunkFile"]["name"];
		$filePath = $prepath . "/$pid/" . $fpath . "/" . $fileName;
		
		
        if (($fp = fopen($filePath, 'w')) !== false) {
            for ($i=0; $i<=($_POST["totalChunk"]-1); $i++) {
                
                fwrite($fp, file_get_contents($temp_dir.'/'.$fileName.'.part'.$i));
                _log('writing chunk '.$i);
            }
            fclose($fp);
			
			
			$db->query( "INSERT INTO `files` (`project`, `name`, `folder`) VALUES ('$pid', '$fileName', '$fid')" );
			
			
			
			_log("File $fileName created succesfully at $filePath");
			
        } else {
            _log('cannot create the destination file');
            return false;
        }

        // rename the temporary directory (to avoid access from other 
        // concurrent chunks uploads) and than delete it
        if (rename($temp_dir, $temp_dir.'_UNUSED')) {
            rrmdir($temp_dir.'_UNUSED');
        } else {
            rrmdir($temp_dir);
        }
    }
	

}

// loop through files and move the chunks to a temporarily created directory
if (!empty($_FILES)) foreach ($_FILES as $file) {

    // check the error status
    if ($file['error'] != 0) {
        _log('error '.$file['error'].' in file '.$_FILES["chunkFile"]['name']);
        continue;
    }

    // init the destination file (format <filename.ext>.part<#chunk>
    // the file is stored in a temporary directory
    if(isset($_FILES["chunkFile"]['name']) && trim($_FILES["chunkFile"]['name'])!=''){
        $temp_dir = 'tmp/'.$_FILES["chunkFile"]['name'];
         _log("Temp Verzeichnis: ".$temp_dir);
    } else {
        $temp_dir = 'tmp/'."unbenannt".uniqid();
        _log("unbenanntes Temp Verzeichnis");
    }
    $dest_file = $temp_dir.'/'.$_FILES["chunkFile"]['name'].'.part'.$_POST['chunkIndex'];

    // create the temporary directory
    if (!is_dir($temp_dir)) {
        var_dump(mkdir($temp_dir, 0777, true));
    }

    // move the temporary file
    if (!move_uploaded_file($file['tmp_name'], $dest_file)) {
        _log('Error saving (move_uploaded_file) chunk '.$_POST['chunkIndex'].' for file '.$_FILES["chunkFile"]['name']);
    } else {
        _log('writing chnunk successfully');
        // check if all the parts present, and create the final destination file
        createFileFromChunks($temp_dir);
		
    }
}
