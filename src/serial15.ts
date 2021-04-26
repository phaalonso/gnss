import { createConnection } from "./database/sqlite/connection";
import { std, mean, log } from "mathjs";
import { saveGPSData } from "./gsp_data";
import gps from "./gps";
import { Database } from "sqlite3";

const TAXA = 0.1;
const DISP = 0.5;
const MIN_QTDE = (60 / TAXA) * DISP;

const aCadaMinuto = (connection: Database, time: Date) => {
	var prninfoGrouped = "select prn, count(snr) as total from prninfo where time between ?-60000 and ? group by prn";

	// Query selecionando os prn, e contando sua quantidade em um periodo de tempo
	connection.all(prninfoGrouped, [time, time], (err, rows) => {
		console.log("PrninfoGrouped", rows);
		if (err) {
			console.error(err);
			process.exit(1);
		}
		for (const row of rows) {
			if (row.total >= MIN_QTDE) {
				let vSnr = [];
				let vIntensidadeSinal = [];
				let intensidadeSinalQuadrado = 0;
				let intensidade = 0;

				var prnInfoMinute = "SELECT prn, snr FROM prninfo where time between ?-60000 and ? and prn = ?";

				// Realiza select all na query sql
				connection.all(
					prnInfoMinute,
					[time, time, row.prn],
					(err, rows) => {
						console.log('prnInfoMinute');
						if (err) {
							console.log(err);
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

						console.log("S4", s4);
						//salvar na tabela prnindices
						var stmt3 =
							"INSERT INTO prnindices (prn, mediasnr, mediaazi, mediaelev, tinicial, tfinal, dpsnr, s4) SELECT prn, AVG(snr), AVG(azi), AVG(elev), min(time), max(time), ?, ? from prninfo where time between ?-60000 and ? and prn = ? group by prn";

						connection.all(
							stmt3,
							[dpSnr, s4, time, time, row.prn],
							(err, _) => {
								console.log('saving prnindices')
								if (err) {
									console.log(err);
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

/**
 * Types:
 *	- GSV -> Satelites([prn, elevation, azimuth, snr, status])
 *	- GSA -> Satelites(lista de prn), pdop, hdop, vdop
 *	- GGA -> time, lat, lon, alt, quality, num of satelites, hdop, geoidal, age
 *	- VTG -> speed, track
 *	- RMC -> lat, lon, speed, track, faa
 */

createConnection().then((connection) => {
	let controle = null;
	let time = new Date();
	let lat;
	let lon;

	connection.serialize(function () {
		gps.on("data", function (data) {
			//console.log("Data", data);

			if (data.time) {
				time = data.time;
				lat = data.lat;
				lon = data.lon;
			}


			saveGPSData(connection, data, lat, lon, time);

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
