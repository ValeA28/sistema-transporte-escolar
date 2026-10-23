# Sistema de Gestión de Transporte Escolar

## 1. Descripción del proyecto

El proyecto consiste en el diseño de un sistema de gestión para un servicio de transporte escolar. El sistema busca centralizar la información básica de alumnos, responsables, conductores, vehículos, horarios y pagos.

Actualmente, este tipo de servicios suele realizarse de forma manual o mediante mensajes, lo que puede generar desorden, pérdida de información y dificultades para el control de pagos y horarios.

La base de datos será el componente principal del sistema, ya que permitirá almacenar y consultar de manera organizada toda la información necesaria para administrar el servicio de forma eficiente y sin duplicación de datos.

### Funcionalidades principales

El sistema permitirá:

1. Registrar padres, tutores o responsables.
2. Dar de alta alumnos asociados a un responsable.
3. Registrar conductores.
4. Registrar vehículos.
5. Registrar y consultar horarios.
6. Registrar y consultar pagos.
7. Consultar información general del servicio, como alumnos activos, responsables, pagos pendientes, conductores y vehículos disponibles.

---

# 2. Modelo conceptual orientado a documentos

Para el diseño de la base de datos se propone utilizar MongoDB, un sistema de gestión de bases de datos NoSQL orientado a documentos.

Las principales colecciones propuestas son:

* `responsables`
* `alumnos`
* `conductores`
* `vehiculos`
* `pagos`

La información relacionada con los horarios se almacenará dentro de los documentos de los alumnos, debido a que corresponde directamente al servicio que recibe cada alumno y se espera que sea consultada junto con sus datos.

---

## Colección `responsables`

La colección `responsables` almacenará la información de los padres, madres, tutores u otras personas responsables que utilizan el sistema.

El responsable será el usuario que tendrá una cuenta en el sistema, podrá iniciar sesión y será quien dé de alta a los alumnos que estén bajo su responsabilidad.

### Ejemplo de documento

```json
{
  "_id": "RES001",
  "nombre": "Laura",
  "apellido": "Gómez",
  "dni": "30123456",
  "telefono": "2615555555",
  "email": "laura@email.com",
  "direccion": {
    "calle": "San Martín",
    "numero": 123,
    "localidad": "San Martín"
  },
  "estado": "Activo"
}
```

La información de la dirección se encuentra embebida dentro del documento del responsable, ya que forma parte de sus datos personales y normalmente será consultada junto con el resto de su información.

---

## Colección `alumnos`

La colección `alumnos` almacenará la información de los niños que utilizan el servicio de transporte escolar.

Los alumnos no tendrán una cuenta propia en el sistema. Serán dados de alta por un responsable desde su propia cuenta.

### Ejemplo de documento

```json
{
  "_id": "ALU001",
  "nombre": "Martina",
  "apellido": "Gómez",
  "fechaNacimiento": "2014-05-12",
  "responsable_id": "RES001",
  "horario": {
    "entrada": "07:30",
    "regreso": "13:00"
  },
  "estado": "Activo"
}
```

El campo `responsable_id` permite establecer una referencia hacia el responsable correspondiente.

El horario se encuentra embebido dentro del documento del alumno porque está directamente relacionado con el servicio que recibe ese alumno y normalmente será consultado junto con sus datos.

---

## Colección `conductores`

La colección `conductores` almacenará los datos de los conductores que prestan el servicio de transporte escolar.

### Ejemplo de documento

```json
{
  "_id": "CHO001",
  "nombre": "Carlos",
  "apellido": "Pérez",
  "dni": "28555111",
  "telefono": "2614444444",
  "licencia": {
    "numero": "12345678",
    "vencimiento": "2027-10-15"
  },
  "estado": "Activo"
}
```

Los datos de la licencia se encuentran embebidos porque pertenecen directamente al chofer y se espera que sean consultados junto con su información.

El campo `estado` permite indicar si el conductor se encuentra actualmente habilitado para prestar el servicio.

---

## Colección `vehiculos`

La colección `vehiculos` almacenará la información de los vehículos utilizados para prestar el servicio.

### Ejemplo de documento

```json
{
  "_id": "VEH001",
  "marca": "Mercedes-Benz",
  "modelo": "Sprinter",
  "patente": "AB123CD",
  "capacidad": 19,
  "estado": "Activo"
}
```

El campo `estado` permite indicar si el vehículo se encuentra actualmente disponible para formar parte del servicio o si se encuentra inactivo.

Los vehículos se mantienen en una colección independiente porque representan elementos que pueden ser administrados y consultados de forma independiente.

---

## Colección `pagos`

La colección `pagos` almacenará los pagos realizados por los responsables correspondientes al servicio de transporte escolar.

### Ejemplo de documento

```json
{
  "_id": "PAG001",
  "responsable_id": "RES001",
  "alumno_id": "ALU001",
  "periodo": "Agosto 2026",
  "monto": 85000,
  "fechaPago": "2026-08-05",
  "metodoPago": "Transferencia",
  "estado": "Pagado"
}
```

Los pagos se almacenan en una colección independiente porque un responsable puede realizar múltiples pagos a lo largo del tiempo. De esta manera, cada pago puede registrarse como un documento independiente y conservar un historial sin duplicar toda la información del responsable o del alumno.

Los campos `responsable_id` y `alumno_id` funcionan como referencias hacia las colecciones correspondientes.

---

# 3. Fundamentación de la lógica no relacional

Para diseñar la estructura de la base de datos se analizaron las formas en que la aplicación utilizará y consultará la información.

