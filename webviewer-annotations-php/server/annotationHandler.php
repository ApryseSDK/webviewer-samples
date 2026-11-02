<?php
// Create xfdf folder if it doesn't exist
if (!is_dir("xfdf")) {
  mkdir("xfdf");
}

// Only allow safe characters in the document ID to prevent path traversal
$document_id = isset($_REQUEST['documentId']) ? $_REQUEST['documentId'] : '';
if (!is_string($document_id) || !preg_match('/^[A-Za-z0-9_-]+$/', $document_id)) {
  header("HTTP/1.1 400 Bad Request");
  exit;
}

$xfdf_file = "xfdf/".basename($document_id).".xfdf";

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
  // Resolve the real path and make sure it stays inside the xfdf folder
  $xfdf_dir = realpath("xfdf");
  $real_xfdf_file = realpath($xfdf_file);
  if ($real_xfdf_file !== false && strpos($real_xfdf_file, $xfdf_dir.DIRECTORY_SEPARATOR) === 0) {
    // Read from the XFDF file and send the string as a response
    $xfdf_string = file_get_contents($real_xfdf_file);
    header("HTTP/1.1 200 OK");
    header("Content-type: text/xml");
    echo $xfdf_string;
  } else {
    header("HTTP/1.1 204 No Content");
  }
}
?>