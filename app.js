require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const helmet = require('helmet');

const globalVars = require('./middleware');
const indexRoutes = require('./routes');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const dbConnect = require('./utils/db');
const session = require('./utils/session');
const auth = require('./utils/auth');
const getIP = require('./utils/get-ip');

dbConnect();

const app = express();

app.use(globalVars);
app.use(helmet());
app.use(session);
app.use(auth);

app.set('view engine', 'ejs');

app.set('trust proxy', getIP.isTrustedProxy());
app.use(getIP.extractClientIP);

app.use('/static/vendor',
  express.static(path.join(__dirname, 'public', 'vendor'),
    { immutable: true, maxAge: '1y' }));
app.use('/static/assets',
  express.static(path.join(__dirname, 'public', 'assets'),
    { maxAge: '1d' }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashSuccess = req.flash('success');
  res.locals.flashError = req.flash('error');
  next();
});

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', indexRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App has been started on port ${port}`));
