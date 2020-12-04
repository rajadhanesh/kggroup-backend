const express = require('express');
const router = express.Router();
const Joi = require('joi');
const moment = require('moment');

const response = require('../util/response');

router.post('/book', (req, res) => {
    const body = req.body;
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
        const givenTime = String(Number(payload.time.split(':')[0]));
        let dateTime = moment(`${payload.date}" "${payload.time}:00`);
  
        req.db.appoinments.find({ date: payload.date, from: { $regex: givenTime } }).toArray((error, resp) => {
            if (resp.length > 0) {
                req.db.patient.find({date: payload.date, time: { $regex: givenTime }}).toArray((error, timeResp) => { 
                    console.log('timeResp', timeResp);
                });

                // let storePayload = {
                //     name: body.name,
                //     mobileNo: body.mobileNo,
                //     date: body.date,
                //     time: body.time,
                //     bookedDateTime: dateTime.format(),
                //     createdDate: new Date()
                // }
                // req.db.patient.insertOne(storePayload, { $set: {storePayload} }, {upsert: true}, (error, resp) => {
                //     console.log(resp);
                // });
                res.json(response.success([], 'Booked successfully'));
            } else {
                res.json(response.failure([], 'slot not avaliable'));
            }
        });
    } else {
        res.json(response.failure([], validation.error.details));
    }
});


module.exports = router;