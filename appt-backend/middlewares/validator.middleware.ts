import { Request, Response, NextFunction } from 'express';
import Joi from "joi";

export const validateAccount = (req: Request, res: Response, next: NextFunction) => {
    const { error } = accountSchema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error);
        return res.status(400).json({ error: error.details.map((err) => err.message) });
    }
    next()
}

export const validateAppt = (req: Request, res: Response, next: NextFunction) => {
    const { error } = apptSchema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error);
        return res.status(400).json({ error: error.details.map((err) => err.message) });
    }
    next()
}




const eventSchema = Joi.object({
    _id: Joi.string().required(),
    title: Joi.string().required(),
    color: Joi.string().optional(),
    start: Joi.date(),
    end: Joi.date(),
    repeats: Joi.number().required(),
    notes: Joi.string().optional(),
    participants: Joi.array().optional().items(Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
    })),
    maxParticipants: Joi.number().optional(),
    apptServiceId: Joi.string().optional(),
    className: Joi.string().optional(),
    borderColor: Joi.string().optional(),
    datesChange: Joi.array().optional().items(Joi.object({
        oldStart: Joi.date(),
        newEvent: Joi.object({
            title: Joi.string().required(),
            color: Joi.string().optional(),
            start: Joi.date(),
            end: Joi.date(),
            participants: Joi.array().optional().items(Joi.object({
                name: Joi.string().required(),
                phone: Joi.string().required(),
            })),
        }),
    })),
    dateDelete: Joi.array().optional().items(Joi.object({
        start: Joi.date(),
    }))
});



const apptSchema = Joi.object({
    accountId: Joi.string().min(1).required(),
    appt: eventSchema,
})

const calendarSchema = Joi.object({
    EndingHourDay: Joi.string().required(),
    startingHourDay: Joi.string().required(),
    apptServices: Joi.array().items(Joi.object({
        _id: Joi.string().required(),
        title: Joi.string().required(),
        color: Joi.string().required(),
        apptDuration: Joi.number().required(),
        breakDuration: Joi.number().required(),
        latestBook: Joi.number().required(),
        earliestBook: Joi.number().required(),
    })),
    events: Joi.array().items(eventSchema)
})

const locSchema = Joi.object({
    country: Joi.string().min(2).allow(''),
    city: Joi.string().min(2).allow(''),
    street: Joi.string().min(2).allow(''),
    houseNumber: Joi.string().min(1).allow(''),
    lat: Joi.number().allow(0),
    lng: Joi.number().allow(0),
})

const accountSchema = Joi.object({
    _id: Joi.string().optional(),
    name: Joi.string().min(1).required(),
    phone: Joi.string().required(),
    password: Joi.string().optional(),
    profileImgUrl: Joi.string().allow(''),
    backImgUrl: Joi.string().allow(''),
    imgsUrl: Joi.array().items(Joi.string()).allow(''),
    instaName: Joi.string().allow(''),
    loc: locSchema,
    calendar: calendarSchema,
})
