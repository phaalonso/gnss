import { PrnIndicesSqlite } from "./controller/PrnIndicesSqlite";
import { PrnInfoSqlite } from "./controller/PrnInfoSqlite";
import { ProcessData } from "../core/processData";
import { SQLite } from "./database/DAO";
import { Client } from "../core/Client";
import path from 'path';
import logger from "../logger";


if (require.main == module) {
	(async () => {
			try {
				const file = path.join(__dirname, '..', '..', '..', `sqlite.log`);
				logger.enableWrite(file)
				const dao = new SQLite();
				const prnInfo = new PrnInfoSqlite(dao);
				await prnInfo.createTable();
				const prnIndices = new PrnIndicesSqlite(dao)
				await prnIndices.createTable();
				const processData = new ProcessData(prnInfo, prnIndices);

				const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });
				//const client = new Client(processData,  { port: 2108, host: 'localhost' });

				client.run(() => {
					logger.log('Client is running');
				})
			}  catch(err) {
				logger.exception(err);
			}
	})()
}
