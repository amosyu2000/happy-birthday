const colors = [
    ["§n", "\x1b[0m"],
    ["§B", "\x1b[1m"],
    ["§d", "\x1b[2m"],
    ["§u", "\x1b[4m"],
    ["§b", "\x1b[5m"],
    ["§r", "\x1b[7m"],
    ["§h", "\x1b[8m"],

    ["§FB", "\x1b[30m"],
    ["§Fr", "\x1b[31m"],
    ["§Fg", "\x1b[32m"],
    ["§Fy", "\x1b[33m"],
    ["§Fb", "\x1b[34m"],
    ["§Fm", "\x1b[35m"],
    ["§Fc", "\x1b[36m"],
    ["§Fw", "\x1b[37m"],

    ["§BB", "\x1b[40m"],
    ["§Br", "\x1b[41m"],
    ["§Bg", "\x1b[42m"],
    ["§By", "\x1b[43m"],
    ["§Bb", "\x1b[44m"],
    ["§Bm", "\x1b[45m"],
    ["§Bc", "\x1b[46m"],
    ["§Bw", "\x1b[47m"],
];

module.exports = function(text) {
    text = text + '§n'
    colors.forEach(([ id, seq ]) => {
        text = text.replace(new RegExp(id, 'g'), seq);
    });
    console.log(text);
}