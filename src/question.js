const logger = require('./logger');
const readlineSync = require('readline-sync');

const types = {
    yesno: '§Fw§r(Y/n)',
}

const defaultOptions = {
    type: 'yesno'
}

module.exports = function(text, options) {
    options = {...defaultOptions, ...options};

    logger(`${text} ${types[options.type]}§n `, { newline: false });
    const answer = readlineSync.question();

    if (options.type === 'yesno') {
        return ['Y', 'y'].includes(answer);
    }
    return answer;
}