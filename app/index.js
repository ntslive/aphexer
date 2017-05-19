const express = require('express');
const formidable = require('express-formidable');

const middleware = require('./middleware/index.js');

const app = express();
app.use(formidable());

app.post('/upload', function(req, res) {
    let imageName = req.files.afx.name;

    req.mimeType = middleware.mimeType(req.files.afx.name);
    if (!req.mimeType) { return res.status(400).send('File type not supported.') }
    middleware.aphexImage(req, res, req.files.afx.path);
});

app.get('/', function(req, res) {
    let afxQuery = req.query.afx;
    if (!afxQuery) { return res.sendFile(`${__dirname}/views/index.html`); }

    let imageHref = middleware.parseUri(afxQuery);
    if (!imageHref) { return res.send(`Invalid URL: ${afxQuery}`); }

    req.mimeType = middleware.mimeType(imageHref);
    if (!req.mimeType) { return res.status(400).send('File type not supported'); }
    middleware.aphexImage(req, res, imageHref);
});

let server = app.listen(process.env.PORT || 3001, function() {
    console.log(`Listening at ${server.address().address} ${server.address().port}`);
});
