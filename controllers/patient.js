const express = require('express');
const router = express.Router();
const Joi = require('joi');

const response = require('../util/response');

router.get('/booklist', (req, res) => {
    const params = req.query;
    const payload = {
        date: params.date,
    }
    req.db.patient.find({ date: payload.date }).toArray((error, resp) => {
        if (error) {
            res.json(response.failure([], error.message));
        } else {
            res.json(response.success(resp, 'appoinment list'));
        }
    });
});

/**
 * Create Booking
 */
router.post('/book', (req, res) => {
    const body = req.body;

    /**
     * backend Joi validation
     */
    const payload = {
        name: body.name,
        mobileNo: body.mobileNo,
        date: body.date,
        time: body.time,
    }

    const schema = Joi.object({
        name: Joi.string(),
        mobileNo: Joi.number(),
        date: Joi.date(),
        time: Joi.string(),
    });

    const validation = schema.validate(payload);

    if (validation.error === undefined) {
        /**
         * Find the slot avaliable 
         */
        req.db.appoinments.find({ date: payload.date, from: { $regex: payload.time } }).toArray((error, resp) => {
            if (resp.length > 0) {
                req.db.patient.find({ date: payload.date, $or: [{ time: payload.time }, { expectedTime: payload.time }] }).toArray((error, timeResp) => {
                    let waitingTime = 0;
                    if (timeResp.length > 0) {
                        timeResp.forEach((el) => {
                            if (el.waitingTime === 0) {
                                waitingTime = 30;
                            } else {
                                waitingTime += waitingTime + el.waitingTime
                            }
                        });
                    }
                    const expect = addMinutes(payload.time.split(' ')[0], waitingTime);
                    const temp = `${expect}:00 ${payload.time.split(' ')[1]}`;
                    const expectedTime = (temp.charAt(0) == 0) ? temp.substring(1) : temp;
                    let storePayload = {
                        name: body.name,
                        mobileNo: body.mobileNo,
                        date: body.date,
                        time: body.time,
                        waitingTime: waitingTime,
                        expectedTime: expectedTime,
                        createdDate: new Date()
                    }
                    req.db.patient.updateOne(storePayload, { $set: storePayload }, { upsert: true }, (error, resp) => {
                        if (error) {
                            res.json(response.failure([], error.message));
                        } else {
                            res.json(response.success([], `Booked successfully and your waiting time is ${waitingTime} minutes`));
                        }
                    });
                });
            } else {
                res.json(response.failure([], 'This slot not avaliable'));
            }
        });
    } else {
        res.json(response.failure([], validation.error.details));
    }
});


function addMinutes(time, minsToAdd) {
    function D(J) { return (J < 10 ? '0' : '') + J; };
    var piece = time.split(':');
    var mins = piece[0] * 60 + +piece[1] + +minsToAdd;
    return D(mins % (24 * 60) / 60 | 0) + ':' + D(mins % 60);
}


module.exports = router;