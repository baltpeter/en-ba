#!/usr/bin/env node

import program from 'commander';
import path from 'path';
import chalk from 'chalk';
import run from './runner.js';

const VER = require('../package.json').version;

console.log(
    `
┏━━━┳┓╋╋╋╋╋╋┏┓╋╋╋╋╋┏━┓╋┏┓╋╋╋╋╋╋╋╋┏┓╋╋╋╋╋┏┓
┃┏━━┫┃╋╋╋╋╋┏┛┗┓╋╋╋╋┃┃┗┓┃┃╋╋╋╋╋╋╋┏┛┗┓╋╋╋┏┛┗┓
┃┗━━┫┃┏━━┳━┻┓┏╋━┳━━┫┏┓┗┛┣━━┳━━┳━┻┓┏╋┳┓┏╋┓┏╋┓╋┏┓
┃┏━━┫┃┃┃━┫┏━┫┃┃┏┫┏┓┃┃┗┓┃┃┃━┫┏┓┃┏┓┃┃┣┫┗┛┣┫┃┃┃╋┃┃
┃┗━━┫┗┫┃━┫┗━┫┗┫┃┃┗┛┃┃╋┃┃┃┃━┫┗┛┃┏┓┃┗┫┣┓┏┫┃┗┫┗━┛┃
┗━━━┻━┻━━┻━━┻━┻┛┗━━┻┛╋┗━┻━━┻━┓┣┛┗┻━┻┛┗┛┗┻━┻━┓┏┛
╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏━┛┃╋╋╋╋╋╋╋╋╋╋╋┏━┛┃
╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┗━━┛╋╋╋╋╋╋╋╋╋╋╋┗━━┛
  v` +
        VER +
        `    https://doyensec.com/ + Benjamin Altpeter
`
);
console.log('Scan Status:');

program
    .version(VER)
    .description(
        'Electronegativity is a tool to identify misconfigurations and security anti-patterns in Electron applications.'
    )
    .option('-i, --input <path>', 'input [directory | .js | .html | .asar]')
    .option('-l, --checks <checkNames>', 'only run the specified checks list, passed in csv format')
    .option('-s, --severity <severitySet>', 'only return findings with the specified level of severity or above')
    .option('-c, --confidence <confidenceSet>', 'only return findings with the specified level of confidence or above')
    .option('-o, --output <filename[.csv | .sarif]>', 'save the results to a file in csv or sarif format')
    .option('-r, --relative', 'show relative path for files')
    .option('-v, --verbose', 'show the description for the findings')
    .option('-u, --upgrade <current version..target version>', 'run Electron upgrade checks, eg -u 7..8')
    .option(
        '-e, --electron-version <version>',
        'assume the set Electron version, overriding the detected one, eg -e 7.0.0 to treat as using Electron 7'
    )
    .parse(process.argv);

if (!program.input) {
    program.outputHelp();
    process.exit(1);
}

if (program.output) {
    program.fileFormat = program.output.split('.').pop();
    if (program.fileFormat !== 'csv' && program.fileFormat !== 'sarif') {
        console.log(chalk.red('Please specify file format extension.'));
        program.outputHelp();
        process.exit(1);
    }
}

if (typeof program.checks !== 'undefined' && program.checks) {
    program.checks = program.checks.split(',').map((check) => check.trim().toLowerCase());
} else program.checks = [];

if (typeof program.verbose !== 'undefined' && program.verbose) program.verbose = true;
else program.verbose = false;

const input = path.resolve(program.input);
const forCli = true;

run(
    {
        input,
        output: program.output,
        isSarif: program.fileFormat === 'sarif',
        customScan: program.checks,
        severitySet: program.severity,
        confidenceSet: program.confidence,
        isRelative: program.relative,
        isVerbose: program.verbose,
        electronUpgrade: program.upgrade,
        electronVersionOverride: program.electronVersion,
    },
    forCli
);
