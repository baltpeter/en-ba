import { sourceTypes } from '../../../parser/types';

export default class NodeIntegrationJSCheck {
    constructor() {
        this.id = 'NODE_INTEGRATION_JS_CHECK';
        this.description = `Disable nodeIntegration for untrusted origins`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = 'https://git.io/JeuMn';
    }

    //nodeIntegration Boolean (optional) - Whether node integration is enabled. Default is true for versions < 5.0.0.
    //nodeIntegrationInWorker Boolean (optional) - Whether node integration is enabled in web workers. Default is false
    //nodeIntegrationInSubFrames Boolean (optional) - Whether node integration is enabled in in sub-frames such as iframes. Default is false

    match(astNode, astHelper, scope, defaults) {
        if (astNode.type !== 'NewExpression') return null;
        if (astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') return null;

        let nodeIntegrationFound = false;
        let locations = [];
        if (astNode.arguments.length > 0) {
            var target = scope.resolveVarValue(astNode);

            let loc = [];

            nodeIntegrationFound = this.findNode(astHelper, target, 'nodeIntegration', (value) => value === false, loc);
            // nodeIntegrationInWorker default value is safe, as well as nodeIntegrationInSubFrames
            // so no check for return value (don't care if it was found)
            this.findNode(astHelper, target, 'nodeIntegrationInWorker', (value) => value !== true, loc);
            this.findNode(astHelper, target, 'nodeIntegrationInSubFrames', (value) => value !== true, loc);

            locations = locations.concat(loc);
        }

        if (!nodeIntegrationFound) {
            locations.push({
                line: astNode.loc.start.line,
                column: astNode.loc.start.column,
                id: this.id,
                properties: { type: defaults.nodeIntegration ? 'implicitly_enabled' : 'implicitly_disabled' },
            });
        }

        return locations;
    }

    findNode(astHelper, startNode, name, skipCondition, locations) {
        let found = false;
        const nodes = astHelper.findNodeByType(
            startNode,
            astHelper.PropertyName,
            astHelper.PropertyDepth,
            false,
            (node) => {
                return node.key.value === name || node.key.name === name;
            }
        );

        for (const node of nodes) {
            found = true;

            locations.push({
                line: node.key.loc.start.line,
                column: node.key.loc.start.column,
                id: this.id,
                properties: { type: node.value.value ? 'explicitly_enabled' : 'explicitly_disabled' },
            });
        }

        return found;
    }
}
