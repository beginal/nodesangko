const express = require('express')
const app = express();
const fs = require('fs');
const compression = require('compression')
const bodyParser = require('body-parser')
const pageRouter = require('./route/page')
const indexRouter = require('./route/index')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get('*', (req, res, next) => {
  fs.readdir('./data', (err, filelist) => {
    req.list = filelist
    next();
  });
});

app.use('/page', pageRouter);
app.use('/', indexRouter);

app.use((err,req,res,next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use((req, res, next) => res.status(404).send('Sorry not find Page'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
