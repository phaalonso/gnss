import sqlite3 from "sqlite3";
import { stat } from "fs/promises";
import path from "path";

	const databasePath = path.resolve(path.dirname("."), "dados.db");
console.log(databasePath);

/**
 * @description verifica se existe um arquivo no caminho passado por parametro
 *
 * @param name caminho do arquivo
 */
async function hasFile(name: string) {
	try {
		const fileStat = await stat(name);

		console.log(fileStat);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

/**
 * @description cria o banco de dados
 */
function initDatabase() {
	const tmpC = new sqlite3.Database(databasePath, (err) => {
		console.log(err);
	});

	tmpC.serialize(() => {
		const prnInfoSql = [
			"CREATE TABLE if not exists prninfo (",
			"prn INTEGER,",
			"snr REAL,",
			"azi REAL,",
			"elev REAL,",
			"lat REAl,",
			"long REAL,",
			"time TEXT",
			")",
		].join("");

		tmpC.run(prnInfoSql);
		console.log("Criando tabela prninfo");
	});

	tmpC.serialize(() => {
		const prnIndicesSQL = [
			"CREATE TABLE if not exists prnindices (prn INTEGER,",
			"mediasnr REAL,",
			"mediaazi REAL,",
			"mediaelev REAL,",
			"tinicial TEXT,",
			"tfinal TEXT,",
			"dpsnr REAL,",
			"s4 REAL",
			")",
		].join("");
		tmpC.run(prnIndicesSQL);
		console.log("Criando tabela prnindice");
	});

	tmpC.close();
}

/**
 * @description cria o banco de dados se não existir, e retorna sua conexão
 */
export async function createConnection() {
	const exist = await hasFile(databasePath);

	if (!exist) {
		console.log("Criando banco de dados");
		initDatabase();
	}

	const connection = new sqlite3.Database(
		"dados.db",
		sqlite3.OPEN_READWRITE,
		(err) => {
			if (err) {
				console.error(err.message);
				process.exit(1);
			}
			console.log("Connected to the dados.db");
		}
	);

	connection.run("PRAGMA synchronous=OFF");

	return connection;
}
