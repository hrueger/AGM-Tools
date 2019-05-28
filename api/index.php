<?php
use YoHang88\LetterAvatar\LetterAvatar;
require_once("db.inc.php");
require_once("library.php");
require_once("git.inc.php");

$locale='de_DE.UTF-8';
setlocale(LC_ALL,$locale);
putenv('LC_ALL='.$locale);

function log_to_file($log_msg) {
    $log_filename = "log.txt";
    
    
    file_put_contents($log_filename, $log_msg . "\n", FILE_APPEND);
}
/*
file_put_contents("log.txt", $_POST, FILE_APPEND);
file_put_contents("log.txt", "------------------------------\n", FILE_APPEND);
file_put_contents("log.txt", file_get_contents('php://input'), FILE_APPEND);
file_put_contents("log.txt", "------------------------------\n", FILE_APPEND);
file_put_contents("log.txt", $_GET, FILE_APPEND);
file_put_contents("log.txt", "------------------------------\n------------------------------\n------------------------------\n\n\n", FILE_APPEND);*/

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
            case "dashboardGetSpaceChartData":
                dashboardGetSpaceChartData();
                break;
            case "dashboardGetWhatsnew":
                dashboardGetWhatsnew();
                break;
            case "dashboardGetDates":
                dashboardGetDates();
                break;
            case "dashboardGetVersion":
                dashboardGetVersion();
                break;
            case "usersGetUsers":
                usersGetUsers();
                break;
            case "calendarGetDates":
                calendarGetDates();
                break;    
            case "projectsGetProjects":
                projectsGetProjects();
                break;
            case "projectsNewProject":
                projectsNewProject($args);
                break;
            case "notificationsGetNotifications":
                notificationsGetNotifications();
                break;
            case "chatGetContacts":
                chatGetContacts();
                break;
            case "chatGetMessages":
                chatGetMessages($args);
                break;  
             case "filesGetFolder":
                filesGetFolder($args);
                break;
             case "filesGetFiles":
                filesGetFolder($args);
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
            case "templatesGetTemplates":
                templatesGetTemplates();
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
        
        $res = $db->query("SELECT id, `username`, `password`  FROM users WHERE `username`='$username'");
        
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

function dieWithMessage($message) {
    http_response_code(400);
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
        } else {
            dieWithMessage("Es wurden keine Termine gefunden!".$db->error);
        }
    } else {
        dieWithMessage("Es wurden keine Termine gefunden!".$db->error);
    }
    dieWithMessage("Es wurden keine Termine gefunden!".$db->error);
}

