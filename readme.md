# playwright-trace-metrics
...ingests a folder of [playwright](https://github.com/microsoft/playwright?tab=readme-ov-file#examples) trace files, computes aggregated statistics from 'em, and outputs an `xml` (raw data) and `htm` (visualised) report!<br/><br/>

## Par exemple:
Invoking...
```
npx tsx main.ts --playwright-traces-dir="./traces/" --output-file-base="../ptm-report"
```
...yields...
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/htm-report.png" width="100%" />

## How it worketh...
- in-memory extraction
sample [ptm-report.xml](https://github.com/BenMullan/playwright-trace-metrics/blob/main/docs/ptm-report.xml)
a [xsl transformation](https://github.com/BenMullan/playwright-trace-metrics/blob/main/src/report-template.xsl)

## To use this software...
- download [node-js](https://nodejs.org/dist/v25.2.1/node-v25.2.1-x64.msi) and [a zip of this repository](https://github.com/BenMullan/playwright-trace-metrics/archive/refs/heads/master.zip)
- `cd src\` and `npm i`
- run on your playwright-traces, with `npx tsx main.ts --playwright-traces-dir="./my-traces/are/here/" --output-file-base="../ptm-report"`

<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/cl-invoccation.png" width="100%" />
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/code-scrnsht.png" width="100%" />
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/xml-output.png" width="100%" />
<img alt="ui-screenshot" src="https://raw.githubusercontent.com/BenMullan/playwright-trace-metrics/master/docs/images/xsl-layer.png" width="100%" />

_Ben Mullan 2025_