#!/usr/bin/env node
process.on("unhandledRejection", console.error.bind(console, "Error: "));
import { writeFileSync } from "fs";
import { createRequire } from "module";
import { dirname, extname, join, resolve } from "path";
import { pathToFileURL } from "url";
import compile from "../lib/compiler.js";
import { log_errors } from "../lib/utils/util.js";


(async () => {
    if (typeof global.require !== "function") {
        global.require = createRequire(import.meta.url);
    }
    const args = process.argv;
    const outDir = /^--out=(.+)$/gm.exec(args.find(arg => /^--out=.+$/gm.test(arg))!)![1];
    const mains = args.filter(arg => /^--main=.+$/gm.test(arg)).map(arg => resolve(/^--main=(.+)$/gm.exec(arg)![1]));
    const pretty = args.includes("--pretty");
    for (const main of mains) {
        const compiled = await compile(pathToFileURL(main), { pretty });
        log_errors(compiled.diagnostics);
        const ext = extname(main);
        const newName = join(outDir, main.slice(dirname(main).length + 1, ext ? -ext.length : Infinity) + ".js");
        console.log(newName);
        writeFileSync(newName, compiled.output);
    }
})().catch(console.error.bind(console, "Error: "));

