// Script de sembrado de datos.
// Borra el contenido de cada colección y la vuelve a cargar con los
// archivos JSON de la carpeta scripts/data/ (un archivo por colección).
// El nombre del archivo es el nombre de la colección: alumnos.json -> alumnos.
// Sirve para dejar la base en su estado inicial antes de cada prueba.

// Importar MongoClient para conectarse a MongoDB.
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Credenciales: se leen de variables de entorno para no escribir
// contraseñas en el código.
//   PowerShell:  $env:MONGO_USER="appTransporte"
//                $env:MONGO_PASS="tu_clave"
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

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  console.log("Conectado al Replica Set rs0");

  const db = client.db("sistema-transporte-escolar");

  // Ruta relativa a este archivo: funciona en cualquier computadora.
  const carpeta = path.join(__dirname, "data");
  const archivos = fs.readdirSync(carpeta).filter((a) => a.endsWith(".json"));

  for (const archivo of archivos) {
    const nombre = path.basename(archivo, ".json");

    // Leer el JSON (se quita el BOM que algunos editores de Windows agregan).
    const texto = fs
      .readFileSync(path.join(carpeta, archivo), "utf8")
      .replace(/^\uFEFF/, "");
    const documentos = JSON.parse(texto);

    // Vaciar la colección y cargar los documentos del archivo.
    const coleccion = db.collection(nombre);
    await coleccion.deleteMany({});
    const resultado = await coleccion.insertMany(documentos);

    console.log(`${nombre}: ${resultado.insertedCount} documentos cargados`);
  }

  await client.close();
  console.log("Sembrado finalizado.");
}

main().catch((error) => {
  console.error("Error en el sembrado:", error.message);
  process.exit(1);
});