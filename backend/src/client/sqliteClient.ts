import { PrnIndicesSqlite } from "../controller/PrnIndices";
import { PrnInfoSqlite } from "../controller/PrnInfo";
import { connect } from "../database/mongodb/connection";
import { ProcessData } from "../core/processData";
import { Client } from "./Client";
import { SQLite } from "../database/sqlite/DAO";


if (require.main == module) {
	connect().then(() => {
		const dao = new SQLite();
		const prnInfo = new PrnInfoSqlite(dao);
		const prnIndices = new PrnIndicesSqlite(dao)
		const processData = new ProcessData(prnInfo, prnIndices);

		const client = new Client(processData);

		client.run(() => {
			console.log('Client is running');
		})
	}).catch((err) => {
		console.log(err);
	});
}