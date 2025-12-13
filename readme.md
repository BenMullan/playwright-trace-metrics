# playwright-trace-metrics
...is a small utility, for ingesting a folder of [playwright](https://github.com/microsoft/playwright?tab=readme-ov-file#examples) trace files, computing aggregated statistics from 'em, and outputting an `xml` (raw data) and `htm` (visualised) report!<br/><br/>

## Par exemple:
_Invoking..._
```
npx tsx main.ts --playwright-traces-dir="./traces/" --output-file-base="../ptm-report"
```
_...yields..._
<br/><br/>
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/htm-report.png" width="100%" />
<br/><br/>

## How it worketh...
- trace zips sequentially unpacked in-memory (no extraction to disk), and [parsed for trace + network events](https://github.com/BenMullan/playwright-trace-metrics/blob/a89ef2ef350018703b98a4503141089a0c858820/src/logic/ptm-logic.ts#L159)
- individual traces' metrics [aggregated together](https://github.com/BenMullan/playwright-trace-metrics/blob/a89ef2ef350018703b98a4503141089a0c858820/src/logic/ptm-logic.ts#L81)
- [SVG visualisations generated](https://github.com/BenMullan/playwright-trace-metrics/blob/a89ef2ef350018703b98a4503141089a0c858820/src/logic/ptm-graphing.ts#L64), and combined with individual + aggregated trace data, into a [ptm-report.xml](https://github.com/BenMullan/playwright-trace-metrics/blob/master/docs/ptm-report.xml)
- resultant `xml` put through an [xsl transformation](https://github.com/BenMullan/playwright-trace-metrics/blob/master/src/report-template.xsl), to produce a [ptm-report.htm](https://github.com/BenMullan/playwright-trace-metrics/blob/master/docs/ptm-report.htm)
<br/><br/>

## To use this software...
1. download [node-js](https://nodejs.org/dist/v25.2.1/node-v25.2.1-x64.msi) and [a zip of this repository](https://github.com/BenMullan/playwright-trace-metrics/archive/refs/heads/master.zip)
2. `cd src\` and `npm i`
3. `npx tsx main.ts --playwright-traces-dir="./my-traces/are/here/" --output-file-base="../ptm-report"`
<br/><br/>

## What's inside...
**Command-line invocation**
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/cl-invoccation.png" width="100%" />
<br/><br/>

**`xml` output**
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/xml-output.png" width="100%" />
<br/><br/>

**`xsl` transformation**
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/xsl-layer.png" width="100%" />
<br/><br/>

**Codebase**
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/code-scrnsht.png" width="100%" />
<br/><br/>

_Ben Mullan 2025_