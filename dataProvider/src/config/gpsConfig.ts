import configJson from '../../config.json';
import * as v from 'valibot';

const ConfigSchema = v.object({
    gps: v.object({
        serialInput: v.pipe(v.string('Define o arquivo de onde será lido a stream de dados'), v.minLength(1)),
        baudRate: v.optional(v.number('Taxa dos dados recebidos, vária de acordo com o receptor'), 115_200),
    }),
    socket: v.object({
        host: v.pipe(v.string('Socket host'), v.minLength(1)),
        port: v.number('Socket port'),
    }),
    log: v.object({
        qtdEnvioInterval: v.optional(v.number(), 1800000),
    })
})

export const gpsConfig = v.parse(ConfigSchema, configJson);
