<?php

function connect() {
	$db = new mysqli("localhost", "agmtools", "", "agmtools");
	$db->query("Set names 'utf8'");
	$db->set_charset('utf8mb4');
	return $db;
}

?>