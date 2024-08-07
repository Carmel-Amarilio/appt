import Joi from "joi";

export const validateAccount = (req, res, next) => {
    const { error } = accountSchema.validate(req.body, { abortEarly: false });
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

const calendarSchema = Joi.object({
    _id: Joi.string().required(),
    title: Joi.string().min(1).required(),
    is: Joi.boolean(),
    startTime: Joi.string().required(),
    finishesTime: Joi.string().required(),
    apptLong: Joi.number().required(),
    breakTime: Joi.number().required(),
    daysOff: Joi.array().items(Joi.string()).required(),
    hoursOff: Joi.array().items(Joi.object({
        start: Joi.string(),
        end: Joi.string(),
    })).required(),
    apptTimes: Joi.array().items(Joi.object({
        start: Joi.string().required(),
        end: Joi.string().required(),
    })).required(),
    datesNotAvailable: Joi.array().items(Joi.date()),
    scheduledDates: Joi.array().items(Joi.object({
        _id: Joi.date(),
        dayStartTime: Joi.string(),
        dayFinishesTime: Joi.string(),
        dayApptLong: Joi.number(),
        dayBreakTime: Joi.number(),
        dayHoursOff: Joi.array().items(Joi.object({
            start: Joi.string(),
            end: Joi.string(),
        })),
        daysSchedule: Joi.array().items(Joi.object({
            start: Joi.string(),
            end: Joi.string(),
            phone: Joi.string(),
            name: Joi.string(),
            _id: Joi.string(),
        })),
    })),
});

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
    calendars: Joi.array().items(calendarSchema),
});

