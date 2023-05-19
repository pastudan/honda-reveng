import fs from "fs";
import { parse } from "csv-parse";

// const filename = "./temp-lo-to-hi-plus-modes.csv"; // 57(LO) to 59, pause, 59 to 61, pause
// const filename = "./driver-2-then-2.csv"; // 57(LO) to 59, pause, 59 to 61, pause
const filename = "./driver-2-then-2.csv"; // 57(LO) to 59, pause, 59 to 61, pause
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

function processRecords(records) {
  const lines = [];
  let packet = Buffer.alloc(10);
  let packetIndex = 0;
  let lastLine;
  for (const record of records) {
    const value = swapBitOrder(Number(record.mosi));
    packet.writeUInt8(value, packetIndex);
    packetIndex++;
    if (packetIndex >= 10) {
      const line = [...packet]
        // .map((v) => v.toString().padStart(3, "0"))
        // .map((v) => v.toString(16).padStart(2, "0"))
        .map((v) => v.toString(2).padStart(2, "0"))
        .join("");
      const passenger = packet.readUInt16LE(1);
      const driver = packet.readUInt16LE(3);
      if (line !== lastLine) {
        console.log(
          parseFloat(record.start_time).toFixed(3),
          "\t",
          line,
          "\t",
          `P: ${passenger}, D: ${driver}`
        );
      }
      lastLine = line;

      packet = Buffer.alloc(10);
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
