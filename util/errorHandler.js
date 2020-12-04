/**
 * This module is use to handle all error in the application
 */
const response = require('./response');

const errorHandler = (err, req, res, next)=> {
    const errMsg = err.message;
    if(errMsg === 'Authorization-failed' || errMsg === 'Authorization-expired' || errMsg === 'Authorization-mismatch' || 
    errMsg === 'Authorization-noheader') {
        res.status(500).json(errMsg);
    } else {
        res.json(response.failure('',errMsg));
    }
    
} 

module.exports = errorHandler;
