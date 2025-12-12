/*
    File:       * - main playwright-trace-metrics logic
    Author:     Ben Mullan (c) 2025
*/

import * as xmlSerialisation    from "./xml-serialisation";
import * as ptmGraphing         from "./ptm-graphing";
import * as constants           from "./constants";
import * as fs                  from "fs";
import * as path                from "path";
import jsZip                    from "jszip";

export interface SingleZipTraceMetrics {
    traceZipFileName                :string;
    traceZipFileFullPath            :string;
    totalTraceDurationMs            :number;
    navigationUrl                   :string;
    //
    consoleErrors                   :string[];
    playwrightStepErrors            :string[];
    //
    numScreenshotsTaken             :number;
    numTotalTraceEvents             :number;
    numNetworkRequestsMade          :number;
    numSuccessfulNetworkRequests    :number;
};

export interface AggregatedTraceMetrics {
    numTraceZipsProcessed           :number;
    mostFrequentConsoleError        :string;
    //
    totalConsoleErrors              :number;
    totalPlaywrightStepErrors       :number;
    totalScreenshotsTaken           :number;
    totalNetworkRequestsMade        :number;
    totalSuccessfulNetworkRequests  :number;
    //
    meanTraceDurationMs             :number;
    minTraceDurationMs              :number;
    maxTraceDurationMs              :number;
    //
    meanNumPlaywrightStepErrors     :number;
    minNumPlaywrightStepErrors      :number;
    maxNumPlaywrightStepErrors      :number;
};

export const getFinalReportHtml = async (_finalReportXml :string, _playwrightTracesDir_fullPath :string) :Promise<string> => {
    
    const _xsltTemplate :string = fs.readFileSync(constants.reportXslFilePath, { encoding : "utf8" });
    
    return await xmlSerialisation.renderXml_intoHtml(
        _finalReportXml, _xsltTemplate, [
            { name : "renderTime",              value : (new Date()).toDateString() },
            { name : "traceZipsDir",            value : _playwrightTracesDir_fullPath }
        ]
    );

};

export const getFinalReportXml = async (_individualTraces :SingleZipTraceMetrics[], _aggregatedTraceMetrics :AggregatedTraceMetrics) :Promise<string> => {

    const _svgChart_tagName :string = "svgChart";
    const _chartTitle_tagName :string = "chartTitle";

    const _individualTraceMetrics_xml :string = xmlSerialisation.serialiseObjectArrayToXml(_individualTraces, "individualTraceMetrics", "singleZipMetrics");
    const _aggregatedTraceMetrics_xml :string = xmlSerialisation.serialiseObjectToXml(_aggregatedTraceMetrics, "aggregatedTraceMetrics");

    const _svgCharts_xml :string = xmlSerialisation.zipXmlElementsTogether(
        [
            xmlSerialisation.zipXmlElementsTogether([xmlSerialisation.serialiseObjectToXml({ title : "trace durations' trend" }, _chartTitle_tagName), await ptmGraphing.generateTraceDurations_barChartSvg(_individualTraces)], _svgChart_tagName),
            xmlSerialisation.zipXmlElementsTogether([xmlSerialisation.serialiseObjectToXml({ title : "network requests' success rate" }, _chartTitle_tagName), await ptmGraphing.generateNetworkSuccessRate_pieChartSvg(_aggregatedTraceMetrics)], _svgChart_tagName),
            xmlSerialisation.zipXmlElementsTogether([xmlSerialisation.serialiseObjectToXml({ title : "playwright-errors' trend" }, _chartTitle_tagName), await ptmGraphing.generatePlaywrightErrors_barChartSvg(_individualTraces)], _svgChart_tagName)
        ],
        "svgCharts"
    );

    return xmlSerialisation.zipXmlElementsTogether([_aggregatedTraceMetrics_xml, _individualTraceMetrics_xml, _svgCharts_xml], "playwrightTraceMetricsReport");

};

