const { google } = require('googleapis');
const readline = require('readline');
const { bugs, name, settings } = require('../package.json');
const logger = require('./logger');

module.exports = async function(auth, birthdays) {
    google.options({ auth });
    const calendar = google.calendar('v3');

    try {
        const selectedCalendar = null;
        for (const id of await listBirthdayCalendars()) {
            logger(`§FcFound a calendar named §B"${settings.birthdayCalendar.name}" §n§Fcwith ID §B"${id}". §n§FcOverwrite it? §Fw§r(Y/n)`);
        }
    } catch (e) {
        if (e.code === 403) {
            logger(`§FyFailed to access the Calendar API. Make sure that the §Fm${name} §Fyapplication has permission to see and edit your calendars.`);
        } else {
            logger(`§FyFailed to access the Calendar API. Please file a bug report to §u${bugs.url}.\n§n§Fr${e.stack}`);
        }
        return '';
    }

    async function listBirthdayCalendars() {
        const { data } = await calendar.calendarList.list({});
        return data.items
            .filter(c => c.summary === settings.birthdayCalendar.name)
            .map(c => c.id);
    }

}