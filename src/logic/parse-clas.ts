/*
    File:       * - parses command-line arguments for playwright-trace-metrics/main.ts
    Author:     Ben Mullan (c) 2025
*/

import * as packageJson     from "./../package.json";
import * as yargsHelpers    from "yargs/helpers";
import yargs                from "yargs/yargs";
import path                 from "path";
import fs                   from "fs";

/*
    example invocations...
        --playwright-traces-dir=".\traces\" --output-file-base=".\report"
        --playwright-traces-dir ".\traces\" --output-file-base ".\report"
*/

export type ParsedCLAs = {
	playwrightTracesDir     :string;
    "playwright-traces-dir" :string;
    outputFileBase          :string;
    "output-file-base"      :string;
	_                       :(string|number)[];
    $0                      :string;
	[x :string]             :unknown;
};

export const parsePlaywrightTraceMetricsCLAs = async (_argv :string[]) :Promise<ParsedCLAs> => {
	
    const _parsedCLAs :ParsedCLAs = yargs(yargsHelpers.hideBin(_argv))

        .option("playwright-traces-dir", { demandOption : true, type : "string", describe : "The path to a directory containing playwright trace zip files" })
        .coerce("playwright-traces-dir", (_possiblyRelativePath :string) => path.resolve(_possiblyRelativePath))
        .check((_argv :any) :boolean => { if (fs.existsSync(_argv["playwright-traces-dir"]) && fs.statSync(_argv["playwright-traces-dir"]).isDirectory()) { return true; } else { throw new Error(`this playwright-traces-dir doesn't exist: "${_argv["playwright-traces-dir"]}"`); } })

        .option("output-file-base", { demandOption : false, type : "string", default : "../ptm-report", describe : "The extension-less file path used for BOTH the output *.xml, AND *.htm files" })
        .coerce("output-file-base", (_possiblyRelativePath :string) => path.resolve(_possiblyRelativePath))
        .check((_argv :any) :boolean => { const _parentDir = path.dirname(_argv["output-file-base"]); if (fs.existsSync(_parentDir) && fs.statSync(_parentDir).isDirectory()) { return true; } else { throw new Error(`the directory for the output-file-base doesn't exist or isn't a directory: "${_parentDir}"`); } })

        .usage("~~~ playwright trace metrics ~~~\n-----------\n→ Aggregate metrics from playwright trace zips, into a html report.")
        .epilogue("→ prototype von Ben Mullan 2025")
        .version(packageJson.version)

        .strict()
        .help()
        .parseSync() as ParsedCLAs

    ;

	return _parsedCLAs;

};