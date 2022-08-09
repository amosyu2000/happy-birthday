const { google } = require('googleapis');
const logger = require('./logger');
const package = require('../package.json');

module.exports = async function(auth) {
    google.options({ auth });
    const people = google.people('v1');

    try {
        const { data } = await people.people.connections.list({
            personFields: ['names', 'birthdays'],
            resourceName: 'people/me',
        });

        const peopleWithBirthdays = data.connections.filter(person => person.birthdays !== undefined);
        logger(`§FgFound the birthdays of ${peopleWithBirthdays.length} ${peopleWithBirthdays.length === 1 ? 'person' : 'people'} in your contacts.`);
        return peopleWithBirthdays.map(person => {
            const primaryBirthday = person.birthdays.find(birthday => birthday.metadata.primary === true);
            const primaryName = person.names.find(name => name.metadata.primary === true);
            return {
                date: primaryBirthday.date,
                name: primaryName.displayName,
            }
        })
    } catch (e) {
        if (e.code === 403) {
            logger(`§FyFailed to access the People API. Make sure that the §B${package.name} §n§Fyapplication has permission to see and download your contacts.`);
        } else {
            logger(`§FyAn unexpected error occurred. Please file a bug report to §B§u${package.bugs.url}.\n§n§Fr${e.stack}`);
        }
        return [];
    }
}