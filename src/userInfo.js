const { google } = require('googleapis');
const logger = require('./logger');

module.exports = async function(auth) {
    google.options({ auth });
    const oauth2 = google.oauth2('v2');

    const { data } = await oauth2.userinfo.get({});
    logger(`§FgSuccessfully signed in as §B${data.name}§n§Fg.`)
}