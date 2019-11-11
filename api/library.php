<?php

define("PREPATH", "/var/www/html/AGM-Tools/data/");

function human_filesize($bytes, $decimals = 0) {
    $size = array('B','kB','MB','GB','TB','PB','EB','ZB','YB');
    $factor = floor((strlen($bytes) - 1) / 3);
    return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . " ".@$size[$factor];
}

function trim_text($input, $length, $ellipses = true, $strip_html = true) {
    //strip tags, if desired
    if ($strip_html) {
        $input = strip_tags($input);
    }
  
    //no need to trim, already shorter than trim length
    if (strlen($input) <= $length) {
        return $input;
    }
  
    //find last space within length
    $last_space = strrpos(substr($input, 0, $length), ' ');
    $trimmed_text = substr($input, 0, $last_space);
  
    //add ellipses (...)
    if ($ellipses) {
        $trimmed_text .= '...';
    }
  
    return $trimmed_text;
}

function getPushTokenFromUserId($uid) {
    $db = connect();
    $uid = $db->real_escape_string($uid);
    $res = $db->query("SELECT pushToken FROM users WHERE id = $uid");
    if ($res) {
        $res = $res->fetch_all(MYSQLI_ASSOC);
        if ($res) {
            $res = $res[0];
            if ($res) {
                $res = $res["pushToken"];
                if ($res) {
                    return $res;
                }
            }
        }
    }
    return null;
}

function sendPushMessage($title, $body, $payload, $deviceTokens)
{
    $url = "https://fcm.googleapis.com/fcm/send";
    
    $data = array();

    $notification = array();
    $notification ['title'] = $title;
    $notification ['body'] =  $body;
    $data["notification"] = $notification;
    
    
    $data ['registration_ids'] = $deviceTokens;
    
    
    $data['data'] = $payload;

    $content = json_encode($data);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER,
            array(
                "Content-type: application/json",
                file_get_contents("firebase_key.secret")
                ));
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $content);

    $json_response = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    if ( $status != 201 && $status != 200) {
        var_dump($data);
        var_dump($json_response);

        die("Error: call to URL $url failed with status $status, response $json_response, curl_error " . curl_error($curl) . ", curl_errno " . curl_errno($curl));
    }

    curl_close($curl);
    

}


function getCurrentUserName() {
    $db = connect();
    return @($db->query("SELECT username FROM users WHERE id=".@$db->real_escape_string(getCurrentUserId()))->fetch_all(MYSQLI_ASSOC)[0]["username"]);
}

function dieSuccessfully() {
    die(json_encode(array("status"=>true)));
}


function getUsername() {
	$db = connect();
	$id = $db->real_escape_string($_SESSION["userid"]);
	$res = $db->query("SELECT name FROM users WHERE id=$id");
	if ($res) {
		$res = $res->fetch_all(MYSQLI_ASSOC);
		if ($res) {
			$res = $res[0];
			if ($res) {
				
				return explode(" ", $res["name"])[0];
			}
		}
	}
	return "Unbekannter";
}

function putSession($key, $value) {
	$db = connect();
	$token = null;
	$headers = apache_request_headers();
	
	if(isset($headers['Authorization'])){
		
		$token = $db->real_escape_string($headers['Authorization']);
		
		$res = $db->query("SELECT * FROM `session` WHERE `token` = '$token'");
		if ($res) {
			
			$res = $res->fetch_all(MYSQLI_ASSOC);
			if ($res && isset($res[0]) && isset($res[0]["data"])) {
				//echo "update";
				//var_dump($res);
				$data = unserialize($res[0]["data"]);
				$data[$key] = $value;
				$data = serialize($data);
				$db->query("UPDATE `session` SET `data` = '$data' WHERE `token` = '$token'");
				//echo $db->error;
				die();
				
			}else {
				$data = array();
			}
		} else {
			$data = array();
		}
		//echo "new";
		$data[$key] = $value;
		$data = $db->real_escape_string(serialize($data));
		$sql = "INSERT INTO `session` (token, `data`) VALUES ('$token', '$data')";
		$db->query($sql);
		//echo $sql;
	} 
	
	  
}

function getSession($key) {
	
	$db = connect();
	$token = null;
	$headers = apache_request_headers();
	if(isset($headers['Authorization'])){
		$token = $db->real_escape_string($headers['Authorization']);
	} else if (isset($_GET["token"])) {
		$token = $db->real_escape_string("Bearer ".$_GET["token"]);
	} else {
		echo "Fehler bei getSession: kein Token";
		die();
	}
	$sql = "SELECT * FROM `session` WHERE `token` = '$token'";
	//echo $sql;
	$res = $db->query($sql);
	
	if ($res) {
		$res = $res->fetch_all(MYSQLI_ASSOC);
		//var_dump($res);
		if ($res && isset($res[0]) && isset($res[0]["data"])) {
			$data = unserialize($res[0]["data"]);
			//echo ("Token: ".$data[$key]);
			return $data[$key];
		}
	}
	echo "Fehler bei getSession: ".$db->error."\n";
	die();
}




//******  AGM-Tools library.php  ******//

setlocale(LC_TIME, "de_DE");

$urlprepath = "https://agmtools.allgaeu-gymnasium.de/AGM-Tools/";
define("URLPREPATH", $urlprepath);

function getDirectorySize($path)
{
	$bytestotal = 0;
	$path = realpath($path);
	if ($path !== false && $path != '' && file_exists($path)) {
		foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)) as $object) {
			$bytestotal += $object->getSize();
		}
	}
	return $bytestotal;
}

function reloadModule($module, $additional = null)
{
	if ($additional) {
		echo "<script>$('body').removeClass('modal-open');$('.modal-backdrop').remove();loadModule('$module', true, '$additional');</script>";
	} else {
		echo "<script>$('body').removeClass('modal-open');$('.modal-backdrop').remove();loadModule('$module', true);</script>";
	}
}

function setRootDirUserFilePath()
{
	global $USER_FILE;
	$USER_FILE = "./users.serialized";
}

function getFTPDirSize($username, $password, $server, $dir)
{
	$connid = ftp_connect($server);

	//ini_set('xdebug.max_nesting_level',500);
	$connid = ftp_connect($server);
	$login_result = ftp_login($connid, $username, $password);
	$total_size = 0;
	$contents_on_server = ftp_nlist($connid, $dir);
	foreach ($contents_on_server as $user_file) {
		if (ftp_size($connid, $user_file) == -1) {
			$directory = $user_file;
			$obj = new FTP();
			$obj->getsize($username, $password, $server, $directory);
		} else {
			//$file_size = ftp_size($connid,$user_file);
			$total_size += ftp_size($connid, $user_file);
		}
	}
	echo $total_size;
}

function getMime($filename)
{

	$mime_types = array(

		'txt' => 'text/plain',
		'htm' => 'text/html',
		'html' => 'text/html',
		'php' => 'text/html',
		'css' => 'text/css',
		'js' => 'application/javascript',
		'json' => 'application/json',
		'xml' => 'application/xml',
		'swf' => 'application/x-shockwave-flash',
		'flv' => 'video/x-flv',

		// images
		'png' => 'image/png',
		'jpe' => 'image/jpeg',
		'jpeg' => 'image/jpeg',
		'jpg' => 'image/jpeg',
		'gif' => 'image/gif',
		'bmp' => 'image/bmp',
		'ico' => 'image/vnd.microsoft.icon',
		'tiff' => 'image/tiff',
		'tif' => 'image/tiff',
		'svg' => 'image/svg+xml',
		'svgz' => 'image/svg+xml',

		// archives
		'zip' => 'application/zip',
		'rar' => 'application/x-rar-compressed',
		'exe' => 'application/x-msdownload',
		'msi' => 'application/x-msdownload',
		'cab' => 'application/vnd.ms-cab-compressed',

		// audio
		'mp3' => 'audio/mpeg',
		'wav' => 'audio/wav',
		'ogg' => 'audio/ogg',
		// video
		'avi' => 'video/avi',
		'mov' => 'video/quicktime',
		'mp4' => 'video/mp4',
		'qt' => 'video/quicktime',
		'mov' => 'video/quicktime',

		// adobe
		'pdf' => 'application/pdf',
		'psd' => 'image/vnd.adobe.photoshop',
		'ai' => 'application/postscript',
		'eps' => 'application/postscript',
		'ps' => 'application/postscript',

		// ms office
		'doc' => 'application/msword',
		'rtf' => 'application/rtf',
		'xls' => 'application/vnd.ms-excel',
		'ppt' => 'application/vnd.ms-powerpoint',
		'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'pptx' => 'application/vnd.ms-powerpoint',
		'xlsx' => 'application/vnd.ms-excel',
		

		// open office
		'odt' => 'application/vnd.oasis.opendocument.text',
		'ods' => 'application/vnd.oasis.opendocument.spreadsheet',
	);

	@$ext = strtolower(array_pop(explode('.', $filename)));
	if (array_key_exists($ext, $mime_types)) {
		return $mime_types[$ext];
	} elseif (function_exists('finfo_open')) {
		$finfo = finfo_open(FILEINFO_MIME);
		$mimetype = finfo_file($finfo, $filename);
		finfo_close($finfo);
		return $mimetype;
	} else {
		return 'application/octet-stream';
	}
}

