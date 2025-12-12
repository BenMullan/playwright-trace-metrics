/*
    file:	    log.ts - global application logging
    author:		Ben Mullan (c) 2025
*/

import tracer from "tracer";

const loggingProvider = tracer.colorConsole(
    {
        format: "{{timestamp}} <{{title}}> {{file}}:{{line}} ({{method}}) \t {{message}}",
        dateformat: "HH:MM:ss.l"
    }
);

/*
    use in other files like...
        log.info("...");
        log.error("...");
*/

export default loggingProvider;