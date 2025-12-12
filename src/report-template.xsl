<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">    
    <xsl:output method="html" indent="yes"/>
    <xsl:template match="/playwrightTraceMetricsReport">

        <html>
            <head>
                <title>📋 playwright-trace-metrics → report</title>
                <style>

                    body { font-family: Verdana, sans-serif; margin: 2em; color:rgb(46, 46, 46); }
                    
                    table { border-collapse: collapse; width: 95%; font-size: 14px; }
                    th, td { border: 1px solid rgb(226, 226, 226); padding: 4px 1px; }
                    th { background: rgb(238, 247, 255); position: sticky; top: 0; }
                    tr:nth-child(even) { background: rgb(245, 245, 245); }
                    th:nth-child(9), td:nth-child(9) { width: 32ch; } /* console errors */
                    
                    summary { cursor: pointer; color: #0366d6; }
                    pre { white-space: pre-wrap; margin: 0.5rem 0 0; }
                    code {
                        color:rgb(85, 5, 45); background-color: rgb(255, 253, 232); 
                        padding: 2px 2px; border-radius: 4px; font-size: 0.9em; font-weight: 500;
                    }
                
                    .x-margined { margin-left: 3em; margin-right: 3em; margin-bottom: 2em; }
                    .expand-head {
                        font-size: 1em; font-weight: 700; background-color:rgb(209, 235, 187);
                        margin: 1em; padding: 0.5em; border-radius: 8px; border: 1px solid #a3d2a1;
                        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
                    }
                   
                    figure.chart { height: 230px; margin: 5px; margin-bottom: 20px; }
                    figure.chart &gt; figcaption { text-align: center; font-size: 0.9em; color: rgb(100, 100, 100); font-weight: 700; }
                    figure.chart &gt; svg { width: 100%; height: 100%; display: block; transition: transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease; border-radius: 6px; }
                    figure.chart &gt; svg:hover {
                        transform: scale(1.6) translateX(20%); box-shadow: 0 12px 16px rgba(121, 121, 121, 0.65);
                        border: 1px solid #0366d6; object-fit: cover; width: 60%;
                    }

                </style>
            </head>
            <body>

                <h1>📋 playwright-trace-metrics :: report!</h1>
                <p style="margin: 0px; font-size: 0.8em;"><xsl:value-of select="concat('rendered on ', $renderTime)"/></p>
                <p style="margin: 0px; font-size: 0.8em;"><xsl:value-of select="concat(aggregatedTraceMetrics/@numTraceZipsProcessed, ' trace file(s) from &quot;', $traceZipsDir, '&quot;')"/></p>
                <br/><hr/>

                <details open="open">
                    <summary class="expand-head">aggregated trace metrics...</summary>
                    <table class="x-margined">
                        <tr>
                            <xsl:for-each select="svgCharts/svgChart">
                                <td>
                                    <figure class="chart">
                                        <xsl:copy-of select="*[local-name()='svg']"/>
                                        <figcaption>
                                            <xsl:value-of select="chartTitle/@title"/>
                                        </figcaption>
                                    </figure>
                                </td>
                            </xsl:for-each>
                        </tr>
                    </table>
                </details>
                <hr/>

                <details open="open">
                    <summary class="expand-head">raw aggregation data...</summary>
                    <table class="x-margined">
                        <tr>
                            <td>#trace files processed: <code><xsl:value-of select="aggregatedTraceMetrics/@numTraceZipsProcessed"/></code></td>
                            <td>#total console-errors: <code><xsl:value-of select="aggregatedTraceMetrics/@totalConsoleErrors"/></code></td>
                            <td>#total playwright-step errors: <code><xsl:value-of select="aggregatedTraceMetrics/@totalPlaywrightStepErrors"/></code></td>
                            <td>#total screenshots taken: <code><xsl:value-of select="aggregatedTraceMetrics/@totalScreenshotsTaken"/></code></td>
                        </tr>
                        <tr>
                            <td>#mean trace duration (ms): <code><xsl:value-of select="aggregatedTraceMetrics/@meanTraceDurationMs"/></code></td>
                            <td>#min trace duration (ms): <code><xsl:value-of select="aggregatedTraceMetrics/@minTraceDurationMs"/></code></td>
                            <td>#max trace duration (ms): <code><xsl:value-of select="aggregatedTraceMetrics/@maxTraceDurationMs"/></code></td>
                            <td>#total network requests made: <code><xsl:value-of select="aggregatedTraceMetrics/@totalNetworkRequestsMade"/></code></td>
                        </tr>
                        <tr>
                            <td>#mean playwright-step errors: <code><xsl:value-of select="aggregatedTraceMetrics/@meanNumPlaywrightStepErrors"/></code></td>
                            <td>#max playwright-step errors: <code><xsl:value-of select="aggregatedTraceMetrics/@maxNumPlaywrightStepErrors"/></code></td>
                            <td>#min playwright-step errors: <code><xsl:value-of select="aggregatedTraceMetrics/@minNumPlaywrightStepErrors"/></code></td>
                            <td>#total successful network requests: <code><xsl:value-of select="aggregatedTraceMetrics/@totalSuccessfulNetworkRequests"/></code></td>
                        </tr>
                        <tr>
                            <td colspan="4">most frequent console-error: <code><xsl:value-of select="aggregatedTraceMetrics/@mostFrequentConsoleError"/></code></td>
                        </tr>
                    </table>
                </details>
                <hr/>

                <details open="open">
                    <summary class="expand-head"><xsl:value-of select="aggregatedTraceMetrics/@numTraceZipsProcessed"/> individual traces...</summary>
                    <table class="x-margined">
                        <tr>
                            <th>file</th>
                            <th>exec duration (ms)</th>
                            <th>#screenshots</th>
                            <th>#trace-events</th>
                            <th>#net-requests</th>
                            <th>#successful net-requests</th>
                            <th>playwright-step errors</th>
                            <th>url</th>
                            <th>console errors</th>
                        </tr>
                        <xsl:for-each select="individualTraceMetrics/singleZipMetrics">
                            <tr>
                                <td><xsl:value-of select="@traceZipFileName"/></td>
                                <td><xsl:value-of select="@totalTraceDurationMs"/></td>
                                <td><xsl:value-of select="@numScreenshotsTaken"/></td>
                                <td><xsl:value-of select="@numTotalTraceEvents"/></td>
                                <td><xsl:value-of select="@numNetworkRequestsMade"/></td>
                                <td><xsl:value-of select="@numSuccessfulNetworkRequests"/></td>                            
                                <td><xsl:value-of select="@playwrightStepErrors"/></td>
                                <td>
                                    <details>
                                        <summary><xsl:value-of select="concat(substring(@navigationUrl, 1, 15), '...')"/></summary>
                                        <code><xsl:value-of select="@navigationUrl"/></code>
                                    </details>
                                </td>
                                <td>
                                    <details>
                                        <summary><xsl:value-of select="concat(substring(@consoleErrors, 1, 25), '...')"/></summary>
                                        <code><xsl:value-of select="@consoleErrors"/></code>
                                    </details>
                                </td>
                            </tr>
                        </xsl:for-each>
                    </table>
                </details>

            </body>
        </html>

    </xsl:template>
</xsl:stylesheet>