function convertSize($bytes)
{
	$sizes = array('B', 'KB', 'MB', 'GB', 'TB');
	for ($i = 0; $bytes >= 1024 && $i < (count($sizes) - 1); $bytes /= 1024, $i++);
	return (round($bytes, 2) . " " . $sizes[$i]);
}

function htmlreplace($s)
{
	$utf8 = array("ä", "ö", "ü", "Ä", "Ö", "Ü", "ß", "€");
	$html = array("ae", "oe", "&uuml;", "&Auml;", "&Ouml;", "&Uuml;", "&szlig;", "&euro;");
	$new =  str_replace($utf8, $html, $s);
	return $new;
}

function makeClickableLinks($text)
{
	$text = html_entity_decode($text);
	$text = " " . $text;
	$text = preg_replace("/(^|[\n ])([\w]*?)([\w]*?:\/\/[\w]+[^ \,\"\n\r\t<]*)/is", "$1$2<a href=\"$3\" >$3</a>", $text);
	$text = preg_replace("/(^|[\n ])([\w]*?)((www|wap)\.[^ \,\"\t\n\r<]*)/is", "$1$2<a href=\"http://$3\" >$3</a>", $text);
	$text = preg_replace("/(^|[\n ])([\w]*?)((ftp)\.[^ \,\"\t\n\r<]*)/is", "$1$2<a href=\"$4://$3\" >$3</a>", $text);
	$text = preg_replace("/(^|[\n ])([a-z0-9&\-_\.]+?)@([\w\-]+\.([\w\-\.]+)+)/i", "$1<a href=\"mailto:$2@$3\">$2@$3</a>", $text);
	$text = preg_replace("/(^|[\n ])(mailto:[a-z0-9&\-_\.]+?)@([\w\-]+\.([\w\-\.]+)+)/i", "$1<a href=\"$2@$3\">$2@$3</a>", $text);
	$text = preg_replace("/(^|[\n ])(skype:[^ \,\"\t\n\r<]*)/i", "$1<a href=\"$2\">$2</a>", $text);
	return $text;
}

function canCurrentUserEditFile($fid) {
	$db = connect();
	$fid = $db->real_escape_string($fid);
	$res = $db->QUERY("SELECT members FROM projects JOIN files ON files.project = projects.id WHERE files.id = $fid");
	if ($res) {
		$res = $res->fetch_all(MYSQLI_ASSOC);
		if ($res && isset($res[0]) && isset($res[0]["members"])) {
			$members = explode("-", $res[0]["members"]);
			if (in_array(getCurrentUserId(), $members)) {
				return true;
			}
		}
	}
	return false;
}

function getUserIdArray($db)
{
	$res = $db->query("SELECT * FROM users ORDER BY id");
	$res = $res->fetch_all(MYSQLI_ASSOC);
	$users = [];
	foreach ($res as $user) {
		$users[$user["id"]] = $user["username"];
	}
	return $users;
}

function getContactIDArray($db)
{
	
	$res = $db->query("SELECT * FROM users ORDER BY id");
	$res = $res->fetch_all(MYSQLI_ASSOC);
	$contacts = [];
	foreach ($res as $contact) {
		$contacts[$contact["id"]] = $contact["username"];
	}
	//var_dump($contacts);
	return $contacts;
}

function getCurrentUserId($returnNullIfNotIset = false)
{
	return getSession("userid");
}



function getSetting($db, $setting, $noUserIdTest=false)
{
	//echo "Setting requested: $setting<br>";
	if (!$noUserIdTest) {
		$userid = getCurrentUserId(true);
	} else {
		$userid=null;
	}
	

	$res = $db->query("SELECT * FROM settings WHERE `name`='$setting'");

	if ($res && $userid) {
		$res = $res->fetch_all(MYSQLI_ASSOC);

		if ($res) {
			$settingid = $res[0]["id"];

			$data = $db->query("SELECT `data` FROM `settingsdata` WHERE `user`=$userid AND `setting`=$settingid");
			if ($data) {
				//var_dump($data);
				$data = $data->fetch_all(MYSQLI_ASSOC);
				if ($data != null) {
					if (isset($data[0]["data"])) {
						return $data[0]["data"];
					}
				} else {
					return $res[0]["globalDefaultValue"];
				}
			}
		}
	} else if ($res) {
		$res = $res->fetch_all(MYSQLI_ASSOC);
		return $res[0]["globalDefaultValue"];
	} else {
		return null;
	}





	//dieWithMessage("Die gewünschte Einstellung $setting für Benutzer $userid wurde nicht in der Datenbank gefunden!");
	die();
}

function getFTP($db)
{

	//$server = getSetting($db, "SETTING_FILES_FTP_SERVER");
	//$user = getSetting($db, "SETTING_FILES_FTP_USER");
	//$password = getSetting($db, "SETTING_FILES_FTP_PASSWORD");
	//$port = getSetting($db, "SETTING_FILES_FTP_PORT");
	//$path = getSetting($db, "SETTING_FILES_FTP_PATH");
	//$filepath = "ftp://$user:$password@$server:$port/$path";
	//echo $filepath;

	//@define("FILEPATH", $filepath);


	//echo file_get_contents(FILEPATH."/test.txt");
	//die();
	//var_dump($_GET);

	$conn_id = ftp_connect(getSetting($db, "SETTING_FILES_FTP_SERVER"));

	$login_result = ftp_login($conn_id, getSetting($db, "SETTING_FILES_FTP_USER"), getSetting($db, "SETTING_FILES_FTP_PASSWORD"));
	return $conn_id;
}

function getFTPFilePath($fid, $db = null)
{
	if ($db == null) {
		$db = connect();
	}
	/*if ($conn_id == null) {
			$conn_id = getFTP($db);
		}*/
	$res = $db->query("SELECT * FROM files WHERE id=$fid");
	if (!$res) {
		die("Datei nicht gefunden! Fehler 0x0003");
	}
	$res = $res->fetch_all(MYSQLI_ASSOC);
	if (!$res) {
		die("Datei nicht gefunden!  Fehler 0x0004");
	}
	$res = $res[0];

	$folderpath = getFolderPath($db, $res["folder"]);
	$filename = $res["name"];
	$pid = $res["project"];
	$server = getSetting($db, "SETTING_FILES_FTP_SERVER");
	$user = getSetting($db, "SETTING_FILES_FTP_USER");
	$password = getSetting($db, "SETTING_FILES_FTP_PASSWORD");
	$port = getSetting($db, "SETTING_FILES_FTP_PORT");
	$path = getSetting($db, "SETTING_FILES_FTP_PATH");
	$filepath = "ftp://$user:$password@$server:$port/$path/$pid/$folderpath/$filename";
	return $filepath;
}

function getFolderPath($db, $folderID)
{
	if ($folderID == -1) {
		return "/";
	}
	$folderID = $db->real_escape_string($folderID);
	$folder = $db->query("SELECT * FROM folders WHERE id=$folderID");
	if (!$folder) {
		die("Ordner nicht gefunden!");
	}
	$folder = $folder->fetch_all(MYSQLI_ASSOC)[0];

	if ($folder == null) {
		die("Ordner nicht gefunden!");
	}
	$path = $folder["name"] . "/";
	if ($folder["folder"] != "-1") {
		//echo "nächester umlauf<br>";
		//echo "vorher: $path<br>";
		$path = getFolderPath($db, $folder["folder"]) . $path;
		//echo "nacher: $path<br><br>";
	} else {
		//echo "beenden mit $path<br>";
		//var_dump($folder["folder"]);
		return $path;
	}
	return $path;
}

