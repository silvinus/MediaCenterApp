<?php
require_once('./videoStream.php');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class Movie { 
  public $fileName = ''; 
  public $directory = ''; 
  public $host = '';
}
class SlaveReport {
  public $toRemove = array();
  public $toAdd = array();
}

// POST this.APP_BASE_URL + "/scan/:name"
// GET this.APP_BASE_URL + "/movie/:id/stream/*"

// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$path = trim($_SERVER['PATH_INFO'],'/');
$request = explode('/', $path);
$input = json_decode(file_get_contents('php://input'),true);

if($method == 'POST' && preg_match('/app\/scan\/(.*)/', $path, $matches, PREG_OFFSET_CAPTURE)) {
  $name = $matches[1][0];
  $files = [];

  //read local db
  $excludedFiles = array();
  if(file_exists("mediacenterslave")) 
  { 
    $myfile = fopen("mediacenterslave", "r") or die("Unable to open file!");
    $content = fread($myfile,filesize("mediacenterslave"));
    fclose($myfile);
    $excludedFiles = json_decode($content);
  }

  foreach ($input as $filePath) {
    $files = array_merge($files, traverse_hierarchy($filePath, $excludedFiles, $name));
  }

  // append to file
  if(file_exists('mediacenterslave')) {
    unlink('mediacenterslave');
  }
  $all = array_merge($excludedFiles, $files);
  if($all != null) {
    file_put_contents('mediacenterslave', json_encode($all).PHP_EOL , FILE_APPEND | LOCK_EX);
  }
  // send response
  $report = new SlaveReport();
  $report->toAdd = $files;
  echo json_encode($report);
}
else if($method == 'GET' && preg_match('/app\/movie\/(.*)\/stream\/.*/', $path, $matches, PREG_OFFSET_CAPTURE)) {
  $filename = $matches[1][0];

  if(file_exists("mediacenterslave")) 
  { 
    $myfile = fopen("mediacenterslave", "r") or die("Unable to open file!");
    $content = fread($myfile,filesize("mediacenterslave"));
    fclose($myfile);
    $collection = json_decode($content);

    $movie = find($collection, $filename);
    if($movie == null) {
      header("Status: 404 Not Found");
      return;
    }

    $file = $movie->directory . $movie->fileName;

    $stream = new VideoStream($file);
    $stream->logInFile('start stream $file');
    $stream->start();
  }
  else {
    header("Status: 404 Not Found");
  }
}
else if($method == 'GET' && preg_match('/app\/healthcheck/', $path, $matches, PREG_OFFSET_CAPTURE)) {
  echo json_encode( (object) [
    'isAlive' => true
  ]);
}
else {
  header("Status: 404 Not Found");
}

function find($collection, $filename) {
  foreach ($collection as $item) {
    if($item->fileName == $filename) {
      return $item;
    }
  }
  return null;
}

function traverse_hierarchy($path, $excludedFiles, $host)
{
    $return_array = array();
    $dir = opendir($path);
    while(($file = readdir($dir)) !== false)
    {
        if($file[0] == '.') continue;
        $fullpath = $path . '/' . $file;
        if(is_dir($fullpath))
            $return_array = array_merge($return_array, traverse_hierarchy($fullpath, $excludedFiles, $host));
        else 
        {
            $explode = explode("/", $fullpath);
            $filename = $explode[count($explode) - 1];
            $directory = str_replace($filename, "", $fullpath);
            if(accept($fullpath) && notExistsIn($excludedFiles, $filename)) {
              $movie = new Movie();
              $movie->fileName = $filename;
              $movie->directory = $directory;
              $movie->host = $host;
              $return_array[] = $movie;
            }
        }
    }
    return $return_array;
}

function accept($path)
{
    $allowedExtension = ['avi', 'mkv', 'mp4'];
    foreach ($allowedExtension as $ext) {
        if(strrpos($path, $ext) == strlen($path) - strlen($ext)) {
          return true;
        }
    }
    return false;
}

function notExistsIn($exclude, $filename) {
  foreach ($exclude as $ex) {
    if($filename == $ex->fileName) {
      return false;
    }
  }
  return true;
}
?>