// Script de prueba de alta disponibilidad (failover).
// Inserta un documento cada 3 segundos en el Replica Set rs0.
// Si el PRIMARY cae, espera a que se elija uno nuevo y reintenta
// la MISMA inserción, sin duplicar documentos ni saltear números.

// Importar MongoClient para conectarse a MongoDB.
const { MongoClient } = require("mongodb");

// Credenciales opcionales: solo hacen falta si la autenticación está habilitada.
// Se leen de variables de entorno para no escribir contraseñas en el código.
//   PowerShell:  $env:MONGO_USER="appTransporte"; $env:MONGO_PASS="tu_clave"
const usuario = process.env.MONGO_USER;
const clave = process.env.MONGO_PASS;
const credenciales = usuario
  ? `${encodeURIComponent(usuario)}:${encodeURIComponent(clave)}@`
  : "";
const authSource = usuario ? "&authSource=sistema-transporte-escolar" : "";

// URI con los tres miembros, para seguir conectado aunque cambie el PRIMARY.
const uri =
  `mongodb://${credenciales}127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019` +
  `/sistema-transporte-escolar?replicaSet=rs0${authSource}`;

// Espera una cantidad de milisegundos.
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Devuelve la hora actual como texto (HH:MM:SS).
const hora = () => new Date().toLocaleTimeString("es-AR", { hour12: false });

// Bandera para detener el script ordenadamente con Ctrl + C.
let detener = false;
process.on("SIGINT", () => {
  // Segundo Ctrl + C: salir de inmediato (por si hay una inserción en espera).
  if (detener) process.exit(0);
  detener = true;
  console.log("\nDeteniendo el script... (Ctrl + C otra vez para salir ya)");
});

async function main() {
  // serverSelectionTimeoutMS corto: si no hay PRIMARY, falla rápido
  // y el script lo informa en pantalla en vez de quedar en silencio.
  // writeConcern w:1: la escritura se confirma cuando la recibe el PRIMARY.
  // En un Replica Set con árbitro, si cae el nodo de datos no hay mayoría de
  // nodos con datos y una escritura con w:"majority" quedaría esperando.
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    writeConcern: { w: 1 },
  });
  await client.connect();
  console.log("Conectado al Replica Set rs0");

  const coleccion = client
    .db("sistema-transporte-escolar")
    .collection("prueba_failover");

  // Identificador de esta corrida: evita chocar con documentos de pruebas anteriores.
  const corrida = Date.now();
  let numero = 1;

  console.log("Iniciando inserciones cada 3 segundos...");
  console.log("Presioná Ctrl + C para detener el script.\n");

  while (!detener) {
    // Un solo documento por número, con un _id único y fijo.
    const documento = {
      _id: `FAILOVER-${corrida}-${numero}`,
      mensaje: "Inserción de prueba de alta disponibilidad",
      numero,
      fecha: new Date(),
    };

    // Se reintenta el MISMO documento hasta que quede guardado.
    // Nunca hay dos intentos en paralelo: el bucle espera cada resultado.
    let guardado = false;
    while (!guardado && !detener) {
      try {
        await coleccion.insertOne(documento);
        guardado = true;
        console.log(`Inserción ${numero} realizada correctamente - ${hora()}`);
      } catch (error) {
        if (error.code === 11000) {
          // El documento ya estaba guardado: la escritura llegó antes de la caída
          // y solo se perdió la confirmación. No se duplicó nada.
          guardado = true;
          console.log(
            `Inserción ${numero} confirmada (ya se había guardado antes de la caída) - ${hora()}`
          );
        } else if (error.code === 13 || error.code === 18) {
          // Problema de autenticación o permisos: reintentar no lo arregla.
          throw error;
        } else {
          // Sin PRIMARY disponible (elección en curso): esperar y reintentar.
          console.log(
            `Sin PRIMARY disponible, esperando la elección de uno nuevo... - ${hora()}`
          );
          await esperar(1000);
        }
      }
    }

    numero++;
    await esperar(3000);
  }

  await client.close();
  console.log("Script detenido.");
}

main().catch((error) => {
  console.error("Error general:", error.message);
  process.exit(1);
});