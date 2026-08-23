import { GPSProvider } from "./GnssDataStream";

const path = "/Users/pedroalonso/code/gnss/TrimbleR1_20160310-165531.txt";
// const data = fs.readFileSync(path, "utf-8")
//     .split("\r\n");

// console.log(data.length)

const gps = new GPSProvider({
    // serialInput: '/dev/tty.usbserial'
    fileInput: path
});

gps.parse()

gps.on('data', (e) => {
    console.log(e)
});