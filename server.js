const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const mongoose = require('mongoose');
const webhookRouter = require('./app/routes/webhook.routes');
const dbConfig = require('./app/config/db.config.js');
const db = require('./app/models');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'auth-session',
    keys: [process.env.COOKIE_SECRET || 'your_cookie_secret_key'],
    httpOnly: true
}));

// Conexión a MongoDB
mongoose.set('strictQuery', false);
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Successfully connected to MongoDB.');
    initial();
}).catch(err => {
    console.error('Connection error', err);
    process.exit();
});

// Rutas
require('./app/routes/auth.routes')(app);
require('./app/routes/homeproduct.routes')(app);
require('./app/routes/product.routes')(app);
require('./app/routes/checkout.routes')(app);
require('./app/routes/order.routes')(app);
require('./app/routes/payment.routes')(app);

// Ruta de webhook
app.use('/webhook', webhookRouter);

// Manejo de errores
app.use((req, res, next) => {
    res.status(404).send({ message: 'Resource not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Internal server error' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

function initial() {
    // Asegurar roles iniciales
    const Role = db.role;
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({ name: 'user' }).save(err => {
                if (err) {
                    console.log('error', err);
                }
                console.log("added 'user' to roles collection");
            });

            new Role({ name: 'moderator' }).save(err => {
                if (err) {
                    console.log('error', err);
                }
                console.log("added 'moderator' to roles collection");
            });

            new Role({ name: 'admin' }).save(err => {
                if (err) {
                    console.log('error', err);
                }
                console.log("added 'admin' to roles collection");
            });
        }
    });
}
