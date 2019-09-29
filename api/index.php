<?php

//$data = file_get_contents('php://input');
//var_dump($data);
//die();

use YoHang88\LetterAvatar\LetterAvatar;
require_once("db.inc.php");
require_once("library.php");

$locale='de_DE.UTF-8';
setlocale(LC_ALL,$locale);
putenv('LC_ALL='.$locale);

function log_to_file($log_msg) {
    $log_filename = "log.txt";
    
    
    file_put_contents($log_filename, $log_msg . "\n", FILE_APPEND);
}



if (isset($_GET["get"]) && isset($_GET["type"]) && (isset($_GET["token"])||isset($_GET["shareLink"]))) {
    $skipSessionCheck = false;
    if (isset($_GET["shareLink"]) || !isset($_GET["token"])) {
        $db = connect();
        $shareLink = $db->real_escape_string($_GET["shareLink"]);
        $item = $db->query("SELECT * FROM shares WHERE link='$shareLink'");
        if (!$item) {
            
        } else {
            $item = $item->fetch_all(MYSQLI_ASSOC);
            
            if (empty($item)) {
                
            } else {
                if ($_GET["type"]==$item[0]["type"] && $_GET["get"]==$item[0]["targetID"]) {
                    $skipSessionCheck = true;
                } else {
                   
                }
            }
        }
    }

    if ($_GET["type"] == "file") {
        $db = connect();
        $fid = $db->real_escape_string($_GET["get"]);
        $res = $db->QUERY("SELECT members FROM projects JOIN files ON files.project = projects.id WHERE files.id = $fid");
        if ($res) {
            $res = $res->fetch_all(MYSQLI_ASSOC);
            if (($res && isset($res[0]) && isset($res[0]["members"])) || $skipSessionCheck) {
                $members = explode("-", $res[0]["members"]);
                if ($skipSessionCheck || in_array(getCurrentUserId(), $members)) {
                    $fc = new FileController($db, true);
                    $path = $fc->getLocalFilePath($fid, true);



                    $file_size  = filesize($path);
                    $file_name = pathinfo($path, PATHINFO_FILENAME);
                    $file = @fopen($path,"rb");
                    $mime = getMime($path);
                    header('Content-type: ' . $mime);
                    if (isset($_GET["download"])) {
                        header('Content-Disposition: attachment; filename="' . basename($path) . '"');
                    } else {
                        header('Content-Disposition: inline; filename="' . basename($path) . '"');
                    }
                    
                    header('Content-length: '.filesize($path));
                    
                    if(isset($_SERVER['HTTP_RANGE'])){
                        list($size_unit, $range_orig) = explode('=', $_SERVER['HTTP_RANGE'], 2);
                        if ($size_unit == 'bytes')
                        {
                            @list($range, $extra_ranges) = explode(',', $range_orig, 2);
                        }
                        else
                        {
                            $range = '';
                            header('HTTP/1.1 416 Requested Range Not Satisfiable');
                            exit;
                        }
                    }
                    else
                    {
                        $range = '';
                    }
                    list($seek_start, $seek_end) = explode('-', $range, 2);
                    $seek_end   = (empty($seek_end)) ? ($file_size - 1) : min(abs(intval($seek_end)),($file_size - 1));
                    $seek_start = (empty($seek_start) || $seek_end < abs(intval($seek_start))) ? 0 : max(abs(intval($seek_start)),0);
                    if ($seek_start > 0 || $seek_end < ($file_size - 1))
                    {
                        header('HTTP/1.1 206 Partial Content');
                        header('Content-Range: bytes '.$seek_start.'-'.$seek_end.'/'.$file_size);
                        header('Content-Length: '.($seek_end - $seek_start + 1));
                    }
                    else
                    header("Content-Length: $file_size");
                    header('Accept-Ranges: bytes');
                    set_time_limit(0);
                    fseek($file, $seek_start);
                    
                    header("Content-Length: $file_size");
                    ob_clean();
                    while($file && !feof($file))  {
                        print(@fread($file, 1024*8));
                        ob_flush();
                        flush();
                        if (connection_status()!=0) 
                        {
                            @fclose($file);
                            exit;
                        }	
                        
                    }
                    
                
                    @fclose($file);
                    exit;





                    //echo $mime;

                    die();
                } else {
                    die("Verweigert");
                }
            }
        }
    } else if ($_GET["type"] == "folder") {
        $db = connect();
        $fid = $db->real_escape_string($_GET["get"]);
        $res = $db->query("SELECT members FROM projects JOIN folders ON folders.project = projects.id WHERE folders.id = $fid");
        if ($res) {
            $res = $res->fetch_all(MYSQLI_ASSOC);
            
            if (($res && isset($res[0]) && isset($res[0]["members"])) || $skipSessionCheck) {
                $members = explode("-", $res[0]["members"]);
                if ($skipSessionCheck || in_array(getCurrentUserId(true), $members)) {
                    
                    $fc = new FileController($db, true);
                    $path = $fc->getCompleteFolderPath($fid, true);
                    
                    $filename = uniqid();
                    $zip = new ZipArchive();
                    $rootPath = realpath($path);
                    $zip->open($filename, ZipArchive::CREATE | ZipArchive::OVERWRITE);
                    $files = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($rootPath),
                        RecursiveIteratorIterator::LEAVES_ONLY
                    );

                    foreach ($files as $name => $file) {
                        if (!$file->isDir())
                        {
                            // Get real and relative path for current file
                            $filePath = $file->getRealPath();
                            $relativePath = substr($filePath, strlen($rootPath) + 1);

                            // Add current file to archive
                            $zip->addFile($filePath, $relativePath);
                        }
                    }
                    $zip->close();
                    header('Content-Type: application/zip');
                    $foldername = $db->query("SELECT * FROM folders WHERE id='$fid'")->fetch_all(MYSQLI_ASSOC)[0]["name"];
                    header('Content-Disposition: attachment; filename="'.$foldername.'.zip"');
                    header('Content-Length: ' . filesize($filename));
                    readfile($filename);
                    unlink($filename); 
                    die();
                } else {
                    die("Verweigert");
                }
            } else {
                die("Verweigert");
            }
        } else {
            die("Verweigert");
        }
        die("Verweigert");
    } else {
        die("Verweigert");
    }
}

if (isset($_POST["sendChatAttachment"])) {
    if (isset($_POST["type"]) && $_POST["type"] == "image") {
        if (isset($_FILES["attachment"])) {
            $db = connect();

            $name = uniqid() . ".png";
			$path = getSetting($db, "SETTING_FILES_DIRECT_PATH");
			$path = $path . "/attachments/$name";

			if (!move_uploaded_file($_FILES["attachment"]["tmp_name"], $path)) {
				die("Die Datei konnte nicht hochgeladen werden, weil ".$_FILES["attachment"]["error"]);
            }
            
            
            $dest = "/var/www/html/AGM-Tools/data/attachments/" . pathinfo($path)["filename"] . ".thumbnail." . pathinfo($path)["extension"];
            makeThumb($path, $dest);

            $name = $db->real_escape_string($name);
            $rid = $_POST["sendChatAttachment"];
            chatSendMessage(array(
                "rid" => $rid,
                "message" => "Bild",
                "imageSrc" => $name
            ));
            die(json_encode(array("status" => true, "imageSrc" => $name)));
        }
    }
}

if (isset($_GET["getAttachment"])) {

    /*$src = "/var/www/html/AGM-Tools/data/attachments/" . explode("/", $_GET["getAttachment"])[0];
    $dest = "/var/www/html/AGM-Tools/data/attachments/" . pathinfo($src)["filename"] . ".thumbnail." . pathinfo($src)["extension"];
    makeThumbnail($src, $dest);
    die();*/

    $db = connect();
    $prepath = getSetting($db, "SETTING_FILES_DIRECT_PATH");
    $file = $prepath . "/attachments/" . explode("/", $_GET["getAttachment"])[0];
    if (isset($_GET["thumbnail"])) {
        $file = $prepath . "/attachments/" . pathinfo($file)["filename"] . ".thumbnail." . pathinfo($file)["extension"];
    }
    
    if (file_exists($file)) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $header = finfo_file($finfo, $file);
        header("Content-Type: $header");
        readfile($file);
        exit;
    }
}

if (isset($_GET["downloadMobileLatest"])) {
    $db = connect();
    $ret = array();
    $res = $db->query("SELECT `version` FROM changelogs ORDER BY `version` DESC LIMIT 1");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $v = $res[0]["version"];
    $file = "./releases/mobile/".$v.".apk";
    if (is_file($file)) {
        header("Content-Type: application/vnd.android.package-archive");
        header("Content-Disposition: attachment; filename=\"AGM-Tools_$v.apk\"");
        header('Content-Length: ' . filesize($file));
        readfile($file);
        die();
    } else {
        echo "<h1>Datei nicht gefunden...</h1>";
        echo "<p>Debug Info: $file</p>";
        die();
    }
}



