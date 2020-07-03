import { sourceTypes } from '../../../parser/types';

export default class SandboxJSCheck {
    constructor() {
        this.id = 'SANDBOX_JS_CHECK';
        this.description = `Use sandbox for untrusted origins`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = 'https://git.io/JeuM2';
    }

    match(astNode, astHelper, scope) {
        if (astNode.type !== 'NewExpression') return null;
        if (astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') return null;

        let wasFound = false;
        let loc = [];
        if (astNode.arguments.length > 0) {
            var target = scope.resolveVarValue(astNode);

            const found_nodes = astHelper.findNodeByType(
                target,
                astHelper.PropertyName,
                astHelper.PropertyDepth,
                false,
                (node) => node.key.value === 'sandbox' || node.key.name === 'sandbox'
            );

            for (const node of found_nodes) {
                wasFound = true;
                loc.push({
                    line: node.key.loc.start.line,
                    column: node.key.loc.start.column,
                    id: this.id,
                    properties: { type: node.value.value ? 'explicitly_enabled' : 'explicitly_disabled' },
                });
            }
        }

        if (wasFound) {
            return loc;
        } else {
            // default is false
            return [
                {
                    line: astNode.loc.start.line,
                    column: astNode.loc.start.column,
                    id: this.id,
                    properties: { type: 'implicitly_disabled' },
                },
            ];
        }
    }
}
