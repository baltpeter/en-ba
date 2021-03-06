import cliProgress from 'cli-progress';
import Table from 'cli-table3';
import chalk from 'chalk';
import logger from 'winston';

import { LoaderFile, LoaderAsar, LoaderDirectory } from './loader';
import { Parser } from './parser';
import { Finder } from './finder';
import { GlobalChecks, severity, confidence } from './finder';
import { extension, input_exists, is_directory, writeIssues, getRelativePath } from './util';
import { convertCompilerOptionsFromJson } from 'typescript';
import { minVersion } from 'semver';

export default async function run(options, forCli = false) {
    if (!input_exists(options.input)) {
        const err = 'Input does not exist!';
        if (forCli) {
            console.log(chalk.red(err));
            process.exit(1);
        } else throw new Error(err);
    }

    options.customScan = options.customScan.map((c) => c.toLowerCase());

    // Load
    let loader;

    if (is_directory(options.input)) {
        loader = new LoaderDirectory();
    } else {
        loader = extension(options.input) === 'asar' ? new LoaderAsar() : new LoaderFile();
    }

    await loader.load(options.input);
    const electronVersion = minVersion(options.electronVersionOverride || loader.electronVersion || '0.1.99').raw;

    if (options.severitySet) {
        if (!severity.hasOwnProperty(options.severitySet.toUpperCase())) {
            const err = 'This severity level does not exist!';
            if (forCli) {
                console.log(chalk.red(err));
                process.exit(1);
            } else throw new Error(err);
        } else options.severitySet = severity[options.severitySet.toUpperCase()];
    } else options.severitySet = severity['INFORMATIONAL']; // default to lowest

    if (options.confidenceSet) {
        if (!confidence.hasOwnProperty(options.confidenceSet.toUpperCase())) {
            const err = 'This confidence level does not exist!';
            if (forCli) {
                console.log(chalk.red(err));
                process.exit(1);
            } else throw new Error(err);
        } else options.confidenceSet = confidence[options.confidenceSet.toUpperCase()];
    } else options.confidenceSet = confidence['TENTATIVE']; // default to lowest

    // Parser
    const parser = new Parser(false, true);
    const globalChecker = new GlobalChecks(options.customScan, options.electronUpgrade);
    if (options.customScan.length > 0)
        options.customScan = options.customScan
            .filter((r) => !r.includes('globalcheck'))
            .concat(globalChecker.dependencies);
    const finder = await new Finder(options.customScan, options.electronUpgrade);
    const filenames = [...loader.list_files];
    let issues = [];
    let errors = [];
    let table = new Table({
        head: ['Check ID', 'Affected File', 'Location', 'Issue Description'],
        colWidths: [undefined, undefined, undefined, 50], // necessary for wordWrap
        wordWrap: true,
    });

    if (forCli)
        console.log(
            chalk.green(
                `${
                    globalChecker._enabled_checks.length + finder._enabled_checks.length
                } check(s) successfully loaded: ${globalChecker._enabled_checks.length} global, ${
                    finder._enabled_checks.length
                } atomic`
            )
        );

    let progress;
    let oldLog;
    let consoleArguments = [];
    if (forCli) {
        progress = new cliProgress.Bar(
            { format: '{bar} {percentage}% | {value}/{total}' },
            cliProgress.Presets.shades_grey
        );
        oldLog = console.log;
        console.log = function () {
            consoleArguments.push(arguments);
        };
    }

    try {
        if (forCli) progress.start(filenames.length, 0);

        for (const file of filenames) {
            if (forCli) progress.increment();

            try {
                const [type, data, content, warnings] = parser.parse(file, loader.load_buffer(file));
                if (data === null) continue;

                if (warnings !== undefined) {
                    for (const warning of warnings) {
                        errors.push({ file: file, message: warning.message, tolerable: true });
                    }
                }

                const result = await finder.find(file, data, type, content, null, electronVersion);
                issues.push(...result);
            } catch (error) {
                errors.push({ file: file, message: error.message, tolerable: false });
            }
        }

        if (forCli) progress.stop();
    } finally {
        if (forCli) {
            console.log = oldLog;
            for (let i = 0; i < consoleArguments.length; i++) console.log.apply(this, consoleArguments[i]);
        }
    }

    if (forCli && !options.noErrors) {
        for (const error of errors) {
            if (error.tolerable) console.log(chalk.yellow(`Tolerable error parsing ${error.file} - ${error.message}`));
            else console.log(chalk.red(`Error parsing ${error.file} - ${error.message}`));
        }
    }

    // Second pass of checks (in "GlobalChecks")
    // Now that we have all the "naive" findings we may analyze them further to sort out false negatives
    // and false positives before presenting them in the final report (e.g. CSP)
    issues = await globalChecker.getResults(issues);

    issues.forEach(function (issue, i, issues) {
        // adjust to Relative or Absolute path
        if (options.isRelative) issues[i].file = getRelativePath(options.input, issue.file);

        // Process issues output for my needs.
        if (options.benni) {
            // Limit sample length to 120 chars.
            if (issues[i].sample) issues[i].sample = issues[i].sample.substring(0, 120);
            delete issues[i].description;
            delete issues[i].shortenedURL;
            delete issues[i].manualReview;
            delete issues[i].severity;
            delete issues[i].confidence;
        }
    });

    let rows = [];
    if (forCli && !options.benni) {
        for (const issue of issues) {
            if (
                issue.severity.value >= options.severitySet.value &&
                issue.confidence.value >= options.confidenceSet.value
            )
                rows.push([
                    `${issue.id}${
                        issue.manualReview ? chalk.bgRed(`\n*Review Required*`) : ``
                    }\n${issue.severity.format()} | ${issue.confidence.format()}`,
                    issue.file,
                    `${issue.location.line}:${issue.location.column}`,
                    `${options.isVerbose ? issue.description + '\n' + issue.shortenedURL : issue.shortenedURL}`,
                ]);
        }
    }

    if (options.output) writeIssues(options.output, issues, options.isSarif);

    const res = {
        globalChecks: globalChecker._enabled_checks.length,
        atomicChecks: finder._enabled_checks.length,
        issues,
        electronVersion,
    };
    if (!options.noErrors) res.errors = errors;
    if (forCli) {
        if (options.jsonOverride) console.dir(res, { depth: null });
        else {
            if (rows.length > 0) {
                table.push(...rows);
                console.log(table.toString());
            } else console.log(chalk.green(`\nNo issues were found.`));
        }
    } else return res;
}
