<?php
define("REPO_DIRECTORY", "/agmtoolsdata/storage/");
define("REPO_SUFFIX", "/.git/");
define("CACHE", "/tmp");
define("GIT_BINARY", "git");

class Git {

    static $repos;

    public static function loadRepositories() {
        $repoDir = REPO_DIRECTORY;
        if (!file_exists($repoDir)) return array();
        if (!is_dir($repoDir)) return array();

        $repos = array();
        $valid = array();

        if ($handle = opendir($repoDir)) {
            while (false !== ($file = readdir($handle))) {
                
                $fullpath = $repoDir . $file;
               
                if ($file[0] != '.' && is_dir($fullpath)) {
                    $repoSuffix = REPO_SUFFIX;
                    if (is_dir($fullpath . $repoSuffix)) {
                        $headFile = "HEAD";
                        if (substr($repoSuffix, -1) != "/") {
                            $headFile = "/{$headFile}";
                            
                        }
                        
                        if (file_exists($fullpath . $repoSuffix . $headFile) && self::getOwner($fullpath, $repoSuffix) != NULL) { 
                            $valid[] = trim($file);
                            $repos[] = trim("{$fullpath}/");
                        }
                    }
                }
            }
            closedir($handle);
        }
        self::$repos = array_combine($valid, $repos);
        sort($repos);

        return array($repos, $valid);
    }

    public static function getOwner($path, $repoSuffix) {
        
        $out = array();
        $gitBinary = GIT_BINARY;
        $cmd = "GIT_DIR=" . escapeshellarg($path . $repoSuffix) . " {$gitBinary} rev-list  --header --max-count=1 HEAD 2>&1 | grep -a committer | cut -d' ' -f2-3";
        $own = exec($cmd, $out);
        return $own;
    }

    function parse($proj, $what) {
        $gitBinary = GIT_BINARY;

        $cmd1 = "GIT_DIR=" . self::$repos[$proj] . REPO_SUFFIX . " {$gitBinary} rev-parse  --symbolic --" . escapeshellarg($what) . "  2>&1";
        $out1 = array();
        $bran = array();
        exec($cmd1, $out1);
        for($i = 0; $i < count($out1); $i++) {
            $cmd2="GIT_DIR=" . self::$repos[$proj] . REPO_SUFFIX . " {$gitBinary} rev-list --max-count=1 " . escapeshellarg($out1[$i]) . " 2>&1";
            $out2 = array();
            exec($cmd2, $out2);
            $bran[$out1[$i]] = $out2[0];
        }
        return $bran;
    }

    public static function stats($repo, $inc = false, $fbasename = 'counters') {
        $rtoday = 0;
        $rtotal = 0;
        $now = floor(time()/24/60/60); // number of days since 1970

        if (!is_dir(CACHE)) {
            mkdir(CACHE);
            chmod(CACHE, 0777);
        }

        $fname = CACHE . basename($repo);

        if (!is_dir($fname)) {
            mkdir($fname);
            chmod($fname, 0777);
        }

        $fname = CACHE . basename($repo) . "/" . $fbasename . "-" . basename($repo, ".git");
        $fd = 0;

        //$fp1 = sem_get(fileinode($fname), 1);
        //sem_acquire($fp1);

        if (file_exists($fname)) {
            $file = fopen($fname, "r+"); // open the counter file
        } else {
            $file = FALSE;
        }
        if ($file != FALSE) {
            fseek($file, 0); // rewind the file to beginning
            // read out the counter value
            fscanf($file, "%d %d %d", $fd, $rtoday, $rtotal);
            if($fd != $now) {
                $rtoday = 0;
                $fd = $now;
            }
            if ($inc) {
                $rtoday++;
                $rtotal++;
            }
            fclose($file);
        }
        // uncomment the next lines to erase the counters
        //$rtoday = 0;
        //$rtotal = 0;
        $file = fopen($fname, "w+"); // open or create the counter file
        // write the counter value
        fseek($file, 0); // rewind the file to beginning
        fwrite($file, "$fd $rtoday $rtotal\n");
        fclose($file);
        chmod($fname, 0666);
        return array('today' => $rtoday, 'total' => $rtotal);
    }

    public static function repoPath($proj) {
        foreach (self::$repos as $repo) {
            $path = basename($repo);
            if ($path == $proj) {
                return $repo;
            }
        }
        return false;
    }

    public static function shortlogs($proj) {
        return self::getLastNCommits($proj);
    }

