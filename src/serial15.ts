import { createConnection } from "./database/sqlite/connection";
import { std, mean } from "mathjs";
import { saveGPSData } from "./gsp_data";
import gps from "./gps";
import { Database } from "sqlite3";

const TAXA = 0.1;
const DISP = 0.5;
const MIN_QTDE = (60 / TAXA) * DISP;

const prninfoGrouped =
	"select prn, count(snr) as total from prninfo where time between ?-60000 and ? group by prn";
const prnInfoMinute =
	"SELECT prn, snr FROM prninfo where time between ?-60000 and ? and prn = ?";

const aCadaMinuto = (connection: Database, time: Date) => {
	// Query selecionando os prn, e contando sua quantidade em um periodo de tempo
	connection.all(prninfoGrouped, [time, time], (err, rows) => {
		console.log("db.all");
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log("varrer linhas");
		for (const row of rows) {
			if (row.total >= MIN_QTDE) {
				let vSnr = [];
				let vIntensidadeSinal = [];
				let intensidadeSinalQuadrado = 0;
				let intensidade = 0;

				// Realiza select all na query sql
				connection.all(
					prnInfoMinute,
					[time, time, row.prn],
					(err, rows) => {
						if (err) {
							throw err;
						}
						rows.forEach((row) => {
							if (row.snr) {
								//console.log(row.prn + " -->" + row.snr);
								intensidade = Math.pow(10, row.snr / 10);
								vSnr.push(row.snr);
								vIntensidadeSinal.push(intensidade);
								intensidadeSinalQuadrado += Math.pow(
									intensidade,
									2
								);
							}
						});

						var dpSnr = std(vSnr);
						intensidadeSinalQuadrado /= vIntensidadeSinal.length;
						var mediaIntensidadeSinalQuadrado = Math.pow(
							mean(vIntensidadeSinal),
							2
						);
						var s4 = Math.sqrt(
							(intensidadeSinalQuadrado -
								mediaIntensidadeSinalQuadrado) /
								mediaIntensidadeSinalQuadrado
						);

						//salvar na tabela prnindices
						var stmt3 =
							"INSERT INTO prnindices (prn, mediasnr, mediaazi, mediaelev, tinicial, tfinal, dpsnr, s4) SELECT prn, " +
							"AVG(snr), AVG(azi), AVG(elev), min(time), max(time), ?, ? from prninfo where time between ?-60000 and ? and prn = ? group by prn";

						connection.all(
							stmt3,
							[dpSnr, s4, time, time, row.prn],
							(err, _) => {
								if (err) {
									throw err;
								} else {
									console.log("add prnindice");
								}
							}
						);
					}
				);
			}
		}
	});
};

createConnection().then((connection) => {
	let controle = null;

	connection.serialize(function () {
		gps.on("data", function (data) {
			console.log("Data", data);

			const { time } = data;

			saveGPSData(connection, data);

			// console.log("time.getUTCSeconds = "+time.getUTCSeconds());
			// console.log("controle"+controle);

			if (
				time &&
				time.getUTCSeconds() == 0 &&
				time.getMinutes() != controle
			) {
				// Executada a cada minuto
				controle = time.getMinutes();
				console.log(`CONTROLE ${controle}`);

				aCadaMinuto(connection, time);
			}
		});
	});
});
