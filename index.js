require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urlDatabase = [];
let urlCounter = 0;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;

  if (!url || !/^https?:\/\//.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    urlCounter += 1;
    urlDatabase[urlCounter] = url;

    res.json({ original_url: url, short_url: urlCounter });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.redirect('/');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
