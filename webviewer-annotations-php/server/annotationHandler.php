<?php
// Create xfdf folder if it doesn't exist
if (!is_dir("xfdf")) {
  mkdir("xfdf");
}

$xfdf_file = "xfdf/".$_REQUEST['documentId'].".xfdf";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Handle POST request sent to '/server/annotationHandler.php'
  $xfdf_string = file_get_contents('php://input');
  // Write XFDF string into an XFDF file
  if (file_put_contents($xfdf_file, $xfdf_string)) {
    header("HTTP/1.1 200 OK");
  } else {
    header("HTTP/1.1 500 Internal Server Error");
  }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Handle GET request sent to '/server/annotationHandler.php'
  if (file_exists($xfdf_file)) {
    // Read from the XFDF file and send the string as a response
    $xfdf_string = file_get_contents($xfdf_file);
    header("HTTP/1.1 200 OK");
    header("Content-type: text/xml");
    echo $xfdf_string;
  } else {
    header("HTTP/1.1 204 No Content");
  }
}
?>