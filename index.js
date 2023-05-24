import fs from "fs";
import { parse } from "csv-parse";
import c from "chalk";

// const filename = "./temp-lo-to-hi-plus-modes.csv"; // 57(LO) to 59, pause, 59 to 61, pause
// const filename = "./driver-2-then-2.csv"; // 57(LO) to 59, pause, 59 to 61, pause
const filename = "./full-range.csv"; // 57(LO) to 59, pause, 59 to 61, pause
// LO = 57
// HI = 87

const records = await parse(
  fs.readFileSync(filename),
  {
    delimiter: ",",
    columns: true,
  },
  async function (err, records) {
    if (err) throw err;
    processRecords(records);
  }
);

const PACKET_SIZE = 10;

function processRecords(records) {
  const lines = [];
  let packet = Buffer.alloc(PACKET_SIZE);
  let packetIndex = 0;
  let lastLine;
  let i = 0;
  let d = 57;
  let p = 57;

  console.log("D-bits-1  D-bits-2  Driver Passenger");
  console.log("-abcdefg  -abcdefg  ");
  console.log("==================================");

  for (const record of records) {
    const value = swapBitOrder(Number(record.mosi));
    packet.writeUInt8(value, packetIndex);
    packetIndex++;
    // if (packetIndex === 8) packetIndex = 10;
    // if (packetIndex === 9) packetIndex = 10;
    // if (packetIndex === 9) packetIndex = 10;

    if (packetIndex === 10) {
      let line = [...packet]
        // .map((v) => v.toString().padStart(3, "0"))
        // .map((v) => v.toString(16).padStart(2, "0"))
        .map((v) => v.toString(2).padStart(8, "0"))
        .join(" ");
      const passenger = packet.readUInt16LE(1);
      const driver = packet.readUInt16LE(3);

      let bytes = line.split(" ");
      //remove 3rd byte
      // bytes.splice(9, 1);
      // bytes.splice(8, 1);
      // bytes.splice(0, 1);
      line = bytes.join(",");

      const time = parseFloat(record.start_time);

      const isPassenger = time > 47 && time < 96;
      if (line !== lastLine && time > 1 && time < 120) {
        // if (time === 52.1907477) console.log(" ");
        // if (time === 96.5558679) console.log(" ");

        let bytestr = [bytes[5], bytes[2], bytes[1]].join(" ");

        // let pSegment2 = bytes[1].substring(1, 6) + bytes[2].substring(6, 1);
        const passengerSegment1 =
          bytes[2].substring(1, 7) + bytes[5].substring(5, 6);
        const passengerSegment2 =
          bytes[1].substring(1, 7) + bytes[5].substring(6, 7);

        const driverSegment1 =
          bytes[4].substring(1, 7) + bytes[5].substring(3, 4);
        const driverSegment2 =
          bytes[3].substring(1, 7) + bytes[5].substring(4, 5);

        const seg = process.argv[2];
        const segment = get7seg(p.toString().charAt(0), seg);

        // loop through each character of the bytestr and highlight it if it's a 1

        const newbtyestr = bytestr
          .split("")
          .map((char) => {
            if (char === " ") return char;
            return !!parseInt(char, 10) === segment ? c.green(char) : char;
          })
          .join("");

        console.log(
          "0" + driverSegment1 + "  0" + driverSegment2 + " ",
          sevenSegBitsToChar(driverSegment1) +
            sevenSegBitsToChar(driverSegment2),
          "   ",
          sevenSegBitsToChar(passengerSegment1) +
            sevenSegBitsToChar(passengerSegment2)
          // time.toFixed(0).padStart(3, " "),
          // d.toString().padStart(2, " "),
          // p.toString().charAt(0),
          // p.toString().charAt(1),
          // segment ? c.green(seg) : c.red(seg)
        );
        if (time > 47 && time < 96) {
          p++;
        } else {
          d++;
        }
        // parseFloat(record.start_time).toFixed(3).padStart(8, " "),
        i++;
      }
      lastLine = line;

      packet = Buffer.alloc(PACKET_SIZE);
      packetIndex = 0;
    }
  }
}

function swapBitOrder(num) {
  var result = 0;

  for (var i = 0; i < 8; i++) {
    result <<= 1; // Shift the result to the left by 1 bit

    if (num & 1) {
      result |= 1; // Set the least significant bit of the result if the corresponding bit in num is 1
    }

    num >>= 1; // Shift num to the right by 1 bit
  }

  return result;
}

function get7seg(num, seg) {
  let table;
  switch (num) {
    case "0":
      table = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 1 };
      break;
    case "1":
      table = { a: 1, b: 0, c: 0, d: 1, e: 1, f: 1, g: 1 };
      break;
    case "2":
      table = { a: 0, b: 0, c: 1, d: 0, e: 0, f: 1, g: 0 };
      break;
    case "3":
      table = { a: 0, b: 0, c: 0, d: 0, e: 1, f: 1, g: 0 };
      break;
    case "4":
      table = { a: 1, b: 0, c: 0, d: 1, e: 1, f: 0, g: 0 };
      break;
    case "5":
      table = { a: 0, b: 1, c: 0, d: 0, e: 1, f: 0, g: 0 };
      break;
    case "6":
      table = { a: 0, b: 1, c: 0, d: 0, e: 0, f: 0, g: 0 };
      break;
    case "7":
      table = { a: 0, b: 0, c: 0, d: 1, e: 1, f: 1, g: 1 };
      break;
    case "8":
      table = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0 };
      break;
    case "9":
      table = { a: 0, b: 0, c: 0, d: 0, e: 1, f: 0, g: 0 };
      break;
  }
  return !table[seg];
}

const BIT_MAPPING = {
  //abcdefg - segments of display
  ["0001110"]: "L",
  ["0011101"]: "o",
  ["0110111"]: "H",
  ["0000100"]: "i",
  ["1111110"]: "0",
  ["0110000"]: "1",
  ["1101101"]: "2",
  ["1111001"]: "3",
  ["0110011"]: "4",
  ["1011011"]: "5",
  ["1011111"]: "6",
  ["1110000"]: "7",
  ["1111111"]: "8",
  ["1111011"]: "9",
};

function sevenSegBitsToChar(byte) {
  return BIT_MAPPING[byte];
}
