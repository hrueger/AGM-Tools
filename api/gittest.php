<pre>
<?php

require_once("./git.inc.php");

echo "GIT::loadRepositories()\n\n";
$repos = Git::loadRepositories();
var_dump($repos);
echo "_____________________________________________________________________________________________\n\n\n";
echo "GIT::getLastNCommits()\n\n";
$commits = Git::getLastNCommits("choosealicense.com",  array('count' => 1));
var_dump($commits);
echo "_____________________________________________________________________________________________\n\n\n";
echo "GIT::lsTree()\n\n";
$commits = Git::lsTree("choosealicense.com", "_data");
var_dump($commits);
echo "_____________________________________________________________________________________________\n\n\n";
echo "GIT::diff()\n\n";
$commits = Git::diff("choosealicense.com", "eb65fab84763b2a7d4a67d2dd82cdd83563bb107");
var_dump($commits);
echo "_____________________________________________________________________________________________\n\n\n";
?>
</pre>