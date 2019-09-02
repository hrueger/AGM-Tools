<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<meta http-equiv="CACHE-CONTROL" content="NO-CACHE">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
		<link rel="stylesheet" href="share.css">
		
		<title>AGM-Tools</title>
  </head>

  <body>

    <div class="site-wrapper">

      <div class="site-wrapper-inner">

        <div class="cover-container">

          <div class="masthead clearfix">
            <div class="inner">
              <img class="logo" src="./logo3.png" alt="Multimedia AG">
              <nav>
                <ul class="nav masthead-nav">
                  <li class="active"><a href="#">Freigabe</a></li>
                </ul>
              </nav>
            </div>
          </div>

          <div class="inner cover">
		  <?php
			require_once("../library.php");
			require_once("../db.inc.php");
			if (!isset($_GET["l"])) {
				header("Location: ../index.php");
			}
			$link = $_GET["l"];
			$db = connect();
			$l = $db->real_escape_string($link);
			$file = $db->query("SELECT * FROM shares WHERE link='$l'");
			if (!$file) {
				echo "<h1 class='cover-heading'>Fehler</h1><p class='lead'>Der Link wurde nicht gefunden. Wahrscheinlich war er veraltet.</p>";
			} else {
			    $file = $file->fetch_all(MYSQLI_ASSOC);
				//var_dump($file);
				if (empty($file)) {
					echo "<h1 class='cover-heading'>Fehler</h1><p class='lead'>Die Datei wurde nicht gefunden. Wahrscheinlich sind Sie einem veralteten Link gefolgt.</p>";
				} else {
					$file = $file[0];
					$fid = $db->real_escape_string($file["targetID"]);
					if ($file["type"] == "folder") {
						$f = $db->query("SELECT * FROM folders WHERE id='$fid'");
						$type = "folder";
						$was = "Dieser Ordner";
					} else if ($file["type"] == "file"){
						$f = $db->query("SELECT * FROM files WHERE id='$fid'");
						$was = "Diese Datei";
						$type = "file";
					} else {
						alert("danger", "Unbekannter Typ!");
						die();
					}
					if (!$f) {
						echo "<h1 class='cover-heading'>Fehler</h1><p class='lead'>Die Datei wurde nicht gefunden. Wahrscheinlich sind Sie einem veralteten Link gefolgt.</p>";
					} else {
						
						$f = $f->fetch_all(MYSQLI_ASSOC)[0];
						$fid = $f["id"];
						$filename = $f["name"];

						$folderpath = getFolderPath($db, $f["folder"]);
						$pid = $f["project"];
						$prepath = getSetting($db, "SETTING_FILES_DIRECT_PATH", true);
						$filepath = "$prepath/$pid/$folderpath$filename";
						if ($type == "file") {
							$size = filesize($filepath);
							$downloadLink = "../?get=$fid&download&type=file&shareLink=$link";
						} else {
							$size = getDirectorySize($filepath);
							$downloadLink = "../?get=$fid&download&type=folder&shareLink=$link";
						}

						if ($size == -1) {
							echo "Unbekannte Größe";
						} else {
							$size = "Größe: ".convertSize($size);
						}


						echo "<h1 class='cover-heading'>$filename</h1><small>$size</small>
							<p class='lead'>$was wurde für Sie freigegeben. Laden Sie sie jetzt einfach herunter.</p>

							<p class='lead'>
								<a id='dlBtn' href='$downloadLink' target='_blank' class='btn btn-lg btn-primary'>Herunterladen</a>
							</p>
							<div id='downloader'>
							<div class='progress'>
								<div class='progress-bar progress-bar-striped active' role='progressbar' id='bar' style='width: 100%'>
								<span id='text'>100%</span>
								</div>
							</div></div>";
					
						
					}
							 
					  
				}
					  
			}
		  
		  ?>
           
			
			
          </div>

		  
		  
		  
          <div class="mastfoot">
            <div class="inner">
              <p>Copyright &copy; <?php echo date("Y"); ?><br>Hannes Rüger<br>Multimedia AG</p>
            </div>
          </div>

        </div>

      </div>

    </div>

	

  </body>
</html>
