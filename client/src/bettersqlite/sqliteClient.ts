import { SQLite } from "./database/DAO";
import { Client } from "../core/Client";
import { PrnInfoBetterSqlite } from "./controllers/PrnInfoBetterSqlite";
import { PrnIndicesBetterSqlite } from "./controllers/PrnIndicesBetterSqlite";
import path from "path";
import logger from "../logger";
import { ProcessData } from "../core/ProcessData";
import config from "../config/ConfigProvider";

if (require.main == module) {
	(async () => {
		try {
			const file = path.join(__dirname, "..", "..", "..", `sqlite.log`);
			logger.enableWrite(file);
			const dao = new SQLite();
			const prnInfo = new PrnInfoBetterSqlite(dao);
			await prnInfo.createTable();
			const prnIndices = new PrnIndicesBetterSqlite(dao);
			await prnIndices.createTable();
			const processData = new ProcessData(prnInfo, prnIndices);

			const clientConfig = config.get('client');
			//const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });
			const client = new Client(processData,  { 
				port: clientConfig.port, 
				host: clientConfig.host 
			});

			client.run(() => {
				logger.log("Client is running");
			});
		} catch (err) {
			logger.exception(err);
		}
	})();
}
