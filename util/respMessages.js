/**
 * This module contains all response messages 
 */

/** router Begins*/
const routerMsg = {
    f:{
        pageNotFound:'no router found'
    },
    code: {
        pageNotFound: 404
    }
}
/** router Ends*/

/** Login Begins*/
const loginMsg = {
    s: 'Login Successfully',
    f: {
        invalidUsername: 'Invalid Username',
        wrongPassword: 'Wrong Password',
        invalidCred: 'Invalid Login Credentials',
        userBlock: `To many unsuccessfully attempts, User Blocked To unblock Kindly contact throught EmailId: xyz@gmail.com`
    }
}
/** Login Ends*/


/** Logout Begins*/
const logoutMsg = {
    s: 'Logout Successfully'
}
/** Logout Ends*/


module.exports = { routerMsg, loginMsg, logoutMsg };