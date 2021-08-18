import { CustomData } from "../ProcessData";

export interface IPrnInfoController {
    insert(
        prn: number,
        snr: number,
        azimuth: number,
        elevation: number,
        lat: number,
        lon: number,
        time: Date
	): any;

	insertMany(data: CustomData[]): any;

    /**
     * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
     * @param time tempo sera relativo a esse parametro
     */
	getGroupedPrn(time: Date): any;

    /**
     * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
     * @param time tempo sera relativo a esse parametro
     * @param prn informa de qual prn será realizado a filtragem
     */
	getByPrn(time: Date, prn: number): any;
    infoLength(): Promise<number>;
}