function getFolderPathAndIDs($db, $folderID)
{
	if ($folderID == -1) {
		return "/";
	}
	$folderID = $db->real_escape_string($folderID);
	$folder = $db->query("SELECT * FROM folders WHERE id=$folderID");
	if (!$folder) {
		die("Ordner nicht gefunden!");
	}
	$folder = $folder->fetch_all(MYSQLI_ASSOC)[0];

	if ($folder == null) {
		die("Ordner nicht gefunden!");
	}
	$path = $folder["name"] . "&" . $folder["id"] . "/";
	if ($folder["folder"] != "-1") {
		//echo "nächester umlauf<br>";
		//echo "vorher: $path<br>";
		$path = getFolderPathAndIds($db, $folder["folder"]) . $path;
		//echo "nacher: $path<br><br>";
	} else {
		//echo "beenden mit $path<br>";
		//var_dump($folder["folder"]);
		return $path;
	}
	return $path;
}

function ftp_get_filelist($con, $path)
{
	$files = array();
	$contents = ftp_nlist($con, $path);
	var_dump($contents);
	die();
	$contents = ftp_rawlist($con, $path);

	$a = 0;
	$out = null;
	if (count($contents)) {
		foreach ($contents as $line) {

			preg_match("#([drwx\-]+)([\s]+)([0-9]+)([\s]+)([0-9]+)([\s]+)([a-zA-Z0-9\.]+)([\s]+)([0-9]+)([\s]+)([a-zA-Z]+)([\s ]+)([0-9]+)([\s]+)([0-9]+):([0-9]+)([\s]+)([a-zA-Z0-9\.\-\_ ]+)#si", $line, $out);

			if ($out[3] != 1 && ($out[18] == "." || $out[18] == "..")) {
				// do nothing
			} else {
				$a++;
				$files[$a]['rights'] = $out[1];
				$files[$a]['type'] = $out[3] == 1 ? "file" : "folder";
				$files[$a]['owner_id'] = $out[5];
				$files[$a]['owner'] = $out[7];
				$files[$a]['date_modified'] = $out[11] . " " . $out[13] . " " . $out[13] . ":" . $out[16] . "";
				$files[$a]['name'] = $out[18];
			}
		}
	}
	return $files;
}


function updateReceivers()
{
	$db = connect();
	$users = $db->query("SELECT * FROM users");
	$users = $users->fetch_all(MYSQLI_ASSOC);
	$projects = $db->query("SELECT * FROM projects");
	$projects = $projects->fetch_all(MYSQLI_ASSOC);
	$receivers = $db->query("SELECT * FROM receivers");
	$receivers = $receivers->fetch_all(MYSQLI_ASSOC);
	$receivers = array_column($receivers, "name");
	foreach ($users as $line) {
		if (!in_array($line["username"], $receivers)) {
			$name = $line["username"];
			$type = "private";
			$members = $line["id"];
			$res = $db->query("INSERT INTO receivers (name, type, members) VALUES ('$name', '$type', '$members')");
			if (!$res) {
				echo $db->error;
			}
			//echo "new one found!<br>";
		}
	}
	foreach ($projects as $line) {
		if (!in_array($line["name"], $receivers)) {
			$name = $line["name"];
			$type = "group";
			$members = $line["members"];
			$res = $db->query("INSERT INTO receivers (name, type, members) VALUES ('$name', '$type', '$members')");
			if (!$res) {
				echo $db->error;
			}
			//echo "new Project found!<br>";
		}
	}
}

function getProjectName($db, $pid)
{
	$pid = $db->real_escape_string($pid);
	$res = $db->query("SELECT * FROM `projects` WHERE `id`='$pid'");
	if ($res) {
		$res = $res->fetch_all(MYSQLI_ASSOC);
		if ($res) {
			$res = $res[0];
			if ($res) {
				return $res["name"];
			}
		}
	}
	dieWithMessage("Ein Fehler ist aufgetreten: Eine Falsche ProjektId für getProjectName");
	die();
}

function getVersion()
{
	$db = connect();
	return $db->query("SELECT `version` FROM `changelogs` ORDER BY `version` DESC LIMIT 1")->fetch_all(MYSQLI_ASSOC)[0]["version"];
}

function isAllowedTo($permission)
{
	$permission = "PERMISSION_" . $permission;
	//echo $permission;
	$userid = getCurrentUserId();
	$db = connect();
	$res = $db->query("SELECT $permission FROM usergroups JOIN users ON users.usergroup = usergroups.id WHERE users.id=$userid");
	if ($res) {
		//echo "1<br>";
		$res = $res->fetch_all(MYSQLI_ASSOC);
		if ($res) {
			//echo "2<br>";
			$res = $res[0];
			if ($res) {
				//var_dump($res);
				//echo "3<br>";
				$res = $res[$permission];

				if ($res == "1") {
					//echo "4<br>";
					return true;
				} else {

					return false;
				}
			}
		}
	}
	//echo "6<br>";
	echo $db->error;
	return false;
}


class FileController
{

	private $mode;
	private $fileID;
	private $db;


	public function __construct($db, $skipUserIdCheck=false)
	{
		$this->db = $db;
		
		$this->mode = getSetting($db, "SETTING_FILES_SAVE_MODE", $skipUserIdCheck);
		
		$this->listDirCount = 1;
		//echo $this->mode;
	}

