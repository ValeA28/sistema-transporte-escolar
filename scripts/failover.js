const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/?replicaSet=rs0";

const client = new MongoClient(uri);

async function iniciar() {
    try {
        await client.connect();

        console.log("Conectado al Replica Set rs0");
        console.log("Iniciando inserciones cada 3 segundos...");
        console.log("Presioná Ctrl + C para detener el script.\n");

        const db = client.db("sistema-transporte-escolar");
        const coleccion = db.collection("prueba_failover");

        let contador = 1;

        setInterval(async () => {
            try {
                const documento = {
                    _id: `FAIL-${contador}`,
                    mensaje: "Prueba de alta disponibilidad",
                    numero: contador,
                    fecha: new Date()
                };

                await coleccion.insertOne(documento);

                console.log(
                    `Inserción ${contador} realizada correctamente - ${new Date().toLocaleTimeString()}`
                );

                contador++;
            } catch (error) {
                console.log("Error durante la inserción:", error.message);
            }
        }, 3000);

    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

iniciar();
