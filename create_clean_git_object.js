import fs from "fs";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";

const [tree, parent, name, email, refName, ...messageParts] = process.argv.slice(2);
const message = messageParts.join(" ");

if (!tree || !parent || !name || !email || !refName || !message) {
  throw new Error("Missing required arguments.");
}

const gitDir = path.resolve(".git");
const now = Math.floor(Date.now() / 1000);
const offsetMinutes = -new Date().getTimezoneOffset();
const sign = offsetMinutes >= 0 ? "+" : "-";
const absoluteOffset = Math.abs(offsetMinutes);
const tz = `${sign}${String(Math.floor(absoluteOffset / 60)).padStart(2, "0")}${String(
  absoluteOffset % 60
).padStart(2, "0")}`;

const payload =
  `tree ${tree}\n` +
  `parent ${parent}\n` +
  `author ${name} <${email}> ${now} ${tz}\n` +
  `committer ${name} <${email}> ${now} ${tz}\n\n` +
  `${message}\n`;

const store = Buffer.from(`commit ${Buffer.byteLength(payload)}\0${payload}`, "utf8");
const sha = crypto.createHash("sha1").update(store).digest("hex");
const objectDir = path.join(gitDir, "objects", sha.slice(0, 2));
const objectPath = path.join(objectDir, sha.slice(2));

fs.mkdirSync(objectDir, { recursive: true });
fs.writeFileSync(objectPath, zlib.deflateSync(store));
fs.writeFileSync(path.join(gitDir, refName), `${sha}\n`);

console.log(sha);
