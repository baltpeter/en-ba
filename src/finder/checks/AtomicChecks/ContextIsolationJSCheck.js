import { sourceTypes } from '../../../parser/types';

export default class ContextIsolationJSCheck {
    constructor() {
        this.id = 'CONTEXT_ISOLATION_JS_CHECK';
        this.description = `Review the use of the contextIsolation option`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = 'https://git.io/Jeu1p';
    }

    match(astNode, astHelper, scope) {
        if (astNode.type !== 'NewExpression') return null;
        if (astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') return null;

        let location = [];
        if (astNode.arguments.length > 0) {
            const target = scope.resolveVarValue(astNode);

            const contextIsolation = astHelper.findNodeByType(
                target,
                astHelper.PropertyName,
                astHelper.PropertyDepth,
                false,
                (node) => node.key.value === 'contextIsolation' || node.key.name === 'contextIsolation'
            );

            if (contextIsolation.length > 0) {
                // explicitly disabled
                for (const node of contextIsolation) {
                    // in practice if there are two keys with the same name, the value of the last one wins
                    // but technically it is an invalid json
                    // just to be on the safe side show a warning if any value is insecure
                    location.push({
                        line: node.key.loc.start.line,
                        column: node.key.loc.start.column,
                        id: this.id,
                        properties: { type: node.value.value ? 'explicitly_enabled' : 'explicitly_disabled' },
                    });
                }
            } else {
                // not present (-> implicitly disabled)
                location.push({
                    line: astNode.loc.start.line,
                    column: astNode.loc.start.column,
                    id: this.id,
                    properties: { type: 'implicitly_disabled' },
                });
            }
        } else {
            // no webpreferences (-> implicitly disabled)
            location.push({
                line: astNode.loc.start.line,
                column: astNode.loc.start.column,
                id: this.id,
                properties: { type: 'implicitly_disabled' },
            });
        }

        return location;
    }
}
