import { BackupService } from "../src/bettersqlite/BackupService";
import { SQLite } from "../src/bettersqlite/database/DAO";
import path from 'path';

async function backupTest() {
	const dao = new SQLite();
	const backupService = new BackupService(dao, { 
		folder: path.join(__dirname, '..', 'backups') 
	});

	await backupService.backup(new Date());
}

backupTest();
