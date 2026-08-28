import path from "node:path";
import { MessageHandler } from "./clients/MessageHandler";
import { WebsocketClient } from "./clients/WebsocketClient";
import logger from "./logger";
import { ProcessData } from "./ProcessData";
import { MessageBuffer } from "./clients/MessageBuffer";
import { IPrnIndicesController, IPrnInfoController } from "./adapter/out/store";
import { PrnIndicesBetterSqlite, PrnInfoBetterSqlite, SQLite } from "./adapter/out/store/sqlite";
import { connectMongoDB } from "./adapter/out/store/mongodb/model/connection";
import { PrnInfoMongo } from "./adapter/out/store/mongodb/PrnInfoMongo";
import { PrnIndicesMongo } from "./adapter/out/store/mongodb/PrnIndicesMongo";

let prnInfoController: IPrnInfoController;
let prnIndicesController: IPrnIndicesController;

async function initDatabase() {
    const selectedDB = process.env.DB;

    if (!selectedDB) {
        logger.log('Coun\'t find the DB variable');
        process.exit(1);
    }

    const db = selectedDB.toLocaleLowerCase();

    if (db === 'sqlite') {
        const dao = new SQLite();
        prnInfoController = new PrnInfoBetterSqlite(dao);
        prnIndicesController = new PrnIndicesBetterSqlite(dao);
    } else if (db === 'mongo') {
        await connectMongoDB()
        prnInfoController = new PrnInfoMongo();
        prnIndicesController = new PrnIndicesMongo()
    } else {
        logger.log('Unknown DB env variable, use sqlite or mongo');
        process.exit(1);
    }

    await prnIndicesController.initialize();
    await prnInfoController.initialize();
}

async function start() {
    try {
        const file = path.join(__dirname, "..", "..", `sqlite.log`);
        console.log(file);
        logger.enableWrite(file);

        await initDatabase();

        const processData = new ProcessData(
            prnInfoController,
            prnIndicesController,
        );

        // const client = new WebSocketClient(processData);

        const messageHandler = new MessageHandler(
            processData,
            new MessageBuffer('\n')
        );

        // const client = new NewSocketClient({
        //     host: 'localhost',
        //     port: 2108
        // });

        //const client = new WebsocketClient('ws://192.168.3.23:4312');
        const client = new WebsocketClient('ws://localhost:4312');

        client.onMessage(messageHandler.handle.bind(messageHandler));

        client.subscribe('custom');
        await client.start();
    } catch (err: any) {
        logger.exception(err);
    }
}

start();
