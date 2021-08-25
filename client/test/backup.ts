import { SQLite } from "../src/bettersqlite/database/DAO";

async function backupTest() {
	const dao = new SQLite();

	await dao.backupData();
}

backupTest();
