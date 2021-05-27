import { PrnIndicesSqlite } from "../controller/PrnIndices";
import { PrnInfoSqlite } from "../controller/PrnInfo";
import { connect } from "../database/mongodb/connection";
import { ProcessData } from "../core/processData";
import { Client } from "./Client";
import { SQLite } from "../database/sqlite/DAO";


(async () => {
	if (require.main == module) {
		connect().then(() => {
			const dao = new SQLite();
			const prnInfo = new PrnInfoSqlite(dao);
			// @ts-ignore
			await prnInfo.createTable();
			const prnIndices = new PrnIndicesSqlite(dao)
			// @ts-ignore
			await prnIndices.createTable();
			const processData = new ProcessData(prnInfo, prnIndices);

			const client = new Client(processData);

			client.run(() => {
				console.log('Client is running');
			})
		}).catch((err) => {
			console.log(err);
		});
	}
})()