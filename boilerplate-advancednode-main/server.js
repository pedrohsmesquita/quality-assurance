'use strict';
require('dotenv').config();
const routes = require('./routes.js');
const auth = require('./auth.js');
const express = require('express');
const myDB = require('./connection');
const passport = require('passport');
const session = require('express-session');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI});

fccTesting(app); //For FCC testing purposes
app.set('view engine', 'pug');
app.set('views', './views/pug');
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

myDB(async client => {
    const db = await client.db('dbtest').collection('users');
    
    routes(app, db);
    auth(app, db);

    let currentUsers = 0;

    io.on('connection', socket => {
        ++currentUsers;
        io.emit('user count', currentUsers);
        console.log('user ' + socket.request.user.username + ' connected');

        socket.on('disconnect', () => {
            --currentUsers;
            io.emit('user count', currentUsers);
        });
    });
}).catch(err => {
    app.get('/', (req, res) => {
        res.render('index', {'title': err, 'message': 'Unable to connect to database'});
    });
});

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');

    accept(null, true);
};

function onAuthorizeFail(data, message, error, accept) {
    if (error) throw new Error(message);
    console.log('failed connection to socket.io:', message);
    accept(null, false);
};

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