	public function displayFile($fid)
	{
		if ($this->mode == "ftp") {
			$farray = $this->getFileArray($fid);
			$fname = $farray["name"];

			//$pid = $farray["project"];


			$file_parts = pathinfo($fname);
			//echo $fname;
			//$fn = $file_parts["basename"];
			echo "<h3>$fname</h3><br>";
			//echo $file_parts['extension'];
			$displayPath = URLPREPATH . "library/getFTPFile.php?fid=$fid&mime=";


			switch (strtolower($file_parts['extension'])) {
					// images
				case "jpg":
					echo "<img class='img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "jpeg":
					echo "<img class='img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "png":
					echo "<img class='img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "gif":
					echo "<img class='img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "bmp":
					echo "<img class='img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "ico":
					echo "<img class='img-responsive' src='" . $displayPath . "'></img>";
					break;

					//audio
				case "mp3":
					echo " <audio controls><source src='" . $displayPath . "' type='audio/mp3'>Bitte verwende einen anderen Browser, beispielsweise Firefox.</audio> ";
					break;
				case "ogg":
					echo " <audio controls><source src='" . $displayPath . "' type='audio/mp3'>Bitte verwende einen anderen Browser, beispielsweise Firefox.</audio> ";
					break;
				case "wav":
					echo " <audio controls><source src='" . $displayPath . "' type='audio/mp3'>Bitte verwende einen anderen Browser, beispielsweise Firefox.</audio> ";
					break;

					//audio
				case "mp4":

					echo " <video src='" . $displayPath . "' controls>Bitte verwende einen anderen Browser, beispielsweise Firefox.</video>";
					break;
				case "avi":
					echo " <video src='" . $displayPath . "' controls>Bitte verwende einen anderen Browser, beispielsweise Firefox.</video>";
					break;
				case "mov":
					echo " <video src='" . $displayPath . "' controls>Bitte verwende einen anderen Browser, beispielsweise Firefox.</video>";
					break;

					// adobe
				case "pdf":
					//echo " <embed src='".$displayPath."' width='500' height='375' type='application/pdf'>";
					$displayPath = "./getFTPFile.php?fid=$fid&mime=";
					echo " <iframe src='" . URLPREPATH . "library/getPDF.php?f=" . $displayPath . "' width='800' height='500'></iframe>";
					break;

					//archives
				case "zip":
					echo "	<p>Dies ist eine gepackte (Zip-)Datei. Ihr Inhalt kann nicht ohne Auspacken angezeigt werden. <br><br>
							<button id='extract' class='btn btn-primary' onclick=\"javascript:extractZIP($fid);\">Auspacken</button></p>
							<div id='extrator'></div>";
					break;
				case "docx":
					echo "<p>Dies ist ein Plan, wollen Sie ihn bearbeiten?</p>";
					echo "<button class=\"btn btn-success\" onclick=\"javascript:loadModule('plans', true, 'word=$fid');\">Bearbeiten</button><br><br><br><br>";
				case "exe":


				case "": // Handle file extension for files ending in '.'
					break;
				case null: // Handle no file extension
					break;
			}
		} else if ($this->mode == "direct") {
			//echo $fid;
			$result = "";
			$res = [];
			$farray = $this->getFileArray($fid);
			$fname = $farray["name"];
			$pid = $farray["project"];

			//$pid = $farray["project"];


			$file_parts = pathinfo($fname);
			//echo $fname;
			//$fn = $file_parts["basename"];

			$fpath = getFolderPath($this->db, $farray["folder"]);
			$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$res[0] = $fname;
			//echo $file_parts['extension'];
			$displayPath = URLPREPATH . "getFile.php?fid=".$fid;
			$origpath = substr($prepath, 1) . "/" . $pid . "/" . $fpath . $fname;
			//echo $displayPath;
			if (!isset($file_parts['extension'])) {
				$file_parts['extension'] = null;
			}
			switch (strtolower($file_parts['extension'])) {
					// images
				case "jpg":
					$result .= "<img class='centered img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "jpeg":
					$result .= "<img class='centered img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "png":
					$result .= "<img class='centered img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "gif":
					$result .= "<img class='centered img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "bmp":
					$result .= "<img class='centered img-responsive' src='" . $displayPath . "'></img>";
					break;
				case "ico":
					$result .= "<img class='centered img-responsive' src='" . $displayPath . "'></img>";
					break;

					//audio
				case "mp3":
					$result .= " <audio class='centered' controls><source src='" . $displayPath . "' type='audio/mp3'>Bitte verwende einen anderen Browser, beispielsweise Firefox.</audio> ";
					break;
				case "ogg":
					$result .= " <audio class='centered' controls><source src='" . $displayPath . "' type='audio/mp3'>Bitte verwende einen anderen Browser, beispielsweise Firefox.</audio> ";
					break;
				case "wav":
					$result .= " <audio class='centered' controls><source src='" . $displayPath . "' type='audio/mp3'>Bitte verwende einen anderen Browser, beispielsweise Firefox.</audio> ";
					break;

					//audio
				case "mp4":
					$result .= " <video class='centered' src='" . $displayPath . "' controls>Bitte verwende einen anderen Browser, beispielsweise Firefox.</video>";
					break;
				case "avi":
					$result .= " <video class='centered' src='" . $displayPath . "' controls>Bitte verwende einen anderen Browser, beispielsweise Firefox.</video>";
					break;
				case "mov":
					$result .= " <video class='centered' src='" . $displayPath . "' controls>Bitte verwende einen anderen Browser, beispielsweise Firefox.</video>";
					break;

					// adobe
				case "pdf":
					//echo " <embed src='".$displayPath."' width='500' height='375' type='application/pdf'>";
					//$displayPath = "./getFTPFile.php?fid=$fid&mime=";
					$result .= " <iframe class='centered' src='" . URLPREPATH . "library/getPDF.php?f=." . $displayPath . "' width='800' height='500'></iframe>";
					break;

					//archives
				case "zip":
					$result .= "	<p>Dies ist eine gepackte (Zip-)Datei. Ihr Inhalt kann nicht ohne Auspacken angezeigt werden. <br><br>
							<button id='extract' class='btn btn-primary' onclick=\"javascript:extractZIP($fid);\">Auspacken</button></p>
							<div id='extrator'></div>";
					break;


				case "docx":
					/*$result.= "<p>Dies ist ein Plan, wollen Sie ihn bearbeiten?</p>";
					$result.= "<button class=\"btn btn-success\" onclick=\"javascript:loadModule('plans', true, 'word=$fid');\">Bearbeiten</button><br><br><br><br>";*/
					$result .= "<a class='btn btn-primary' target='_blank' href='edit.php?file=$fid'>Word Dokument bearbeiten</a>";
					break;
				case "xlsx":
					/*$result.= "<p>Dies ist ein Plan, wollen Sie ihn bearbeiten?</p>";
					$result.= "<button class=\"btn btn-success\" onclick=\"javascript:loadModule('plans', true, 'word=$fid');\">Bearbeiten</button><br><br><br><br>";*/
					$result .= "<a class='btn btn-primary' target='_blank' href='edit.php?file=$fid'>Excel Dokument bearbeiten</a>";
					break;
				case "pptx":
					/*$result.= "<p>Dies ist ein Plan, wollen Sie ihn bearbeiten?</p>";
					$result.= "<button class=\"btn btn-success\" onclick=\"javascript:loadModule('plans', true, 'word=$fid');\">Bearbeiten</button><br><br><br><br>";*/
					$result .= "<a class='btn btn-primary' target='_blank' href='edit.php?file=$fid'>PowerPoint Dokument bearbeiten</a>";
					break;




				case "exe":
					break;
					// Programmierzeug
				case "md":
					require_once("library/parsedown/parsedown.php");

					$Parsedown = new Parsedown();
					$result .= "<div class='well'>" . $Parsedown->text(file_get_contents("." . $displayPath)) . "</div>";


				case "": // Handle file extension for files ending in '.'
					$result .= "<div class='well'>" . file_get_contents("." . $displayPath) . "</div>";
					break;
				case null: // Handle no file extension
					$result .= "<div class='well'>" . file_get_contents("." . $displayPath) . "</div>";
					break;

				default:
					if (is_file("../library/geshi/geshi/" . $file_parts['extension'] . ".php")) {
						require_once("library/geshi/geshi.php");

						$handle = fopen("." . $origpath, "r");
						$source = fread($handle, filesize("." . $origpath));
						fclose($handle);
						$geshi = new GeSHi($source, $file_parts['extension']);
						$result .= "<div class='well'>" . $geshi->parse_code() . "</div>";
					} else {
						require_once("library/geshi/geshi.php");

						$handle = fopen("." . $origpath, "r");
						$source = fread($handle, filesize("." . $origpath));
						fclose($handle);
						$geshi = new GeSHi($source, "text");
						$result .= "<div class='well'>" . $geshi->parse_code() . "</div>";
					}
			}
		}

		$res[1] = $result;
		return $res;
	}

	public function getLocalFilePath($fid) {
		$farray = $this->getFileArray($fid);
		$fname = $farray["name"];
		$pid = $farray["project"];
		$fpath = getFolderPath($this->db, $farray["folder"]);
		$prepath = PREPATH;//getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
		//return substr($prepath, 1) . "/" . $pid . "/" . $fpath . $fname;
		return $prepath . "/" . $pid . "/" . $fpath . $fname;
	}

	public function getFileArray($fid)
	{
		if ($fid) {
			$query = "SELECT * FROM files WHERE id=$fid";
			$farray = $this->db->query($query);
			if (!$farray) {
				dieWithMessage("Interner Fehler: bei getFileArray wurde die FID nicht gefunden! Fehler: " . $this->db->error . " <br>Beim Query: $query");
			}
			$farray = $farray->fetch_all(MYSQLI_ASSOC)[0];
			if (!$farray) {
				dieWithMessage("Interner Fehler: bei getFileArray wurde die FID nicht gefunden! Fehler: leere Rückgabe, aber kein DB Fehler");
			}
			return $farray;
		} else {
			dieWithMessage("Interner Fehler: bei getFileArray wurde keine FID übergeben! Fehler: " . $this->db->error . " <br>Beim Query: $query");

			die();
			return false;
		}
	}

	public function getFolderArray($fid)
	{
		$farray = $this->db->query("SELECT * FROM folders WHERE id=$fid");
		if (!$farray) {
			dieWithMessage("Interner Fehler: bei getFolderArray wurde die FID nicht gefunden!");
		}
		$farray = $farray->fetch_all(MYSQLI_ASSOC)[0];
		if (!$farray) {
			dieWithMessage("Interner Fehler: bei getFolderArray wurde die FID nicht gefunden!");
		}
		return $farray;
	}

