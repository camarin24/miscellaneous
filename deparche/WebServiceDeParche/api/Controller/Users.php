<?php

class Users extends Controller
{

    private $mUsers = null;

    public function __construct(){
        $this->mUsers = $this->loadModel("clsUsers");
    }

    public function Login($email){

        $this->mUsers->__SET("email", $email);
        try{
            $login = $this->mUsers->Login();
        }catch(Exception $e){
            $mensaje = "Ocurrio un error ".$e->getMessage();
        }
        echo json_encode($login);
    } 

    
}