export const computeAggregatedMetrics_fromIndividualMetrics = (_allZipMetrics :SingleZipTraceMetrics[]) :AggregatedTraceMetrics => {

    const _allConsoleErrors :string[] = _allZipMetrics.flatMap(_zipTraceMetrics => _zipTraceMetrics.consoleErrors);

    return {
        numTraceZipsProcessed           : _allZipMetrics.length,
        mostFrequentConsoleError        : ((_allConsoleErrors.length != 0)
            ? [..._allConsoleErrors.reduce((_accMap, _err) => _accMap.set(_err, (_accMap.get(_err) ?? 0) + 1), new Map<string, number>()).entries()].reduce((_a, _b) => _a[1] >= _b[1] ? _a : _b)[0]
            : "(no console errors)"
        ),
        //
        totalConsoleErrors              : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.consoleErrors.length          , 0),
        totalPlaywrightStepErrors       : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.playwrightStepErrors.length   , 0),
        totalScreenshotsTaken           : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.numScreenshotsTaken           , 0),
        totalNetworkRequestsMade        : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.numNetworkRequestsMade        , 0),
        totalSuccessfulNetworkRequests  : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.numSuccessfulNetworkRequests  , 0),
        //
        meanTraceDurationMs             : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.totalTraceDurationMs, 0) / _allZipMetrics.length,
        minTraceDurationMs              : Math.min(..._allZipMetrics.map(_zipTraceMetrics => _zipTraceMetrics.totalTraceDurationMs)),
        maxTraceDurationMs              : Math.max(..._allZipMetrics.map(_zipTraceMetrics => _zipTraceMetrics.totalTraceDurationMs)),
        //
        meanNumPlaywrightStepErrors     : _allZipMetrics.reduce((_countSoFar, _current) => _countSoFar + _current.playwrightStepErrors.length, 0) / _allZipMetrics.length,
        minNumPlaywrightStepErrors      : Math.min(..._allZipMetrics.map(_zipTraceMetrics => _zipTraceMetrics.playwrightStepErrors.length)),
        maxNumPlaywrightStepErrors      : Math.max(..._allZipMetrics.map(_zipTraceMetrics => _zipTraceMetrics.playwrightStepErrors.length))
    };

};

export const getMetrics_fromTraceZip = async (_zipFile_fullPath :string) :Promise<SingleZipTraceMetrics> => {
    
    const _rawZipData :Buffer = fs.readFileSync(_zipFile_fullPath);
    const _parsedZipData :jsZip = await (new jsZip()).loadAsync(_rawZipData);

    // {zip}/"trace.trace"
    const _traceSubfile :jsZip.JSZipObject|null = _parsedZipData.file(constants.pwZipSubfiles.traceSubfile);
    if (!_traceSubfile) throw new Error(`the zip doesn"t contain a "${constants.pwZipSubfiles.traceSubfile}" file`);
    const _traceSubfile_stringContents :string = await _traceSubfile.async("string");
    const _traceSubfile_metrics :Partial<SingleZipTraceMetrics> = getMetricsFrom_traceSubfile(_traceSubfile_stringContents);
    
    // {zip}/"trace.network"
    const _networkSubfile :jsZip.JSZipObject|null = _parsedZipData.file(constants.pwZipSubfiles.networkSubfile);
    if (!_networkSubfile) throw new Error(`the zip doesn"t contain a "${constants.pwZipSubfiles.networkSubfile}" file`);
    const _networkSubfile_stringContents :string = await _networkSubfile.async("string");
    const _networkSubfile_metrics :Partial<SingleZipTraceMetrics> = getMetricsFrom_networkSubfile(_networkSubfile_stringContents);

    return {
        traceZipFileName : path.basename(_zipFile_fullPath),
        traceZipFileFullPath : _zipFile_fullPath,
        ..._traceSubfile_metrics,
        ..._networkSubfile_metrics
    } as SingleZipTraceMetrics;

};

