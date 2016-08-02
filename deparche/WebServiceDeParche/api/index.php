<?php 

require 'Config/Config.php';
require 'Controller/controller.php';
require 'Library/Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();


$app->get('/pruebaLogin', function () {
	$ctr = Controller::loadController("Users");
	echo $ctr->Login($_GET["email"]);
});

$app->post('/actualizarFechaSoporte', function () {
	$ctr = Controller::loadController("Tiquetes");
	echo $ctr->actualizarFechaSoporte($_GET["id_cliente"], $_GET["id_tiquete"],$_GET["fecha_soporte"]);
});


$app->run();
