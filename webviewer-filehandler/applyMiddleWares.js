const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

function applyMiddleWares(app) {
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: 'pdftron',
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60,
            secure: false,
        },
        resave: false
    }));
    app.use(cookieParser());
    app.use(express.static('client'));
}

module.exports = applyMiddleWares;