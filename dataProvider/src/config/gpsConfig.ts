interface GpsConfig {
	serialInput: string;
	baudRage: number;
}

export const GPSConfig: GpsConfig = {
	serialInput: '/dev/ttyUSB0',
	baudRage: 115200
}
