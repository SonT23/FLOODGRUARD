const path = require('path');
const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;
const { engine } = require('express-handlebars');


app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', engine({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname + '/resources/views'));

app.use(morgan('combined'));
//template engine

app.get('/index', (req, res) => {
  res.render('index')
});
app.get('/sensor', (req, res) => {
  res.render('sensor')
});
app.get('/report', (req, res) => {
 res.render('report')
});
app.get('/sos', (req, res) => {
  res.render('sos')
});
app.get('/grab', (req, res) => {
  res.render('grab')
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/index`);
});