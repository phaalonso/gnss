import { SQLite } from "./database/DAO";
import path from 'path';
import fs from 'fs';
import logger from "../logger";

interface IBackupConfig {
	folder: string;
	//backupInterval: number;
}

export class BackupService {
	private backupList;

	constructor(
		private dao: SQLite,
		private config: IBackupConfig,
	) {}

	public async backup(date: Date) {
		try {
			if (!fs.existsSync(this.config.folder)) {
				fs.mkdirSync(this.config.folder);
			}

			const destination = path.join(
				this.config.folder, 
				`backup-${date.toISOString()}.db`
			);

			console.log(destination);

			const res = await this.dao.con.backup(destination)

			console.log(res);
		} catch(err) {
			logger.log(`Error while making backup for ${date}`);
		}
	}

	private async sendToServer() {

	}

	private async initAutoBackup() {
	}
}
