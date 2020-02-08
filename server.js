'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortUrl = require('./modelShortUrl');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true});

app.use(cors());

app.use(bodyParser.urlencoded({ entended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', (req, res, next)=>{  
  //var { urlToShorten } = req.params;
  var url = req.body.url;
  var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  if(regex.test(url)===true){
    //return res.json({urlToShorten})
    var short = Math.floor(Math.random()*100000).toString();
    
    var data = new shortUrl(
      {
        originalUrl: url,
        shortenUrl: short
      }
    );
    
    data.save(err=>{
      if(err){
        return res.send('Error db save')
      }
    });
    
    return res.json(data)
    
  }
  
  return res.json({"error":"invalid URL"})
});

//Query & Redirect
app.get('/api/shorturl/:urlToForward', (req,res,next)=>{
  var shortenUrl = req.params.urlToForward;
  
  shortUrl.findOne({'shortenUrl': shortenUrl}, (err, data)=>{
    if(err) return res.send('DB Error');
    var re = new RegExp("^(http|https)://", "i");
    var strToCheck = data.originalUrl;
    if(re.test(strToCheck)){
      res.redirect(301, data.originalUrl);
    } else{
      res.redirect(301, 'http://' + data.originalUrl);
  
    }
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});