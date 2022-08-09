const { authenticate } = require('@google-cloud/local-auth');
const fs = require('fs');
const logger = require('./src/logger.js');
const package = require('./package.json');
const people = require('./src/people.js');
const userInfo = require('./src/userInfo.js');

async function main() {
    logger(`§Fm${Array(50).join('■')}\n\t§B${package.name}\n§n§Fm${Array(50).join('■')}`);

    // Scopes that I need to request in order to access Google APIs
    // https://developers.google.com/identity/protocols/oauth2/scopes
    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];
    
    // Opens the Google authentication webpage in your browser, using the keys from my GCP project (Project ID: happy-birthday-25)
    // Since the GCP project is in "Testing" mode, only whitelisted users can use it for authentication
    try {
        logger('Please sign in to a Google Account to continue.\nOpening in your browser...');
        const auth = await authenticate({
            keyfilePath: fs.realpathSync('oauth2.keys.json', []),
            scopes
        });
        await userInfo(auth);

        const birthdays = await people(auth);
    } catch (e) {
        if (e.message === 'access_denied') {
            logger(`§FyAuthentication aborted. The §Fm${package.name} §Fyapplication needs access to your Google Account in order to proceed.`);
        } else {
            logger(`§FyAuthentication failed. Please file a bug report to §u${package.bugs.url}.\n§n§Fr${e.stack}`);
        }
    }
}

if (module === require.main) {
    main();
}