    public static function commit($proj, $commit) {
        $options = array(
            'since' => $commit,
            'count' => 1
        );
        return self::getLastNCommits($proj, $options);
    }

    public static function blob($proj, $path) {
        if (is_file(self::$repos[$proj] . "/"  . $path)) {
            $File = new File(self::$repos[$proj] . "/" .$path);
            return array(
                'content' => $File->read(),
                'ext' => $File->ext()
            );
        }
        return null;
    }

    public static function lsTree($proj, $tree) {
        $gitBinary = GIT_BINARY;

        $lsTreePath = ($tree != '') ? "HEAD:{$tree}" : 'HEAD';

        $out = array();
        //Have to strip the \t between hash and file
        $cmd = sprintf("GIT_DIR=%s%s %s ls-tree %s 2>&1 | sed -e 's/\t/ /g'",
            self::$repos[$proj],
            REPO_SUFFIX,
            $gitBinary,
            ($tree != '') ? "HEAD:{$tree}" : 'HEAD'
        );
        exec($cmd, $out);

        $results = array();
        foreach ($out as $line) {
            $result = array_combine(
                array('perm', 'type', 'hash', 'file'),
                explode(" ", $line, 4)
            );
            if (empty($tree)) {
                $path = $result['file'];
            } elseif (substr($tree, -1) == "/") {
                $path = $tree . $result['file'];
            } else {
                $path = $tree . "/" . $result['file'];
            }
            $cmd = sprintf("GIT_DIR=%s%s %s log --pretty=format:%%H%%x00%%an%%x00%%ai%%x00%%s -1 -- %s",
                self::$repos[$proj],
                REPO_SUFFIX,
                $gitBinary,
                $path
            );
            exec($cmd, $info);
            if (empty($info)) {
                $results[] = $result;
                continue;
            }

            list($revision, $author, $date, $message) = explode(chr(0), $info[0]);
            $results[] = array_merge($result, compact('revision', 'author', 'date', 'message'));
            unset($info);
        }
        return $results;
    }

    public static function diff($proj, $commit) {
        $gitBinary = GIT_BINARY;

        $out = array();
        $cmd = "GIT_DIR=" . self::$repos[$proj] . REPO_SUFFIX . " {$gitBinary} show {$commit} --format=\"%b\" 2>&1";
        exec($cmd, $out);

        $diff = false;
        $summary = array();
        $file = array();
        $results = array();
        foreach ($out as $line) {
            if (empty($line)) continue;
            if ($diff) {
                if (substr($line, 0, 4) === 'diff') {
                    $results[] = array(
                        'file' => implode("\n", $file),
                        'summary' => implode("\n", $summary),
                    );
                    $file       = array();
                    $summary    = array();
                    $summary[]  = $line;
                    $diff       = false;
                } else {
                    $file[]     = $line;
                }
            } else {
                if (substr($line, 0, 3) === '@@ ') {
                    $diff       = true;
                    $file[]     = $line;
                } else {
                    $summary[]  = $line;
                }
            }
        }
        $results[] = array(
            'file' => implode("\n", $file),
            'summary' => implode("\n", $summary),
        );
        return $results;
    }

    public static function getLastNCommits($proj, $options = array()) {
        $gitBinary = GIT_BINARY;
        $options = array_merge(array(
            'since' => 'HEAD',
            'until' => 'HEAD',
            'count' => 10,
            'dry'   => false,
            'params' => array()
        ), $options);

        if ($options['count'] == 1) {
            $query = $options['since'];
        } else {
            $query = implode('..', array($options['since'], $options['until']));
            if (in_array($query, array('..', 'HEAD..HEAD'))) $query = '--all';
        }

        // --full-history --topo-order --skip=0

        $params     = array();
        $params[]   = "max-count={$options['count']}";
        foreach ($options['params'] as $param) {
            $params[]= $param;
        }
        $params     = implode(' --', $params);
        if (!empty($params)) $params = "--{$params}";

        $format     = array();
        $format[]   = 'parents %P';
        $format[]   = 'tree %T';
        $format[]   = 'author %aN';
        $format[]   = 'email %aE';
        $format[]   = 'timestamp %at';
        $format[]   = 'subject %s';
        $format[]   = 'endrecord%n';
        $format     = implode('%n', $format);
        $cmd = "GIT_DIR=" . self::$repos[$proj] . REPO_SUFFIX . " {$gitBinary} rev-list {$query} {$params} --pretty=format:\"{$format}\"";
        if ($options['dry']) return $cmd;
        $out = array();
        exec($cmd, $out);

        $commit = array();
        $results = array();
        foreach ($out as $line) {
            $line = trim($line);
            if (empty($line)) {
                $results[] = array_merge(array(
                    'parents' => array()
                ), $commit);
                $commit = array();
                continue;
            }
            if ($line == 'endrecord') {
                // Commit exists, we can generate extra data here
                continue;
            }

            $descriptor = strstr($line, ' ', true);
            $info = trim(strstr($line, ' '));
            if ($descriptor == 'commit') {
                $commit['hash'] = $info;
            } else if ($descriptor == 'parents') {
                $commit['parents'] = explode(' ', $info);
            } else if ($descriptor == 'tree') {
                $commit['tree'] = $info;
            } else if ($descriptor == 'author') {
                $commit['author'] = $info;
            } else if ($descriptor == 'email') {
                $commit['email'] = $info;
            } else if ($descriptor == 'timestamp') {
                $commit['timestamp'] = $info;
            } else if ($descriptor == 'subject') {
                $commit['subject'] = $info;
            }
        }
        return $results;
    }

