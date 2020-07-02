import * as attributes from '../../attributes';
import * as csp from '@doyensec/csp-evaluator';

export default class CSPGlobalCheck {
    constructor() {
        this.id = 'CSP_GLOBAL_CHECK';
        this.description = {
            NO_CSP: 'No CSP has been detected in the target application',
            MAYBE_WEAK_CSP: 'One or more CSP directives detected seems to be vulnerable',
            WEAK_CSP: 'One or more CSP directives detected are vulnerable',
        };
        this.depends = ['CSPJSCheck', 'CSPHTMLCheck'];
        this.shortenedURL = 'https://git.io/JeuMe';
    }

    async perform(issues) {
        const cspIssues = issues.filter((e) => e.id === 'CSP_JS_CHECK' || e.id === 'CSP_HTML_CHECK');
        const otherIssues = issues.filter((e) => e.id !== 'CSP_JS_CHECK' && e.id !== 'CSP_HTML_CHECK');

        const properties = {
            csp_list: [],
            no_csp_found: false,
            num_strong_csps: 0,
            num_maybe_weak_csps: 0,
            num_weak_csps: 0,
        };
        if (cspIssues.length === 0) {
            // No CSP detected
            properties.no_csp_found = true;
        } else {
            // There is a CSP set
            for (const cspIssue of cspIssues) {
                properties.csp_list.push(cspIssue.properties.CSPstring);

                const parser = new csp.CspParser(cspIssue.properties.CSPstring);
                const evaluator = new csp.CspEvaluator(parser.csp, csp.Version.CSP3);
                const findings = evaluator.evaluate();
                let worst_grade = 'strong';

                for (const finding of findings) {
                    console.log(finding);
                    if (finding.severity === csp.severities.HIGH || finding.severity === csp.severities.MEDIUM) {
                        worst_grade = 'weak';
                    } else if (
                        (finding.severity === csp.severities.HIGH_MAYBE ||
                            finding.severity === csp.severities.MEDIUM_MAYBE) &&
                        worst_grade == 'strong'
                    ) {
                        worst_grade = 'maybe_weak';
                    }
                }

                if (worst_grade === 'strong') properties.num_strong_csps++;
                else if (worst_grade === 'maybe_weak') properties.num_maybe_weak_csps++;
                else if (worst_grade === 'weak') properties.num_weak_csps++;
            }
        }

        const report = {
            file: 'N/A',
            location: { line: 0, column: 0 },
            id: this.id,
            description: this.description.NO_CSP,
            shortenedURL: this.shortenedURL,
            properties,
        };
        return [...otherIssues, report];
    }
}
