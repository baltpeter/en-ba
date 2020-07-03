import { sourceTypes } from '../../../parser/types';

export default class NodeIntegrationHTMLCheck {
    constructor() {
        this.id = 'NODE_INTEGRATION_HTML_CHECK';
        this.description = `Disable nodeIntegration for untrusted origins`;
        this.type = sourceTypes.HTML;
        this.shortenedURL = 'https://git.io/JeuMG';
    }

    match(cheerioObj, content) {
        const loc = [];
        const webviews = cheerioObj('webview');
        const self = this;
        webviews.each(function (i, elem) {
            const nodeintegration = cheerioObj(this).attr('nodeintegration');
            const nodeintegrationInSubframes = cheerioObj(this).attr('nodeintegrationinsubframes');

            let type = '';
            if (nodeintegration === 'true' || nodeintegrationInSubframes === 'true') type = 'explicitly_enabled';
            else if (nodeintegration === 'false' || nodeintegrationInSubframes === 'false') {
                type = 'explicitly_disabled';
            } else type = 'implicitly_disabled';

            loc.push({
                line: content.substr(0, elem.startIndex).split('\n').length,
                column: 0,
                id: self.id,
                properties: { type },
            });
        });
        return loc;
    }
}