	public function getFolderFid($fid)
	{
		return $this->getFolderArray($fid)["folder"];
	}

	public function getFileFid($fid)
	{
		return $this->getFileArray($fid)["folder"];
	}

	public function extractZIP($fid)
	{
		if ($this->mode == "ftp") {
			dieWithMessage("EIne Zip-Datei kann leider nicht extrahiert werden, wenn der Dateispeicherungsmodus auf 'FTP' eingestellt ist. Bitte wenden Sie sich an den Systemadministrator, um das Problem zu beheben.");
			die();
		}
		ini_set("max_execution_time", 0);
		$fid = $_POST["extract"];



		$farray = $this->getFileArray($fid);

		$fname = $farray["name"];
		$path_parts = pathinfo($fname);
		$filename = $path_parts["filename"];
		$pid = $farray["project"];
		$fpath = getFolderPath($this->db, $farray["folder"]);
		//die($fpath);
		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");

		$path = "$prepath/$pid/$fpath$fname";

		//echo $filename;

		$extractPath = "$prepath/$pid/$fpath$filename/";

		if (!file_exists($extractPath)) {
			if (!mkdir($extractPath, 0777)) {
				dieWithMessage("Erstellung der Verzeichnisse schlug fehl...");
				die();
			}
		}


		$zip = new ZipArchive;
		$res = $zip->open($path);
		if ($res === true) {
			$zip->extractTo($extractPath);
			$zip->close();

			$this->scan($pid);

			reloadModule("files", "projectid=$pid");
			die();
		} else {
			dieWithMessage($zip->getStatusString());
			dieWithMessage("Ein Fehler ist aufgetreten");
		}

		die();
	}

	public function createShare($fid, $type)
	{



		//echo $type;
		$fid = $this->db->real_escape_string($fid);
		$type = $this->db->real_escape_string($type);
		$share = $this->db->query("SELECT * FROM shares WHERE targetID=$fid");
		if ($share) {
			$share = $share->fetch_all(MYSQLI_ASSOC);
		}
		if (empty($share)) {
			$link = md5(uniqid(rand(), true));
			$res = $this->db->query("INSERT INTO `shares` (`id`, `targetID`, `link`, `type`) VALUES (NULL, '$fid', '$link', '$type');");
			//var_dump($db->error);

			
		} else {
			$link = $share[0]["link"];
			
		}
			

		die(json_encode(array("status"=>true, "link"=>$link)));
	}

	public function scan($pid)
	{
		$db_files = $this->db->query("SELECT * FROM `files` WHERE `project`=$pid");
		$db_files = $db_files->fetch_all(MYSQLI_ASSOC);
		$db_files = array_column($db_files, "name");
		$this->db->query("DELETE FROM `files` WHERE `project`=$pid");

		$db_folders = $this->db->query("SELECT * FROM `folders` WHERE `project`=$pid");
		$db_folders_res = $db_folders->fetch_all(MYSQLI_ASSOC);
		$db_folders = array_column($db_folders_res, "name");
		$this->db->query("DELETE FROM `folders` WHERE `project`=$pid");
		//die($db->error);
		//alert("success", "Files: <br><pre>".var_dump($db_files)."</pre>");
		//alert("success", "Folders: <br><pre>".var_dump($db_folders)."</pre>");

		list($counter, $known, $counterFolders, $knownFolders) = $this->scanDirectory($pid, $db_files, $db_folders);
		//alert("success", "$counter neue und $known bekannte Dateien wurden gefunden.<br>$counterFolders neue und $knownFolders bekannte Ordner wurden gefunden.");
		reloadModule("files", "projectid=$pid");
	}

	private function scanDirectory($pid, $db_files, $db_folders, $path = "", $fid = -1)
	{
		if ($this->mode == "ftp") {
			dieWithMessage("Das Aktualisieren der Dateien im FTP Modus wird nicht unterstützt!");
			die();
			/*$dir =  getSetting($this->db, "SETTING_FILES_FTP_PATH")."/$pid/$path";
			$ftp = getFTP($this->db);
			$files = ftp_get_filelist($ftp, $dir);

			alert("primary", "Debug: <pre>".var_dump($files)."</pre>");
			die();

			$counter = 0;
			$known = 0;
			$counterFolders = 0;
			$knownFolders = 0;


			//$db_folderIDs = array_column($db_folders_res, "id");


			//echo "<pre>";
			//var_dump($files);
			//var_dump($db_files);
			//var_dump($db_folders);
			//var_dump($db_folderIDs);
			//echo "</pre>";
			//die();


			foreach ($files as $index => $file) {

				if ($file["type"] == "file") { /// Datei
				$file = $file["name"];
					//echo $file;
					//echo "<br>";
					//echo $pid;
					if (in_array($file, $db_files)) {
						//echo "known file<br>";
						$res = $this->db->query("INSERT INTO `files` (`id`, `project`, `name`, `folder`) VALUES (NULL, '$pid', '$file', '$fid')");
						$known += 1;
					} else {
						$res = $this->db->query("INSERT INTO `files` (`id`, `project`, `name`, `folder`) VALUES (NULL, '$pid', '$file', '$fid')");
						if ($res) {
							$counter += 1;
						} else {
							dieWithMessage("Fehler: ".$db->error);
							die();
						}
					}
				} else { /// /// Ordner
					$folder = $file["name"];
					if ($folder != "." AND $folder != "..") {
						if (in_array($folder, $db_folders)) {
						//echo "known file<br>";
						$knownFolders += 1;
						$res = $this->db->query("INSERT INTO `folders` (`id`, `project`, `name`, `folder`) VALUES (NULL, '$pid', '$folder', '$fid')");

						} else {
							$res = $this->db->query("INSERT INTO `folders` (`id`, `project`, `name`, `folder`) VALUES (NULL, '$pid', '$folder', '$fid')");
							if ($res) {
								$counterFolders += 1;
							} else {
								dieWithMessage("Fehler: ".$db->error);
								die();
							}
						}
						$dieseOrdnerID = $this->db->insert_id;
						$news = array();//$this->scanDirectory($db, $pid, $db_files, $db_folders, $path."/".$folder, $dieseOrdnerID); ///// rekursiv !!!
						$counter += $news[0];
						$known += $news[1];
						$counterFolders += $news[2];
						$knownFolders += $news[3];
					}
				}
			}
			return array($counter, $known, $counterFolders, $knownFolders);*/
		} else if ($this->mode == "direct") {
			$dir =  getSetting($this->db, "SETTING_FILES_DIRECT_PATH") . "/$pid/$path/";
			//echo $dir;
			$files  = scandir($dir);

			//alert("primary", "Debug: <pre>".var_dump($files)."</pre>");
			//die();

			$counter = 0;
			$known = 0;
			$counterFolders = 0;
			$knownFolders = 0;


			//$db_folderIDs = array_column($db_folders_res, "id");


			//echo "<pre>";
			//var_dump($files);
			//var_dump($db_files);
			//var_dump($db_folders);
			//var_dump($db_folderIDs);
			//echo "</pre>";
			//die();


			foreach ($files as $file) {

				if (is_file($dir . $file)) { /// Datei

					//echo $file;
					//echo "<br>";
					//echo $pid;
					if (in_array($file, $db_files)) {
						//echo "known file<br>";
						$res = $this->db->query("INSERT INTO `files` (`id`, `project`, `name`, `folder`, `tags`) VALUES (NULL, '$pid', '$file', '$fid', '')");
						$known += 1;
					} else {
						$res = $this->db->query("INSERT INTO `files` (`id`, `project`, `name`, `folder`, `tags`) VALUES (NULL, '$pid', '$file', '$fid', '')");
						if ($res) {
							$counter += 1;
						} else {
							dieWithMessage("Fehler: " . $this->db->error);
							die();
						}
					}
				} else { /// /// Ordner
					$folder = $file;
					if ($folder != "." and $folder != "..") {
						if (in_array($folder, $db_folders)) {
							//echo "known file<br>";
							$knownFolders += 1;
							$res = $this->db->query("INSERT INTO `folders` (`id`, `project`, `name`, `folder`, `tags`) VALUES (NULL, '$pid', '$folder', '$fid', '')");
						} else {
							$res = $this->db->query("INSERT INTO `folders` (`id`, `project`, `name`, `folder`, `tags`) VALUES (NULL, '$pid', '$folder', '$fid', '')");
							if ($res) {
								$counterFolders += 1;
							} else {
								dieWithMessage("Fehler: " . $this->db->error);
								die();
							}
						}
						$dieseOrdnerID = $this->db->insert_id;
						$news = $this->scanDirectory($pid, $db_files, $db_folders, $path . "/" . $folder, $dieseOrdnerID); ///// rekursiv !!!
						$counter += $news[0];
						$known += $news[1];
						$counterFolders += $news[2];
						$knownFolders += $news[3];
					}
				}
			}
			return array($counter, $known, $counterFolders, $knownFolders);
		} else {
			dieWithMessage("Das Aktualisieren im Modus $this->mode wird nicht unterstützt.");
		}
	}

