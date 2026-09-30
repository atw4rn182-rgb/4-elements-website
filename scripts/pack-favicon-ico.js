/**
 * Packs 16/32/48 PNG favicons into a root favicon.ico (PNG-in-ICO).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const entries = [16, 32, 48].map((size) => ({
  size,
  data: fs.readFileSync(path.join(root, "images", `favicon-${size}.png`)),
}));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);

let offset = 6 + 16 * entries.length;
const dir = [];
for (const entry of entries) {
  const row = Buffer.alloc(16);
  row.writeUInt8(entry.size === 256 ? 0 : entry.size, 0);
  row.writeUInt8(entry.size === 256 ? 0 : entry.size, 1);
  row.writeUInt8(0, 2);
  row.writeUInt8(0, 3);
  row.writeUInt16LE(1, 4);
  row.writeUInt16LE(32, 6);
  row.writeUInt32LE(entry.data.length, 8);
  row.writeUInt32LE(offset, 12);
  dir.push(row);
  offset += entry.data.length;
}

const ico = Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]);
const dest = path.join(root, "favicon.ico");
fs.writeFileSync(dest, ico);
console.log("Wrote", dest, ico.length, "bytes");
