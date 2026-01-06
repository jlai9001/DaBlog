//express server
require('dotenv').config();


const express = require ('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers');

const app = express();
app.set('trust proxy', 1);

// process.env.port is for publishing online
const PORT = process.env.PORT || 5000;

// health
app.get('/health', (req, res) => {
    res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
    });
});

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// Make currentUser always available to views
app.use((req, res, next) => {
    res.locals.currentUser = null;
    res.locals.error = null;
    res.locals.currentRoute = req.path;
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: 'auto',
        maxAge: 1000 * 60 * 60 // 1 hour
    }
    //cookie exp : {maxAge: new Date (Date.now()+(3600000))}
}));

// create public folder
app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/',require('./server/routes/main'))
app.use('/',require('./server/routes/admin'))

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`App listening on port: ${PORT}`);
        });
    } catch (err) {
        console.error("Server failed to start:", err);
        process.exit(1);
    }
};

startServer();
