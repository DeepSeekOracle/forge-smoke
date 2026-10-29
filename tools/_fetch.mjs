import { writeFileSync } from "node:fs";
const r = await fetch("http://127.0.0.1:8796/preview/forge-smoke/src/main.js");
const b = Buffer.from(await r.arrayBuffer());
writeFileSync("docs/evidence/_served-main.js", b);
console.log("bytes", b.length);
