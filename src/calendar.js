const { google } = require('googleapis');
const { bugs, name, settings } = require('../package.json');
const logger = require('./logger');
const question = require('./question');

module.exports = async function(auth, birthdays) {
    google.options({ auth });
    const calendar = google.calendar('v3');

    try {
        let selectedCalendarId = null;

        const birthdayCalendars = await listBirthdayCalendars();
        for (const id of birthdayCalendars) {
            const doSelectCalendar = question(`§FcFound a calendar named §B"${settings.birthdayCalendar.name}" §n§Fcwith ID §B"${id}". §n§FcReplace it?`);
            if (doSelectCalendar) {
                deleteCalendar(id);
                selectedCalendarId = await createCalendar();
                break;
            }
        }
        if (selectedCalendarId === null) {
            const doCreateCalendar = question(`§FcYou don't own any${birthdayCalendars.length > 0 ? ' more ' : ' '}calendars named §B"${settings.birthdayCalendar.name}". §n§FcCreate${birthdayCalendars.length > 0 ? ' another ' : ' '}one?`);
            if (doCreateCalendar) {
                selectedCalendarId = await createCalendar();
            }
            else {
                return '';
            }
        }

        for (const birthday of birthdays) {
            await insertBirthdayToCalendar(birthday, selectedCalendarId);
        }
        logger(`§FgAdded ${birthdays.length} birthdays to the calendar.`);
        return selectedCalendarId;

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

    async function insertBirthdayToCalendar(birthday, calendarId) {
        // By default, all the birthday events start this year
        const currentYear = (new Date()).getFullYear();
        const date = new Date(currentYear, birthday.date.month-1, birthday.date.day);
        // If a year is provided, use it instead
        if (birthday.date.year) {
            date.setFullYear(birthday.date.year);
        }
        // If the birthday has already passed this year, have the event start next year
        else if (date < new Date()) {
            date.setFullYear(date.getFullYear() + 1);
        }

        const eventDateTime = { date: date.toISOString().split('T')[0] };
        await calendar.events.insert({
            calendarId,
            requestBody: {
                colorId: settings.birthdayEvent.colorId,
                end: eventDateTime,
                recurrence: ["RRULE:FREQ=YEARLY"],
                start: eventDateTime,
                summary: settings.birthdayEvent.summary.replace(/%s/g, birthday.name),
                transparency: "transparent",
            }
        })
    }
}