function makeThumbnail($original_file, $destination_file, $square_size = 250){
    // get width and height of original image
    $imagedata = getimagesize($original_file);
    $original_width = $imagedata[0];	
    $original_height = $imagedata[1];
    
    if($original_width > $original_height){
        $new_height = $square_size;
        $new_width = $new_height*($original_width/$original_height);
    }
    if($original_height > $original_width){
        $new_width = $square_size;
        $new_height = $new_width*($original_height/$original_width);
    }
    if($original_height == $original_width){
        $new_width = $square_size;
        $new_height = $square_size;
    }
    
    $new_width = round($new_width);
    $new_height = round($new_height);
    
    // load the image
    if(substr_count(strtolower($original_file), ".jpg") or substr_count(strtolower($original_file), ".jpeg")){
        $original_image = imagecreatefromjpeg($original_file);
    }
    if(substr_count(strtolower($original_file), ".gif")){
        $original_image = imagecreatefromgif($original_file);
    }
    if(substr_count(strtolower($original_file), ".png")){
        $original_image = imagecreatefrompng($original_file);
    }
    
    $smaller_image = imagecreatetruecolor($new_width, $new_height);
    $square_image = imagecreatetruecolor($square_size, $square_size);
    
    imagecopyresampled($smaller_image, $original_image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height);
    
    if($new_width>$new_height){
        $difference = $new_width-$new_height;
        $half_difference =  round($difference/2);
        imagecopyresampled($square_image, $smaller_image, 0-$half_difference+1, 0, 0, 0, $square_size+$difference, $square_size, $new_width, $new_height);
    }
    if($new_height>$new_width){
        $difference = $new_height-$new_width;
        $half_difference =  round($difference/2);
        imagecopyresampled($square_image, $smaller_image, 0, 0-$half_difference+1, 0, 0, $square_size, $square_size+$difference, $new_width, $new_height);
    }
    if($new_height == $new_width){
        imagecopyresampled($square_image, $smaller_image, 0, 0, 0, 0, $square_size, $square_size, $new_width, $new_height);
    }
    
    // save the smaller image
    if(substr_count(strtolower($destination_file), ".jpg")){
        imagejpeg($square_image,$destination_file,100);
    }
    if(substr_count(strtolower($destination_file), ".gif")){
        imagegif($square_image,$destination_file);
    }
    if(substr_count(strtolower($destination_file), ".png")){
        imagepng($square_image,$destination_file,9);
    }

    imagedestroy($original_image);
    imagedestroy($smaller_image);
    imagedestroy($square_image);

}



$data = file_get_contents('php://input');
@$data = json_decode($data);

//log_to_file(print_r($data, true));
if ($data) {
    if (isset($data->action)) {
        $action = $data->action;
        if (isset($data->args)) {
            $args = array();
            foreach ($data->args as $arg) {
                $vars = get_object_vars($arg);
                foreach ($vars as $key => $value) {
                    $args[$key] = $value;
                }
            }
        } else {
            $args = [];
        }
        
        switch ($action) {
            case "authenticate":
                authenticate($data);
                break;

            case "updatePushToken":
                updatePushToken($args);
                break;

            case "dashboardGetSpaceChartData":
                dashboardGetSpaceChartData();
                break;
            case "dashboardGetWhatsnew":
                dashboardGetWhatsnew();
                break;
            case "dashboardGetDates":
                dashboardGetDates();
                break;
            case "dashboardGetNotifications":
                dashboardGetNotifications();
                break;
            case "dashboardGetVersion":
                dashboardGetVersion();
                break;
            case "dashboardMakeNotificationSeen":
                dashboardMakeNotificationSeen($args);
                break;
            case "dashboardGetUpdates":
                dashboardGetUpdates($args);
                break;
            
            case "usersGetUsers":
                usersGetUsers();
                break;
            case "usersNewUser":
                usersNewUser($args);
                break;
            case "usersDeleteUser":
                usersDeleteUser($args);
                break;
            case "usersEditCurrentUser":
                usersEditCurrentUser($args);
                break;

            case "calendarGetDates":
                calendarGetDates();
                break;    
            case "calendarNewEvent":
                calendarNewEvent($args);
                break;
            case "calendarUpdateEvent":
                calendarUpdateEvent($args);
                break;
            case "calendarRemoveEvent":
                calendarRemoveEvent($args);
                break;

            case "projectsGetProjects":
                projectsGetProjects();
                break;
            case "projectsNewProject":
                projectsNewProject($args);
                break;
            case "projectsDeleteProject":
                projectsDeleteProject($args);
                break;
            case "projectsAddMembers":
                projectsAddMembers($args);
                break;

            case "notificationsGetNotifications":
                notificationsGetNotifications();
                break;
            case "notificationsNewNotification":
                notificationsNewNotification($args);
                break;
            case "notificationsDeleteNotification":
                notificationsDeleteNotification($args);
                break;

            case "chatGetContacts":
                chatGetContacts();
                break;
            case "chatGetMessages":
                chatGetMessages($args);
                break;
            case "chatSendMessage":
                chatSendMessage($args);
                break; 
            case "chatMarkAsRead":
                chatMarkAsRead($args);
                break; 
            case "chatMarkAsReceived":
                chatMarkAsReceived($args);
                break; 

            case "tutorialsGetTutorials":
                tutorialsGetTutorials($args);
                break;
            case "tutorialsGetTutorial":
                tutorialsGetTutorial($args);
                break;
            case "tutorialsNewTutorial":
                tutorialsNewTutorial($args);
                break;
            case "tutorialsUpdateTutorial":
                tutorialsUpdateTutorial($args);
                break;
            case "tutorialsDeleteTutorial":
                tutorialsDeleteTutorial($args);
                break;
            case "tutorialsAddStep":
                tutorialsAddStep($args);
                break;
            case "tutorialsUpdateStep":
                tutorialsUpdateStep($args);
                break;
            case "tutorialsDeleteStep":
                tutorialsDeleteStep($args);
                break;

            case "filesGetFolder":
                filesGetFolder($args);
                break;
            case "filesGetFiles":
                filesGetFolder($args);
                break;
            case "filesToggleTag":
                filesToggleTag($args);
                break;  
            case "filesCreateShare":
                filesCreateShare($args);
                break;
            case "filesNewFolder":
                filesNewFolder($args);
                break;
            case "filesRename":
                filesRename($args);
                break;
            case "filesDelete":
                filesDelete($args);
                break;

            case "clientsoftwareGetMobile":
                clientsoftwareGetMobile();
                break;  
            case "clientsoftwareGetDesktop":
                clientsoftwareGetDesktop();
                break; 

            case "bugsGetBugs":
                bugsGetBugs();
                break;
            case "bugsNewBug":
                bugsNewBug($args);
                break;
            case "bugsDeleteBug":
                bugsDeleteBug($args);
                break;

            case "templatesGetTemplates":
                templatesGetTemplates();
                break;
            case "templatesNewTemplate":
                templatesNewTemplate($args);
                break;  

            default: 
                break;
        }
    }
}

function authenticate($data) {
    if (isset($data->username) &&
    isset($data->password) &&
    !empty(trim($data->username)) &&
    !empty(trim($data->password))) {
        
        $db = connect();
        
        $username = $db->real_escape_string($data->username);
        
        $res = $db->query("SELECT id, `username`, `password`, `email`  FROM users WHERE `username`='$username'");
        
        if (!$res) {
            
            dieWithMessage("Bitte überprüfen Sie Ihren Benutzernamen!");
        } else {
            $res = $res->fetch_all(MYSQLI_ASSOC);
            if (!$res) {
                
                dieWithMessage("Bitte überprüfen Sie Ihren Benutzernamen!");
            } else {
                $res = $res[0];
                if (!$res) {
                    
                    dieWithMessage("Bitte überprüfen Sie Ihren Benutzernamen!");
                } else {
                    $password = $res["password"];
                    $status = password_verify($data->password, $password);
                    
                    if ($status) {                            
                        
                        
                        //putSession("userid", $res["id"]);

                        $token = $db->real_escape_string(uniqid());
                        $data = array();
                        $data["userid"] = $res["id"];
                        $data = $db->real_escape_string(serialize($data));
                        $sql = "INSERT INTO `session` (token, `data`) VALUES ('Bearer $token', '$data')";
                        $db->query($sql);
                        //echo $sql;


                        
                        $ret = array(
                            "id" => $res["id"],
                            "username" => $res["username"],
                            "firstName" => explode(" ", $res["username"])[0],
                            "lastName" => explode(" ", $res["username"])[1],
                            "email" => $res["email"],
                            "token" => $token
                            
                        );
                        die(json_encode($ret));
                    } else {
                        dieWithMessage("Bitte überprüfen Sie Ihr Passwort!");
                    }
                }
            }  
        }
    }
    dieWithMessage("Nicht alle Felder wurden ausgefüllt!");
    
}

function updatePushToken($data) {
    $db = connect();
    $cuid = $db->real_escape_string(getCurrentUserId());
    $pushToken = $db->real_escape_string($data["pushToken"]);
    $res = $db->query("UPDATE users SET pushToken = '$pushToken' WHERE id = '$cuid'");
    if ($res) {
        dieSuccessfully();
    } else {
        dieWithMessage($db->error);
    }
}

function dieWithMessage($message) {
    http_response_code(400);
    error_log("Debug: ".$message);
    die(json_encode(array("message"=>$message)));
}


