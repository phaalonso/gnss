import { PrnInfoModel } from "./prninfo/prninfo.model";

export class PrnInfoMongo {
	insert(prn: number, snr: number, azimuth: number, elevation: number, lat: number, lon: number, time: Date) {
		return new PrnInfoModel({
			prn,
			snr,
			azi: azimuth,
			elev: elevation,
			lat,
			long: lon,
			time
		}).save();
	}

	/**
	 * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 */
	public getGroupedPrn(time: Date) {
		return PrnInfoModel.find({ 
			time: { 
				$lte: time,
				$gt: new Date(time.getTime() - 1000 * 60),
			} });
	}

	/**
	 * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 * @param prn informa de qual prn será realizado a filtragem
	 */
	public getByPrn(time: Date, prn: number) {
		//return this.dao.all(
			//'SELECT prn, snr FROM prninfo WHERE time BETWEEN ?-60000 AND ? AND prn = ?',
			//[time, time, prn]
		//);
		return PrnInfoModel.find({
			prn: prn,
			time: {
				$lte: time,
				$gt: new Date(time.getTime() - 1000 * 60),
			}
		});
	}
}
