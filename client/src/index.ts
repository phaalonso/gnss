
import path from "path";
import { Application } from "./Application";
import { PrnIndicesBetterSqlite } from "./bettersqlite/controllers/PrnIndicesBetterSqlite";
import { PrnInfoBetterSqlite } from "./bettersqlite/controllers/PrnInfoBetterSqlite";
import { SQLite } from "./bettersqlite/database/DAO";
import { MessageHandler } from "./clients/MessageHandler";
import { NewSocketClient } from "./clients/NewSocketClient";
import { NewWebsocketClient } from "./clients/NewWebsocketClient";
import { WebSocketClient } from "./clients/WebSocketClient";
import { IPrnIndicesController, IPrnInfoController } from "./controller";
import logger from "./logger";
import { PrnIndicesMongo } from "./mongodb/controller/PrnIndicesMongo";
import { PrnInfoMongo } from "./mongodb/controller/PrnInfoMongo";
import { connect } from "./mongodb/database/connection";
import { ProcessData } from "./ProcessData";

let prnInfoController: IPrnInfoController;
let prnIndicesController: IPrnIndicesController;


async function initDatabase() {
    const selectedDB = process.env.DB.toLocaleLowerCase();

    switch(selectedDB) {
        case 'sqlite':
            const dao = new SQLite();
            const prnInfo = new PrnInfoBetterSqlite(dao);
            await prnInfo.createTable();
            prnInfoController = prnInfo;

            const prnIndices = new PrnIndicesBetterSqlite(dao);
            await prnIndices.createTable();
            prnIndicesController = prnIndices;
            break;
        case 'mongo':
            await connect()
            prnInfoController = new PrnInfoMongo();
            prnIndicesController = new PrnIndicesMongo()
            break;
        default:
            logger.log('Unknown DB env variable, use sqlite or mongo');
            process.exit(1);
    }
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

        //TODO: Fazer clientes serem compativeis para passar a utilizar `Application`
        // const client = new WebSocketClient(processData);

        const messageHandler = new MessageHandler(
            processData,
            '\n'
        );

        // const client = new NewSocketClient({
        //     host: 'localhost',
        //     port: 2108
        // });

        const client = new NewWebsocketClient('ws://localhost:4312')

        client.onMessage(messageHandler.handle.bind(messageHandler));
        
        client.subscribe('custom');
        await client.start();

        // const app = new Application(
        //     prnInfoController,
        //     prnIndicesController,
        // );

        // app.run(() => {
        //     logger.log('Client is running');
        // });

    } catch (err) {
        logger.exception(err);
    }
}

start();