function dashboardGetSpaceChartData($update = false) {
    $db = connect();
	//$ftp = getFTP($db);
	$size = $db->query("SELECT `value` FROM `cache` WHERE `name` = 'FileSpaceUsed'")->fetch_all(MYSQLI_ASSOC)[0]["value"];
	$max = 1000 * 1000 * 1000 * 300;
	if ($update || !$size) {
		$db = connect();
		$fc = new FileController($db);
		$size = $fc->getDataSize();
		
		$size = $db->real_escape_string($size);
		$db->query("UPDATE `cache` SET `value` = '$size' WHERE `cache`.`name` = 'FileSpaceUsed'");
		//echo number_format(($size / 1024 / 1024), 2, '.', '') . ' MB';

		//ftp_close($ftpStream);*/
	}
    $res =array(round(($max - $size)/1024/1024), 0, round($size/1024/1024));
    die(json_encode($res));
}

function dashboardGetWhatsnew() {
    $db = connect();
    $ret = array();
    $res = $db->query("SELECT `version`, `changes` FROM changelogs ORDER BY `version` DESC LIMIT 5");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $counter = 0;
    foreach ($res as $line) {
        $changes = explode("\r\n", $line["changes"]);
        $version = $line["version"];
        $ret[] = array("id"=> $counter, "version" => $version, "news" => $changes);
        $counter++;
    };
    die(json_encode($ret));
}

function dashboardGetVersion() {
    die(json_encode(getVersion()));
}

function dashboardGetDates() {
    $db = connect();
    $ret = array();
    $termine = $db->query("SELECT *, TIMESTAMPDIFF(SECOND,CURRENT_TIMESTAMP(),`startDate`) AS timeleft FROM dates WHERE startDate > NOW() ORDER BY `startDate` ASC LIMIT 5 ");
    
    if ($termine) {
        $termine = $termine->fetch_all(MYSQLI_ASSOC);
        if ($termine) {
            
            foreach ($termine as $termin) {
                $diff = $termin["timeleft"] - 60;
                $months = floor($diff / 60 / 60 / 24 / 30);
                $diff = $diff - ($months * 60 * 60 * 24 * 30);
                $days = floor(($diff) / 60 / 60 / 24);
                $diff = $diff - ($days * 60 * 60 * 24);
                $hours = floor(($diff) / 60 / 60);
                $diff = $diff - ($hours * 60 * 60);
                $minutes = floor(($diff) / 60);
                $seconds = $diff - ($minutes * 60);
                setlocale(LC_TIME, "de", "de_DE");
                $weekday = strftime("%A", strtotime($termin["startDate"]));
                $date = date('d.m.o', strtotime($termin["startDate"]));
                $starttime = date('H:i', strtotime($termin["startDate"]));
                $vorbei = false;
                if ($months <= 0) {
                    if ($days <= 0) {
                        if ($hours <= 0) {
                            $countdown = "$minutes Minuten";
                        } else {
                            $countdown = "$hours Stunden und $minutes Minuten";
                        }
                    } else {
                        $countdown = "$days Tage, $hours Stunden und $minutes Minuten";
                    }
                } else {
                    $countdown = "$months Monate, $days Tage, $hours Stunden und $minutes Minuten";
                }
                

                $ret[] = array("name" => $termin["headline"], "weekday" => $weekday, "date"=> $date, "starttime"=>$starttime, "countdown" => $countdown);
            }
            die(json_encode($ret));
        } 
        
    }
    if ($db->error) {
        dieWithMessage("Es wurden keine Termine gefunden!".$db->error);
    } else {
        die(json_encode(array()));
    }
    
}

function dashboardMakeNotificationSeen($data) {
    $db = connect();
    if (isset($data["id"]) &&
		!empty(trim($data["id"])) &&
		is_numeric(trim($data["id"])) ) {
			$id = $db->real_escape_string(trim($data["id"]));
			$seen = explode("-", $db->query("SELECT `seen` FROM `notifications` WHERE `notifications`.`id` = $id")->fetch_all(MYSQLI_ASSOC)[0]["seen"]);
			//var_dump($seen);
			array_push($seen, getCurrentUserId());
			//var_dump(getCurrentUserId());
			
			//var_dump($seen);
			
			$seen = $db->real_escape_string(implode("-", $seen));
		//var_dump($seen);
			$result = $db->query("UPDATE `notifications` SET `seen` = '$seen' WHERE `notifications`.`id` = $id");
			
			if($result) {
				dieSuccessfully();
			} else {
				dieWithMessage("Fehler: ".$db->error);
				
		}
	} else {
		dieWithMessage("Fehler: nicht alle Parameter übergeben");
	}
}

function dashboardGetNotifications() {
    $db = connect();
    $ret = array();
    $currentUserId = getCurrentUserId();
	$usernames = getUserIdArray($db);
	//echo "USERID: ". $currentUserId;
	
    $res = $db->query("SELECT * FROM notifications");
    $res = $res->fetch_all(MYSQLI_ASSOC);

    foreach ($res as $line) {
        $receivers = explode("-", $line["receivers"]);
        $seenby = explode("-", $line["seen"]);
        if (in_array($currentUserId, $receivers) and !in_array($currentUserId, $seenby)) {
            switch ($line["type"]) {
                case 1:
                    $type = "alert-success";
                    break;
                case 2:
                    $type = "alert-info";
                    break;
                case 3:
                    $type = "alert-warning";
                    break;
                case 4:
                    $type = "alert-danger";
                    break;
                default:
                    break;
            }
            $day = date("d.m.Y", strtotime($line["date"]));
            $time = date("H:i", strtotime($line["date"]));

            $id = $line["id"];
            $ret[] = array("type"=>$type, "id"=>$id, "headline"=>$line["headline"], "content"=>$line["content"], "sender"=>$usernames[$line["sender"]], "date"=>$day, "time"=>$time);
        }
	}
    die(json_encode(array("status"=>true, "notifications"=>$ret)));
           
    //dieWithMessage("Es wurden keine Termine gefunden!".$db->error);
}

function dashboardGetUpdates($data) {
    $db = connect();
    $ret = array();
    $res = $db->query("SELECT `version` FROM changelogs ORDER BY `version` DESC LIMIT 1");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $v = $res[0]["version"];
    if (version_compare($data["version"], $v, '<')) {
        die(json_encode(array("update" => true)));
    } else {
        die(json_encode(array("update" => false)));
    }
}


function usersGetUsers() {
    $db = connect();
    $res = $db->query("SELECT users.id, users.username, users.email, usergroups.name as groupname FROM users JOIN usergroups ON users.usergroup = usergroups.id");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    die(json_encode($res));
}

function usersNewUser($data) {
    $db = connect();
    if (!isAllowedTo("CREATE_USER")) {
		dieWithMessage("Du hast leider keine Berechtigung, einen Benutzer zu erstellen.");
		die();
	}
	if (isset($data["username"]) &&
		isset($data["email"]) &&
		isset($data["pw"]) &&
		isset($data["pw2"]) &&
		!empty(trim($data["username"])) &&
		!empty(trim($data["email"])) &&
		!empty(trim($data["pw"])) &&
		!empty(trim($data["pw2"]))) {
			/////////////////////////

			
			
			$username = $db->real_escape_string($data["username"]);
			$email = $db->real_escape_string($data["email"]);
			$pw = $db->real_escape_string($data["pw"]);
			$pw2 = $db->real_escape_string($data["pw2"]);
			
			if ($pw != $pw2) {
				dieWithMessage("Die beiden neuen Passw&ouml;rter stimmen nicht &uuml;berein!");
				
			}
			
			$pwhash = $db->real_escape_string(password_hash($pw, PASSWORD_DEFAULT));
			
			$result = $db->query("INSERT INTO `users` (username, email, password, usergroup) VALUES ('$username', '$email', '$pwhash', 1)");
			//$lid = $db->insert_id;
			//$result2 = $db->query("INSERT INTO `receivers` (name, type, members) VALUES ('$username', 'private', '$lid')");
			updateReceivers();
			if($result) {
				$res = array("status" => true);
				die(json_encode($res));
			} else {
				dieWithMessage("Fehler: ".$db->error);
				
		}
	} else {
		dieWithMessage("Nicht alle Daten wurden korrekt eingegeben!");
		
	}
}

function usersDeleteUser($data) {
    
    $db = connect();
    if (!isAllowedTo("REMOVE_USER")) {
		dieWithMessage("Du hast leider keine Berechtigung, einen Benutzer zu löschen.");
		die();
	}
	if (is_numeric(intval(trim($data["id"])))) {
			/////////////////////////
			$id = intval(trim($data["id"]));
			
			$result = $db->query("DELETE FROM users WHERE id=$id");
			
			
			if($result) {
				
				die(json_encode(array("status" => true)));
			} else {
				dieWithMessage("Fehler: ".$db->error);
				
		}
	} else {
		dieWithMessage("Ein interner Fehler ist aufgetreten!");
		die();
	}
}

