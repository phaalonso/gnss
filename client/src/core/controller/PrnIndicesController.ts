export interface IPrnIndicesController {
	insertProcessedData(dpSnr: number, s4: number, time: Date, prn: number): any;
	indicesLength(): Promise<number>;
}
