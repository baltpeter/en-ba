import { sourceTypes } from '../../../parser/types';

export default class RemoteModuleJSCheck {
    constructor() {
        this.id = 'REMOTE_MODULE_JS_CHECK';
        this.description = `Disable the remote module`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = 'https://git.io/JvqrQ';
    }

    match(astNode, astHelper, scope, defaults) {
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
                (node) => node.key.value === 'enableRemoteModule' || node.key.name === 'enableRemoteModule'
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
            // in earlier versions, 'remote' is enabled by default (assuming nodeIntegration:true), which is a misconfiguration
            return [
                {
                    line: astNode.loc.start.line,
                    column: astNode.loc.start.column,
                    id: this.id,
                    properties: { type: defaults.enableRemoteModule ? 'implicitly_enabled' : 'implicitly_disabled' },
                },
            ];
        }
    }
}
