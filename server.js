const express = require('express');
const app = express();
const path = require('path');
const SystemService = require('./src/system_service');

const session = require('express-session');
const passport = require('passport');
require('./src/configs/passport_config')(passport);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, `${process.env.BP_SRC_PATH}/views`));
app.use(express.static(__dirname + '/nfs/public'));

app.use(express.urlencoded({ extended: false }));
//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.use('/', require('./src/routes/index_route'));
app.use('/login', require('./src/routes/login_route'));


const startServer = async (port = 3000) => {

    await SystemService.initSystem(app);
    app.use((req, res, next) => res.status(404).send(res.render('404')));

    SystemService.startServer(port);


}

const stopServer = () => {
    app.close();
}

startServer();

