/**
 * This module contains API response template
 */

class Response {
    success(data, message) {
        return { status: true, data, message}
    };

    failure(data, message) {
        return { status: false, data, message}
    }
}

module.exports = new Response();