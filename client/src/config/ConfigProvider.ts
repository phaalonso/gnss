import { configurator } from 'config-validation';
import path from 'node:path';

const config = configurator({
	client: {
		host: {
			type: 'string',
		},
		port: {
			type: 'port',
			default: 2108,
		}
	},
	process: {
		interval: {
			type: 'number',
			description: 'Intervalo em microsegundos',
			default: 15000,
		}
	}
}) as any;

config.load(path.join(__dirname, '..', '..','config.json'));

export default config;
