<?

if ($handle = opendir('/')) {

    /* This is the correct way to loop over the directory. */
    while (false !== ($entry = readdir($handle))) {
        echo "$entry\n";
    }


    closedir($handle);
}

?>