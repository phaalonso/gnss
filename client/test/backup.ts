import { BackupService } from "../src/bettersqlite/BackupService";
import { SQLite } from "../src/bettersqlite/database/DAO";
import path from 'path';
import { UploadService } from "../src/bettersqlite/UploadService";

async function backupTest() {
	const dao = new SQLite();
	const ftp = new UploadService({
		host: 'localhost',
		port: 21,
		user: 'teste',
		password: 'teste',
		backupPath: '~/backup/',
	});

	const backupService = new BackupService(dao, { 
		folder: path.join(__dirname, '..', 'backups'),
		backupInterval: 60000,
	}, ftp);

	//await backupService.backup(new Date());
	//await backupService.sendToServer();
	
	//await backupService.initAutoBackup();
	await backupService.sendToServer();
}

backupTest();
