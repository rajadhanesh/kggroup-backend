const express = require('express');
const router = express.Router();
const Joi = require('joi');

const response = require('../util/response');

/**
 * To get appoinment list with given date
 */
router.get('/appoinment', (req, res) => {
    const params = req.query;
    const payload = {
        date: params.date,
    }
    req.db.appoinments.find({ date: payload.date }).toArray((error, resp) => {
        if (error) {
            res.json(response.failure([], error.message));
        } else {
            res.json(response.success(resp, 'appoinment list'));
        }
    });
});

/**
 * To create new appoinment
 */
router.post('/appoinment', (req, res) => {
    const body = req.body;
    const payload = {
        date: body.date,
        session: body.session,
        from: new Date(body.from).toLocaleString(),
        to: new Date(body.to).toLocaleString(),
    }
    const schema = Joi.object({
        date: Joi.date(),
        session: Joi.boolean(),
        from: Joi.date(),
        to: Joi.date(),
    });

    const validation = schema.validate(payload);
    if (validation.error === undefined) {
        req.db.appoinments.find({
            date: payload.date, $and: [{ from: { $lt: payload.from } }, { to: { $gte: payload.from }, }],
        }).toArray((error, resp) => {
            req.db.appoinments.find({
                date: payload.date, $and: [{ from: { $lt: payload.to } }, {
                    to: { $gte: payload.to },
                }],
            }).toArray((error, respTo) => {
                let allow = false;
                if ((resp.length === 0 && respTo.length === 0)) {
                    allow = true;
                } else {
                    if(resp.length > 0 && payload.from === resp[0].to) { allow = true };
                    if(respTo.length > 0 && payload.from === respTo[0].to) { allow = true};
                }
                console.log('allow', allow);
                if (allow) {
                    req.db.appoinments.updateOne(payload, { $set: payload }, { upsert: true }, (error, resp) => {
                        if (error) {
                            res.json(response.failure([], error.message));
                        } else {
                            if (resp.upsertedCount > 0) {
                                res.json(response.success({
                                    date: payload.date,
                                    session: payload.session,
                                    from: payload.from,
                                    to: payload.to,
                                }, 'appoinment created succesfully'));
                            } else {
                                res.json(response.failure([], 'duplicate time not allowed'));
                            }

                        }
                    });
                } else {
                    res.json(response.failure([], 'time lies between already allocated slot'));
                }
            });
        });

    } else {
        res.json(response.failure([], validation.error.details));
    }
});


module.exports = router;