	public function deleteFile($fid)
	{


		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
		$farray = $this->getFileArray($fid);
		$fname = $farray["name"];
		$pid = $farray["project"];
		$folderid = $farray["folder"];
		$path_parts = pathinfo($fname);
		$filename = $path_parts["filename"];
		$pid = $farray["project"];
		$fpath = getFolderPath($this->db, $folderid);
		$path = $prepath . "/$pid/$fpath$fname";

		//echo $filename;



		if (!file_exists($path)) {
			dieWithMessage("Ein interner Fehler ist aufgetreten: bei deleteFile() wurde der Orginalpfad nicht gefunden!");
			
		} else {
			unlink($path);
			
			$res = $this->db->query("DELETE FROM `files` WHERE `files`.`id` = $fid");
			if ($res) {
				die(json_encode(array("status"=>true)));
			} else {
				dieWithMessage("Ein Fehler ist aufgetreten, die Datei konnte nicht in der Datenbank gelöscht werden");
				
			}
		}
	}

	public function deleteFolder($fid)
	{
		$this->deleteFolderRecursive($fid);
		$farray = $this->getFolderArray($fid);
		$fname = $farray["name"];
		$pid = $farray["project"];
		$fpath = getFolderPath($this->db, $farray["folder"]);
		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
		$path = $prepath . "/" . $pid . "/" . $fpath . $fname;
		@rmdir($path);
		
		$id = $this->db->real_escape_string($fid);
		$this->db->query("DELETE FROM `folders` WHERE `id`=$id");
		die(json_encode(array("status"=>true)));
	}

	private function deleteFolderRecursive($fid)
	{
		$deletedFiles = 0;
		$deletedFolders = 0;
		$fid = $this->db->real_escape_string($fid);
		$content = $this->db->query("SELECT * FROM `files` WHERE `folder`= $fid");
		if ($content) {
			$content = $content->fetch_all(MYSQLI_ASSOC);
			if ($content) {
				$farray = $this->getFolderArray($fid);
				$fname = $farray["name"];
				$pid = $farray["project"];
				$fpath = getFolderPath($this->db, $farray["folder"]);
				$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
				$path = $prepath . "/" . $pid . "/" . $fpath . $fname;

				foreach ($content as $file) {
					unlink($path . "/" . $file["name"]);
					$id = $this->db->real_escape_string($file["id"]);
					$this->db->query("DELETE FROM `files` WHERE `id`=$id");
					$deletedFiles += 1;
				}
			}
		}
		$folders = $this->db->query("SELECT * FROM `folders` WHERE `folder`= $fid");
		if ($folders) {
			$folders = $folders->fetch_all(MYSQLI_ASSOC);
			if ($folders) {
				$farray = $this->getFolderArray($fid);
				$fname = $farray["name"];
				$pid = $farray["project"];
				$fpath = getFolderPath($this->db, $farray["folder"]);
				$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
				$path = $prepath . "/" . $pid . "/" . $fpath . $fname;

				foreach ($folders as $folder) {
					$gotten = $this->deleteFolderRecursive($folder["id"]);
					$deletedFiles += $gotten[0];
					$deletedFolders += $gotten[1];
					@rmdir($path . "/" . $folder["name"]);
					$id = $this->db->real_escape_string($folder["id"]);
					$this->db->query("DELETE FROM `folders` WHERE `id`=$id");
					$deletedFolders += 1;
				}
			}
		}
		return array($deletedFiles, $deletedFolders);
	}

	

	public function renameFile($fid, $name)
	{
		
		
		$farray = $this->getFileArray($fid);

		$fname = $farray["name"];
		$pid = $farray["project"];
		$path = $fpath = getFolderPath($this->db, $farray["folder"]);
		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
		$path = $prepath . "/" . $pid . "/" . $fpath . $fname;
		$pathNew = $prepath . "/$pid/" . $fpath . $name;
		$nameNew = $name;
		//die($pathNew);
		//alert("primary", "schon hier");

		if (!file_exists($path)) {
			dieWithMessage("Ein interner Fehler ist aufgetreten");
			die();
		} else {
			rename($path, $pathNew);
			$res = $this->db->query("UPDATE `files` SET `name` = '$nameNew' WHERE `files`.`id` = $fid");
			if ($res) {
				//alert("success", "Erfolgreich umbenannt!");
				
			} else {
				dieWithMessage("Ein Fehler ist aufgetreten");
				
			}
		}
		
	}

	public function renameFolder($fid, $name)
	{
		
		$farray = $this->getFolderArray($fid);

		$fname = $farray["name"];
		$path_parts = pathinfo($fname);
		$filename = $path_parts["filename"];
		$pid = $farray["project"];
		$path = getFolderPath($this->db, $farray["folder"]);
		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
		$pathOld = $prepath . "/$pid/$path$fname";
		$pathNew = $prepath . "/$pid/$path$name";
		$nameNew = $name;
		//die($pathNew);


		if (!file_exists($pathOld)) {
			dieWithMessage("Ein interner Fehler ist aufgetreten: bei renameFolder existeiert der Orginalpfad nicht");
			die();
		} else {
			rename($pathOld, $pathNew);
			$res = $this->db->query("UPDATE `folders` SET `name` = '$nameNew' WHERE `folders`.`id` = $fid");
			if ($res) {
				//alert("success", "Erfolgreich umbenannt!");
				
			} else {
				dieWithMessage("Ein Fehler ist aufgetreten");
				
			}
		}
		
	}


	public function moveFile($fid, $target)
	{
		if ($this->mode == "ftp") {
			dieWithMessage("Das funktioniert im FTP Modus mommentan nicht!");
			die();
		} else if ($this->mode == "direct") {
			$farray = $this->getFileArray($fid);
			$fnewarray = $this->getFolderArray($target);

			$fname = $farray["name"];
			$pid = $farray["project"];
			$fpath = getFolderPath($this->db, $farray["folder"]);
			$fnewpath = getFolderPath($this->db, $target);
			$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$path = $prepath . "/$pid/" . $fpath . $fname;
			$pathNew = $prepath . "/$pid/" . $fnewpath . $fname;

			//die($pathNew);
			//alert("primary", "schon hier");

			if (!file_exists($path)) {
				dieWithMessage("Ein interner Fehler ist aufgetreten");
				die();
			} else {
				rename($path, $pathNew);
				$res = $this->db->query("UPDATE `files` SET `folder` = '$target' WHERE `files`.`id` = $fid");
				if ($res) {
					//alert("success", "Erfolgreich umbenannt!");
					$this->reloadThere("files", $fid, "file");
					die();
				} else {
					dieWithMessage("Ein Fehler ist aufgetreten");
					die();
				}
			}
		}
	}

	public function moveFolder($fid, $target)
	{
		if ($this->mode == "ftp") {
			dieWithMessage("Das funktioniert im FTP Modus mommentan nicht!");
			die();
		} else if ($this->mode == "direct") {
			$farray = $this->getFolderArray($fid);
			$fnewarray = $this->getFolderArray($target);

			$fname = $farray["name"];
			$pid = $farray["project"];
			$fpath = getFolderPath($this->db, $farray["folder"]);
			$fnewpath = getFolderPath($this->db, $target);
			$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$path = $prepath . "/$pid/" . $fpath . $fname;
			$pathNew = $prepath . "/$pid/" . $fnewpath . $fname;

			//die($pathNew);
			//alert("primary", "schon hier");

			if (!file_exists($path)) {
				dieWithMessage("Ein interner Fehler ist aufgetreten");
				die();
			} else {
				rename($path, $pathNew);
				$res = $this->db->query("UPDATE `folders` SET `folder` = '$target' WHERE `folders`.`id` = $fid");
				if ($res) {
					//alert("success", "Erfolgreich umbenannt!");
					$this->reloadThere("files", $fid, "folder");
					die();
				} else {
					dieWithMessage("Ein Fehler ist aufgetreten");
					die();
				}
			}
		}
	}