Se decidió utilizar una combinación de **Embedded Documents** y **References**, dependiendo del tipo de información y de la frecuencia con la que será consultada junto con el documento principal.

## Embedded Documents

Los documentos embebidos se utilizarán para información que pertenece directamente a una entidad y que normalmente será consultada junto con ella.

Por ejemplo, la dirección del responsable se encuentra dentro del documento `responsables`:

```json
"direccion": {
  "calle": "San Martín",
  "numero": 123,
  "localidad": "San Martín"
}
```

De la misma manera, los horarios del alumno se encuentran dentro de su documento:

```json
"horario": {
  "entrada": "07:30",
  "regreso": "13:00"
}
```

También se utiliza este criterio para los datos de la licencia del chofer.

La utilización de documentos embebidos permite obtener la información relacionada mediante una misma lectura, evitando separar datos que normalmente serán utilizados conjuntamente.

## References

Las referencias se utilizarán cuando la información corresponda a una entidad independiente o pueda estar relacionada con varios documentos.

Por ejemplo, cada alumno tendrá un `responsable_id`:

```json
"responsable_id": "RES001"
```

Esto permite relacionar al alumno con el responsable que lo dio de alta sin duplicar los datos personales del responsable dentro del documento del alumno.

También los pagos utilizarán referencias:

```json
"responsable_id": "RES001",
"alumno_id": "ALU001"
```

Esto permite que un mismo responsable pueda tener uno o varios alumnos y que cada alumno pueda tener múltiples registros de pagos a lo largo del tiempo, evitando duplicar información y facilitando el mantenimiento de los datos.

La decisión de utilizar referencias en estos casos se basa en que responsables, alumnos y pagos representan información que puede crecer y modificarse de manera independiente.

En conjunto, esta combinación permite aprovechar las características del modelo orientado a documentos. De esta manera, se decidió guardar juntos los datos que se van a consultar habitualmente al mismo tiempo y utilizar referencias cuando la información pueda modificarse o utilizarse de forma independiente.

## Patrones de acceso y consultas proyectadas

Para definir la estructura de los documentos también se tuvieron en cuenta las consultas que se espera realizar en el futuro desde la aplicación.

Algunas de las principales consultas serán:

* Consultar los datos de un responsable que inició sesión.
* Consultar los alumnos asociados a un determinado responsable.
* Consultar los datos de un alumno junto con su horario.
* Consultar y actualizar los datos de un alumno.
* Consultar los pagos realizados por un determinado responsable.
* Consultar el historial de pagos de un alumno.
* Consultar qué alumnos tienen pagos pendientes.
* Consultar los horarios registrados para los alumnos.

Estos patrones de acceso influyen en la forma en que se organizaron los documentos. Por ejemplo, los horarios se encuentran dentro del documento del alumno porque normalmente se necesitarán junto con sus datos. En cambio, el responsable se mantiene en una colección independiente y el alumno utiliza `responsable_id`, ya que un responsable puede tener uno o varios alumnos y sus datos personales no deberían repetirse en cada documento.

De la misma manera, los pagos se mantienen en una colección independiente porque un alumno puede tener muchos pagos a lo largo del tiempo. Esto permite consultar el historial completo de pagos sin tener que modificar o hacer crecer constantemente el documento del alumno.

De esta manera, la estructura propuesta busca que las consultas más habituales sean sencillas y que la información que puede crecer o modificarse de forma independiente no tenga que repetirse en diferentes documentos.






---

## Implementación y pruebas - Fase 2

En esta fase se implementó el modelo diseñado anteriormente utilizando MongoDB. Se creó la base de datos `sistema-transporte-escolar` y las colecciones `alumnos`, `responsables`, `conductores`, `vehiculos` y `pagos`.

También se cargaron datos iniciales en formato JSON y se desarrollaron consultas MQL para realizar búsquedas, actualizaciones y eliminaciones sobre la información del sistema.

### Pruebas de Consultas (MQL)

Las siguientes consultas representan diferentes necesidades del sistema de gestión de transporte escolar.

### Consulta 1 - Coincidencia exacta


Permite consultar los pagos registrados para un responsable específico. Esto facilita el control de los pagos realizados por cada familia.

**Código MQL:**

```javascript
db.pagos.find({
  responsable_id: "RES001"
})
```

Esta consulta busca los documentos cuyo `responsable_id` coincida exactamente con `RES001`.

**Resultado de la ejecución:**

<img width="453" height="623" alt="Captura de pantalla 2026-09-21 195809" src="https://github.com/user-attachments/assets/b9c32358-4288-4f1b-a569-429f085292d5" />


---

### Consulta 2 - Operador de comparación


Permite consultar los pagos cuyo monto sea superior a $85.000. Esto puede ser útil para analizar los pagos de mayor importe.

**Código MQL:**

```javascript
db.pagos.find({
  monto: {
    $gt: 85000
  }
})
```

El operador `$gt` permite buscar valores mayores que el monto indicado.

**Resultado de la ejecución:**

<img width="343" height="690" alt="Captura de pantalla 2026-09-21 193302" src="https://github.com/user-attachments/assets/2599f481-d655-4eaf-9b3b-ea836cd825c5" />
<img width="328" height="837" alt="Captura de pantalla 2026-09-21 193332" src="https://github.com/user-attachments/assets/7111dff5-6df2-4729-88d5-141348866d0e" />
<img width="297" height="237" alt="Captura de pantalla 2026-09-21 193341" src="https://github.com/user-attachments/assets/99972ace-878b-4ea3-a19f-2b1213503951" />


---

