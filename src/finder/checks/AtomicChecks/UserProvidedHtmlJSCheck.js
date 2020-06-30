import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class UserProvidedHtmlJSCheck {
    constructor() {
        this.id = 'USER_PROVIDED_HTML_JS_CHECK';
        this.description = `Don't use user-provided HTML.`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = '';
    }

    match(astNode, astHelper, scope) {
        if (astNode.type !== 'ExpressionStatement') return;
        let shouldReport = false;

        // Catch `element.{innerHTML,outerHTML} = html;`.
        if (
            astNode.expression.type === 'AssignmentExpression' &&
            ['innerHTML', 'outerHTML'].includes(
                astNode.expression.left.property && astNode.expression.left.property.name
            )
        ) {
            if (astNode.expression.right.type === 'Literal') return;
            shouldReport = true;
        }

        // Catch `document.{write,writeln}(html);`.
        // Note: This only matches if called on an object called `document`. This seems like a reasonable tradeoff to
        //       avoid false positives, though.
        if (
            astNode.expression.type === 'CallExpression' &&
            astNode.expression.callee.object &&
            astNode.expression.callee.object.name === 'document' &&
            ['write', 'writeln'].includes(astNode.expression.callee.property && astNode.expression.callee.property.name)
        ) {
            if (astNode.expression.arguments.every((a) => a.type === 'Literal')) return;
            shouldReport = true;
        }

        // Catch `element.insertAdjacentHTML(position, html)`.
        if (
            astNode.expression.type === 'CallExpression' &&
            astNode.expression.callee.property &&
            astNode.expression.callee.property.name === 'insertAdjacentHTML'
        ) {
            if (astNode.expression.arguments[1] && astNode.expression.arguments[1].type === 'Literal') return;
            shouldReport = true;
        }

        if (shouldReport)
            return [
                {
                    line: astNode.loc.start.line,
                    column: astNode.loc.start.column,
                    id: this.id,
                    description: this.description,
                    shortenedURL: this.shortenedURL,
                    severity: severity.MEDIUM,
                    confidence: confidence.CERTAIN,
                    manualReview: true,
                },
            ];
    }
}
