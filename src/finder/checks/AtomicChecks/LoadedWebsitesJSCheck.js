import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

const extractSample = (lines, start_line, start_col, end_line, end_col) => {
    if (start_line === end_line) {
        return lines[start_line].substring(start_col, end_col);
    } else if (end_line - start_line == 1) {
        return lines[start_line].substring(start_col) + '\n' + lines[end_line].substring(0, end_col);
    } else {
        let result = lines[start_line].substring(start_col);
        for (let i = start_line + 1; i < end_line; i++) result += '\n' + lines[i];
        result += '\n' + lines[end_line].substring(0, end_col);

        return result;
    }
};

const cleanString = (lit) => lit.replace(/^[`'"]/, '').replace(/[`'"]$/, '');

export default class LoadedWebsitesJSCheck {
    constructor() {
        this.id = 'LOADED_WEBSITES_JS_CHECK';
        this.description = `Which websites are loaded?`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = '';
    }

    match(astNode, astHelper, scope, defaults, electron_version, lines) {
        if (astNode.type !== 'CallExpression') return null;
        const INTERESTING_METHODS = ['loadURL', 'loadFile'];
        if (
            !(
                INTERESTING_METHODS.includes(astNode.callee.name) ||
                (astNode.callee.property && INTERESTING_METHODS.includes(astNode.callee.property.name))
            )
        ) {
            return null;
        }

        let target;
        if (!astNode.arguments[0]) target = undefined;
        else if (astNode.arguments[0].type === 'Literal') target = astNode.arguments[0].value;
        else if (astNode.arguments[0].type === 'Identifier') target = scope.resolveVarValue(astNode).value;
        else if (astNode.arguments[0].type === 'CallExpression') {
            // win.loadURL(url.format({ protocol: 'file:', ...args }));
            const arg = astNode.arguments[0].arguments && astNode.arguments[0].arguments[0];
            if (arg && arg.type == 'ObjectExpression') {
                const path_arg = arg.properties && arg.properties.find((p) => p.key && p.key.name === 'protocol');
                if (path_arg) target = path_arg.value && path_arg.value.value;
            }
        } else {
            target = extractSample(
                lines,
                astNode.arguments[0].loc.start.line - 1,
                astNode.arguments[0].loc.start.column,
                astNode.arguments[0].loc.end.line - 1,
                astNode.arguments[0].loc.end.column
            );
        }
        target = cleanString(target);

        let method = astNode.callee.name || (astNode.callee.property && astNode.callee.property.name);
        if (!target) method = 'unknown';
        else if (method === 'loadURL') {
            // See https://tools.ietf.org/html/rfc3986#section-3.1 for valid protocol structure.
            if (!/^[a-zA-Z][a-zA-Z0-9+-.]*:/.test(target)) method = 'unknown';
            else if (new RegExp('^file', 'i').test(target)) method = 'loadFile';
            else if (new RegExp('^https?', 'i').test(target)) method = 'loadURL';
            else method = 'loadFile';
        }

        return [
            {
                line: astNode.loc.start.line,
                column: astNode.loc.start.column,
                id: this.id,
                description: this.description,
                shortenedURL: this.shortenedURL,
                severity: severity.NONE,
                confidence: confidence.CERTAIN,
                properties: {
                    target,
                    method,
                },
                manualReview: false,
            },
        ];
    }
}
