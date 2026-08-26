<?php
/**
 * Front Controller
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/Database.php';

// Models
require_once __DIR__ . '/../app/Models/Repair.php';

// Controllers
require_once __DIR__ . '/../app/Controllers/RepairController.php';

$router = new Router();

// Define routes
$router->add('GET', '/api/repairs', 'RepairController@index');
$router->add('GET', '/api/repairs/{id}', 'RepairController@show');

// Dispatch
$url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Remove subdirectories if hosted in one, e.g. /backend/public
$basePath = '/backend/public'; 
if (strpos($url, $basePath) === 0) {
    $url = substr($url, strlen($basePath));
}

$router->dispatch($_SERVER['REQUEST_METHOD'], $url);
