import { Database } from "sqlite3";

export class SQLite {
	private filePath: string;
	public con: Database;

	constructor(dbFilePath?: string) {
		this.filePath = dbFilePath || 'dados.db';
		this.con = new Database(this.filePath, err => {
			if (err) {
				console.error('Não foi possível conectar com o banco de dados');
				process.exit(1);
			} else {
				console.log('Conectado ao banco de dados');
				this.con.run("PRAGMA synchronous=OFF");
			}
		});
	}

	public run(sql: string, params = []) {
		return new Promise((res, rej) => {
			this.con.run(sql, params, function(err) {
				if (err) {
					console.log(`Erro ao executar a query ${sql}`);
					console.error(err);
					rej(err);
				} else {
					res({ id: this.lastID });
				}
			});
		});
	}

	public get(sql: string, params = []) {
		return new Promise((res, rej) => {
			this.con.get(sql, params, (err, result) => {
				if (err) {
					console.log(`Erro ao executar a query ${sql}`);
					console.error(err);
					rej(err);
				} else {
					res(result);
				}
			});
		});
	}

	public all(sql: string, params = []) {
		return new Promise((res, rej) => {
			this.con.all(sql, params, (err, rows) => {
				if (err) {
					console.log(`Erro ao executar a query ${sql}`);
					console.error(err);
					rej(err);
				} else {
					res(rows);
				}
			});
		});
	}

	public serialize(cb: () => void) {
		this.con.serialize(cb);
	}
}
