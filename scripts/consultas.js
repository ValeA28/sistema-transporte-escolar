// ============================================================
// SISTEMA DE GESTIÓN DE TRANSPORTE ESCOLAR
// Consultas MQL - Fase 2
// ============================================================

// Selecciona la base de datos del proyecto.
use("sistema-transporte-escolar");


// ============================================================
// PASO 3 - CONSULTAS DE LECTURA
// ============================================================


// ------------------------------------------------------------
// CONSULTA 1 - Coincidencia exacta
// ------------------------------------------------------------
// Busca los pagos correspondientes al responsable RES001.
// Se utiliza una coincidencia exacta sobre responsable_id.

db.pagos.find({
  responsable_id: "RES001"
});


// ------------------------------------------------------------
// CONSULTA 2 - Operador de comparación
// ------------------------------------------------------------
// Busca los pagos cuyo monto sea mayor a $85.000.
// $gt significa "greater than" (mayor que).

db.pagos.find({
  monto: {
    $gt: 85000
  }
});


// ------------------------------------------------------------
// CONSULTA 3 - Dot notation
// ------------------------------------------------------------
// Busca los alumnos cuyo horario de entrada sea exactamente
// a las 07:30.
// Se utiliza dot notation para acceder a entrada dentro
// del objeto horario.

db.alumnos.find({
  "horario.entrada": "07:30"
});


// ------------------------------------------------------------
// CONSULTA 4 - Proyección de campos
// ------------------------------------------------------------
// Consulta los conductores mostrando solamente nombre,
// apellido, teléfono y estado.
// Se excluye explícitamente el campo _id.

db.conductores.find(
  {},
  {
    _id: 0,
    nombre: 1,
    apellido: 1,
    telefono: 1,
    estado: 1
  }
);


// ------------------------------------------------------------
// CONSULTA 5 - Filtro dentro de un arreglo
// ------------------------------------------------------------
// Busca los alumnos que tienen una persona autorizada
// cuyo parentesco sea "Abuelo".
// Se utiliza el operador $elemMatch.

db.alumnos.find({
  personas_autorizadas: {
    $elemMatch: {
      parentesco: "Abuelo"
    }
  }
});


// ============================================================
// PASO 4 - ACTUALIZACIONES Y ELIMINACIÓN
// ============================================================


// ------------------------------------------------------------
// OPERACIÓN 1 - Actualización con $set
// ------------------------------------------------------------
// Modifica la observación del alumno ALU007 y agrega
// una nueva propiedad llamada contactoEmergencia.

db.alumnos.updateOne(
  {
    _id: "ALU007"
  },
  {
    $set: {
      observaciones: "Debe esperar dentro del establecimiento hasta ser retirada por una persona autorizada.",
      contactoEmergencia: "2634559999"
    }
  }
);


// ------------------------------------------------------------
// OPERACIÓN 2 - Incremento con $inc
// ------------------------------------------------------------
// Incrementa en 1 la cantidad de viajes realizados por
// el vehículo VEH001.
// Si viajesRealizados no existe, MongoDB lo crea con valor 1.

db.vehiculos.updateOne(
  {
    _id: "VEH001"
  },
  {
    $inc: {
      viajesRealizados: 1
    }
  }
);


// ------------------------------------------------------------
// OPERACIÓN 3 - Eliminación segura con deleteOne
// ------------------------------------------------------------
// Elimina el vehículo de prueba VEH011 solamente si,
// además de tener ese _id, su estado es "Dado de baja".
// El criterio estricto evita eliminar otro vehículo.

db.vehiculos.deleteOne(
  {
    _id: "VEH011",
    estado: "Dado de baja"
  }
);
