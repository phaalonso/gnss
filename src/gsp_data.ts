import { Database } from "sqlite3";

export function saveGPSData(con: Database, data) {
	const stmt = con.prepare(
		"INSERT INTO prninfo (prn, snr, azi, elev, lat, long, time) VALUES(?,?,?,?,?,?,?)"
	);

	const { msgNumber, satellites, lat, lon, time } = data;

	if (msgNumber != undefined && msgNumber != "null") {
		for (const satelite of satellites) {
			//console.log(data.satellites[i].prn + " - " + data.satellites[i].snr
			// + " - " + data.satellites[i].azimuth + " - " + data.satellites[i].elevation + " - " + time.toISOString());

			//teste 3
			//stmt = db.prepare("INSERT INTO prninfo (prn, snr, azi, elev, time) VALUES(?,?,?,?,?)");
			stmt.run(
				satelite.prn,
				satelite.snr,
				satelite.azimuth,
				satelite.elevation,
				lat,
				lon,
				time
			);
			//stmt.finalize();
		}
	}
}
