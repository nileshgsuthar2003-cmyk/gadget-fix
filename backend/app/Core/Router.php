<?php
class Router {
    private $routes = [];

    public function add($method, $path, $controllerAction) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'controllerAction' => $controllerAction
        ];
    }

    public function dispatch($method, $uri) {
        foreach ($this->routes as $route) {
            if ($route['method'] === $method) {
                // Handle dynamic routes (e.g., /api/repairs/{id})
                $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_-]+)', $route['path']);
                $pattern = "#^" . $pattern . "$#";
                
                if (preg_match($pattern, $uri, $matches)) {
                    array_shift($matches); // Remove the full match
                    
                    list($controllerName, $actionName) = explode('@', $route['controllerAction']);
                    
                    // Instantiate the controller and call the action
                    if (class_exists($controllerName)) {
                        $controller = new $controllerName();
                        if (method_exists($controller, $actionName)) {
                            call_user_func_array([$controller, $actionName], $matches);
                            return;
                        }
                    }
                }
            }
        }
        
        // Not Found
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint Not Found']);
    }
}
?>