### Consulta 3 - Notación de punto (Dot Notation)


Permite consultar qué alumnos tienen un determinado horario de entrada, facilitando la organización de los recorridos del transporte escolar.

**Código MQL:**

```javascript
db.alumnos.find({
  "horario.entrada": "07:30"
})
```

En esta consulta se utiliza la notación de punto para acceder al campo `entrada`, que se encuentra dentro del objeto `horario`.

**Resultado de la ejecución:**

<img width="696" height="817" alt="Captura de pantalla 2026-09-21 192103" src="https://github.com/user-attachments/assets/fc07fa18-5594-446a-8184-78f753fe814d" />
<img width="378" height="771" alt="Captura de pantalla 2026-09-21 192413" src="https://github.com/user-attachments/assets/f1440040-5b28-4250-9b25-6bd45b7cf9be" />
<img width="785" height="807" alt="Captura de pantalla 2026-09-21 192428" src="https://github.com/user-attachments/assets/581ad7df-4741-45f7-b2c3-e01d09b0e643" />
<img width="342" height="601" alt="Captura de pantalla 2026-09-21 192440" src="https://github.com/user-attachments/assets/fbc39034-006f-4e21-9969-cb462b975557" />


---

### Consulta 4 - Proyección de campos


Permite consultar información específica de los conductores sin mostrar todos los datos almacenados. En este caso se muestran solamente el nombre, apellido, teléfono y estado.

**Código MQL:**

```javascript
db.conductores.find(
  {},
  {
    _id: 0,
    nombre: 1,
    apellido: 1,
    telefono: 1,
    estado: 1
  }
)
```

La proyección permite seleccionar los campos que se desean mostrar. Se excluye explícitamente `_id` utilizando `_id: 0`.

**Resultado de la ejecución:**

<img width="338" height="842" alt="Captura de pantalla 2026-09-21 213038" src="https://github.com/user-attachments/assets/36737607-9052-4a16-844d-a412fc6e48da" />
<img width="277" height="718" alt="Captura de pantalla 2026-09-21 213311" src="https://github.com/user-attachments/assets/4ce08d8e-5ea9-45b8-998e-da3bb74f2204" />
<img width="276" height="542" alt="Captura de pantalla 2026-09-21 213341" src="https://github.com/user-attachments/assets/81922356-613b-4074-a7fd-67b000211b18" />


---

### Consulta 5 - Filtrado dentro de un arreglo con `$elemMatch`


Permite consultar los alumnos que tienen entre sus personas autorizadas a una persona cuyo parentesco sea abuelo.

**Código MQL:**

```javascript
db.alumnos.find({
  personas_autorizadas: {
    $elemMatch: {
      parentesco: "Abuelo"
    }
  }
})
```

El operador `$elemMatch` permite buscar dentro del arreglo `personas_autorizadas` un elemento que cumpla con la condición indicada.

**Resultado de la ejecución:**

<img width="360" height="778" alt="Captura de pantalla 2026-09-22 001133" src="https://github.com/user-attachments/assets/a07bcf04-db94-4afb-bc52-1256d79355b8" />
<img width="363" height="807" alt="Captura de pantalla 2026-09-22 001210" src="https://github.com/user-attachments/assets/9829efd7-51a7-4a8e-ad0d-06aaf3746b3b" />


---

## Actualizaciones y eliminación

Además de las consultas de lectura, se realizaron tres operaciones de modificación y eliminación.

### Operación 1 - Actualización con `$set`


Permite actualizar información de un alumno y agregar un dato adicional para situaciones de emergencia.

En este caso se modificó la observación del alumno `ALU007` y se agregó la propiedad `contactoEmergencia`.

**Código MQL:**

```javascript
db.alumnos.updateOne(
  { _id: "ALU007" },
  {
    $set: {
      observaciones: "Debe esperar dentro del establecimiento hasta ser retirada por una persona autorizada.",
      contactoEmergencia: "2634559999"
    }
  }
)
```

El operador `$set` permite modificar un campo existente y también agregar una nueva propiedad si esta no existe.

**Resultado de la ejecución:**

<img width="1116" height="485" alt="Captura de pantalla 2026-09-22 012507" src="https://github.com/user-attachments/assets/ac859cae-ccb0-406f-800b-a3ca96a380bd" />
<img width="913" height="247" alt="Captura de pantalla 2026-09-22 012651" src="https://github.com/user-attachments/assets/5301cea9-ecb1-4748-ad99-57b49ffdccab" />


---

### Operación 2 - Incremento con `$inc`


Permite llevar un contador de los viajes realizados por un vehículo. Cada vez que se registra un nuevo viaje, el contador puede incrementarse.

En este caso se incrementó en 1 la cantidad de viajes realizados por el vehículo `VEH001`.

**Código MQL:**

```javascript
db.vehiculos.updateOne(
  { _id: "VEH001" },
  {
    $inc: {
      viajesRealizados: 1
    }
  }
)
```

El operador `$inc` incrementa el valor numérico indicado. Como `viajesRealizados` no existía inicialmente, MongoDB creó la propiedad con valor `1`.

**Resultado de la ejecución:**

<img width="396" height="458" alt="Captura de pantalla 2026-09-22 035726" src="https://github.com/user-attachments/assets/6da3ebe4-40af-4322-a67f-11a33177f960" />
<img width="245" height="177" alt="Captura de pantalla 2026-09-22 035748" src="https://github.com/user-attachments/assets/858d4f42-667b-449a-b08e-7c85ce66aa2c" />


---

### Operación 3 - Eliminación segura con `deleteOne`


