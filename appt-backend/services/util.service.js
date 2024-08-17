import fs from 'fs'
import moment from "moment";


export const utilService = {
    readJsonFile,
    checkForAllDuplicates,
    makeId,
    isApptAvailable
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

function isApptAvailable(calendar, appt) {
    const newEvents = [];
    calendar.events.forEach(event => {

        if (event.repeats > 0) {
            let nextEventStart = moment(event.start).clone()
            let nextEventEnd = moment(event.end).clone()

            while (true) {
                if (nextEventStart.isAfter(moment().add(1, 'months'))) break

                const newEventInstance = {
                    ...event,
                    start: nextEventStart.toDate(),
                    end: nextEventEnd.toDate(),
                }

                if (event.datesChange) event.datesChange.forEach(({ oldStart, newStart, newEnd }) => {
                    if (new Date(oldStart).setMilliseconds(0) === nextEventStart.toDate().getTime()) {
                        newEventInstance.start = new Date(newStart)
                        newEventInstance.end = new Date(newEnd)
                    }
                })

                const IsEventInDelete = event.dateDelete ? event.dateDelete.find(({ start }) => new Date(start).setMilliseconds(0) === newEventInstance.start.getTime()) : false
                if (!IsEventInDelete) newEvents.push(newEventInstance)

                switch (event.repeats) {
                    case 1: // Every day
                        nextEventStart.add(1, 'days')
                        nextEventEnd.add(1, 'days')
                        break;
                    case 2: // Every week
                        nextEventStart.add(1, 'weeks')
                        nextEventEnd.add(1, 'weeks')
                        break;
                    case 3: // Every month
                        nextEventStart.add(1, 'months')
                        nextEventEnd.add(1, 'months')
                        break;
                    default:
                        break;
                }
            }

        } else { newEvents.push({ ...event, start: new Date(event.start), end: new Date(event.end) }) }
    })
    const apptService = calendar.apptServices.find(({ _id }) => _id === appt.apptServiceId)
    const allOpenAppt = calculateOptimalAppointments(newEvents, apptService)
    const apptExist = allOpenAppt.find(({ start, end }) =>
        new Date(appt.start).getTime() === new Date(start).getTime() &&
        new Date(appt.end).getTime() === new Date(end).getTime()
    )
    if (apptExist) return true
    return false
}

function calculateOptimalAppointments(events, apptService) {
    const { apptDuration, breakDuration, color } = apptService;
    const appointments = [];
    const startDay = new Date().setHours(0, 0, 0, 0);
    const endDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1);

    // Sort events by start time
    events.sort((a, b) => +a.start - +b.start);

    // Generate appointments for each day
    for (let day = new Date(startDay); day <= endDay; day.setDate(day.getDate() + 1)) {
        let dayStart = new Date(day.setHours(0, 0, 0, 0));
        let dayEnd = new Date(day.setHours(23, 59, 59, 999));

        // Filter events for the current day
        let dayEvents = events.filter(event => {
            return (event.start < dayEnd && event.end > dayStart);
        });

        let lastEndTime = dayStart.getTime();

        for (let i = 0; i <= dayEvents.length; i++) {
            let event = dayEvents[i];
            let nextStartTime = event ? event.start.getTime() : dayEnd.getTime();

            while (lastEndTime + apptDuration * 60000 <= nextStartTime) {
                let appointmentStart = new Date(lastEndTime);
                let appointmentEnd = new Date(appointmentStart.getTime() + apptDuration * 60000);

                appointments.push({
                    start: appointmentStart,
                    end: appointmentEnd,
                    title: 'appt Option',
                    repeats: 0,
                    className: 'appt-option',
                    borderColor: color
                });

                lastEndTime = appointmentEnd.getTime() + breakDuration * 60000;
            }

            if (event) {
                lastEndTime = Math.max(lastEndTime, event.end.getTime());

                // If the event has className 'appt-schedule', add breakDuration
                if (event.className === 'appt-schedule') {
                    lastEndTime += breakDuration * 60000;
                }
            }
        }
    }

    return appointments;
}
