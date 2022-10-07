const { google } = require('googleapis');
const { bugs, name, settings } = require('../package.json');
const logger = require('./logger');
const question = require('./question');

module.exports = async function(auth, birthdays) {
    google.options({ auth });
    const calendar = google.calendar('v3');

    try {
        let selectedCalendarID = null;

        const birthdayCalendars = await listBirthdayCalendars();
        for (const id of birthdayCalendars) {
            const doSelectCalendar = question(`§FcFound a calendar named §B"${settings.birthdayCalendar.name}" §n§Fcwith ID §B"${id}". §n§FcReplace it?`);
            if (doSelectCalendar) {
                deleteCalendar(id);
                selectedCalendarID = await createCalendar();
                break;
            }
        }
        if (selectedCalendarID === null) {
            const doCreateCalendar = question(`§FcYou don't own any${birthdayCalendars.length > 0 ? ' more ' : ' '}calendars named §B"${settings.birthdayCalendar.name}". §n§FcCreate${birthdayCalendars.length > 0 ? ' another ' : ' '}one?`);
            if (doCreateCalendar) {
                selectedCalendarID = await createCalendar();
            }
            else {
                return '';
            }
        }
    } catch (e) {
        if (e.code === 403) {
            logger(`§FyFailed to access the Calendar API. Make sure that the §B${name} §n§Fyapplication has permission to see and edit your calendars.`);
        } else {
            logger(`§FyAn unexpected error occurred. Please file a bug report to §B§u${bugs.url}.\n§n§Fr${e.stack}`);
        }
        return '';
    }

    async function listBirthdayCalendars() {
        const { data } = await calendar.calendarList.list({});
        return data.items
            .filter(c => c.summary === settings.birthdayCalendar.name)
            .map(c => c.id);
    }

    async function createCalendar() {
        const { data } = await calendar.calendars.insert({
            requestBody: {
                summary: settings.birthdayCalendar.name,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
        });
        logger(`§FgCreated a new calendar named §B"${settings.birthdayCalendar.name}" §n§Fgwith ID §B"${data.id}".`);
        return data.id;
    }

    async function deleteCalendar(calendarId) {
        await calendar.calendars.delete({ calendarId });
        logger(`§FgDeleted calendar named §B"${settings.birthdayCalendar.name}" §n§Fgwith ID §B"${calendarId}".`);
    }
}