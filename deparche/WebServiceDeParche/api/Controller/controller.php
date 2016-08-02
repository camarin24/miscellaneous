<?php

class Controller
{
    /**
     * @var null Database Connection
     */
    public static $db = null;

    private function openDatabaseConnection()
    {
        $options = array(PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ, PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING);

        if (!isset(self::$db)) {
            self::$db = new PDO(DB_TYPE . ':host=' . DB_HOST . ';port=3306;dbname=' . DB_NAME . ';charset=' . DB_CHARSET, DB_USER, DB_PASS, $options);
        }
    }

    /**
     * Loads the "model".
     * @return object model
     */
    public function loadModel($modelName)
    {
        $this->openDatabaseConnection();
        require 'Model/'.$modelName.'.php';
        // create new "model" (and pass the database connection)
        return new $modelName(self::$db);
    }


    public static function loadController($controllerName)
    {
        require 'Controller/'.$controllerName.'.php';
        // create new "model" (and pass the database connection)
        return new $controllerName();
    }

}
