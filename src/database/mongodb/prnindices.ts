export class PrnIndicesMongo {
	insertProcessedData(dpSnr: number, s4: number, time: Date, prn: number) {
		//return this.dao.run(
			//'INSERT INTO prnindices (prn, mediasnr, mediaazi, mediaelev, tinicial, tfinal, dpsnr, s4) SELECT prn, AVG(snr), AVG(azi), AVG(elev), min(time), max(time), ?, ? from prninfo where time between ?-60000 and ? and prn = ? group by prn',
			//[dpSnr, s4, time, time, prn]
		//);
	}
}
