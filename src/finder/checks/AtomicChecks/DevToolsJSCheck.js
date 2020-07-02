import { sourceTypes } from '../../../parser/types';

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
                location.push({
                    line: node.key.loc.start.line,
                    column: node.key.loc.start.column,
                    id: this.id,
                    properties: { type: node.value.value ? 'explicitly_enabled' : 'explicitly_disabled' },
                });
            }
            // not specified (-> implicitly enabled)
            if (found_nodes.length === 0) {
                location.push({
                    line: astNode.loc.start.line,
                    column: astNode.loc.start.column,
                    id: this.id,
                    properties: { type: 'implicitly_enabled' },
                });
            }
        }

        return location;
    }
}
