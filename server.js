const express = require('express');
const app = express();
const path = require('path');
const SystemService = require('./src/system_service');
const { ensureAuthenticated } = require('./src/configs/auth_config');

const session = require('express-session');
const passport = require('passport');
require('./src/configs/passport_config')(passport);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './nfs/brunoperry_net/src/views'));
app.use(express.static(__dirname + '/nfs/brunoperry_net/public'));

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


app.use('/', require('./src/routes/homex_route'));
app.use('/login', require('./src/routes/login_route'));
// app.use((req, res, next) => res.status(404).send(res.render('404')));

const startServer = async (port = 3000) => {

    await SystemService.initSystem(app);

    app.listen(port, () => {
        console.log(`Server started at port:${port}!`);
    });
}

const stopServer = () => {
    app.close();
}

startServer();

