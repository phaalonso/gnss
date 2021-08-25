import { SQLite } from "./database/DAO";
import path from 'path';
import fs from 'fs';
import logger from "../logger";

interface IBackupConfig {
	folder: string;
	backupInterval: number;
	//uploadInterval: number;
}

export class BackupService {
	constructor(
		private dao: SQLite,
		private config: IBackupConfig,
	) {}

	private timeout: NodeJS.Timeout;

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

			logger.log(`Backup realizado! Total de páginas ${res.totalPages}, páginas restantes ${res.remainingPages}`);
		} catch(err) {
			logger.log(`Error while making backup for ${date}`);
		}
	}

	public async sendToServer() {
		try {
			const listFile = await fs.promises.readdir(this.config.folder);

			for (const file of listFile) {
				//Uplaod to server
			}
		} catch (err) {
			logger.exception(err, 'sendToServer');
		}
	}

	public hasAutoBackup() {
		return this.timeout != undefined;
	}

	public async initAutoBackup() {
		const intervalFn = async () => {
			await this.backup(new Date());
			await this.sendToServer();
		};

		this.timeout = setInterval(intervalFn.bind(this), this.config.backupInterval);
	}

	public async stopAutoBackup() {
		if (this.timeout) {
			clearInterval(this.timeout);
		} else {
			throw Error("Auto backup is not initialized");
		}
	}
}
