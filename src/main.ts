/*
    file:	    main.ts - entrypoint for playwright-trace-metrics
    exec:       [eg] npx tsx main.ts --playwright-traces-dir="./traces/" --output-file-base="../ptm-report"
    author:		Ben Mullan (c) 2025
*/

import * as constants   from "./logic/constants";
import * as parseCLAs   from "./logic/parse-clas";
import * as ptmLogic    from "./logic/ptm-logic";
import log              from "./logic/log";
import * as fs          from "fs";
import esMain           from "es-main";

/*
    playwright-trace-metrics :: entrypoint
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    high-level...
        - parse the command-line arguments
        - read all playwright trace-zip files in specified dir
        - serialise collected data to xml, & save to disk
        - use xslt to generate html report from xml file

    exit-codes...
        0   → exited cleanly & without any runtime errors
        31  → a runtime error occurred (eg file-permission error)
        (codes 1 to 12 are predefined by node)
*/

const main = async () => {

    try {

        const _clas :parseCLAs.ParsedCLAs = await parseCLAs.parsePlaywrightTraceMetricsCLAs(process.argv);

        log.info("playwright-trace-metrics → starting...");
        log.debug("node version: ", process.versions.node);

        const _allZipFiles_metrics :ptmLogic.SingleZipTraceMetrics[] = await ptmLogic.getMetrics_fromAllTraceZipsInDir(
            _clas["playwright-traces-dir"],
            (_zipFileName :string, _zipFileIndex: number, _totalNumZipFiles: number) => { log.info(`successfully read zip file ${_zipFileIndex} of ${_totalNumZipFiles}: ${_zipFileName}`); },
            (_zipFileName :string, _error :Error, _zipFileIndex: number, _totalNumZipFiles: number) => { log.error(`error reading zip file ${_zipFileIndex} of ${_totalNumZipFiles}: ${_zipFileName}\n${_error.stack ?? _error.message}`); }
        );

        const _aggregatedTraceMetrics :ptmLogic.AggregatedTraceMetrics = ptmLogic.computeAggregatedMetrics_fromIndividualMetrics(_allZipFiles_metrics);

        const _finalReportXml :string = await ptmLogic.getFinalReportXml(_allZipFiles_metrics, _aggregatedTraceMetrics);
        fs.writeFileSync(`${_clas["output-file-base"]}.xml`, _finalReportXml, { encoding : "utf8" });
        log.warn(`wrote xml report to "${_clas["output-file-base"]}.xml"`);
        
        const _finalReportHtml :string = await ptmLogic.getFinalReportHtml(_finalReportXml, _clas["playwright-traces-dir"]);
        fs.writeFileSync(`${_clas["output-file-base"]}.htm`, _finalReportHtml, { encoding : "utf8" });
        log.warn(`wrote htm report to "${_clas["output-file-base"]}.htm"`);

        process.exit(constants.exitCode_success);

    } catch (_runtimeError) {

        const _error = (_runtimeError as Error);
        log.error(`exiting; runtime error:\n${_error.stack ?? _error.message}`);
        process.exit(constants.exitCode_runtimeError);

    }

};

if (esMain(import.meta)) { await main(); }