export const getMetrics_fromAllTraceZipsInDir = async (

    _traceZipsDir_fullPath  :string,
    _onZipReadSuccess?      :(_zipFileName :string, _index: number, _total: number) => void,
    _onZipReadFailure?      :(_zipFileName :string, _error :Error, _index: number, _total: number) => void

) :Promise<SingleZipTraceMetrics[]> => {

    const _accumulatedZipMetrics :SingleZipTraceMetrics[] = [];
    const _allZipFilesInDir :string[] = fs.readdirSync(_traceZipsDir_fullPath).filter(_fileName => _fileName.endsWith(".zip"));

    for (const [_zipFileIndex, _zipFileName] of _allZipFilesInDir.entries()) {
        try {
            const _zipMetrics = await getMetrics_fromTraceZip(path.join(_traceZipsDir_fullPath, _zipFileName));
            _accumulatedZipMetrics.push(_zipMetrics);
            if (_onZipReadSuccess) { _onZipReadSuccess(_zipFileName, _zipFileIndex + 1, _allZipFilesInDir.length); }
        } catch (_zipReadError :unknown) {
            if (_onZipReadFailure) { _onZipReadFailure(_zipFileName, _zipReadError as Error, _zipFileIndex + 1, _allZipFilesInDir.length); }
        }
    }

    return _accumulatedZipMetrics;
};

const getMetricsFrom_traceSubfile = (_traceSubfile_stringContents :string) :Partial<SingleZipTraceMetrics> => {

    const _traceSubfile_lines = _traceSubfile_stringContents.split("\n").filter(Boolean);

    let _navigationUrl                  :string     = "(unknown)";
    let _consoleErrors                  :string[]   = [];
    let _playwrightStepErrors           :string[]   = [];
    let _screenshotCount                :number     = 0;

    let _firstMentioned_eventStartTime  :number = 0;
    let _lastMentioned_eventEndTime     :number = 0;

    // the total execution-duration,
    // is from the earliest mentioned startTime, to the last mentioned endTime,
    // across all event lines.

    for (const _line of _traceSubfile_lines) {

        const _eventJson :any = JSON.parse(_line);

        if ((_eventJson.type === "before") && (_firstMentioned_eventStartTime === 0)) { _firstMentioned_eventStartTime = _eventJson.startTime; }
        if (_eventJson.type === "after") { _lastMentioned_eventEndTime = _eventJson.endTime; }

        if (["before", "after"].includes(_eventJson.type) && ("error" in _eventJson)) { _playwrightStepErrors.push(_eventJson.error.message); }
        if ((_eventJson.type === "before") && (_eventJson.method === "goto")) { _navigationUrl = _eventJson.params.url; }
        if ((_eventJson.type === "console") && (_eventJson.messageType === "error")) { _consoleErrors.push(_eventJson.text); }
        if (_eventJson.type === "screencast-frame") { ++_screenshotCount; }

    }

    return {
        totalTraceDurationMs    : (_lastMentioned_eventEndTime - _firstMentioned_eventStartTime),
        navigationUrl           : _navigationUrl,
        consoleErrors           : _consoleErrors,
        playwrightStepErrors    : _playwrightStepErrors,
        numScreenshotsTaken     : _screenshotCount,
        numTotalTraceEvents     : _traceSubfile_lines.length
    };

};

const getMetricsFrom_networkSubfile = (_networkSubfile_stringContents :string) :Partial<SingleZipTraceMetrics> => {

    const _networkSubfile_lines = _networkSubfile_stringContents.split("\n").filter(Boolean);

    let _numSuccessfulNetworkRequests   :number = 0;

    for (const _line of _networkSubfile_lines) {

        const _eventJson :any = JSON.parse(_line);

        const _httpStatus :number|undefined = _eventJson?.snapshot?.response?.status ?? undefined;
        if ((typeof _httpStatus === "number") && (_httpStatus! >= 200) && (_httpStatus! <= 399)) { ++_numSuccessfulNetworkRequests; }

    }

    return {
        numNetworkRequestsMade          : _networkSubfile_lines.length,
        numSuccessfulNetworkRequests    : _numSuccessfulNetworkRequests
    };

};