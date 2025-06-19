// const cds = require("@sap/cds");
// const cov2ap = require("@cap-js-community/odata-v2-adapter");
// //cds.on("bootstrap", (app) => app.use(cov2ap()));
// const express = require('express');
// const bodyParser = require('body-parser');
// const path = require('path');
// const fs = require('fs');
 
// cds.on("bootstrap", (app) => {
//     app.use(cov2ap());
//     // Set the limit to 1GB or adjust as needed
//     app.use(express.json({ limit: '1gb' }));
//     app.use(express.urlencoded({ limit: '1gb', extended: true }));
//     app.use('/files', express.static(path.join(__dirname, 'files')));
//   });
 
// module.exports = cds.server;
const cds = require("@sap/cds");
const cov2ap = require("@cap-js-community/odata-v2-adapter");
const express = require('express');
const path = require('path');

cds.on("bootstrap", (app) => {
    app.use(cov2ap());

    // Increase payload size limit
    app.use(express.json({ limit: '1gb' }));
    app.use(express.urlencoded({ limit: '1gb', extended: true }));

    // Serve static files from the 'files' directory
    app.use('/files', express.static(path.join(__dirname, 'files')));
});

module.exports = cds.server;
