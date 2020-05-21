import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class UserProvidedCodeExecutionJSCheck {
    constructor() {
        this.id = 'USER_PROVIDED_CODE_EXECUTION_JS_CHECK';
        this.description = `Don't execute user-provided code.`;
        this.type = sourceTypes.JAVASCRIPT;
        this.shortenedURL = '';
    }

    match(astNode, astHelper, scope) {
        if (astNode.type !== 'ExpressionStatement') return;
        let shouldReport = false;

        // Catch `child_process.{exec,execSync}(command)`.
        // TODO: This doesn't check if we are actually executing the respective functions on the `child_process` object.
        if (
            astNode.expression.type === 'CallExpression' &&
            ['exec', 'execSync'].includes(astNode.expression.callee.property && astNode.expression.callee.property.name)
        ) {
            if (astNode.expression.arguments[0] && astNode.expression.arguments[0].type === 'Literal') return;
            shouldReport = true;
        }

        // Catch `child_process.{execFile,execFileSync,spawn,spawnSync}(command, args, options)`, but only if
        // `options.shell === true`.
        // TODO: This doesn't check if we are actually executing the respective functions on the `child_process` object.
        if (
            astNode.expression.type === 'CallExpression' &&
            ['execFile', 'execFileSync', 'spawn', 'spawnSync'].includes(
                astNode.expression.callee.property && astNode.expression.callee.property.name
            )
        ) {
            if (astNode.expression.arguments[0] && astNode.expression.arguments[0].type === 'Literal') return;
            if (
                !astNode.expression.arguments[2] ||
                !astNode.expression.arguments[2].properties.find(
                    (p) =>
                        p.key &&
                        p.key.name === 'shell' &&
                        p.value &&
                        (p.value.value === true || p.value.type === 'Identifier')
                )
            ) {
                return;
            }
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