Permite eliminar un registro específico que ya no debe formar parte de la colección, utilizando un criterio de filtrado estricto para evitar eliminar otros documentos.

Para realizar esta prueba se utilizó temporalmente el vehículo `VEH011`, marcado como `"Dado de baja"`.

**Código MQL:**

```javascript
db.vehiculos.deleteOne({
  _id: "VEH011",
  estado: "Dado de baja"
})
```

La eliminación utiliza dos condiciones: el identificador del vehículo y su estado. De esta manera, solamente se elimina el documento que cumple ambas condiciones.

**Resultado de la ejecución:**

<img width="312" height="532" alt="Captura de pantalla 2026-09-22 002630" src="https://github.com/user-attachments/assets/a595b6a4-0abd-4967-8d67-91b5308bd23b" />
<img width="313" height="246" alt="Captura de pantalla 2026-09-22 040503" src="https://github.com/user-attachments/assets/99d8056b-3a32-4e1d-82ef-f3725ce78d0e" />


---

## Conclusión de las pruebas

Las consultas y operaciones realizadas permitieron comprobar el funcionamiento de MongoDB sobre el modelo diseñado para el sistema de transporte escolar.

Se utilizaron consultas de filtrado, operadores de comparación, notación de punto, proyecciones y búsquedas dentro de arreglos. También se realizaron operaciones de actualización y eliminación para comprobar el manejo de los datos.

Las pruebas permitieron verificar que la información puede consultarse y modificarse de acuerdo con las necesidades del sistema, aprovechando las características del modelo orientado a documentos.







# Fase 3: Resiliencia, Transacciones y Securización

## Introducción

En esta fase del proyecto se busca mejorar la disponibilidad, la consistencia y la seguridad de la base de datos del Sistema de Gestión de Transporte Escolar, utilizando las funcionalidades de MongoDB.

El objetivo es pasar de una base de datos utilizada de manera local a una configuración que permita tolerar fallos, mantener la consistencia de las operaciones críticas y controlar el acceso a la información.

Para ello, el trabajo se divide en tres etapas:

1. **Alta disponibilidad:** configurar un Replica Set de MongoDB con tres nodos y comprobar la elección automática de un nuevo nodo principal ante la caída del PRIMARY.
2. **Transacciones ACID:** implementar transacciones que permitan confirmar operaciones exitosas y revertir los cambios cuando se produzca un error o se incumpla una regla de negocio.
3. **Seguridad:** habilitar la autenticación de MongoDB y crear usuarios con distintos permisos, aplicando el principio de mínimo privilegio.

## Paso 1: Alta disponibilidad

### Objetivo

Configurar un Replica Set de MongoDB compuesto por un nodo PRIMARY, un nodo SECONDARY y un ARBITER. Posteriormente, comprobar su capacidad de recuperación mediante la interrupción intencional del nodo principal mientras se ejecutan inserciones de documentos.

Esta prueba permite verificar si MongoDB puede elegir automáticamente un nuevo PRIMARY cuando el nodo principal deja de estar disponible.

### 1. Configuración del Replica Set

Se modificó el archivo de configuración `mongod.cfg` para habilitar la replicación de MongoDB mediante el conjunto `rs0`. Posteriormente, se reinició el servicio para aplicar los cambios.

<img width="840" height="901" alt="image" src="https://github.com/user-attachments/assets/5ac423b5-3b33-4f22-b286-c53395aeafdb" />


### 2. Inicialización del Replica Set

Desde MongoDB Shell (`mongosh`), se ejecutó el comando `rs.initiate()` para inicializar el Replica Set `rs0`, utilizando inicialmente el nodo `127.0.0.1:27017`.

Esta inicialización permitió comenzar a configurar los demás miembros del conjunto.

<img width="975" height="859" alt="image" src="https://github.com/user-attachments/assets/9ca636c7-b9d5-43fe-9c7a-f2b4d962e9e7" />

### 3. Incorporación del Arbiter

Se incorporó una tercera instancia de MongoDB en el puerto `27019`, configurada como Arbiter. Este miembro participa en las elecciones del Replica Set, pero no almacena una copia de los datos de la aplicación.

La incorporación permitió completar la configuración de los tres miembros necesarios para esta práctica.
<img width="855" height="354" alt="image" src="https://github.com/user-attachments/assets/956ba916-1278-4800-9b0c-c37394ee7e8b" />

### 4. Ejecución del script de inserciones

Se creó el archivo `scripts/failover.js` utilizando Node.js y el controlador de MongoDB.

El script se conecta al Replica Set `rs0` e inserta documentos automáticamente cada tres segundos en la colección `prueba_failover`. Cada documento incluye un identificador, un mensaje, un número y la fecha de inserción.

Este procedimiento permite observar el comportamiento de las operaciones de escritura durante la prueba de alta disponibilidad.

<img width="975" height="433" alt="image" src="https://github.com/user-attachments/assets/25c76d3e-7cc1-408c-ae04-3c7e1365a42d" />

### 5. Simulación de la caída del PRIMARY

Para comprobar la tolerancia a fallos, se detuvo intencionalmente el proceso correspondiente al nodo que ejercía el rol de PRIMARY.

Esta interrupción permitió simular la caída del nodo principal mientras se realizaba la prueba de alta disponibilidad.

<img width="870" height="128" alt="image" src="https://github.com/user-attachments/assets/0b580162-220e-4d72-8d9d-d85e02e58413" />

### 6. Elección automática de un nuevo PRIMARY

Después de detener el nodo principal, se comprobó el estado de la topología mediante el comando `db.hello()`.

