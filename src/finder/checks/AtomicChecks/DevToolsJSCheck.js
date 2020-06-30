import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class DevToolsJSCheck {
    constructor() {
        this.id = 'DEV_TOOLS_JS_CHECK';
        this.description = `Disable Chromium DevTools in production`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = '';
    }

    match(astNode, astHelper, scope) {
        if (astNode.type !== 'NewExpression') return null;
        if (astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') return null;

        let location = [];

        if (astNode.arguments.length > 0) {
            var target = scope.resolveVarValue(astNode);

            const found_nodes = astHelper.findNodeByType(
                target,
                astHelper.PropertyName,
                astHelper.PropertyDepth,
                false,
                (node) => node.key.value === 'devTools' || node.key.name === 'devTools'
            );

            for (const node of found_nodes) {
                if (node.value.value === true) {
                    location.push({
                        line: node.key.loc.start.line,
                        column: node.key.loc.start.column,
                        id: this.id,
                        description: this.description,
                        shortenedURL: this.shortenedURL,
                        severity: severity.LOW,
                        confidence: confidence.CERTAIN,
                        manualReview: false,
                    });
                }
            }
            if (found_nodes.length === 0) {
                location.push({
                    line: astNode.loc.start.line,
                    column: astNode.loc.start.column,
                    id: this.id,
                    description: this.description,
                    shortenedURL: this.shortenedURL,
                    severity: severity.MEDIUM,
                    confidence: confidence.CERTAIN,
                    manualReview: false,
                });
            }
        }

        return location;
    }
}
