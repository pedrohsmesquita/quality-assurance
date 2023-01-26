require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const { ObjectID } = require('mongodb');

module.exports = function (app, db) {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        db.findOne({_id: new ObjectID(id)}, (err, doc) => {
            done(null, doc);
        });
    });

    passport.use(new LocalStrategy((username, password, done) => {
        db.findOne({username: username}, (err, user) => {
            console.log(`User ${username} has attempted to log in.`);
            if (err) return done(err);
            if (!user) return done(null, false);
            if (!bcrypt.compareSync(password, user.password)) return done(null, false);
            return done(null, user);
        });
    }));

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://boilerplate-advancednode.pedrohsmesquita.repl.co/auth/github/callback'
    }, (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
    }));
}