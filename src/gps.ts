import parser from './parser';
import GPS from 'gps';

const gps = new GPS();

parser.on("data", function (data) {
	gps.update(data);
});

export default gps;
