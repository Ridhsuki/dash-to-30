import fs from "node:fs";
import path from "node:path";

const assetFile = path.join(process.cwd(), "lib/audio/audioAssets.ts");
const text = fs.readFileSync(assetFile, "utf8");
const matches = [...text.matchAll(/["'](\/audio\/[^"']+)["']/g)];
const assets = [...new Set(matches.map((match) => match[1]))].sort();

let hasError = false;

console.log("Referenced audio assets:");

for (const src of assets) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;

  console.log(
    `${exists ? "OK" : "MISSING"} ${src} ${exists ? `${size} bytes` : ""}`,
  );

  if (!exists || size < 128) {
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log("All referenced audio files exist and have non-empty size.");
