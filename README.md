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
