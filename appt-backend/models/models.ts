
export interface Account {
    _id?: string
    name: string
    phone: string
    password: string
    profileImgUrl: string
    backImgUrl: string
    imgsUrl: string[]
    instaName: string
    loc: Loc
    calendar: {
        events: Event[]
        apptServices: ApptService[]
        startingHourDay: string
        EndingHourDay: string
    }
}
export interface Loc {
    country: string
    city: string
    street: string
    houseNumber: string
    lat: number
    lng: number
}
export interface calendar {
    events: Event[]
    apptServices: ApptService[]
    startingHourDay: string
    EndingHourDay: string
}


export interface Event {
    _id: string
    title: string
    color?: string
    start: Date
    end: Date
    repeats: number,
    notes?: string
    participants?: string
    apptServiceId?: string
    className?: string
    borderColor?: string
    datesChange?: {
        oldStart: Date
        newEvent: {
            title: string
            color: string
            start: Date
            end: Date
        }
    }[]
    dateDelete?: {
        start: Date
    }[]
}
export interface ApptService {
    _id: string
    title: string
    color: string
    apptDuration: number
    breakDuration: number
    latestBook: number
    earliestBook: number
}
export interface FilterBy {
    bizName: string
    page: number
}

export interface Appt {
    accountId: string
    appt: {
        apptServiceId: string
        start: Date
        end: Date
    }
}

