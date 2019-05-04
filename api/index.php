<?php

require_once("db.inc.php");
require_once("library.php");

/*file_put_contents("log.txt", $_POST, FILE_APPEND);
file_put_contents("log.txt", "------------------------------\n", FILE_APPEND);
file_put_contents("log.txt", file_get_contents('php://input'), FILE_APPEND);
file_put_contents("log.txt", "------------------------------\n", FILE_APPEND);
file_put_contents("log.txt", $_GET, FILE_APPEND);
file_put_contents("log.txt", "------------------------------\n------------------------------\n------------------------------\n\n\n", FILE_APPEND);*/

$data = file_get_contents('php://input');
@$data = json_decode($data);
if ($data) {
    if (isset($data->action)) {
        switch ($data->action) {
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
                

                $ret[] = array("weekday" => $weekday, "date"=> $date, "starttime"=>$starttime, "countdown" => $countdown);
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

?>