El resultado mostró que `127.0.0.1:27018` había asumido el rol de PRIMARY. Esto demuestra que MongoDB realizó una elección automática tras la caída del nodo que ejercía ese rol.

<img width="975" height="914" alt="image" src="https://github.com/user-attachments/assets/a8d74c1c-7d53-44e8-b12e-f9936357de9c" />


### 7. Recuperación del nodo

Una vez finalizada la prueba de caída, se volvió a iniciar el nodo `127.0.0.1:27017`.

Mediante `db.hello()` se comprobó que el nodo volvió a formar parte del Replica Set como SECONDARY, mientras que `127.0.0.1:27018` continuó como PRIMARY.

<img width="975" height="843" alt="image" src="https://github.com/user-attachments/assets/8d29dbbc-4a22-4cd5-98e8-f6feb768fb41" />

### 8. Continuidad de las inserciones durante la prueba de alta disponibilidad

Durante la prueba se detuvo intencionalmente el nodo que actuaba como PRIMARY para comprobar la capacidad de recuperación del Replica Set.

En la ejecución del script se observaron algunas interrupciones temporales en las operaciones de escritura, seguidas de nuevas inserciones realizadas correctamente. Esto permitió observar el comportamiento del sistema ante errores durante las operaciones de escritura.

La captura muestra la continuidad de las inserciones y la recuperación de las operaciones después de los errores registrados.

<img width="886" height="382" alt="image" src="https://github.com/user-attachments/assets/5eb18e1d-8603-48fb-8789-93c435941cda" />


## Paso 2: Transacciones ACID

### Objetivo

Implementar transacciones en MongoDB para garantizar la consistencia de las operaciones críticas del Sistema de Gestión de Transporte Escolar. Se realizaron dos pruebas: una transacción exitosa y otra fallida, utilizando `commitTransaction()` y `abortTransaction()`.

### 1. Proceso seleccionado

Se seleccionó el registro de pagos mensuales de los alumnos como proceso crítico del sistema.

Cuando se registra un pago, también se actualiza la información relacionada con el alumno. Ambas operaciones deben confirmarse conjuntamente para evitar inconsistencias en la información.

Para implementar este comportamiento se creó el archivo `scripts/transacciones.js`, utilizando Node.js y el controlador de MongoDB.

### 2. Conexión al Replica Set

Antes de ejecutar las pruebas, se estableció una conexión con el nodo de MongoDB ubicado en el puerto `27018`, perteneciente al Replica Set `rs0`.

La conexión se realizó mediante MongoDB Shell (`mongosh`). El indicador `rs0 [direct: primary]` confirmó que el nodo estaba actuando como PRIMARY.

Esta conexión permitió ejecutar el script `scripts/transacciones.js` y realizar las pruebas de transacciones ACID.

<img width="1112" height="395" alt="Captura de pantalla 2026-10-19 014403" src="https://github.com/user-attachments/assets/b47bf40d-f4e4-4eb0-806b-0753295cf19f" />

### 3. Transacción exitosa

En la primera prueba se inició una transacción mediante `session.startTransaction()`. Dentro de ella se insertó un pago en la colección `pagos` y se incrementó el campo `pagosRegistrados` del alumno correspondiente.

Finalmente, se ejecutó `commitTransaction()` para confirmar los cambios.

El resultado fue satisfactorio: el programa confirmó que el pago se encontraba guardado en la base de datos y que la actualización del alumno se realizó correctamente.

### 4. Transacción fallida

En la segunda prueba se intentó registrar un pago con monto cero, incumpliendo la regla de negocio que establece que el importe debe ser mayor que cero.

Dentro de la transacción se realizaron dos operaciones: la inserción del pago en la colección `pagos` y la actualización del contador `pagosRegistrados` del alumno.

Luego, el programa detectó el incumplimiento de la regla de negocio y ejecutó `abortTransaction()` para cancelar la transacción.

De esta manera, se revirtieron ambas operaciones: el pago inválido no quedó almacenado y el contador del alumno no se incrementó como consecuencia de la transacción fallida.

### 5. Evidencia de ejecución

La siguiente captura muestra la ejecución de ambas pruebas y la comprobación final de los resultados.

Se verificó que el pago válido quedó guardado (`true`), que el pago inválido no quedó almacenado (`false`) y que el contador del alumno pasó de 1 a 2 debido únicamente a la transacción exitosa de esta ejecución.

<img width="777" height="492" alt="image" src="https://github.com/user-attachments/assets/7a18faf9-9c8e-4210-9c38-2e8a9c287284" />

### 6. Conclusión

Las pruebas permitieron comprobar el funcionamiento de las transacciones de MongoDB en dos escenarios diferentes.

En el escenario exitoso, los cambios se confirmaron mediante `commitTransaction()`. En el escenario fallido, la transacción se canceló mediante `abortTransaction()`, revirtiendo tanto la inserción del pago inválido como la actualización del alumno.

De esta manera, se aplicaron transacciones al proceso de registro de pagos del Sistema de Gestión de Transporte Escolar, evitando que una operación incompleta dejara información inconsistente entre las colecciones.


### 3. Seguridad y autenticación

El objetivo de esta etapa fue proteger la base de datos del Sistema de Gestión de Transporte Escolar mediante la configuración de la autenticación y la creación de usuarios con distintos niveles de permisos.

#### 3.1. Verificación del Replica Set

Se verificó el estado de los tres miembros del Replica Set `rs0`. El resultado mostró los siguientes estados:

