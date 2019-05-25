<?php

require_once("./library.php");
require_once("./db.inc.php");

if (isset($_GET["fid"])) {
    $db = connect();
    $fid = $db->real_escape_string($_GET["fid"]);
    $res = $db->QUERY("SELECT members FROM projects JOIN files ON files.project = projects.id WHERE files.id = $fid");
    if ($res) {
        $res = $res->fetch_all(MYSQLI_ASSOC);
        if ($res && isset($res[0]) && isset($res[0]["members"])) {
            $members = explode("-", $res[0]["members"]);
            if (in_array(getCurrentUserId(), $members)) {
                $fc = new FileController($db);
                $path = $fc->getLocalFilePath($fid);



                $file_size  = filesize($path);
                $file_name = pathinfo($path, PATHINFO_FILENAME);
                $file = @fopen($path,"rb");

                //echo $path;
                //echo "<br>";

                //$finfo = finfo_open(FILEINFO_MIME_TYPE); // return mime type ala mimetype extension   
                //echo finfo_file($finfo, $path) . "<br>";
                //finfo_close($finfo);

                $mime = getMime($path);
                header('Content-type: ' . $mime);
                header('Content-Disposition: inline; filename="' . basename($path) . '"');
                //header('Content-length: '.filesize($path));
                
                
                if(isset($_SERVER['HTTP_RANGE'])){
                    list($size_unit, $range_orig) = explode('=', $_SERVER['HTTP_RANGE'], 2);
                    if ($size_unit == 'bytes')
                    {
                        //multiple ranges could be specified at the same time, but for simplicity only serve the first range
                        //http://tools.ietf.org/id/draft-ietf-http-range-retrieval-00.txt
                        list($range, $extra_ranges) = explode(',', $range_orig, 2);
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

                //figure out download piece from range (if set)
                list($seek_start, $seek_end) = explode('-', $range, 2);

                //set start and end based on range (if set), else set defaults
                //also check for invalid ranges.
                $seek_end   = (empty($seek_end)) ? ($file_size - 1) : min(abs(intval($seek_end)),($file_size - 1));
                $seek_start = (empty($seek_start) || $seek_end < abs(intval($seek_start))) ? 0 : max(abs(intval($seek_start)),0);
            
                //Only send partial content header if downloading a piece of the file (IE workaround)
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
                while(!feof($file))  {
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
}
die("Verweigert");