    // meine Funktionen //
    public static function initRepo($name) {
        
        $repoPath = REPO_DIRECTORY . $name . "";
        

        if (is_dir($repoPath)) {
            dieWithMessage("Fehler, ein Projekt dieses Namens existiert bereits!");
        }

        mkdir($repoPath, 0777, true);
        $gitBinary = GIT_BINARY;

        
        chdir($repoPath);
        $cmd = "$gitBinary init";
        $out = shell_exec($cmd.' 2>&1');
        $q = "Initialized empty Git repository";
        if (!substr($out[0], 0, strlen($q)) === $q) {
            dieWithMessage("Fehler beim Initialisieren des Git Repositories: ".$out);
        }

        chdir($repoPath);

        $out = "";
        $cmd = "git config receive.denyCurrentBranch updateInstead";
        $out = shell_exec($cmd.' 2>&1');

        $q = "error";
        if (substr($out, 0, strlen($q)) === $q) {
            dieWithMessage("Fehler beim Initialisieren des Git Repositories: ".$out);
        }
        echo $out;


        file_put_contents($repoPath."/info.txt", "Dies ist ein neues Projekt erstellt dur AGM-Tools.\n\nViel Spaß beim Verwenden!");
        file_put_contents($repoPath."/hier_eure_dateien.txt", "Hier könnt Ihr alle Eure Dateien und Ordner hinlegen. Sie werden automatisch synchronisiert!");
        file_put_contents($repoPath."/.gitignore", "# In diese Datei können alle Ordner und Dateien eingetragen werden, die nicht hochgeladen werden sollen.\n
        # Das geht aber auch automatisch über einen Rechtsklick im Windows Explorer.\n\n
        # Beispiel:\n
        # renders/\n
        # privat.txt\n\n
        # Viel Spaß!");
        self::setUser($name, "System", "system@agmtools.allgaeu-gymnasium.de");
        self::addUntracked($name);
        $ret = explode("\n", self::doCommit($name, "Neues Projekt"));
        self::loadRepositories();
        return $ret;

        
        
    }

    public static function addUntracked($repo) {
        chdir(REPO_DIRECTORY.$repo);
        $out = "";
        $cmd = "git add *";
        $out = shell_exec($cmd.' 2>&1');

        $q = "error";
        if (substr($out, 0, strlen($q)) === $q) {
            dieWithMessage("Fehler beim Hinzufügen den ungetrackten Dateien und Ordner: ".$out);
        }
        echo $out;
    }

    public static function doCommit($repo, $message) {
        chdir(REPO_DIRECTORY.$repo);
        $out = "";
        $cmd = "git commit -m '$message'";
        $out = shell_exec($cmd.' 2>&1');
        return $out;
    }

    public static function setUser($repo, $name, $mail) {
        chdir(REPO_DIRECTORY.$repo);
        $out = "";
        $cmd = "git config user.name '$name'";
        $out = shell_exec($cmd.' 2>&1');

        $q = "error";
        if (substr($out, 0, strlen($q)) === $q) {
            dieWithMessage("Fehler beim Setzen des Benutzers: ".$out);
        }
        $cmd = "git config user.email '$mail'";
        $out = shell_exec($cmd.' 2>&1');

        $q = "error";
        if (substr($out, 0, strlen($q)) === $q) {
            dieWithMessage("Fehler beim Setzen des Benutzers: ".$out);
        }
        echo $out;
    }

}