function usersEditCurrentUser($data) {
    $db = connect();
    if (isset($data["id"]) &&
		isset($data["username"]) &&
		isset($data["email"]) &&
		isset($data["pw-old"]) &&
		isset($data["pw-new"]) &&
		isset($data["pw-new2"]) &&
		is_numeric(intval(trim($data["id"]))) &&
		!empty(trim($data["username"])) &&
		!empty(trim($data["email"])) &&
		!empty(trim($data["pw-old"]))) {
			/////////////////////////

			$id = $db->real_escape_string($data["id"]);
			
			$username = $db->real_escape_string($data["username"]);
			
			$email = $db->real_escape_string($data["email"]);;
			
			$pwOld = $data["pw-old"];
			$pwNew = $data["pw-new"];
			$pwNew2 = $data["pw-new2"];
			//echo $id;
			if ($pwNew != $pwNew2) {
				dieWithMessage("Die beiden neuen Passw&ouml;rter stimmen nicht &uuml;berein!");
				die();
			}
			
			$res = $db->query("SELECT * FROM users WHERE id=$id");
			$res = $res->fetch_all(MYSQLI_ASSOC)[0];
			
			if (!password_verify($pwOld, $res["password"])) {
				dieWithMessage("Ein falsches Password wurde eingegeben!");
				die();
			}

			if (trim($pwNew) == "") {
				$result = $db->query("UPDATE `users` SET 
										`username` = '$username',
										`email` = '$email'
										WHERE `id` = ".$id);
			} else {
				$pwhash = $db->real_escape_string(password_hash($pwNew, PASSWORD_DEFAULT));
				$result = $db->query("UPDATE `users` SET 
										`username` = '$username',
										`email` = '$email',
										`password` = '$pwhash'
									WHERE `users`.`id` = $id ");
			}
			
			if($result) {
				die(json_encode(array("status" => true)));
			} else {
				dieWithMessage("Fehler: ".$db->error);
				die();
		}
	} else {
		dieWithMessage("Nicht alle Daten wurden korrekt eingegeben!");
		die();
	}
}

function projectsGetProjects() {
    $db = connect();
    $res = $db->query("SELECT id, `name`, members, `description` FROM projects");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $usersIDs = getUserIdArray($db);
    foreach ($res as &$line) {
        $members = explode("-", $line["members"]);
        $users = array();
        foreach ($members as $member) {
            $users[] = $usersIDs[$member];
        }
        $line["members"] = $users;
    }
    
    die(json_encode($res));
}

function projectsNewProject($data) {
    $db = connect();
    if (!isAllowedTo("CREATE_PROJECT")) {
		dieWithMessage("Du hast leider keine Berechtigung, ein Projekt zu erstellen.");
		die();
	}
	if (isset($data["name"]) &&
		isset($data["description"]) &&
		isset($data["members"]) &&
		!empty(trim($data["name"])) &&
		!empty(trim($data["description"])) &&
		!empty($data["members"]) ) {
			
			$members = implode("-",  $data["members"]);
			$name = $db->real_escape_string($data["name"]);
			
			$description = $db->real_escape_string($data["description"]);
			
			$result = $db->query("INSERT INTO projects (name, description, members, type) VALUES ('$name', '$description', '$members', null)");
			$pid = $db->insert_id;
            if ($db->error) {
                dieWithMessage("Fehler: ".$db->error);
            }
			$result2 = $db->query("INSERT INTO `folders` (`id`, `project`, `folder`, `name`, `tags`) VALUES (NULL, '$pid', '-1', 'Planbilder', '')");
			if ($db->error) {
                dieWithMessage("Fehler: ".$db->error);
            }
			$result3 = $db->query("INSERT INTO `receivers` (`id`, `name`, `type`, `members`) VALUES (NULL, '$name', 'group', '$members')");
			if ($db->error) {
                dieWithMessage("Fehler: ".$db->error);
            }
			$fc = new FileController($db);
			$fc->generateProjectDirs($pid);
			//echo error_get_last();
		
			if($result and $result2 and $result3) {
				dieSuccessfully();
			} else {
				dieWithMessage("Fehler".$db->error);
			}
			die();
        } else {
            dieWithMessage("Nicht alle Daten angegeben!");
        }
	
}

function projectsDeleteProject($data) {
    $db = connect();
    if (!isAllowedTo("REMOVE_PROJECT")) {
			alert("danger", "Du hast leider keine Berechtigung, ein Projekt zu löschen.");
			die();
	}
	$id = $db->real_escape_string($data["id"]);
	$result = $db->query("DELETE FROM `projects` WHERE `projects`.`id` = $id");
	if($result) {
		dieSuccessfully();
	} else {
		dieWithMessage("Fehler: ".$db->error);
	}
}

function projectsAddMembers($data) {
    $db = connect();
    if (!isAllowedTo("ADD_USER_TO_PROJECT")) {
			diwWithMessage("Du hast leider keine Berechtigung, einen Benutzer zu einem Projekt hinzuzufügen.");
		}
		$pid = $data["project"];
		
		$members = implode("-", $data["members"]);
		$res = $db->query("UPDATE projects SET members = CONCAT(members, '-$members') WHERE id=$pid");
		$pname = $db->query("SELECT `name` FROM projects WHERE id=$pid")->fetch_all(MYSQLI_ASSOC)[0]["name"];
		if ($pname) {
			$res2 = $db->query("UPDATE receivers SET members = CONCAT(members, '-$members') WHERE `name`='$pname'");
		} else {
			$res2 = false;
		}
		
		if (!$res || !$res2) {
			dieWithMessage($db->error);
		} else {
			dieSuccessfully();
		}
}

function calendarGetDates() {
    $db = connect();
    $res = $db->query("SELECT * FROM dates");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    /*$usersIDs = getUserIdArray($db);
    foreach ($res as &$line) {
        $members = explode("-", $line["members"]);
        $users = array();
        foreach ($members as $member) {
            $users[] = $usersIDs[$member];
        }
        $line["members"] = $users;
    }*/
    
    die(json_encode($res));
}

function calendarNewEvent($data) {
    $db = connect();
    if (
			isset($data["startDate"]) &&
			isset($data["endDate"]) &&
			isset($data["headline"]) &&
			isset($data["description"]) &&
			isset($data["location"]) &&
			!empty(trim($data["startDate"])) &&
			!empty(trim($data["endDate"])) &&
			!empty(trim($data["headline"])) &&
			!empty(trim($data["location"])) &&
			!empty(trim($data["description"]))
		) {

			////////////////////////
			$important = $data["important"];

			$startDate = date("Y-m-d H:i", strtotime($data["startDate"]));
			$endDate = date("Y-m-d H:i", strtotime($data["endDate"]));
			$headline = $db->real_escape_string($data["headline"]);
			$location = $db->real_escape_string($data["location"]);
			$description = $db->real_escape_string($data["description"]);
			$author = getCurrentUserID();

			$sql = "INSERT INTO `dates` (`id`, `startDate`, `endDate`, `headline`, `description`, `location`, `creator`) VALUES
					(NULL, '$startDate', '$endDate', '$headline', '$description', '$location', '$author');";

            $result = $db->query($sql);
            $id = $db->insert_id;


			if ($result && $id) {
				if ($important) {
					$users = array_keys(getUserIdArray($db));
					$receivers = implode("-", $users);
					$result = $db->query("INSERT INTO `notifications` (`id`, `receivers`, `sender`, `headline`, `content`, `type`, `seen`, `date`) VALUES
									(NULL, '$receivers', '$author', 'Neuer Termin: $headline', 'Es wurde ein neuer Termin hinzugefügt: $description <br>vom $startDate Uhr bis zum $endDate Uhr', '2', '0', NOW())");
					if ($result) {
						die(json_encode(array("status"=> true, "id" => $id)));
					} else {
						dieWithMessage("Termin nicht gespeichert!" . $db->error);
					}
				} else {
					die(json_encode(array("status"=> true)));
				}
			} else {
				dieWithMessage("Termin nicht gespeichert!" . $db->error);
			}



			/////////////////////////
		} else {
			dieWithMessage("Termin nicht gespeichert, nicht alle Daten wurden angegeben!".print_r($data, true));
		}
}

function calendarUpdateEvent($data) {
    $db = connect();
    if (
			isset($data["id"]) &&
			isset($data["startDate"]) &&
			isset($data["endDate"]) &&
			isset($data["headline"]) &&
			isset($data["description"]) &&
			isset($data["location"]) &&
			!empty(trim($data["id"])) &&
			!empty(trim($data["startDate"])) &&
			!empty(trim($data["endDate"])) &&
			!empty(trim($data["headline"])) &&
			!empty(trim($data["location"])) &&
			!empty(trim($data["description"]))
		) {

			////////////////////////
			$important = $data["important"];

			$startDate = date("Y-m-d H:i", strtotime($data["startDate"]));
			$endDate = date("Y-m-d H:i", strtotime($data["endDate"]));
			$headline = $db->real_escape_string($data["headline"]);
			$location = $db->real_escape_string($data["location"]);
			$description = $db->real_escape_string($data["description"]);
			$id = $db->real_escape_string($data["id"]);
			$author = getCurrentUserID();

			$sql = "UPDATE `dates` SET `startDate`='$startDate', `endDate`='$endDate', `headline`='$headline', `description`='$description', `location`='$location' WHERE id = $id;";

			$result = $db->query($sql);


			if ($result) {
				
				die(json_encode(array("status"=> true)));
					
			} else {
				dieWithMessage("Termin nicht aktualisiert!" . $db->error);
			}
		} else {
			dieWithMessage("Termin nicht gespeichert, nicht alle Daten wurden angegeben! ".print_r($data, true));
		}
}

function calendarRemoveEvent($data) {
    $db = connect();
    if (isset($data["id"]) && !empty(trim($data["id"]))) {
			
			$id = $db->real_escape_string($data["id"]);
			

			$sql = "DELETE FROM dates WHERE id='$id'";

			$result = $db->query($sql);
			if ($result) {
				
				die(json_encode(array("status"=> true)));
					
			} else {
				dieWithMessage("Termin nicht gelöscht! " . $db->error);
			}
		} else {
			dieWithMessage("Termin nicht gelöscht, nicht alle Daten wurden angegeben! ".print_r($data, true));
		}
}

function notificationsGetNotifications() {
    $db = connect();
    $usernames = getUserIdArray($db);
    $myID = getCurrentuserId();
    $res = $db->query("SELECT * FROM notifications WHERE sender=".$myID);
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $ret = array();
    foreach ($res as $line) {
        $receivers = explode("-", $line["receivers"]);
        $names =  [];
        foreach ($receivers as $receiverid) {
            $names[] = $usernames[$receiverid];
        }
        $receivernames = $names;
        $users = explode("-", $line["seen"]);
        $names =  [];
        foreach ($users as $user) {
            if ($user) {
                $names[] = $usernames[$user];
            }
        }
        $seens = $names;
        $users = array_diff($receivers, $users);
        $notseens =  [];
        foreach ($users as $user) {
            if ($user) {
                $notseens[] = $usernames[$user];
            }
        }
        $ret[] = array(
            "seen" => $seens,
            "notseen" => $notseens,
            "receivers" => $receivernames,
            "headline" => $line["headline"],
            "content" => $line["content"],
            "id" => $line["id"]
        );
    }
    die(json_encode($ret));
}

function notificationsNewNotification($data) {
    $db = connect();
    if (isset($data["headline"]) &&
		isset($data["content"]) &&
		isset($data["type"]) &&
		isset($data["receivers"]) &&
		!empty(trim($data["headline"])) &&
		!empty(trim($data["content"])) &&
		!empty(trim($data["type"])) &&
		!empty($data["receivers"]) ) {
			/////////////////////////

			$receivers_array = $data["receivers"];
			$receivers = implode("-", $receivers_array);
			
			$headline = $db->real_escape_string($data["headline"]);
			
			$content = $db->real_escape_string($data["content"]);
			
			$sender = getCurrentUserId();
			
			$type = $db->real_escape_string($data["type"]);

			$result = $db->query("INSERT INTO `notifications` (`id`, `receivers`, `sender`, `headline`, `content`, `type`, `seen`, `date`) VALUES
								(NULL, '$receivers', '$sender', '$headline', '$content', '$type', '0', NOW())");
			if($result) {
				die(json_encode(array("status" => true)));
			} else {
				dieWithMessage("Fehler: ".$db->error);
				
		}
	} else {
		dieWithMessage("Nicht alle Daten angebenen!");
		
	}
}

function notificationsDeleteNotification($data) {
    $db = connect();
    $id = $db->real_escape_string(trim($data["id"]));
	$result = $db->query("DELETE FROM `notifications` WHERE `notifications`.`id` = $id");
	if($result) {
		die(json_encode(array("status" => true)));
	} else {
		dieWithMessage("Fehler: ".$db->error);
		
	}
}

function chatGetContacts() {
    
    $db = connect();
    $ret = array();
    $result = array();
    $userid = $db->real_escape_string(getSession("userid"));
	//var_dump( $db->query("(SELECT id FROM receivers WHERE members=$userid)")->fetch_all());
	$res = $db->query("SELECT r.name, r.id as rid, r.members, r.type, messages.message, messages.status, IF(messages.sender='$userid','true','false') AS `fromMe`, users.username as sendername, `timestamp` FROM receivers as r LEFT JOIN messages ON messages.id = (
        SELECT id FROM messages
        
		WHERE 
			(r.type = 'group' 
				AND messages.receiver = r.id
			) OR (
				r.type = 'private' 
				AND
					(messages.receiver IN (SELECT id FROM receivers WHERE members='$userid') AND messages.sender IN (SELECT members FROM receivers WHERE id = r.id) )
					OR
					(messages.sender = '$userid' AND messages.receiver = r.id )
			)
		
        
		ORDER BY `timestamp` DESC
        LIMIT 1
	)
	LEFT JOIN users ON users.id = messages.sender 
	ORDER BY `timestamp` DESC
	");

    

	if ($res) {
		$res = $res->fetch_all(MYSQLI_ASSOC);
	} else {
        $res = array();
        echo $db->error;
	}

    require_once("./vendor/autoload.php");
   
	foreach ($res as $line) {
        $avatar = new LetterAvatar($line["name"], 'circle', 64);
		//echo "<br>Receivers.members: ".$line[ "members" ];
		//echo "<br>Messages.sender: ".$line[ "sender" ];

        $members = explode("-", $line["members"]);
		if ($line["type"] == "private") {

			if (!in_array($userid, $members)) {
				$name = $line["name"];

                $latestmessage = trim_text($line["message"], 40);
                
                $rid = $db->real_escape_string($line["rid"]);
                $cuid = $db->real_escape_string(getCurrentUserId());

                // nachrichten empfangen machen
                if (!$db->query("UPDATE messages SET `status` = 'received' WHERE `sender`=(SELECT members FROM receivers WHERE `id` = '$rid' AND `type`='private') AND `status`='sent' AND `receiver` = (SELECT id FROM receivers WHERE `members` = '$cuid' AND `type`='private')")) {
                //if ($res = $db->query("SELECT members FROM receivers WHERE `id` = '$rid'")) {
                    dieWithMessage("Datenbankfehler: ".$db->error);
                }
                

                $numberUnread = $db->query("SELECT COUNT(*) as numberUnread FROM messages WHERE `sender`=(SELECT members FROM receivers WHERE `id` = '$rid' AND `type`='private') AND `receiver` = (SELECT id FROM receivers WHERE `members` = '$cuid' AND `type`='private') AND `status` = 'received'");
                if ($numberUnread) {
                    $numberUnread = $numberUnread->fetch_all(MYSQLI_ASSOC);
                    if ($numberUnread && isset($numberUnread[0]) && isset($numberUnread[0]["numberUnread"])) {
                        $numberUnread = intval($numberUnread[0]["numberUnread"]);
                    } else {
                        $numberUnread = 0;
                    }
                } else {
                    echo $db->error;
                }

				$result[] = array(
                    "contact" => array(
                          "avatar" => $avatar->__toString(),
                        "name" => htmlspecialchars($line["name"])
                    ),
                    "lastseen" => "noch unbekannt",
                    "when" => $line["timestamp"],
                    "unread" => $numberUnread,
                    "text" => [htmlspecialchars($latestmessage)],
                    "fromMe" => ($line["fromMe"] == "true" ? true : false),
                    "status" => $line["status"],
                    "rid" => $line["rid"],
                );
			}
		} else {
			if (in_array($userid, $members)) {
				//echo "hi<br>";
				//$name = htmlentities(mb_convert_encoding($line["name"], 'UTF-8', 'ASCII'), ENT_SUBSTITUTE, "UTF-8"); //encoding auf UTF 8
				$name = $line["name"];
                $latestmessage = explode(" ", $line["sendername"])[0] . ": " . trim_text($line["message"], 40);
                if ($latestmessage == ": ") {
                    $latestmessage = "";
                }

                // nachrichten empfangen machen
                /*if (!$db->query(fehlt)) {
                //if ($res = $db->query("SELECT members FROM receivers WHERE `id` = '$rid'")) {
                    dieWithMessage("Datenbankfehler: ".$res->fetch_all(MYSQLI_ASSOC)[0]["members"]);
                }*/
                $rid = $db->real_escape_string($line["rid"]);
                $status = $db->query("SELECT id, `status` FROM messages WHERE `sender`!='$userid' AND `receiver` = $rid");
                if ($status) {
                    $status = $status->fetch_all(MYSQLI_ASSOC);
                    if ($status) {
                        $numberUnread = 0;
                        foreach($status as $messageStatus) {
                            $mid = $messageStatus["id"];
                            $messageStatus = @unserialize($messageStatus["status"]);
                            if ($messageStatus) {
                                if (isset($messageStatus["received"]) && !in_array($userid, $messageStatus["received"])) {
                                    $messageStatus["received"][] = $userid;
                                    $id = $db->real_escape_string($mid);
                                    $newStatus = $db->real_escape_string(serialize($messageStatus));
                                    if(!$db->query("UPDATE messages SET `status` = '$newStatus' WHERE id=$id")) {
                                        echo $db->error;
                                        echo "\n\n\n"."UPDATE messages SET `status` = '$newStatus' WHERE id=$id"."\n\n";
                                    }
                                }
                                if (isset($messageStatus["seen"]) && !in_array($userid, $messageStatus["seen"])) {
                                    $numberUnread++;
                                }
                            } else {
                                $numberUnread++;
                            }
                        }
                    } else {
                        $numberUnread = 0;
                        echo $db->error;
                    }
                } else {
                    echo $db->error;
                }

				$result[] = array(
                    "contact" => array(
                        "avatar" => $avatar->__toString(),
                        "name" => htmlspecialchars($line["name"])
                    ),
                    "lastseen" => "Mitgliederliste...",//$membersList,
                    "when" => $line["timestamp"],
                    "fromMe" => ($line["fromMe"] == "true" ? true : false),
                    "status" => $line["status"],
                    "unread" => $numberUnread,
                    "text" => [htmlspecialchars($latestmessage)],
                    "rid" => $line["rid"]
                );
			}
		}
	}

	die(json_encode($result));
    dieWithMessage("Es wurden keine Kontakte gefunden!".$db->error);
}

function chatGetMessages($data) {

    $db = connect();
	$chatID = $data["rid"];
    $m = "";
    //var_dump($data);
    //die();
    $myID = getCurrentUserId();
    $ret = array();
	
	$allusers = explode("-", $db->query("SELECT members FROM receivers WHERE id=" . $chatID)->fetch_all(MYSQLI_ASSOC)[0]["members"]);
	
	$type = $db->query("SELECT type FROM receivers WHERE id=" . $chatID)->fetch_all(MYSQLI_ASSOC)[0]["type"];

	if ($type == "private") {
		
		$myreceiverid = $db->query("SELECT * FROM receivers WHERE members='" . $myID . "'")->fetch_all(MYSQLI_ASSOC)[0]["id"];
		$otherSenderId = $db->query("SELECT * FROM receivers WHERE id='" . $chatID . "'")->fetch_all(MYSQLI_ASSOC)[0]["members"];
		$res = $db->query("SELECT * FROM messages WHERE (receiver='" . $chatID . "' AND sender='" . $myID . "') OR  (receiver='" . $myreceiverid . "' AND sender='" . $otherSenderId . "')");

	} else if ($type == "group") {
		
		$res = $db->query("SELECT * FROM messages WHERE receiver='" . $chatID . "'");
	}

	
	if (!isset($res) || !$res) {
		die(json_encode(array()));
	}


	$contacts = getContactIDArray($db);
	$res = $res->fetch_all(MYSQLI_ASSOC);
	//$ret["message"] = var_dump($res);
	//$ret["message"] .= var_dump($contacts);
	//$previousSender = null;
	//$counter = $id;
	$number = 0;
	$lastDay = 0;
	foreach ($res as $line) {

		$nowDay = date('d.m.Y', strtotime($line["timestamp"]));
		if ($lastDay != $nowDay) {
            
             $ret[] = array("id"=> uniqid(), "system" => "true", "text" => $nowDay);
        }
        

		$alt = ($line["sender"] == $myID) ? true : false;
		//if ($previousSender != $line["sender"]) {
			$name = $contacts[intval($line["sender"])];
		//} else {
		//	$name = false;
		//}
		$message = $line["message"];
        $status = $line["status"];
        $imageSrc = $line["imageSrc"];
        $attachmentSrc = $line["attachmentSrc"];
        $contactSrc = unserialize($line["contactSrc"]);
        
		if ($type == "group" && $line["sender"] == $myID) {

			$status = $line["status"];
			if (!$status) {
				$status = [];
				$status["received"] = [];
				$status["seen"] = [];
			} else if (!empty($status)) {
				//var_dump($status);
				//file_put_contents('log.txt', print_r($status).PHP_EOL , FILE_APPEND | LOCK_EX);
				try {
					$status = @unserialize($status);
					if (!$status) {
						$status = [];
						$status["received"] = [];
						$status["seen"] = [];
					}
				} catch (Exception $e) {
					$status = [];
				}
			}

			$allreceived = true;
			foreach ($allusers as $user) {
				if ($user != $myID && !in_array($user, $status["received"])) {
					$allreceived = false;
					//echo "User: $user, Status: " . print_r( $status[ "received" ] ) . "\n";
				}
			}
			if ($allreceived) {
				$allseen = true;
				foreach ($allusers as $user) {
					if (!in_array($user, $status["seen"])) {
						$allseen = false;
					}
				}
				if ($allseen) {
					$status = "seen";
				} else {
					$status = "received";
				}
			} else {
				$status = "sent";
			}
			//echo $status;
		}

		$time = $line["timestamp"];
		
		$ret[] = array("id"=> uniqid(), "fromMe" => $alt, "sendername" => $name, "attachmentSrc" => $attachmentSrc, "contactSrc" => $contactSrc, "imageSrc" => $imageSrc, "text" => $message, "sent" => $status, "created" => $time);




		$counter = $line["id"];
		//$previousSender = $line["sender"];
		$lastDay = date('d.m.Y', strtotime($line["timestamp"]));
		$number++;

		if ($type == "group") {
			$status = $line["status"];
			if (!$status) {
				$status = [];
				$status["seen"] = [];
				$status["received"] = [];
			} else if (!empty($status)) {
				//var_dump($status);
				@$status = unserialize($status);
				if (!$status) {
					$status = [];
					$status["received"] = [];
					$status["seen"] = [];
				}
			}
			if (!in_array($myID, $status["seen"])) {
				$status["seen"][] = $myID;
			}
			$status = $db->real_escape_string(serialize($status));
			$mID = $db->real_escape_string($line["id"]);
			$db->query("UPDATE `messages` SET `status` = '$status' WHERE `messages`.`id` = $mID");
			//$existing = false;
			//foreach (explode("-", $receiverIdArray[$line["receiver"]]["members"]) as $member) {
			//	if ($member == $myID) $existing = true;
			//}
			//echo $existing ."\n";
			//echo "das war eine gruppe";
		} else {
            if ($alt==false) {
                $mID = $db->real_escape_string($line["id"]);
			    $db->query("UPDATE `messages` SET `status` = 'seen' WHERE `messages`.`id` = $mID");
            }
			//echo $db->affected_rows."   -   ".$db->error."\n";
			//echo "das war ein privater chat von ".$line["receiver"]."\n";
		}
	}

	if ($number == 0) {

        die(json_encode(array()));
        
	}
	//$i["lastid"] = $counter;
	die(json_encode($ret));
}

function chatSendMessage($data) {
    $db = connect();
    if (!isset($data["imageSrc"])) {
        $data["imageSrc"] = "";
    }
    $imageSrc = $db->real_escape_string($data["imageSrc"]);

    if (!isset($data["attachmentSrc"])) {
        $data["attachmentSrc"] = "";
    }
    $attachmentSrc = $db->real_escape_string($data["attachmentSrc"]);

    if (!isset($data["contactSrc"])) {
        $contactSrc = "";
    } else {
        $contactSrc = $db->real_escape_string(serialize($data["contactSrc"]));
    }
    

    $data["message"] = $db->real_escape_string($data["message"]);
    $data["rid"] = $db->real_escape_string($data["rid"]);
    $res = $db->query("INSERT INTO messages (`message`, sender, `timestamp`, receiver, `status`, `imageSrc`, `attachmentSrc`, `contactSrc`) VALUES ('" . $data["message"] . "', '" . getCurrentuserId() . "', now(), '" . $data["rid"] . "', 'sent', '$imageSrc', '$attachmentSrc', '$contactSrc')");
    $messageId = $db->insert_id;
    if (!$res) {
		dieWithMessage($db->error);
    }
    $name = getCurrentUserName();
    $id = $db->real_escape_string($data["rid"]);
	$res = $db->query("SELECT type, members FROM receivers WHERE id=$id")->fetch_all(MYSQLI_ASSOC)[0];
	$receivers = explode("-", $res["members"]);

	if ($res["type"] == "private") {
		//$m = buildMessage(false, $name, $data["message"], false, date("H:i"));
		$senderid = $db->real_escape_string(getCurrentUserId());
		$senderid = $db->query("SELECT `id` FROM `receivers` WHERE `members` = '$senderid'")->fetch_all(MYSQLI_ASSOC)[0]["id"];

		$retdata = [];
		$retdata["chatID"] = $senderid;
        $retdata['action'] = 'newMessage';
        $retdata["messageId"] = $messageId;
        $retdata["sender"] = $name;
        $retdata["body"] = $data["message"];
        $pushToken = getPushTokenFromUserId($receivers[0]);
        if ($pushToken) {
            sendPushMessage($name, $data["message"], $retdata, [$pushToken]);
        }
		
	} else {
		//$m = buildMessage(false, $name, $data["message"], false, date("H:i"));
		$senderid = $db->real_escape_string(getCurrentUserId());
		$senderid = $db->query("SELECT `id` FROM `receivers` WHERE `members` = '$senderid'")->fetch_all(MYSQLI_ASSOC)[0]["id"];

		$retdata = [];
		$retdata["chatID"] = $data["rid"];
		$retdata['action'] = 'newMessage';
        $retdata["messageId"] = $messageId;
		$retdata["sender"] = $name;
        $retdata["body"] = $data["message"];
        
        $pushTokens = array();
		foreach ($receivers as $receiver) {
			if ($receiver != getCurrentUserId()) {
                $pushToken = getPushTokenFromUserId($receiver);
                if ($pushToken) {
                    $pushTokens[] = $pushToken;
                }
			}
        }
        sendPushMessage($name, $data["message"], $retdata, $pushTokens);
	}
	return;
}

function chatMarkAsRead($data) {
    $myId = getCurrentUserId();
    $db = connect();
    $mid = $db->real_escape_string($data["message"]);
    $res = $db->query("SELECT messages.status, receivers.type FROM messages JOIN receivers on messages.receiver = receivers.id WHERE messages.id = $mid")->fetch_all(MYSQLI_ASSOC)[0];
    if ($res) {
        if ($res["type"] == "private" && ($res["status"] == "received" || $res["status"] == "sent")) {
            $result = $db->query("UPDATE messages SET `status` = 'seen' WHERE id = $mid");
            if (!$result) {
                echo $db->error;
            }
        } else if ($res["type"] == "group") {
            $status = $res["status"];
			if (!$status) {
				$status = [];
				$status["seen"] = [];
				$status["received"] = [];
			} else if (!empty($status)) {
				@$status = unserialize($status);
				if (!$status) {
					$status = [];
					$status["received"] = [];
					$status["seen"] = [];
				}
			}
			if (!in_array($myID, $status["seen"])) {
				$status["seen"][] = $myID;
            }
            if (!in_array($myID, $status["received"])) {
				$status["received"][] = $myID;
			}
			$status = $db->real_escape_string(serialize($status));
			$mID = $db->real_escape_string($line["id"]);
			$db->query("UPDATE `messages` SET `status` = '$status' WHERE `id` = $mID");

        } else {
            dieWithMessage("Das dürfte niemals passieren...");
        }
    }
}

function chatMarkAsReceived($data) {
    $myId = getCurrentUserId();
    $db = connect();
    $mid = $db->real_escape_string($data["message"]);
    $res = $db->query("SELECT messages.status, receivers.type FROM messages JOIN receivers on messages.receiver = receivers.id WHERE messages.id = $mid")->fetch_all(MYSQLI_ASSOC)[0];
    if ($res) {
        if ($res["type"] == "private" && $res["status"] != "seen") {
            $result = $db->query("UPDATE messages SET `status` = 'received' WHERE id = $mid");
            if (!$result) {
                echo $db->error;
            }
        } else if ($res["type"] == "group") {
            $status = $res["status"];
			if (!$status) {
				$status = [];
				$status["seen"] = [];
				$status["received"] = [];
			} else if (!empty($status)) {
				@$status = unserialize($status);
				if (!$status) {
					$status = [];
					$status["received"] = [];
					$status["seen"] = [];
				}
			}
            if (!in_array($myID, $status["received"])) {
				$status["received"][] = $myID;
			}
			$status = $db->real_escape_string(serialize($status));
			$mID = $db->real_escape_string($line["id"]);
			$db->query("UPDATE `messages` SET `status` = '$status' WHERE `id` = $mID");

        } else {
            dieWithMessage("Das dürfte niemals passieren...");
        }
    }
}


function tutorialsGetTutorials($data) {
    $db = connect();
    $usernames = getUserIdArray($db);
    $myID = getCurrentuserId();
    $res = $db->query("SELECT * FROM tutorials");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $ret = array();
    foreach ($res as $line) {
        $ret[] = array(
            "id" => $line["id"],
            "title" => $line["title"],
            "description" => $line["description"],
            "author" => $line["author"],
            "date" => $line["date"],
            "editable" => ($line["author"] == $myID));
        
    }
    die(json_encode($ret));
}
function tutorialsNewTutorial($data) {
    $db = connect();
    if (isset($data["title"]) &&
		isset($data["description"]) &&
		!empty(trim($data["title"])) &&
		!empty(trim($data["description"])) ) {

			$title = $db->real_escape_string($data["title"]);
			$description = $db->real_escape_string($data["description"]);
			$author = $db->real_escape_string(getCurrentUserId());

			$result = $db->query("INSERT INTO `tutorials` (`id`, `title`, `description`, `author`, `date`) VALUES
								(NULL, '$title', '$description', '$author', NOW())");
			if($result) {
				die(json_encode(array("status" => true)));
			} else {
				dieWithMessage("Fehler: ".$db->error);
				
		}
	} else {
		dieWithMessage("Nicht alle Daten angebenen!");
	}
}
function tutorialsUpdateTutorial($data) {
    $db = connect();
    if (isset($data["id"]) &&
    isset($data["description"]) &&
    isset($data["title"]) &&
    !empty(trim($data["id"])) &&
    !empty(trim($data["title"])) &&
    !empty(trim($data["description"])) ) {

        $title = $db->real_escape_string($data["title"]);
        $id = $db->real_escape_string($data["id"]);
        $description = $db->real_escape_string($data["description"]);

        $result = $db->query("UPDATE `tutorials` SET `title`='$title', `description`='$description', `date`=NOW() WHERE `id`='$id'");
        if($result) {
            die(json_encode(array("status" => true)));
        } else {
            dieWithMessage("Fehler: ".$db->error);
    }
	} else {
		dieWithMessage("Nicht alle Daten angebenen!");
		
	}
}
function tutorialsDeleteTutorial($data) {
    
}
function tutorialsGetTutorial($data) {
    $db = connect();
    $usernames = getUserIdArray($db);
    $myID = getCurrentuserId();
    $id = (isset($data["id"]) ? $db->real_escape_string($data["id"]):dieWithMessage("Nicht alle Daten wurden angebenen!"));
    $res = $db->query("SELECT * FROM tutorials WHERE `id` = '$id'");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $steps = $db->query("SELECT * FROM tutorialsteps WHERE `tutorial` = '$id'");
    $steps = $steps->fetch_all(MYSQLI_ASSOC);
    
    $tutorialSteps = [];
    foreach ($steps as $step) {
        $tutorialSteps[] = array(
            "id" => $step["id"],
            "title" => $step["title"],
            "content" => $step["content"],
            "image1" => $step["image1"],
            "image2" => $step["image2"],
            "image3" => $step["image3"]
            );
        
    }

    foreach ($res as $line) {
        $ret = array(
            "id" => $line["id"],
            "title" => $line["title"],
            "description" => $line["description"],
            "author" => $line["author"],
            "date" => $line["date"],
            "steps" => $tutorialSteps
            );
        
    }
    die(json_encode($ret));
}

function tutorialsAddStep($data) {
    $db = connect();
    $id = (isset($data["id"]) ? $db->real_escape_string($data["id"]):dieWithMessage("Nicht alle Daten wurden angebenen!"));
    $res = $db->query("INSERT INTO `tutorialsteps` (`id`, `tutorial`, `title`, `content`, `image1`, `image2`, `image3`) VALUES (NULL, '$id', 'Unbenannter Schritt', '', '', '', '');");
    if($res) {
        die(json_encode(array("status" => true)));
    } else {
        dieWithMessage("Fehler: ".$db->error);  
    }
}
function tutorialsUpdateStep($data) {
    $db = connect();
    if (isset($data["id"]) &&
    isset($data["content"]) &&
    isset($data["title"]) &&
    isset($data["image1"]) &&
    isset($data["image2"]) &&
    isset($data["image3"]) &&
    !empty(trim($data["id"])) &&
    !empty(trim($data["title"])) &&
    !empty(trim($data["content"])) ) {

        $title = $db->real_escape_string($data["title"]);
        $id = $db->real_escape_string($data["id"]);
        $content = $db->real_escape_string($data["content"]);
        $image1 = $db->real_escape_string($data["image1"]);
        $image2 = $db->real_escape_string($data["image2"]);
        $image3 = $db->real_escape_string($data["image3"]);

        $result = $db->query("UPDATE `tutorialsteps` SET `title`='$title', `content`='$content', `image1`='$image1', `image2`='$image2', `image3`='$image3' WHERE `id`='$id'");
        if($result) {
            die(json_encode(array("status" => true)));
        } else {
            dieWithMessage("Fehler: ".$db->error);
    }
	} else {
		dieWithMessage("Nicht alle Daten angebenen!");
		
	}
}

function filesGetFolder($data) {
    $db = connect();
	$fid = $db->real_escape_string($data["fid"]);
	$pid = $db->real_escape_string($data["pid"]);
    
    $res1 = $db->query("SELECT * FROM files WHERE folder='$fid' AND project='$pid'");
    
    $res1 = $res1->fetch_all(MYSQLI_ASSOC);
    $res2 = $db->query("SELECT * FROM folders WHERE folder='$fid' AND project='$pid'")->fetch_all(MYSQLI_ASSOC);
    
    $files = [];
    $folders = [];

    $tres = $db->query("SELECT * FROM tags");
    $tres = $tres->fetch_all(MYSQLI_ASSOC);
    $tags = [];
    foreach ($tres as $tag) {
        $tags[$tag["id"]] = [];
        $tags[$tag["id"]]["name"] = $tag["name"];
        $tags[$tag["id"]]["id"] = $tag["id"];
        $tags[$tag["id"]]["backgroundColor"] = $tag["color"];
        $tags[$tag["id"]]["color"] = $tag["text-color"];
    }


    $fc = new FileController($db);
    foreach ($res1 as $file) {
        $file["type"] = "file";
        $ftags = array_filter(explode("-", $file["tags"]));
        $file["tags"] = array();
        foreach ($ftags as $ftag) {
            $file["tags"][] = array("name" => $tags[$ftag]["name"],
			"color" =>$tags[$ftag]["color"],"id" =>$tags[$ftag]["id"],
			"backgroundColor" => $tags[$ftag]["backgroundColor"],);
        }
        $file["size"] = @filesize($fc->getLocalFilePath($file["id"]));
        if ($file["size"]) {
            $file["rawsize"] = $file["size"];
            $file["size"] = human_filesize($file["size"]);
        } else {
            $file["rawsize"] = null;
            $file["size"] = "-";
        }
        $files[] = $file;
    }
    foreach ($res2 as $folder) {
        $folder["type"] = "folder";
        
        $ftags = array_filter(explode("-", $folder["tags"]));
        $folder["tags"] = array();
        foreach ($ftags as $ftag) {
            $folder["tags"][] = array("name" => $tags[$ftag]["name"],
			"color" =>$tags[$ftag]["color"],"id" =>$tags[$ftag]["id"],
			"backgroundColor" => $tags[$ftag]["backgroundColor"],);
        }
        $folder["size"] = getDirectorySize($fc->getCompleteFolderPath($folder["id"]));
        
        if ($folder["size"]) {
            $folder["rawsize"] = $folder["size"];
            $folder["size"] = human_filesize($folder["size"]);
        } else {
            $folder["rawsize"] = null;
            $folder["size"] = "-";
        }
        $folders[] = $folder;
    }
    //log_to_file(print_r("hi", true));
    //log_to_file(print_r(array_merge($folders, $files), true));
    die(json_encode(array_merge($folders, $files)));
    /*$path = $data["path"];
    $project = $data["project"];
    Git::loadRepositories();
    $res = Git::lsTree($project, $path);
    $res = array_map("utf8_encode", $res );
    $files = [];
    $folders = [];
    foreach ($res as $file) {
        //if (!substr($file["file"], 0, 1) == ".") {
            $item = array(
                "name" => (isset($file["file"])?$file["file"]:""),
                "commitMessage" => (isset($file["message"])?$file["message"]:""),
                "author" => (isset($file["author"])?$file["author"]:""),
                "hash" => (isset($file["hash"])?$file["hash"]:""),
                "date" => (isset($file["date"])?$file["date"]:""),
                "type" => ($file["type"]=="tree"?"folder":"file"),
            );
            if ($file["type"]=="tree") {
                $folders[] = $item;
            } else {
                $files[] = $item;
            }
        //} 
        
        
    }
    usort($files, function ($a, $b) {
        return $a["name"] <=> $b["name"];
    });
    usort($folders, function ($a, $b) {
        return $a["name"] <=> $b["name"];
    });
    die(json_encode(array_merge($folders, $files)));*/
}

function filesToggleTag($data) {
    $fc = new FileController(connect());
	if ($data["type"] == "file") {
		$fc->editFileTag($data["fid"], $data["tagid"]);
	} else {
        $fc->editFolderTag($data["fid"], $data["tagid"]);
	}

}

function filesCreateShare($data) {
    $fc = new FileController(connect());
    $fc->createShare($data["fid"], $data["type"]);
}

function filesNewFolder($data) {
    $db = connect();
    $pid = $db->real_escape_string($data["pid"]);
	$fid = $db->real_escape_string($data["fid"]);
	$foldername = $db->real_escape_string($data["name"]);

	$res = $db->query("INSERT INTO `folders` (`id`, `project`, `folder`, `name`, `tags`) VALUES (NULL, '$pid', '$fid', '$foldername', '')");
	$id = $db->insert_id;
	if (!$res) {
		dieWithMessage("Fehler" . $db->error);
		die();
	}


	$fpath = getFolderPath($db, $fid);
	$prepath = getSetting($db, "SETTING_FILES_DIRECT_PATH");
	$path = $prepath . "/$pid/" . $fpath . $foldername;
	mkdir($path);

	if (!$res) {
		dieWithMessage("Fehler: der Ordner konnte nicht erstellt werden!");
	}
	
	dieSuccessfully();
}

function filesRename($data) {
    $fc = new FileController(connect());
    if ($data["type"] == "file") {
		$fc->renameFile($data["fid"], $data["name"]);
		dieSuccessfully();
	} else {
		$fc->renameFolder($data["fid"], $data["name"]);
		dieSuccessfully();
	}
}

function filesDelete($data) {
    $fc = new FileController(connect());
    if (!isAllowedTo("REMOVE_FILE")) {
		dieWithMessage("Du hast leider keine Berechtigung, eine Datei oder einen Ordner zu löschen.");
		
	}
	if ($data["type"] == "file") {
		$fc->deleteFile($data["fid"]);
		die();
	} else {
		$fc->deleteFolder($data["fid"]);
		die();
	}
}

function clientsoftwareGetMobile() {
    $ret = [];
    if ($handle = opendir('/var/www/html/AGM-Tools/releases/mobile/')) {
        while (false !== ($entry = readdir($handle))) {
            if ($entry != "." && $entry != "..") {
                $ret[] = array("title" => $entry, "url" => "/AGM-Tools/releases/mobile/$entry");
            }
        }
        closedir($handle);
    }
    die(json_encode($ret));
}

function clientsoftwareGetDesktop() {
    $ret = [];
    if ($handle = opendir('/var/www/html/AGM-Tools/releases/desktop/')) {
        while (false !== ($entry = readdir($handle))) {
            if ($entry != "." && $entry != "..") {
                $ret[] = array("title" => $entry, "url" => "/AGM-Tools/releases/desktop/$entry");
            }
        }
        closedir($handle);
    }
    die(json_encode($ret));
}

function bugsGetBugs() {
    $db = connect();
    $bugs = [];
    $usernames = getUserIdArray($db);
    $res = $db->query("SELECT * FROM bugs");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    foreach ($res as $line) {
        $bug = [];
        if ($line["type"] == "bug") {
            $bug["type"] = "Bug";
        } else {
            $bug["type"] = "Verbesserungsvorschlag";
        }
        $bug["location"] = $line["place"];
        $bug["title"] = $line["headline"];
        $bug["description"] = $line["description"];
        $bug["id"] = $line["id"];
        
        if (isset($usernames[$line["creator"]])) {
            
            $bug["author"] = $usernames[$line["creator"]];
        } else {
            $bug["author"] = "Unbekannt";
        }
        $bugs[] = $bug;
    }
    die(json_encode($bugs));
}

function bugsNewBug($data) {
    $db = connect();
    if (isset($data["type"]) &&
    isset($data["description"]) &&
    isset($data["headline"]) &&
    isset($data["place"]) &&
    !empty(trim($data["type"])) &&
    !empty(trim($data["description"])) &&
    !empty(trim($data["place"])) &&
    !empty(trim($data["headline"])) ) {
			
        $headline = $db->real_escape_string($data["headline"]);
        $description = $db->real_escape_string($data["description"]);
        $sender = getCurrentUserId();
        $type = $db->real_escape_string($data["type"]);
        $place = $db->real_escape_string($data["place"]);

        $result = $db->query("INSERT INTO `bugs` (`id`, `headline`, `type`, `place`, `description`, `creator`) VALUES (NULL, '$headline', '$type', '$place', '$description', '$sender');");
        if($result) {
            die(json_encode(array("status" => true)));
        } else {
            dieWithMessage("Fehler: ".$db->error);
        }
	} else {
		dieWithMessage("Fehler: nicht alle Daten angegeben!");
    }
}

function bugsDeleteBug($data) {
    $db = connect();
    $id = $db->real_escape_string(trim($data["id"]));
	$result = $db->query("DELETE FROM `bugs` WHERE `id` = $id");
	if($result) {
        dieSuccessfully();
	} else {
		dieWithMessage("Unbekannter Fehler");
		
	}
}

function templatesGetTemplates() {
    $db = connect();
    $res = $db->query("SELECT * FROM templates");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    $templates = [];
    foreach ($res as $line) {
        $template = [];
        $template["id"] = $line["id"];
        $template["type"] = $line["group"];
        $template["name"] = $line["name"];
        $template["description"] = $line["description"];
        $templates[] = $template;
    }
    die(json_encode($templates));
}

function templatesNewTemplate($data) {
    if (isset($data["type"]) &&
	isset($data["description"]) &&
	isset($data["name"]) &&
	isset($_FILES["file"]) &&
	!empty(trim($data["name"])) &&
	!empty(trim($data["description"])) &&
	!empty(trim($data["type"])) &&
	is_uploaded_file($_FILES['file']['tmp_name']) ) {
		/////////////////////////

		// connect and login to FTP server
		$fc = new FileController($db);
		$fc->createTemplate($_FILES['file'], $_POST["name"], $_POST["description"], $_POST["type"]);
		dieSuccessfully();
	} else {
		dieWithMessage("Fehler: Nicht alle Daten angegeben!");
	}
}
?>