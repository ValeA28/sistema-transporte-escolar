# Sistema de Gestión de Transporte Escolar

## 1. Descripción del proyecto

El proyecto consiste en el diseño de un sistema de gestión para un servicio de transporte escolar. El sistema busca centralizar la información básica de alumnos, responsables, choferes, vehículos, horarios y pagos.

Actualmente, este tipo de servicios suele realizarse de forma manual o mediante mensajes, lo que puede generar desorden, pérdida de información y dificultades para el control de pagos y horarios.

La base de datos será el componente principal del sistema, ya que permitirá almacenar y consultar de manera organizada toda la información necesaria para administrar el servicio de forma eficiente y sin duplicación de datos.

### Funcionalidades principales

El sistema permitirá:

1. Registrar padres, tutores o responsables.
2. Dar de alta alumnos asociados a un responsable.
3. Registrar choferes.
4. Registrar vehículos.
5. Registrar y consultar horarios.
6. Registrar y consultar pagos.
7. Consultar información general del servicio, como alumnos activos, responsables, pagos pendientes, choferes y vehículos disponibles.

---

# 2. Modelo conceptual orientado a documentos

Para el diseño de la base de datos se propone utilizar MongoDB, un sistema de gestión de bases de datos NoSQL orientado a documentos.

Las principales colecciones propuestas son:

* `responsables`
* `alumnos`
* `choferes`
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

## Colección `choferes`

La colección `choferes` almacenará los datos de los conductores que prestan el servicio de transporte escolar.

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

El campo `estado` permite indicar si el chofer se encuentra actualmente habilitado para prestar el servicio.

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
