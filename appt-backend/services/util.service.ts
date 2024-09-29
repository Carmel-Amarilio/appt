import fs from 'fs'
import moment from "moment";
import { ApptService, calendar, Event } from '../models/models';


export const utilService = {
    makeId,
    isApptAvailable
}


// function readJsonFile(path) {
//     const str = fs.readFileSync(path, 'utf8')
//     const json = JSON.parse(str)
//     return json
// }


// function checkForAllDuplicates(tags1, tags2) {
//     for (const tag1 of tags1) {
//         if (!tags2.includes(tag1)) {
//             return false;
//         }
//     }
//     return true;
// }

function makeId(length = 5) {
    var txt = ''
    var possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function isApptAvailable(calendar: calendar, appt: { apptServiceId: string, start: Date, end: Date }) {
    const newEvents: Event[] = [];
    calendar.events.forEach(event => {

        if (event.repeats > 0) {
            let nextEventStart = moment(event.start).clone()
            let nextEventEnd = moment(event.end).clone()

            while (true) {
                if (nextEventStart.isAfter(moment().add(1, 'months'))) break

                let newEventInstance = {
                    ...event,
                    start: nextEventStart.toDate(),
                    end: nextEventEnd.toDate(),
                }

                if (event.datesChange) event.datesChange.forEach(({ oldStart, newEvent }) => {
                    if (new Date(oldStart).setMilliseconds(0) === nextEventStart.toDate().getTime()) {
                        newEventInstance = { ...newEventInstance, ...newEvent }
                        newEventInstance.start = new Date(newEventInstance.start)
                        newEventInstance.end = new Date(newEventInstance.end)
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
    if (!apptService) return false
    const allOpenAppt = calculateOptimalAppointments(newEvents, apptService)
    const apptExist = allOpenAppt.find(({ start, end }) =>
        new Date(appt.start).getTime() === new Date(start).getTime() &&
        new Date(appt.end).getTime() === new Date(end).getTime()
    )
    if (apptExist) return true
    return false
}

function calculateOptimalAppointments(events: Event[], apptService: ApptService) {
    const { apptDuration, breakDuration, color, latestBook, earliestBook } = apptService;
    const appointments = [];
    const startDay = new Date(new Date()).setDate(new Date().getDate() + earliestBook)
    const endDay = (new Date(new Date()).setDate(new Date().getDate() + latestBook))
    const now = new Date();


    events.sort((a, b) => +a.start - +b.start);

    // @ts-ignore
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
                let appointmentEnd = new Date(appointmentStart.getTime() + apptDuration * 60000)

                if (appointmentStart >= now) {
                    appointments.push({
                        start: appointmentStart,
                        end: appointmentEnd,
                        repeats: 0,
                    });
                }

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
