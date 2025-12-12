/*
    File:       * - playwright-trace-metrics report graphing logic
    Author:     Ben Mullan (c) 2025
*/

import * as ptmLogic    from "./ptm-logic";
import * as vegaLite    from "vega-lite";
import * as vega        from "vega";

const VEGA_SCHEMA :string = "https://vega.github.io/schema/vega/v5.json";

// pie-chart showing: proportion of successful vs failed network requests, across all traces
export const generateNetworkSuccessRate_pieChartSvg = async (_aggregatedTraceMetrics :ptmLogic.AggregatedTraceMetrics) :Promise<string> => {

    const _chartSpec :vegaLite.TopLevelSpec = {
        $schema : VEGA_SCHEMA,
        data : {
            values : [
                { category : "successful", value : _aggregatedTraceMetrics.totalSuccessfulNetworkRequests },
                { category : "failed", value : (_aggregatedTraceMetrics.totalNetworkRequestsMade - _aggregatedTraceMetrics.totalSuccessfulNetworkRequests) }
            ]
        },
        mark : { type : "arc", innerRadius : 35, outerRadius : 70 },
        encoding : {
            theta : { field : "value", type : "quantitative" },
            color : { field : "category", type : "nominal", scale : { domain : ["successful", "failed"], range : ["#28a745", "#dc3545"] } },
            tooltip : [{ field : "category" }, { field : "value" }]
        },
        width : 150,
        height : 150
    };

    const _vegaView = (new vega.View(vega.parse(vegaLite.compile(_chartSpec).spec), { renderer: "none" }));
    return (await _vegaView.toSVG());

};

// bar-chart showing: trace durations' trend
export const generateTraceDurations_barChartSvg = async (_individualTraces :ptmLogic.SingleZipTraceMetrics[]) :Promise<string> => {

    const _chartSpec :vegaLite.TopLevelSpec = {
        $schema : VEGA_SCHEMA,
        data : { values : _individualTraces },
        mark : { type : "bar", color : "#0366d6" },
        encoding : {
            x : { field : "traceZipFileName", type : "nominal", sort : null, title : "trace filename" },
            y : { field : "totalTraceDurationMs", type : "quantitative", title : "exec duration (ms)" },
            tooltip : [{ field : "traceZipFileName" }, { field : "totalTraceDurationMs" }]
        },       
        config : {
            font : "Verdana", axis : { labelFontSize : 18, titleFontSize : 16 },
            legend : { labelFontSize : 12, titleFontSize : 13 }
        },
        width : 600,
        height : 300
    };

    const _vegaView = (new vega.View(vega.parse(vegaLite.compile(_chartSpec).spec), { renderer: "none" }));
    return (await _vegaView.toSVG());

};

// bar-chart showing: playwright-errors-per-trace trend
export const generatePlaywrightErrors_barChartSvg = async (_individualTraces :ptmLogic.SingleZipTraceMetrics[]) :Promise<string> => {

    const _chartSpec :vegaLite.TopLevelSpec = {
        $schema : VEGA_SCHEMA,
        data : { values : _individualTraces },
        transform : [
            { calculate : "datum.playwrightStepErrors ? datum.playwrightStepErrors.length : 0", as : "numPlaywrightErrors" }
        ],
        mark : { type : "bar", color : "#dc3545" },
        encoding : {
            x : { field : "traceZipFileName", type : "nominal", sort : null, title : "trace filename" },
            y : { field : "numPlaywrightErrors", type : "quantitative", title : "#playwright errors" },
            tooltip : [
                { field : "traceZipFileName", title : "trace" },
                { field : "numPlaywrightErrors", title : "#errors", type : "quantitative" }
            ]
        },
        config : {
            font : "Verdana", axis : { labelFontSize : 18, titleFontSize : 16 },
            legend : { labelFontSize : 12, titleFontSize : 13 }
        },
        width : 600,
        height : 300
    };

    const _vegaView = (new vega.View(vega.parse(vegaLite.compile(_chartSpec).spec), { renderer: "none" }));
    return (await _vegaView.toSVG());

};