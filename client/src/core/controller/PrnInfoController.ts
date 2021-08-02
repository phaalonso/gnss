import { CustomData } from "../ProcessData";

export abstract class PrnInfoController {
    abstract insert(
        prn: number,
        snr: number,
        azimuth: number,
        elevation: number,
        lat: number,
        lon: number,
        time: Date
	): any;

	abstract insertMany(data: CustomData[]): any;

    /**
     * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
     * @param time tempo sera relativo a esse parametro
     */
	abstract getGroupedPrn(time: Date): any;

    /**
     * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
     * @param time tempo sera relativo a esse parametro
     * @param prn informa de qual prn será realizado a filtragem
     */
	abstract getByPrn(time: Date, prn: number): any;

    abstract infoLength(): Promise<number>;
}
