<?php

class clsUsers

{
  private $id;
  private $idSistema;
  private $idFacebook;
  private $nombre;
  private $apellido;
  private $fechaNacimiento;
  private $numeroIdentificacion;
  private $paisResidencia;
  private $ciudadResidencia;
  private $email;
  private $password;
  private $urlImagen;
  private $genero;
  private $mensajePersonal;


  function __construct($db)
  {
    try {
      $this->db = $db;
    } catch (PDOException $e) {
      exit('Database connection could not be established.');
    }
  }
  public function __SET($atributo, $value){
    $this->$atributo = $value;
  }

  public function __GET($atributo){
    return $this->$atributo;
  }


  public function Login(){

   $sql = "CALL SP_LOGIN(?)";
   $query = $this->db->prepare($sql);
   $query->bindValue(1, $this->__GET("email"));

   $query->execute();

   return $query->fetchAll();
 }

 public function comentarTiqueteAsesor()
 {

  $sql = "INSERT INTO tbl_comentarios_tiquetes VALUES (null ,null,?,?,?,null)";
  $query = $this->db->prepare($sql);
  $query->bindValue(1, $this->__GET("_id_asesor"));
  $query->bindValue(2, $this->__GET("_comentario"));
  $query->bindValue(3, $this->__GET("_id_tiquete"));

  return $query->execute();
}

public function comentarTiqueteCliente()
{

  $sql = "INSERT INTO tbl_comentarios_tiquetes VALUES (null ,null,null,?,?,?)";
  $query = $this->db->prepare($sql);
  $query->bindValue(1, $this->__GET("_comentario"));
  $query->bindValue(2, $this->__GET("_id_tiquete"));
  $query->bindValue(3, $this->__GET("_id_asesor"));

  return $query->execute();
}

public function listarComentariosPorTiquete()
{
  $sql = "SELECT  id_comentario, id_asesor, comentario , id_cliente, fecha
  FROM tbl_comentarios_tiquetes WHERE id_tiquete  = ? order by fecha desc ";
  $query = $this->db->prepare($sql);
  $query->bindValue(1, $this->__GET("_id_tiquete"));
  $query->execute();
  return $query->fetchAll();
}

public function getTiquetePorCliente()
{
  $sql = "SELECT t.tipo, t.descripcion, t.prioridad, t.fecha_de_apertura, t.fecha_de_soporte, t.fecha_de_cierre, t.estado 
  FROM tbl_tiquetes t  WHERE t.id_cliente = ?";
  $query = $this->db->prepare($sql);
  $query->bindValue(1, $this->__GET("_id_cliente"));
  $query->execute();
  return $query->fetchAll();
}
public function getTiquetePorPendientes()
{
  $sql = "SELECT t.id_tiquetes id, a.nombre, a.id_asesor, c.nombre cliente, t.tipo, t.descripcion, t.prioridad, t.fecha_de_apertura, t.fecha_de_soporte, t.fecha_de_cierre, t.estado 
  FROM tbl_tiquetes t INNER JOIN tbl_asesores_tiquetes a on t.id_asesor = a.id_asesor INNER JOIN tbl_cliente c on  t.id_cliente = c.id_cliente  WHERE t.estado = ? ";
  $query = $this->db->prepare($sql);
  $query->bindValue(1, $this->__GET("_estado"));
  $query->execute();
  return $query->fetchAll();
}

public function updateEstadoTiquete()
{
  date_default_timezone_set('GMT');

  $sql = "UPDATE tbl_tiquetes SET estado = ?  WHERE id_cliente = ? and id_tiquetes = ? ";
  $query = $this->db->prepare($sql);
  $query->bindValue(1, $this->__GET("_estado"));
  $query->bindValue(2, $this->__GET("_id_cliente"));
  $query->bindValue(3, $this->__GET("_id_tiquete"));
  return $query->execute();
  if ($this->__GET("_estado") == 'cerrado') {
    $fecha_de_cierre = date("Y-m-d H:i:s");
    $sql = "UPDATE tbl_tiquetes SET  fecha_de_cierre = ?  WHERE id_cliente = ? and id_tiquetes = ? ";
    $query = $this->db->prepare($sql);
    $query->bindValue(1, $fecha_de_cierre);
    $query->bindValue(2, $this->__GET("_id_cliente"));
    $query->bindValue(3, $this->__GET("_id_tiquete"));
    return $query->execute();
  }
}

public function asignarAsesorAlTiquete()
{
  $sql = "UPDATE tbl_tiquetes SET estado = ?, id_asesor = ?  WHERE id_cliente = ? and id_tiquetes = ? ";
  $query = $this->db->prepare($sql);
  $_estado = 'asignado';
  $query->bindValue(1, $_estado);
  $query->bindValue(2, $this->__GET("_id_asesor"));
  $query->bindValue(3, $this->__GET("_id_cliente"));
  $query->bindValue(4, $this->__GET("_id_tiquete"));
  return $query->execute();
}
}
