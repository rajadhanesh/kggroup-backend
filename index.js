/** core modules */
const express = require('express');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const envConfig = dotenv.config();

/** external modules */
const DB_config = require('./config/database');
const PORT_config = require('./config/port');
const gv = require('./util/gv');
const errorHandler = require('./util/errorHandler');
const { routerMsg } = require('./util/respMessages');

const app = express();
const kgGroup = {};
let apiVersion = '';

/** To Support Cross Platform */
app.use('', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());       /**  to support JSON-encoded bodies */
app.use(bodyParser.urlencoded({ extended: true })); /** to support URL-encoded bodies */

/** Database Connection */
MongoClient.connect(DB_config.MONGODB_URI, { useUnifiedTopology: true }, (err, dbConnection) => {
    if (err) {
        console.log(`KG-Group Server not connected, Error: ${err.message}, Timestamp: ${new Date()}`);
    } else {
        kgGroup.Connection = dbConnection;
        kgGroup.dbConnection = dbConnection.db();
        const dbConn = kgGroup.dbConnection;

        /** Collection access */
        kgGroup.appoinments = dbConn.collection('appoinments');
        kgGroup.patient = dbConn.collection('patient');

        console.log(`KG-Group Server Connected, Timestamp: ${new Date()}`);
    }
});

/**  Expose Global Variables Through The Request Object */
app.use((req, res, next) => {
    req.gv = gv;
    apiVersion = req.gv.apiVersion;
    req.db = kgGroup;
    next();
});


/** Trim request body data*/
app.use(require('./util/trimmer'));

/** Controllers */
app.use('/admin', require('./controllers/appoinment'));
app.use('/patient', require('./controllers/patient'));

app.all('*', function (req, res) {
    let err = new Error(routerMsg.f.pageNotFound);
    err.status = routerMsg.code.pageNotFound;
    throw err;
});

/** Error Handler */
app.use(errorHandler);


/** Set port **/
app.set('port', PORT_config.port.address);

const server = app.listen(app.get('port'), () => console.log('Express Server Listening On Port ' + server.address().port));

module.exports = app;