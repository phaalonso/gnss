import { SQLite } from "./database/DAO";
import path from 'path';
import fs from 'fs';
import logger from "../logger";
import { FileInfo, UploadService } from "./UploadService";

interface IBackupConfig {
	folder: string;
	backupInterval: number;
	//uploadInterval: number;
}

export class BackupService {
	private timeout: NodeJS.Timeout;

	constructor(
		private dao: SQLite,
		private config: IBackupConfig,
		private upload: UploadService,
	) { } 

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
			if (!this.upload.isConnected()) {
				console.log('Connecting')
				await this.upload.connect();
			}

			const listFile = await fs.promises.readdir(this.config.folder);

			for (const file of listFile) {
				const info: FileInfo = {
					path: path.join(this.config.folder, file),
					fileName: file,
				}

				logger.log(`Uploading the file to remote storage`);
				await this.upload.uploadFile(info);

				fs.rm(info.path, () => {
					logger.log(`Removing the file ${file} from 'local storage'`);
				});
			}

			this.upload.disconnect();
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
		if (this.hasAutoBackup()) {
			clearInterval(this.timeout);
		} else {
			throw Error("Auto backup is not initialized");
		}
	}
}
