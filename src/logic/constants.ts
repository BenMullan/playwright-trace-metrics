/*
    file:       constants.ts - global application constants
    author:     Ben Mullan (c) 2025
*/

import * as path from "path";

export const exitCode_success       :number = 0;
export const exitCode_runtimeError  :number = 31;

// files inside a playwright trace-zip
export const pwZipSubfiles = {
    traceSubfile   : "trace.trace",
    stacksSubfile  : "trace.stacks",
    networkSubfile : "trace.network",
};

// relative to main.ts
export const reportXslFilePath: string = path.resolve("./report-template.xsl");