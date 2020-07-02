import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class LoadedWebsitesJSCheck {
    constructor() {
        this.id = 'LOADED_WEBSITES_JS_CHECK';
        this.description = `Which websites are loaded?`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = '';
    }

    match(astNode, astHelper, scope) {
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
                    method: astNode.callee.name || (astNode.callee.property && astNode.callee.property.name),
                },
                manualReview: false,
            },
        ];
    }
}
