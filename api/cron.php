<?php

require_once("db.inc.php");
require_once("library.php");

// Calendar Event Notification

$spaces = [
    "1 MONTH", "7 DAY", "4 DAY", "2 DAY", "1 DAY", "0 DAY"
];


$db = connect();
$where = "WHERE ";
$first = true;
foreach ($spaces as $space) {
    if (!$first) {
        $where .= " AND ";
    } else {
        $first = false;
    }
    $where .= " DATEDIFF(startDate, DATE_ADD(CURDATE(), INTERVAL $space)) = 0";

}
$events = $db->query("SELECT *, TIMESTAMPDIFF(SECOND,CURRENT_TIMESTAMP(),`startDate`) AS timeleft FROM dates "); //$where

if ($events) {
    $events = $events->fetch_all(MYSQLI_ASSOC);
    if ($events) {
        foreach ($events as $event) {
            $tokens = [];
            foreach (array_keys(getUserIdArray($db)) as $userid) {
                $tokens[] = getPushTokenFromUserId($userid);
            }
            $diff = $event["timeleft"] - 60;
            $months = floor($diff / 60 / 60 / 24 / 30);
            $diff = $diff - ($months * 60 * 60 * 24 * 30);
            $days = floor(($diff) / 60 / 60 / 24);
            if ($months < 0) {
                
                if ($days == 2) {
                    $countdown = "übermorgen";
                } else if ($days == 1) {
                    $when = "morgen";
                } else if ($days == 0) {
                    $when = "heute";
                } else {
                    $when = "in $days Tagen";
                }
                
            } else {
                if ($months == 1) {
                    $when = "in einem Monat";
                } else {
                    $when = "in $months Monaten";
                }
                
            }
            $payload = [
                "action" => "calendarEvent"
            ];
            sendPushMessage("Erinnerung: ".$event["headline"], $when, $payload, $tokens);
            echo "PushMessage send to ".print_r($tokens, true);
            var_dump("Erinnerung: ".$event["headline"], $when, $payload, $tokens);
        }
    }
}

?>