function usersGetUsers() {
    $db = connect();
    $res = $db->query("SELECT users.id, users.username, users.email, usergroups.name as groupname FROM users JOIN usergroups ON users.usergroup = usergroups.id");
    $res = $res->fetch_all(MYSQLI_ASSOC);
    die(json_encode($res));
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

function chatGetContacts() {
    
    $db = connect();
    $ret = array();
    $result = array();
    $userid = $db->real_escape_string(getSession("userid"));
	//var_dump( $db->query("(SELECT id FROM receivers WHERE members=$userid)")->fetch_all());
	$res = $db->query("SELECT r.name, r.id as rid, r.members, r.type, messages.message, users.username as sendername, `timestamp` FROM receivers as r LEFT JOIN messages ON messages.id = (
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
	}


	$ret = [];
	$ret["action"] = "gotContacts";
	$ret["status"] = "true";
	$ret["message"] = "";
	//var_dump($clients);

    //log_to_file(print_r($res, true));
    require_once("./vendor/autoload.php");
   
	foreach ($res as $line) {
        $avatar = new LetterAvatar($line["name"], 'circle', 64);
		//echo "<br>Receivers.members: ".$line[ "members" ];
		//echo "<br>Messages.sender: ".$line[ "sender" ];

        $members = explode("-", $line["members"]);
		if ($line["type"] == "private") {

			if (!in_array($userid, $members)) {
				//echo "hi<br>";
				//$name = htmlentities(mb_convert_encoding($line["name"], 'UTF-8', 'ASCII'), ENT_SUBSTITUTE, "UTF-8"); //encoding auf UTF 8
				$name = $line["name"];

                $latestmessage = trim_text($line["message"], 40);
               
				$result[] = array(
                    "contact" => array(
                        /*"avatar" => 'https://randomuser.me/api/portraits/med/men/'.random_int(0, 100).'.jpg',*/
                          "avatar" => $avatar->__toString(),
                        "name" => htmlspecialchars($line["name"])
                    ),
                    "type" => "DIRECT",
                    "when" => $line["timestamp"],
                    "muted" => false,
                    "unread" => 0,
                    "text" => [htmlspecialchars($latestmessage)],
                    "rid" => $line["rid"]
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
				$result[] = array(
                    "contact" => array(
                        "avatar" => $avatar->__toString(),
                        "name" => htmlspecialchars($line["name"])
                    ),
                    "type" => "DIRECT",
                    "when" => $line["timestamp"],
                    "muted" => false,
                    "unread" => 0,
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
            
             $ret[] = array("system" => "true", "text" => $nowDay);
        }
        

		$alt = ($line["sender"] == $myID) ? true : false;
		//if ($previousSender != $line["sender"]) {
			$name = $contacts[intval($line["sender"])];
		//} else {
		//	$name = false;
		//}
		$message = $line["message"];
		$status = $line["status"];
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
					$status = 2;
				} else {
					$status = 1;
				}
			} else {
				$status = 0;
			}
			//echo $status;
		}

		$time = $line["timestamp"];
		
		$ret[] = array("fromMe" => $alt, "sendername" => $name, "text" => $message, "sent" => $status+1, "created" => $time);




		$counter = $line["id"];
		//$previousSender = $line["sender"];
		$lastDay = date('d.m.Y', strtotime($line["timestamp"]));
		$number++;


		/// make messages received, jetzt abver wirklich!

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
			$db->query("UPDATE `messages` SET `status` = '$status' WHERE `messages`.`id` = $mID;");
			//$existing = false;
			//foreach (explode("-", $receiverIdArray[$line["receiver"]]["members"]) as $member) {
			//	if ($member == $myID) $existing = true;
			//}
			//echo $existing ."\n";
			//echo "das war eine gruppe";
		} else {
			$mID = $db->real_escape_string($line["id"]);
			$db->query("UPDATE `messages` SET `status` = '2' WHERE `messages`.`id` = $mID;");
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

function filesGetFolder($data) {
    $db = connect();
	$fid = $db->real_escape_string($data["fid"]);
	$pid = $db->real_escape_string($data["pid"]);
    
    $res1 = $db->query("SELECT * FROM files WHERE folder='$fid' AND project='$pid'");
    
    $res1 = $res1->fetch_all(MYSQLI_ASSOC);
    $res2 = $db->query("SELECT * FROM folders WHERE folder='$fid' AND project='$pid'")->fetch_all(MYSQLI_ASSOC);
    
    $files = [];
    $folders = [];

    foreach ($res1 as $file) {
        $file["type"] = "file";
        $files[] = $file;
    }
    foreach ($res2 as $folder) {
        $folder["type"] = "folder";
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

function projectsNewProject($data) {
    $db = connect();
    $ret = Git::initRepo($data["name"]);

    $members_array = $data["members"];
    $members = implode("-", $members_array);
    
    $name = $db->real_escape_string($data["name"]);
    
    $description = $db->real_escape_string($data["description"]);
    
    

    $result = $db->query("INSERT INTO projects (name, description, members, type) VALUES ('$name', '$description', '$members', null)");
    $pid = $db->insert_id;
    echo $db->error;
    
    $result2 = $db->query("INSERT INTO `receivers` (`id`, `name`, `type`, `members`) VALUES (NULL, '$name', 'group', '$members')");
    echo $db->error;
    
    if($result and $result2  and $ret) {
        die(json_encode(array("status" => true, "commitMessage" => $ret)));
        
    } else {
        dieWithMessage("Fehler".$db->error);
    }
    die();
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
        
        if (isset($usernames[$line["creator"]])) {
            
            $bug["author"] = $usernames[$line["creator"]];
        } else {
            $bug["author"] = "Unbekannt";
        }
        $bugs[] = $bug;
    }
    die(json_encode($bugs));
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
?>