- **Nodo 1 (27017):** PRIMARY.
- **Nodo 2 (27018):** SECONDARY.
- **Nodo 3 (27019):** ARBITER.

Esta comprobación permitió verificar la configuración y el estado de los miembros del Replica Set.

<img width="886" height="177" alt="image" src="https://github.com/user-attachments/assets/c9d1daac-f72b-4574-9ce2-6d50889388c8" />


#### 3.2. Creación de usuarios

Se crearon dos usuarios para administrar el acceso a MongoDB:

- **adminTransporte:** usuario administrador con el rol `root` sobre la base de datos `admin`.
- **appTransporte:** usuario de aplicación con permisos de lectura y escritura (`readWrite`) únicamente sobre la base de datos `sistema-transporte-escolar`.

Esta separación permite diferenciar las tareas administrativas de las operaciones habituales de la aplicación y limitar los permisos del usuario de aplicación.

<img width="733" height="871" alt="image" src="https://github.com/user-attachments/assets/1525f99b-32d0-4930-8445-0f6262ed4eb8" />
<img width="536" height="75" alt="image" src="https://github.com/user-attachments/assets/9e041e10-49d2-46f7-b137-5b1de56cf419" />



#### 3.3. Configuración de seguridad

Se modificó el archivo `mongod.cfg` para configurar el archivo de clave (`keyFile`) y habilitar la autorización mediante la opción `authorization: enabled`.

El archivo de clave permite la autenticación interna entre los miembros del Replica Set, mientras que la autorización permite controlar el acceso a los recursos de MongoDB según los permisos de cada usuario.

Posteriormente, se verificó la configuración activa y la autenticación de los usuarios creados.

<img width="683" height="820" alt="image" src="https://github.com/user-attachments/assets/42863592-ceba-4327-9508-3796b12bf341" />


#### 3.4. Prueba de acceso sin autenticación

Para comprobar la seguridad, se intentó consultar un documento de la colección `alumnos` sin autenticar previamente al usuario.

MongoDB rechazó la operación y devolvió el error `Unauthorized: Command find requires authentication`.

Este resultado demuestra que no es posible realizar esa consulta sin las credenciales correspondientes.

<img width="886" height="501" alt="image" src="https://github.com/user-attachments/assets/353e9d05-f03d-4c3f-8729-b127fd1ffb9f" />
<img width="886" height="210" alt="image" src="https://github.com/user-attachments/assets/059ddb15-5646-4b3f-8419-42a909ed7fc5" />


#### 3.5. Conclusión

Las pruebas permitieron verificar el estado de los miembros del Replica Set, la creación de usuarios con diferentes permisos y la configuración de la autenticación y autorización de MongoDB.

Además, se comprobó que el sistema rechaza las consultas cuando no se proporcionan credenciales válidas, contribuyendo a proteger la información almacenada en la base de datos.



## 1. Diagrama de Arquitectura

La arquitectura del Sistema de Gestión de Transporte Escolar utiliza Node.js y MongoDB mediante un Replica Set denominado `rs0`, compuesto por dos nodos de datos y un árbitro.

El nodo PRIMARY recibe las operaciones de lectura y escritura, mientras que el nodo SECONDARY mantiene una réplica de los datos. El nodo ARBITER participa en las elecciones para determinar qué nodo asumirá el rol de PRIMARY ante una falla.

**Configuración inicial:**

- **PRIMARY:** puerto `27017`.
- **SECONDARY:** puerto `27018`.
- **ARBITER:** puerto `27019`.

El siguiente diagrama representa la arquitectura implementada y la distribución de los roles.

<img width="442" height="720" alt="Captura de pantalla 2026-10-21 222608" src="https://github.com/user-attachments/assets/bff89604-659d-42dc-b8a8-b57ebc91399b" />




## 2. Bitácora del Failover

Se realizó una prueba de alta disponibilidad sobre el Replica Set `rs0`, compuesto por dos nodos de datos y un árbitro.

**Estado inicial:** el nodo `27017` actuaba como PRIMARY, el nodo `27018` como SECONDARY y el nodo `27019` como ARBITER.

**Caída del nodo principal:** se detuvo el proceso correspondiente al nodo `27017` para simular una falla.

**Elección del nuevo principal:** el nodo `27018` asumió el rol de PRIMARY mediante el mecanismo de elección del Replica Set.

**Verificación:** mediante MongoDB Shell se comprobó que `27018` era el nuevo PRIMARY y que `27017` figuraba como SECONDARY.

La prueba permitió observar el mecanismo de elección automática ante la caída del nodo principal.

**Evidencias de la prueba:**

**Estado inicial del Replica Set:**

Se verificó que el nodo `27017` actuaba como PRIMARY, el nodo `27018` como SECONDARY y el nodo `27019` como ARBITER.

[PEGAR AQUÍ LAS DOS PARTES DE LA CAPTURA DEL ESTADO INICIAL]

**Ejecución del script de failover:**

Se ejecutó el script `failover.js`, conectado al Replica Set `rs0`, para realizar inserciones cada tres segundos. Esto permitió comprobar el funcionamiento de las inserciones durante la prueba de alta disponibilidad.

[PEGAR AQUÍ LA CAPTURA DE LA EJECUCIÓN DE failover.js]

**Detención del nodo principal:**

Se detuvo el proceso correspondiente al nodo principal para simular una falla durante la prueba.

[PEGAR AQUÍ LA CAPTURA DEL COMANDO taskkill]

**Verificación del nuevo nodo principal:**

Después de la caída del nodo principal, se comprobó que el nodo `27018` asumió el rol de PRIMARY, mientras que el nodo `27017` pasó a ser SECONDARY.

