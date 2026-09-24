// ============================================================
// SISTEMA DE GESTIÓN DE TRANSPORTE ESCOLAR
// FASE 2 - IMPLEMENTACIÓN, SEMBRADO DE DATOS Y CONSULTAS MQL
// ============================================================


// Selecciona la base de datos del proyecto.
// Todas las consultas y operaciones que se encuentran
// debajo se ejecutarán sobre esta base de datos.
use("sistema-transporte-escolar");


// ============================================================
// PASO 3 - CONSULTAS DE LECTURA
// ============================================================


// ------------------------------------------------------------
// CONSULTA 1 - COINCIDENCIA EXACTA
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita permitir consultar los pagos realizados
// o registrados por un responsable determinado.
//
// En este caso se consulta al responsable RES001.
// Se utiliza una coincidencia exacta sobre el campo
// responsable_id.
//
// La consulta devuelve todos los documentos de la colección
// pagos donde responsable_id sea exactamente "RES001".

db.pagos.find({
  responsable_id: "RES001"
});


// ------------------------------------------------------------
// CONSULTA 2 - OPERADOR DE COMPARACIÓN
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita identificar los pagos cuyo monto
// sea superior a un determinado valor.
//
// Se utiliza el operador $gt, que significa "greater than"
// o "mayor que".
//
// En este caso se buscan todos los pagos cuyo monto
// sea mayor a 85000.
//
// Esto puede utilizarse para consultar pagos de meses
// cuyo importe sea superior al valor establecido.

db.pagos.find({
  monto: {
    $gt: 85000
  }
});


// ------------------------------------------------------------
// CONSULTA 3 - NOTACIÓN DE PUNTO
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita consultar los alumnos que tienen
// un determinado horario de entrada.
//
// El campo "entrada" se encuentra dentro del objeto
// "horario" del documento de cada alumno.
//
// Por eso se utiliza la notación de punto:
// "horario.entrada"
//
// La consulta devuelve los alumnos cuyo horario de entrada
// sea exactamente a las 07:30.

db.alumnos.find({
  "horario.entrada": "07:30"
});


// ------------------------------------------------------------
// CONSULTA 4 - PROYECCIÓN
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita consultar información de los conductores
// mostrando solamente los datos necesarios para la consulta.
//
// La proyección permite seleccionar qué campos queremos
// visualizar en el resultado.
//
// El valor 1 indica que el campo debe incluirse.
// El valor 0 indica que el campo debe excluirse.
//
// En este caso se excluye _id y se muestran solamente:
// nombre, apellido, telefono y estado.
//
// De esta manera se evita mostrar información que no es
// necesaria para esta consulta.

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
// CONSULTA 5 - FILTRADO DE ELEMENTOS DENTRO DE UN ARRAY
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita consultar qué alumnos tienen registrada
// una persona autorizada cuyo parentesco sea "Abuelo".
//
// El campo personas_autorizadas es un arreglo que puede contener
// una o varias personas autorizadas.
//
// Se utiliza el operador $elemMatch para buscar dentro de ese
// arreglo un elemento que cumpla con la condición indicada.
//
// En este caso se buscan elementos cuyo campo parentesco
// sea igual a "Abuelo".

db.alumnos.find({
  personas_autorizadas: {
    $elemMatch: {
      parentesco: "Abuelo"
    }
  }
});


// ============================================================
// PASO 4 - OPERACIONES DE ESCRITURA
// ============================================================


// ------------------------------------------------------------
// OPERACIÓN 1 - ACTUALIZACIÓN CON $set
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita permitir actualizar información
// de un alumno y agregar nuevos datos cuando sea necesario.
//
// En este caso se modifica la información del alumno ALU007.
//
// Se actualiza el campo "observaciones" para indicar
// una condición relacionada con el retiro del alumno.
//
// Además, se agrega un nuevo campo llamado
// "contactoEmergencia".
//
// El operador $set permite modificar un campo existente
// o crear un nuevo campo si todavía no existe.
//
// updateOne modifica solamente el primer documento que
// coincide con el criterio de búsqueda.

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
// OPERACIÓN 2 - INCREMENTO CON $inc
// ------------------------------------------------------------

// Problema de negocio:
// El sistema necesita llevar un registro de la cantidad
// de viajes realizados por cada vehículo.
//
// En este caso se utiliza el vehículo VEH001.
//
// El operador $inc permite incrementar o disminuir
// un valor numérico.
//
// Se incrementa el campo "viajesRealizados" en 1.
//
// Si el campo todavía no existe en el documento,
// MongoDB lo crea automáticamente con el valor indicado.
//
// Por lo tanto, después de ejecutar esta operación,
// VEH001 tendrá viajesRealizados: 1.

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
// OPERACIÓN 3 - ELIMINACIÓN SEGURA CON deleteOne
// ------------------------------------------------------------

// Problema de negocio:
// El sistema debe permitir eliminar un vehículo que ya
// no se encuentra disponible para prestar el servicio.
//
// Para realizar la prueba de eliminación se utilizó
// temporalmente el vehículo VEH011, cuyo estado es
// "Dado de baja".
//
// Se utiliza deleteOne para eliminar un único documento.
//
// La condición de búsqueda contiene DOS criterios:
// 1. El _id debe ser exactamente "VEH011".
// 2. El estado debe ser exactamente "Dado de baja".
//
// Esto permite realizar una eliminación específica y evita
// eliminar accidentalmente otro vehículo.
//
// VEH011 fue utilizado únicamente como documento de prueba
// para esta operación y no forma parte de los datos iniciales
// de vehiculos.json.

db.vehiculos.deleteOne({
  _id: "VEH011",
  estado: "Dado de baja"
});


// ============================================================
// FIN DEL SCRIPT
// ============================================================
