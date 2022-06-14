var express = require('express');
var router = express.Router();

const { google } = require('googleapis');

const credentials = require('../credentials/credentials.json');

const scopes = [
  'https://www.googleapis.com/auth/drive.readonly'
];

const auth = new google.auth.JWT(
  credentials.client_email, null,
  credentials.private_key, scopes
);

const drive = google.drive({ version: "v3", auth });

/* GET home page. */
router.get(['/', '/home'], function(req, res, next) {
  res.render('index', { page:'Home', status: 'active' });
});


/* GET messages folder page. */
router.get('/messages?', function(req, res, next) {

  drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder'",
    fields: 'files(name)',
  }, (err, response) => {
    if (err) throw err;
    // using "response.data.files" as is because it is an object - there is no need to convert json.

    let _messages = response.data.files.filter(x => x.name.indexOf("TSA") === -1);
    
    // visit https://evdokimovm.github.io/javascript/nodejs/mongodb/pagination/expressjs/ejs/bootstrap/2017/08/20/create-pagination-with-nodejs-mongodb-express-and-ejs-step-by-step-from-scratch.html for the implementation of pagination
    let totalMessages = _messages.length;
    let itemsPerPage = 12;
    let currentPage = req.query.page || 1;
    let pageCount = Math.ceil(totalMessages / itemsPerPage);
    // let msgArrays = [];
    let msgList = _messages.splice( (itemsPerPage * currentPage) - itemsPerPage, itemsPerPage );

    res.render('messages-folder-view', { 
      page: 'Messages',
      status: 'active', 
      messages: msgList,
      current: currentPage,
      pages: pageCount,
    }); 

    // res.render("test", response.data.files);
    // console.log(_messages[5])

  });

});

/* GET tracks page. */
router.get('/track?', function(req, res, next) {
  let _name = req.query.tracks.split("-").join(" ");
  let _query = `mimeType contains 'audio/' and name contains '${_name}'`;
    drive.files.list({
      q: _query,
      fields: 'files(name, webContentLink)',
      orderBy: 'name'
    }, (err, response) => {
      if (err) throw err;
      // using "response.data.files" as is because it is an object - there is no need to convert json.
      let tracks = response.data.files.map(m => {
        return {
          name: m.name.split(".")[0].split("_")[0],
          date: m.name.split(".")[0].split("_")[1],
          webContentLink: m.webContentLink
        }
      });; 

      res.render('messages-tracks-view', {
        tracks,
        _name,
        page: "Tracks"
      });

      console.log(`Track ject:`)
      console.log(tracks)

    });

});

module.exports = router;