[PEGAR AQUÍ LA CAPTURA DE db.hello() QUE MUESTRA EL PRIMARY EN 27018]


## 3. Transacciones ACID

Se seleccionó el registro de pagos mensuales como proceso crítico del Sistema de Gestión de Transporte Escolar, ya que requiere mantener la consistencia entre las colecciones `pagos` y `alumnos`.

**Código de la transacción:**

Se creó el archivo `scripts/transacciones.js` utilizando Node.js y el controlador de MongoDB. El script implementa dos pruebas para demostrar el funcionamiento de las transacciones ACID.

**Transacción exitosa:** se registra un pago y se actualiza el contador de pagos del alumno. Los cambios se confirman mediante `commitTransaction()`.

**Transacción fallida:** se intenta registrar un pago con monto cero, incumpliendo la regla de negocio que establece que el importe debe ser mayor que cero. El error activa `abortTransaction()`, cancelando los cambios realizados durante la transacción.

**Código comentado del script:**

// Importar MongoClient para conectarse a MongoDB.
const { MongoClient } = require("mongodb");

// URI de conexión al Replica Set rs0.
// Se indican los tres miembros para permitir la conexión
// al Replica Set aunque cambie el nodo PRIMARY.
const uri = "mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/?replicaSet=rs0";

// Crear el cliente que permitirá conectarse a MongoDB.
const client = new MongoClient(uri);

// Función principal que ejecuta las pruebas de transacciones ACID.
async function ejecutarTransacciones() {
    try {
        // Establecer la conexión con el Replica Set.
        await client.connect();

        console.log("Conectado al Replica Set rs0");

        // Seleccionar la base de datos del proyecto.
        const db = client.db("sistema-transporte-escolar");

        // Obtener las colecciones que participan en las transacciones.
        const pagos = db.collection("pagos");
        const alumnos = db.collection("alumnos");

        // ==========================================
        // PRUEBA 1: TRANSACCIÓN EXITOSA
        // ==========================================

        // Crear una sesión para agrupar las operaciones
        // que deben confirmarse como parte de una misma transacción.
        const sessionExitosa = client.startSession();

        try {
            console.log("\n--- PRUEBA 1: TRANSACCIÓN EXITOSA ---");

            // Iniciar la transacción dentro de la sesión.
            // Las operaciones asociadas a esta sesión se ejecutan
            // dentro de la transacción hasta confirmar o cancelar.
            sessionExitosa.startTransaction();

            // Preparar los datos del pago que se va a registrar.
            const pago = {
                _id: "PAG-ACID-003",
                responsable_id: "RES001",
                alumno_id: "ALU001",
                periodo: "Diciembre 2026",
                monto: 95000,
                fechaPago: new Date(),
                metodoPago: "Transferencia",
                estado: "Pagado"
            };

            // Operación 1: insertar el pago dentro de la transacción.
            // La opción session vincula la operación a la sesión activa.
            await pagos.insertOne(pago, {
                session: sessionExitosa
            });

            // Operación 2: incrementar el contador de pagos del alumno.
            // Se utiliza la misma sesión para que ambas operaciones
            // pertenezcan a la misma transacción.
            await alumnos.updateOne(
                { _id: "ALU001" },
                {
                    $inc: {
                        pagosRegistrados: 1
                    }
                },
                {
                    session: sessionExitosa,
                    upsert: false
                }
            );

            // Confirmar la transacción.
            // Si ambas operaciones se ejecutaron correctamente,
            // los cambios se confirman conjuntamente.
            await sessionExitosa.commitTransaction();

            console.log("Pago registrado correctamente.");
            console.log("Cambios confirmados con commitTransaction().");

        } catch (error) {
            // Si ocurre un error antes de confirmar la transacción,
            // intentar cancelar sus operaciones pendientes.
            await sessionExitosa.abortTransaction();

            console.log(
                "Error en la transacción exitosa:",
                error.message
            );
            console.log("Se cancelaron los cambios.");

        } finally {
            // Cerrar la sesión independientemente de si la prueba
            // terminó correctamente o se produjo un error.
            await sessionExitosa.endSession();
        }

        // ==========================================
        // PRUEBA 2: TRANSACCIÓN FALLIDA
        // ==========================================

        // Crear una sesión independiente para la segunda prueba.
        // De este modo, la transacción fallida no comparte
        // su sesión con la transacción exitosa.
        const sessionFallida = client.startSession();

        try {
            console.log("\n--- PRUEBA 2: TRANSACCIÓN FALLIDA ---");

            // Iniciar la segunda transacción.
            sessionFallida.startTransaction();

            // Preparar un pago inválido para comprobar
            // el cumplimiento de la regla de negocio.
            const pagoInvalido = {
                _id: "PAG-ACID-004",
                responsable_id: "RES001",
                alumno_id: "ALU001",
                periodo: "Enero 2027",
                monto: 0,
                fechaPago: new Date(),
                metodoPago: "Transferencia",
                estado: "Pagado"
            };

            // Operación 1: insertar el pago dentro de la transacción.
            // La inserción todavía no está confirmada definitivamente.
            await pagos.insertOne(pagoInvalido, {
                session: sessionFallida
            });

            // Operación 2: actualizar el contador del alumno
            // utilizando la misma sesión de la transacción.
            await alumnos.updateOne(
                { _id: "ALU001" },
                {
                    $inc: {
                        pagosRegistrados: 1
                    }
                },
                {
                    session: sessionFallida,
                    upsert: false
                }
            );

            // Validar la regla de negocio después de las operaciones.
            // El monto debe ser mayor que cero para aceptar el pago.
            if (pagoInvalido.monto <= 0) {
                // Lanzar un error para interrumpir el proceso
                // y ejecutar el bloque catch.
                throw new Error(
                    "El monto del pago debe ser mayor que cero."
                );
            }

            // Confirmar únicamente si las operaciones terminaron
            // correctamente y se cumplieron las reglas de negocio.
            await sessionFallida.commitTransaction();

        } catch (error) {
            // Ante el error, cancelar las operaciones de la transacción.
            // Esto revierte tanto la inserción del pago como
            // la actualización del contador del alumno.
            await sessionFallida.abortTransaction();

            console.log("Error esperado:", error.message);
            console.log(
                "Transacción cancelada con abortTransaction()."
            );
            console.log(
                "El pago y la actualización del alumno fueron revertidos."
            );

        } finally {
            // Liberar la sesión de la segunda transacción,
            // tanto si terminó correctamente como si falló.
            await sessionFallida.endSession();
        }

        // ==========================================
        // COMPROBACIÓN FINAL
        // ==========================================

        // Consultar si el pago válido quedó almacenado.
        console.log("\n--- COMPROBACIÓN FINAL ---");

        const pagoExitoso = await pagos.findOne({
            _id: "PAG-ACID-003"
        });

        // Consultar si el pago inválido quedó almacenado.
        const pagoFallido = await pagos.findOne({
            _id: "PAG-ACID-004"
        });

        // Consultar el contador de pagos del alumno.
        const alumno = await alumnos.findOne(
            { _id: "ALU001" },
            {
                projection: {
                    pagosRegistrados: 1
                }
            }
        );

        // Mostrar los resultados de las comprobaciones.
        console.log(
            "Pago exitoso guardado:",
            pagoExitoso !== null
        );

        console.log(
            "Pago fallido guardado:",
            pagoFallido !== null
        );

        console.log(
            "Contador de pagos del alumno:",
            alumno?.pagosRegistrados ?? "Campo no existente"
        );

    } catch (error) {
        // Capturar errores generales, por ejemplo,
        // problemas al conectarse o acceder a la base de datos.
        console.error("Error general:", error.message);

    } finally {
        // Cerrar la conexión del cliente al finalizar el proceso,
        // incluso si se produce un error general.
        await client.close();
    }
}

