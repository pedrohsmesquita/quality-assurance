const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, db) {
    app.route('/').get((req, res) => {
        res.render('index', {
            title: 'Home page',
            message: 'Please login',
            showLogin: true,
            showRegistration: true
        });
    });

    app.route('/register').post((req, res, next) => {
        db.findOne({username: req.body.username}, (err, user) => {
            if (err) next(err);
            else if (user) res.redirect('/');
            const hash = bcrypt.hashSync(req.body.password, 12);
            db.insertOne({
                username: req.body.username,
                password: hash
            }, (err, doc) => {
                if (err) res.redirect('/');
                else next(null, doc.ops[0]);
            });
        });
    }, passport.authenticate('local', {failureRedirect: '/'}), (req, res, next) => {
        res.redirect('/profile');
    });

    app.route('/login').post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
        res.redirect('/profile');
    });

    app.route('/auth/github').get(passport.authenticate('github'));

    app.route('/auth/github/callback').get(passport.authenticate('github', {failureRedirect: '/'}), (req, res) => {
        res.redirect('/profile');
    });
        
    app.route('/profile').get(ensureAuthenticated, (req, res) => {
        res.render('profile', {username: req.user.username});
    });

    app.route('/logout').get((req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.use((req, res, next) => {
        res.status(404)
            .type('text')
            .send('Not Found');
    });

}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
};