import fs from 'fs'

export const utilService = {
    readJsonFile,
    checkForAllDuplicates,
    makeId,
    getDatesBetween
}


function readJsonFile(path) {
    const str = fs.readFileSync(path, 'utf8')
    const json = JSON.parse(str)
    return json
}


function checkForAllDuplicates(tags1, tags2) {
    for (const tag1 of tags1) {
        if (!tags2.includes(tag1)) {
            return false; 
        }
    }
    return true;
}

function makeId(length = 5) {
    var txt = ''
    var possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function getDatesBetween(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
        currentDate.setHours(0, 0, 0, 0); // Set time to midnight
        dateArray.push(currentDate.toISOString());
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}