// Ejecutar la función principal.
ejecutarTransacciones();

**Evidencia de ejecución:**

La prueba confirmó que el pago válido quedó almacenado y que el pago inválido no se guardó. También se verificó el contador de pagos del alumno.

[PEGAR AQUÍ LA CAPTURA DE LA EJECUCIÓN DEL SCRIPT]



## 4. Reporte de Securización

Se configuró MongoDB para controlar el acceso a la base de datos mediante autenticación y autorización.

**Configuración de seguridad:** se modificó el archivo `mongod.cfg` para configurar el `keyFile` y habilitar la opción `authorization: enabled`. El archivo de clave permite la autenticación interna entre los miembros del Replica Set.

**Usuarios creados:**

- **adminTransporte:** usuario administrador con el rol `root` sobre la base de datos `admin`.
- **appTransporte:** usuario de aplicación con el rol `readWrite` sobre la base de datos `sistema-transporte-escolar`.

La separación de roles permite diferenciar las tareas administrativas de las operaciones habituales de la aplicación.

**Verificación de seguridad:** se comprobó la configuración activa y la autenticación de los usuarios creados.

**Prueba de acceso sin autenticación:** se intentó consultar un documento de la colección `alumnos` sin autenticarse previamente. MongoDB rechazó la operación con el error `Unauthorized: Command find requires authentication`.

**Justificación de seguridad:** habilitar la autorización reduce los riesgos asociados a configuraciones que permiten el acceso sin autenticación. La separación de roles limita los privilegios de la aplicación, mientras que el `keyFile` permite autenticar las comunicaciones internas entre los miembros del Replica Set.

**Evidencias de seguridad:**

**Creación de usuarios:**

Se crearon los usuarios `adminTransporte` y `appTransporte` con roles diferenciados según sus funciones.

[PEGAR AQUÍ LA CAPTURA DE LA CREACIÓN DE LOS DOS USUARIOS]

**Configuración de seguridad:**

Se verificó que MongoDB tuviera habilitadas la autorización y la autenticación interna mediante `keyFile`.

[PEGAR AQUÍ LA CAPTURA DE LA CONFIGURACIÓN DE SEGURIDAD]

**Verificación del acceso sin autenticación:**

Se comprobó que MongoDB rechazara una consulta a la colección `alumnos` cuando no se proporcionaban credenciales.

[PEGAR AQUÍ LA CAPTURA DEL ERROR Unauthorized]

**Estado del Replica Set:**

Se verificó el estado de los nodos de datos y del árbitro con la configuración de seguridad activa.

[PEGAR AQUÍ LA CAPTURA DEL ESTADO DE LOS TRES NODOS]



## 5. Conclusión

En esta fase se trabajó sobre la alta disponibilidad de MongoDB, la consistencia de las operaciones mediante transacciones y la protección de la base de datos mediante autenticación y autorización.

Las pruebas permitieron comprobar la elección de un nuevo PRIMARY ante la caída del nodo principal, ejecutar transacciones exitosas y fallidas y verificar que MongoDB rechaza consultas realizadas sin autenticación.

De esta manera, se documentaron las medidas de resiliencia, consistencia y seguridad aplicadas al Sistema de Gestión de Transporte Escolar.
