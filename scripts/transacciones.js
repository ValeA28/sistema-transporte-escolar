// Script de transacciones ACID: registro de pagos mensuales.
// Prueba dos escenarios sobre el Replica Set rs0:
//   1. Transacción exitosa: se registra un pago y se actualiza el contador
//      de pagos del alumno. Ambos cambios se confirman juntos (commit).
//   2. Transacción fallida: se intenta registrar un pago con monto cero.
//      Se viola una regla de negocio y se cancelan todos los cambios (abort).
// Antes y después de cada escenario se muestra el estado de los datos.

// Importar MongoClient para conectarse a MongoDB.
const { MongoClient } = require("mongodb");

// Credenciales del usuario de aplicación: se leen de variables de entorno
// para no escribir contraseñas en el código.
//   PowerShell:  $env:MONGO_USER="appTransporte"
//                $env:MONGO_PASS="tu_clave"
const usuario = process.env.MONGO_USER;
const clave = process.env.MONGO_PASS;
const credenciales = usuario
    ? `${encodeURIComponent(usuario)}:${encodeURIComponent(clave)}@`
    : "";
const authSource = usuario ? "&authSource=sistema-transporte-escolar" : "";

// URI de conexión al Replica Set rs0.
// Se indican los tres miembros para permitir la conexión
// al Replica Set aunque cambie el nodo PRIMARY.
const uri =
    `mongodb://${credenciales}127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019` +
    `/sistema-transporte-escolar?replicaSet=rs0${authSource}`;

// Crear el cliente que permitirá conectarse a MongoDB.
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

// Muestra el estado de los datos relacionados con un pago:
// si el pago existe y cuánto vale el contador de pagos del alumno.
// Devuelve el valor del contador (si el campo todavía no existe, vale 0).
async function mostrarEstado(titulo, pagos, alumnos, idPago) {
    const pago = await pagos.findOne({ _id: idPago });
    const alumno = await alumnos.findOne(
        { _id: "ALU001" },
        { projection: { pagosRegistrados: 1 } }
    );
    const contador = alumno?.pagosRegistrados ?? 0;

    console.log(`${titulo}:`);
    console.log(`  Pago ${idPago} guardado:`, pago !== null);
    console.log("  Contador de pagos del alumno ALU001:", contador);

    return contador;
}

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

        // Identificadores únicos para esta ejecución.
        // Así el script se puede repetir sin chocar con los pagos
        // creados en ejecuciones anteriores.
        const corrida = Date.now();
        const idPagoExitoso = `PAG-ACID-${corrida}-1`;
        const idPagoInvalido = `PAG-ACID-${corrida}-2`;

        // ==========================================
        // PRUEBA 1: TRANSACCIÓN EXITOSA
        // ==========================================

        console.log("\n--- PRUEBA 1: TRANSACCIÓN EXITOSA ---");

        // Estado de los datos antes de la transacción.
        const contadorInicial = await mostrarEstado(
            "Estado ANTES",
            pagos,
            alumnos,
            idPagoExitoso
        );

        // Crear una sesión para agrupar las operaciones
        // que deben confirmarse como parte de una misma transacción.
        const sessionExitosa = client.startSession();

        try {
            // Iniciar la transacción dentro de la sesión.
            // Las operaciones asociadas a esta sesión se ejecutan
            // dentro de la transacción hasta confirmar o cancelar.
            sessionExitosa.startTransaction();

            // Preparar los datos del pago que se va a registrar.
            const pago = {
                _id: idPagoExitoso,
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

        // Estado de los datos después de la transacción exitosa.
        await mostrarEstado(
            "Estado DESPUÉS",
            pagos,
            alumnos,
            idPagoExitoso
        );

        // ==========================================
        // PRUEBA 2: TRANSACCIÓN FALLIDA
        // ==========================================

        console.log("\n--- PRUEBA 2: TRANSACCIÓN FALLIDA ---");

        // Estado de los datos antes de la transacción fallida.
        await mostrarEstado(
            "Estado ANTES",
            pagos,
            alumnos,
            idPagoInvalido
        );

        // Crear una sesión independiente para la segunda prueba.
        // De este modo, la transacción fallida no comparte
        // su sesión con la transacción exitosa.
        const sessionFallida = client.startSession();

        try {
            // Iniciar la segunda transacción.
            sessionFallida.startTransaction();

            // Preparar un pago inválido para comprobar
            // el cumplimiento de la regla de negocio.
            const pagoInvalido = {
                _id: idPagoInvalido,
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

        // Estado de los datos después de la transacción fallida.
        const contadorFinal = await mostrarEstado(
            "Estado DESPUÉS",
            pagos,
            alumnos,
            idPagoInvalido
        );

        // ==========================================
        // RESUMEN FINAL
        // ==========================================

        // El contador debe haber aumentado en 1 por la transacción
        // exitosa, y la transacción fallida no debe haber cambiado nada.
        console.log("\n--- RESUMEN FINAL ---");
        console.log("Contador al inicio:", contadorInicial);
        console.log("Contador al final:", contadorFinal);
        console.log(
            "Aumento del contador:",
            contadorFinal - contadorInicial
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