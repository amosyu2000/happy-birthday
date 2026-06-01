const { google } = require('googleapis');
const logger = require('./logger');
const package = require('../package.json');

module.exports = async function(auth, username) {
    google.options({ auth });
    const people = google.people('v1');

    const peopleList = await asyncListAllPeople(people);

    const peopleWithEvents = peopleList.filter(person => person.birthdays !== undefined || people.events !== undefined);
    logger(`§FgFound the events of ${peopleWithEvents.length} ${peopleWithEvents.length === 1 ? 'person' : 'people'} in your contacts.`);

    const events = [];
    peopleWithEvents.forEach(person => {
        const { displayName } = person.names.find(name => name.metadata.primary === true);
        const name = displayName === username ? 'My' : `${displayName}'s`;

        if (person.birthdays !== undefined) {
            const primaryBirthday = person.birthdays.find(birthday => birthday.metadata.primary === true);
            events.push({
                date: primaryBirthday.date,
                name: `🎂 ${name} birthday`
            });
        }
        if (person.events !== undefined) {
            person.events.forEach(event => {
                events.push({
                    date: event.date,
                    name: `📅 ${name} ${event.type}`
                })
            });
        }
    });
    return events;

    async function asyncListAllPeople(googlePeople, peopleList = [], pageToken = undefined) {
        try {
            const { data } = await googlePeople.people.connections.list({
                personFields: ['names', 'birthdays', 'events'],
                // https://stackoverflow.com/a/60519966/12191708
                pageSize: 10,
                pageToken: pageToken,
                resourceName: 'people/me',
            });
            const { connections, nextPageToken, totalItems } = data;
            const nextPeopleList = [...peopleList, ...connections];

            if (nextPageToken && nextPeopleList.length < totalItems) {
                return asyncListAllPeople(googlePeople, nextPeopleList, nextPageToken);
            }
            return nextPeopleList;
        } catch (e) {
            if (e.code === 403) {
                logger(`§FyFailed to access the People API. Make sure that the §B${package.name} §n§Fyapplication has permission to see and download your contacts.`);
            } else {
                logger(`§FyAn unexpected error occurred. Please file a bug report to §B§u${package.bugs.url}.\n§n§Fr${e.stack}`);
            }
            return [];
        }
    }
}
