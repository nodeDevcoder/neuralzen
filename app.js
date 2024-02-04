const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const morgan = require('morgan');
const middleware = require('./middleware');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const Entry = require('./models/entry');
const axios = require('axios');
const { isLoggedIn } = require('./middleware');
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(morgan('combined'));

mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/vikinghacks')
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));

app.use(session({
    name: 'vks',
    secret: process.env.SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        name: 'vks-auth',
        maxAge: 24000 * 60 * 60 * 14, // 14 days
        secure: 'auto'
    },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL || 'mongodb://127.0.0.1:27017/vikinghacks'
    })
})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.name = 'DrawNeur';
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('err');
    res.locals.warning = req.flash('warn');
    res.locals.success = req.flash('success');
    res.locals.protocol = req.protocol;
    res.locals.hostURL = req.get('host');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/chat', (req, res) => {
    res.render('chat')
})

app.get('/login', middleware.notLoggedIn, (req, res) => {
    res.render('login');
});

app.post('/login', middleware.notLoggedIn, passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: true,
    failureFlash: true,
    successRedirect: '/dashboard'
}));

app.get('/signup', middleware.notLoggedIn, (req, res) => {
    res.render('signup');
});

app.post('/signup', middleware.notLoggedIn, (req, res) => {
    dob_day = new Date(req.body.dob_day);
    gender = req.body.gender;
    if (!(req.body.email && dob_day && gender)) {
        res.redirect('/signup');
    }
    User.register(new User({ email: req.body.email, dob: dob_day, gender: gender }), req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.redirect('/signup');
        }
        console.log(user);
        passport.authenticate('local')(req, res, () => {
            res.redirect('/dashboard');
        });
    });
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
    let entries = await Entry.find({ user: req.user._id }).limit(10).sort({ updatedAt: -1 });
    console.log(entries);
    res.render('dashboard', { entries: entries });
});

app.get('/entries/new', isLoggedIn, async (req, res) => {
    let roomId;
    await axios.post('https://hq.pixelpaper.io/api/board', {}, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer d6rVWyvJWwlf8u3VjMJBhdQq7grXVkcZN1nTZfKV'
        }
    }).then(res => {
        console.log(res.data.room_id)
        roomId = res.data.room_id;
    }).catch(err => console.log(err));
    let newId = await Entry.create({ title: 'New Entry', journal: 'Dump your thoughts...', board: { id: roomId }, user: req.user._id });
    res.redirect('/entries/' + newId._id);
});

app.get('/entries/:id', isLoggedIn, async (req, res) => {
    let entry = await Entry.findOne({ _id: req.params.id, user: req.user._id });
    if (entry) {
        res.render('entry', { entry: entry });
    } else {
        res.render('404');
    }
});

app.post('/entries/:id', isLoggedIn, async (req, res) => {
    let q = req.query;
    let entry = await Entry.findOne({ _id: req.params.id, user: req.user._id });
    console.log(q)
    if (entry && q) {
        if (q.method === 'delete') {
            console.log('DELETE')
            await Entry.deleteOne({ _id: req.params.id, user: req.user._id });
            res.send('GOOD!');
        }
        else if (q.method === 'edit') {
            switch (q.def) {
                case 'title':
                    entry.title = q.val;
                    await entry.save();
                    break;
                case 'desc':
                    entry.journal = q.val;
                    await entry.save();
                    break;
            }
        }
    } else {
        res.render('404');
    }
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        else { res.redirect('/') }
    });
})

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));