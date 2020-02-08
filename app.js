var createError = require('http-errors');
var express = require('express');
var socket_io = require('socket.io');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
var socket_io = require('socket.io');
var socketRoute = require('./routes/socket')
var authRoutes = require('./routes/auth')
var paymentRoutes = require('./routes/payment')
var upiRoutes = require('./routes/upi')
const config = require('./config')

var app = express();

// Socket.io
var io           = socket_io();
app.io           = io;

mongoose.connect(config.dbURI)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(socketRoute(io))
app.use(authRoutes)
app.use('/pay', paymentRoutes)
app.use('/upi', upiRoutes)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