	public function copyFile($fid, $target)
	{
		if ($this->mode == "ftp") {
			dieWithMessage("Das funktioniert im FTP Modus mommentan nicht!");
			die();
		} else if ($this->mode == "direct") {
			$farray = $this->getFileArray($fid);
			$fnewarray = $this->getFolderArray($target);

			$fname = $farray["name"];
			$pid = $farray["project"];
			$fpath = getFolderPath($this->db, $farray["folder"]);
			$fnewpath = getFolderPath($this->db, $target);
			$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$path = $prepath . "/$pid/" . $fpath . $fname;
			$pathNew = $prepath . "/$pid/" . $fnewpath . $fname;

			//die($pathNew);
			//alert("primary", "schon hier");

			if (!file_exists($path)) {
				dieWithMessage("Ein interner Fehler ist aufgetreten");
				die();
			} else {
				copy($path, $pathNew);
				$res = $this->db->query("INSERT INTO `files` (`project`, `name`, `folder`, `tags`) VALUES ('$pid', '$fname', '$target', '')");
				if ($res) {
					//alert("success", "Erfolgreich umbenannt!");
					$this->reloadThere("files", $fid, "file");
					die();
				} else {
					dieWithMessage("Ein Fehler ist aufgetreten");
					die();
				}
			}
		}
	}

	public function copyFolder($fid, $target)
	{
		if ($this->mode == "ftp") {
			dieWithMessage("Das funktioniert im FTP Modus mommentan nicht!");
			die();
		} else if ($this->mode == "direct") {
			$farray = $this->getFolderArray($fid);
			$fnewarray = $this->getFolderArray($target);

			$fname = $farray["name"];
			$pid = $farray["project"];
			$fpath = getFolderPath($this->db, $farray["folder"]);
			$fnewpath = getFolderPath($this->db, $target);
			$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$path = $prepath . "/$pid/" . $fpath . $fname;
			$pathNew = $prepath . "/$pid/" . $fnewpath . $fname;

			//die($pathNew);
			//alert("primary", "schon hier");

			if (!file_exists($path)) {
				dieWithMessage("Ein interner Fehler ist aufgetreten");
				die();
			} else {
				$this->recurse_copy($path, $pathNew);
				$res = $this->db->query("INSERT INTO `folders` (`project`, `name`, `folder`, `tags`) VALUES ('$pid', '$fname', '$target', '')");
				if ($res) {
					//alert("success", "Erfolgreich umbenannt!");
					$this->scan($pid);
					reloadModule("files", "projectid=$pid");

					die();
				} else {
					dieWithMessage("Ein Fehler ist aufgetreten");
					die();
				}
			}
		}
	}



	private function recurse_copy($src, $dst)
	{
		$dir = opendir($src);
		@mkdir($dst);
		while (false !== ($file = readdir($dir))) {
			if (($file != '.') && ($file != '..')) {
				if (is_dir($src . '/' . $file)) {
					$this->recurse_copy($src . '/' . $file, $dst . '/' . $file);
				} else {
					copy($src . '/' . $file, $dst . '/' . $file);
				}
			}
		}
		closedir($dir);
	}

	public function getFilePid($fid)
	{
		return $this->getFileArray($fid)["project"];
	}

	public function getFolderPid($fid)
	{
		return $this->getFolderArray($fid)["project"];
	}

	


	public function getCompleteFolderPath($fid, $noUserIdTest=false)
	{
		$farray = $this->getFolderArray($fid);
		$fname = $farray["name"];
		$pid = $farray["project"];
		$fpath = getFolderPath($this->db, $farray["folder"]);
		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH", $noUserIdTest);
		$path = $prepath . "/" . $pid . "/" . $fpath . $fname;
		return $path;
	}

	public function getCompleteFilePath($fid, $noUserIdTest=false)
	{
		$farray = $this->getFileArray($fid);
		$fname = $farray["name"];
		$pid = $farray["project"];
		$fpath = getFolderPath($this->db, $farray["folder"]);
		$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH", $noUserIdTest);

		//echo $file_parts['extension'];
		$displayPath = URLPREPATH . substr($prepath, 3) . "/" . $pid . "/" . $fpath . $fname;
		return $displayPath;
	}

	public function listDir($pid, $folder, $firstrun = true)
	{


		$folders = array();


		$res = $this->db->query("SELECT * FROM folders WHERE project=$pid AND folder=$folder");
		if ($res) {
			$res = $res->fetch_all(MYSQLI_ASSOC);
			if ($res) {
				foreach ($res as $folder) {
					$tmp = [];
					$tmp["id"] = $folder["id"];
					$tmp["name"] = $folder["name"];
					$folders[] = $tmp;
					//echo "<pre>";
					//var_dump($folders);
					//echo "</pre>";
				}

				// Once we build the folder array, get a new number, create a clickable link for the folder, 
				// and then construct a div tag which will contain the next list of folders/files.
				// The link will trigger our javascript above to toggle the div's display on and off.
				if ($firstrun) {
					$projectname = getProjectName($this->db, $pid);
					echo "<a class='clickableExpand' href=\"javascript:void(0)\" data-fid='-1' data-num='$this->listDirCount'>" . $projectname . "</a><br/>\n";
					echo '<div id="folderLink' . $this->listDirCount . '" style="margin-left: 15px; margin-right: 10px; display: none;">';
				}

				for ($i = 0; $i < count($folders); $i++) {
					$this->listDirCount++;

					// Here is the folder name, so you can add icons and such to this line
					echo "<a class='clickableExpand' href=\"javascript:void(0)\" data-fid='" . $folders[$i]["id"] . "' data-num='$this->listDirCount'>" . $folders[$i]["name"] . "</a><br/>\n";

					echo '<div id="folderLink' . $this->listDirCount . '" style="margin-left: 15px; margin-right: 10px; display: none;">';
					$this->listDir($pid, $folders[$i]["id"], false);
					echo '</div>';
				}
				if ($firstrun) {
					echo '</div>';
				}
			}
		}
	}

	public function createTemplate($file, $name, $description, $type)
	{
		if ($this->mode == "ftp") {
			$db = connect();
			$ftp_conn = getFTP($db);
			$file = $_FILES["file"]["tmp_name"];
			$path = getSetting($db, "SETTING_FILES_FTP_PATH");
			$name = $file['name'];
			$path = $path . "/templates/$name";




			// upload file
			if (!ftp_put($ftp_conn, $path, $file, FTP_BINARY)) {
				die("Fehler beim hochladen!");
			}

			// close connection
			ftp_close($ftp_conn);

			$name = $db->real_escape_string($name);
			$description = $db->real_escape_string($description);
			$filename = $db->real_escape_string($file["name"]);
			$type = $db->real_escape_string($type);


			$result = $this->db->query("INSERT INTO `templates` (`id`, `filename`, `name`, `description`, `group`) VALUES (NULL, '$filename', '$name', '$description', '$type');");
			if ($result) {
				reloadModule("templates");
				die();
			} else {
				dieWithMessage("Fehler: " . $this->db->error);
				die();
			}
		} else if ($this->mode == "direct") {

			//$file = $file["tmp_name"];
			$templateName = $name;
			$path = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$name = $file['name'];
			$path = $path . "/templates/$name";

			if (!move_uploaded_file($file["tmp_name"], $path)) {
				die("Fehler beim hochladen!");
			}

			$name = $this->db->real_escape_string($name);
			$description = $this->db->real_escape_string($description);
			$filename = $this->db->real_escape_string($file["name"]);
			$type = $this->db->real_escape_string($type);


			$result = $this->db->query("INSERT INTO `templates` (`id`, `filename`, `name`, `description`, `group`) VALUES (NULL, '$filename', '$templateName', '$description', '$type');");
			if ($result) {
				reloadModule("templates");
				die();
			} else {
				dieWithMessage("Fehler: " . $db->error);
				die();
			}
		}
	}

