const _ = require('underscore');
const { string } = require('@hapi/joi');
 
module.exports =  (req, res, next) => {  
    req.body = _.object(_.map(req.body, function (value, key) {
      if(typeof value === 'string') {
        return [key, value.trim()];
      } else {
        return [key, value];
      }
    }));
    next();
}
  