
<?php

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

function createFileFromChunks($temp_dir, $fileName, $chunkSize, $totalSize,$total_files) {

    // count all the parts of this file
    $total_files_on_server_size = 0;
    $temp_total = 0;
    foreach(scandir($temp_dir) as $file) {
        $temp_total = $total_files_on_server_size;
        $tempfilesize = filesize($temp_dir.'/'.$file);
        $total_files_on_server_size = $temp_total + $tempfilesize;
    }
    // check that all the parts are present
    // If the Size of all the chunks on the server is equal to the size of the file uploaded.
    if ($total_files_on_server_size >= $totalSize) {
    // create the final destination file 
		
		$db = connect();
		$pid = $_GET[ "pid" ];
		$fid = $_GET[ "fid" ];

		$fpath = getFolderPath( $db, $fid );
		$prepath = substr(getSetting( $db, "SETTING_FILES_DIRECT_PATH" ), 1);
		$filePath = $prepath . "/$pid/" . $fpath . "/" . $fileName;
		
		
        if (($fp = fopen($filePath, 'w')) !== false) {
            for ($i=1; $i<=$total_files; $i++) {
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

//check if request is GET and the requested chunk exists or not. this makes testChunks work
/*if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if(!(isset($_GET['resumableIdentifier']) && trim($_GET['resumableIdentifier'])!='')){
        $_GET['resumableIdentifier']='';
    }
    $temp_dir = 'tmp/'.$_GET['resumableIdentifier'];
    if(!(isset($_GET['resumableFilename']) && trim($_GET['resumableFilename'])!='')){
        $_GET['resumableFilename']='';
    }
    if(!(isset($_GET['chunkIndex']) && trim($_GET['chunkIndex'])!='')){
        $_GET['chunkIndex']='';
    }
    $chunk_file = $temp_dir.'/'.$_GET['resumableFilename'].'.part'.$_GET['chunkIndex'];
    if (file_exists($chunk_file)) {
        file_put_contents("/var/www/html/AGM-Tools/fileuploaderlog.txt", "Chunk ".$_GET['chunkIndex']." mit dem Pfad $chunk_file existierte schon\n", FILE_APPEND);
         header("HTTP/1.0 200 Ok");
       } else {
           file_put_contents("/var/www/html/AGM-Tools/fileuploaderlog.txt", "Chunk ".$_GET['chunkIndex']." mit dem Pfad $chunk_file existierte noch nicht\n", FILE_APPEND);
         header("HTTP/1.0 404 Not Found");
       }
}*/

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
        createFileFromChunks($temp_dir, $_FILES["chunkFile"]['name'],1048576, $_FILES["chunkFile"]['size'],$_POST['totalChunk']);
		
    }
}