	public function showTemplate($tid)
	{
		if ($this->mode == "ftp") {
			$db = connect();
			$res = $db->query("SELECT * FROM templates WHERE id=$tid");
			if (!$res) {
				die("Vorlage nicht gefunden!");
			}
			$res = $res->fetch_all(MYSQLI_ASSOC);
			if (!$res) {
				die("Vorlage nicht gefunden!");
			}
			$res = $res[0];

			$filename = $res["filename"];
			$server = getSetting($db, "SETTING_FILES_FTP_SERVER");
			$user = getSetting($db, "SETTING_FILES_FTP_USER");
			$password = getSetting($db, "SETTING_FILES_FTP_PASSWORD");
			$port = getSetting($db, "SETTING_FILES_FTP_PORT");
			$path = getSetting($db, "SETTING_FILES_FTP_PATH");
			$file_path = "ftp://$user:$password@$server:$port/$path/templates/$filename";
			//$file_name = "test.jpg";
			//$file_ext = "jpg";


			// make sure the file exists

			if (is_file($file_path)) {
				$file_size  = filesize($file_path);
				$file_name = pathinfo($file_path, PATHINFO_FILENAME);
				$file = @fopen($file_path, "rb");

				if ($file) {
						// set the headers, prevent caching
						header("Pragma: public");
						header("Expires: -1");
						header("Cache-Control: public, must-revalidate, post-check=0, pre-check=0");
						header("Content-Disposition: attachment; filename=\"$file_name\"");

						// set appropriate headers for attachment or streamed file
						if (isset($download)) {
							header("Content-Disposition: attachment; filename=\"$file_name\"");
						} else {
							header('Content-Disposition: inline;');
							header('Content-Transfer-Encoding: binary');
						}

						// set the mime type based on extension, add yours if needed.
						$ctype_default = "application/octet-stream";

						$ctype = getMime($file_name);
						header("Content-Type: " . $ctype);
						set_time_limit(0);
						header("Content-Length: $file_size");
						ob_clean();
						while (!feof($file)) {
							print(@fread($file, 1024 * 8));
							ob_flush();
							flush();
							if (connection_status() != 0) {
									@fclose($file);
									exit;
								}
						}

						// file save was a success
						@fclose($file);
						exit;
					} else {
					// file couldn't be opened
					header("HTTP/1.0 500 Internal Server Error");
					echo "error 500";
					exit;
				}
			} else {
				// file does not exist
				header("HTTP/1.0 404 Not Found");
				echo "error 404";
				exit;
			}
		} else if ($this->mode == "direct") {
			$res = $this->db->query("SELECT * FROM templates WHERE id=$tid");
			if (!$res) {
				die("Vorlage nicht gefunden!");
			}
			$res = $res->fetch_all(MYSQLI_ASSOC);
			if (!$res) {
				die("Vorlage nicht gefunden!");
			}
			$res = $res[0];

			$filename = $res["filename"];
			$path = PREPATH;//getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$file_path = "$path/templates/$filename";


			if (is_file($file_path)) {
				$file_size  = filesize($file_path);
				$file_name = pathinfo($file_path, PATHINFO_FILENAME);
				$file = @fopen($file_path, "rb");

				if ($file) {
						// set the headers, prevent caching
						header("Pragma: public");
						header("Expires: -1");
						header("Cache-Control: public, must-revalidate, post-check=0, pre-check=0");
						header("Content-Disposition: attachment; filename=\"$file_name\"");
						$download = false;
						// set appropriate headers for attachment or streamed file
						if ($download) {
							header("Content-Disposition: attachment; filename=\"$file_name\"");
						} else {
							header('Content-Disposition: inline;');
							header('Content-Transfer-Encoding: binary');
						}

						// set the mime type based on extension, add yours if needed.
						$ctype_default = "application/octet-stream";

						$ctype = getMime($file_name);
						header("Content-Type: " . $ctype);
						set_time_limit(0);
						header("Content-Length: $file_size");
						ob_clean();
						while (!feof($file)) {
							print(@fread($file, 1024 * 8));
							ob_flush();
							flush();
							if (connection_status() != 0) {
									@fclose($file);
									exit;
								}
						}

						// file save was a success
						@fclose($file);
						exit;
					} else {
					// file couldn't be opened
					header("HTTP/1.0 500 Internal Server Error");
					echo "error 500";
					exit;
				}
			} else {
				// file does not exist
				header("HTTP/1.0 404 Not Found");
				echo "error 404";
				exit;
			}
		}
	}

	public function deleteTemplate($tid)
	{
		$id = $this->db->real_escape_string(trim($tid));

		$name = $this->db->query("SELECT filename FROM templates WHERE id=$id")->fetch_all(MYSQLI_ASSOC)[0]["filename"];
		if ($this->mode == "ftp") {
			$db = connect();
			$ftp_conn = getFTP($db);
			$path = getSetting($db, "SETTING_FILES_FTP_PATH");
			$path = $path . "/templates/$name";




			// upload file
			if (!ftp_delete($ftp_conn, $path)) {
				die("Fehler beim löschen!");
			}

			// close connection
			ftp_close($ftp_conn);

			$result = $db->query("DELETE FROM `templates` WHERE `id` = $id");
			if ($result) {
				reloadModule("templates");
				die();
			} else {
				dieWithMessage("Unbekannter Fehler");
				die();
			}
		} else if ($this->mode == "direct") {

			$path = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			$path = $path . "/templates/$name";

			if (!unlink($path)) {
				die("Fehler beim löschen!");
			}

			$result = $this->db->query("DELETE FROM `templates` WHERE `id` = $id");
			if ($result) {
				reloadModule("templates");
				die();
			} else {
				dieWithMessage("Unbekannter Fehler");
				die();
			}
		}
	}

	public function generateProjectDirs($pid)
	{
		if ($this->mode == "ftp") {
			$dir1 = getSetting($this->db, "SETTING_FILES_FTP_PATH") . "/" . $pid;

			$ftp = getFTP($this->db);
			@ftp_mkdir($ftp, $dir1);
			@ftp_mkdir($ftp, $dir2);




			
		} else if ($this->mode == "direct") {
			$prepath = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
			//echo $prepath;
			$dir1 = $prepath . "/" . $pid;


			if (!mkdir($dir1, 0777)) {
				dieWithMessage("Fehler beim Verzeichnis eretellen: ");
			}
			//echo "erstellt";
		}
	}

	public function editFolderTag($fid, $tid)
	{
		$tags = explode("-", $this->getFolderArray($fid)["tags"]);
		if (in_array($tid, $tags)) {
			$newTags = [];
			foreach ($tags as $tag) {
				if ($tag != $tid) {
					$newTags[] = $tag;
				}
			}
			$tags = implode("-", $newTags);
		} else {
			$tags[] = $tid;
			$tags = implode("-", $tags);
		}
		$res = $this->db->query("UPDATE `folders` SET `tags` = '$tags' WHERE `id` = $fid");
		if ($res) {
			die(json_encode(array("status" => true)));
		} else {
			dieWithMessage("Fehler: " . $this->db->error);
		}
	}

	public function editFileTag($fid, $tid)
	{
		$tags = explode("-", $this->getFileArray($fid)["tags"]);
		if (in_array($tid, $tags)) {
			$newTags = [];
			foreach ($tags as $tag) {
				if ($tag != $tid) {
					$newTags[] = $tag;
				}
			}
			$tags = implode("-", $newTags);
		} else {
			$tags[] = $tid;
			$tags = implode("-", $tags);
		}
		$res = $this->db->query("UPDATE `files` SET `tags` = '$tags' WHERE `id` = $fid");
		if ($res) {
			die(json_encode(array("status" => true)));
		} else {
			dieWithMessage("Fehler: " . $this->db->error);
		}
	}

	public function getDataSize()
	{
		$path = getSetting($this->db, "SETTING_FILES_DIRECT_PATH");
		return getDirectorySize($path);
	}
}


 
?>