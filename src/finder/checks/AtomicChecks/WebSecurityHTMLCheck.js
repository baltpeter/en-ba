import { sourceTypes } from '../../../parser/types';
import { parseWebPreferencesFeaturesString } from '../../../util';

export default class WebSecurityHTMLCheck {
    constructor() {
        this.id = 'WEB_SECURITY_HTML_CHECK';
        this.description = `Do not use disablewebsecurity`;
        this.type = sourceTypes.HTML;
        this.shortenedURL = 'https://git.io/JeuMr';
    }

    match(cheerioObj, content) {
        const loc = [];
        const webviews = cheerioObj('webview');
        const self = this;
        webviews.each(function (i, elem) {
            let found = false;
            const disablewebsecurity = cheerioObj(this).attr('disablewebsecurity');
            if (disablewebsecurity !== undefined) {
                found = true;
                loc.push({
                    line: content.substr(0, elem.startIndex).split('\n').length,
                    column: 0,
                    id: self.id,
                    properties: { type: disablewebsecurity === 'true' ? 'explicitly_disabled' : 'explicitly_enabled' },
                });
            }

            let wp = cheerioObj(this).attr('webpreferences');
            if (wp) {
                let features = parseWebPreferencesFeaturesString(wp);
                if (features['webSecurity'] === false || features['webSecurity'] === true) found = true;
                loc.push({
                    line: content.substr(0, elem.startIndex).split('\n').length,
                    column: 0,
                    id: self.id,
                    properties: { type: features['webSecurity'] ? 'explicitly_enabled' : 'explicitly_disabled' },
                });
            }

            if (!found) {
                loc.push({
                    line: content.substr(0, elem.startIndex).split('\n').length,
                    column: 0,
                    id: self.id,
                    properties: { type: 'implicitly_enabled' },
                });
            }
        });
        return loc;
    }
}
