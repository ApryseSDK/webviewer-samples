let indentLevel = 0;

function log(message) {

    // could do more later
    console.log(`${(new Array(indentLevel * 2)).fill(" ").join("")}${message}`);
}

function enter(name) {
    console.log();
    console.log(`${(new Array(indentLevel * 2)).fill(" ").join("")}Entering: ${name}`);
    indentLevel++;
}

function leave(name) {
    indentLevel--;
    console.log(`${(new Array(indentLevel * 2)).fill(" ").join("")}Leaving: ${name}`);
    console.log();
}

function reset() {
    console.clear();
}

module.exports = {
    log,
    enter,
    leave,
    reset,
}
