const express = require('express');
const path = require('path');

const middlewares = require('./middleware');
const indexRoutes = require('./routes');

const app = express();

app.set('view engine', 'ejs');

app.use('/static/vendor',
  express.static(path.join(__dirname, 'public', 'vendor'),
    { immutable: true, maxAge: '1y' }));
app.use('/static/assets',
  express.static(path.join(__dirname, 'public', 'assets'),
    { maxAge: '1d' }));

app.use(middlewares);
app.use('/', indexRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App has been started on port ${port}`));
