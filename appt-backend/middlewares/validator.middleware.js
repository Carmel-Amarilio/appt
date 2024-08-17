import Joi from "joi";

export const validateAccount = (req, res, next) => {
    const { error } = accountSchema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error);
        return res.status(400).json({ error: error.details.map((err) => err.message) });
    }
    next()
}

export const validateAppt = (req, res, next) => {
    const { error } = apptSchema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error);
        return res.status(400).json({ error: error.details.map((err) => err.message) });
    }
    next()
}


const locSchema = Joi.object({
    country: Joi.string().min(2).allow(''),
    city: Joi.string().min(2).allow(''),
    street: Joi.string().min(2).allow(''),
    houseNumber: Joi.string().min(1).allow(''),
    lat: Joi.number().allow(0),
    lng: Joi.number().allow(0),
});

const eventSchema = Joi.object({
    _id: Joi.string().required(),
    title: Joi.string().required(),
    color: Joi.string().optional(),
    start: Joi.date(),
    end: Joi.date(),
    repeats: Joi.number().required(),
    notes: Joi.string().optional(),
    participants: Joi.string().optional(),
    apptServiceId: Joi.string().optional(),
    className: Joi.string().optional(),
    borderColor: Joi.string().optional(),
    datesChange: Joi.array().optional().items(Joi.object({
        oldStart: Joi.date(),
        newStart: Joi.date(),
        newEnd: Joi.date(),
    })),
    dateDelete: Joi.array().optional().items(Joi.object({
        start: Joi.date(),
    }))
});

const calendarSchema = Joi.object({
    EndingHourDay: Joi.string().required(),
    startingHourDay: Joi.string().required(),
    apptServices: Joi.array().items(Joi.object({
        _id: Joi.string().required(),
        title: Joi.string().required(),
        color: Joi.string().required(),
        apptDuration: Joi.number().required(),
        breakDuration: Joi.number().required(),
    })),
    events: Joi.array().items(eventSchema)
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
});

const apptSchema = Joi.object({
    accountId: Joi.string().min(1).required(),
    appt: eventSchema,
});

