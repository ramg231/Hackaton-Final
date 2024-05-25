const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const webhookRouter = require('./app/routes/webhook.routes'); 
const app = express();

const dbConfig = require("./app/config/db.config.js");
const db = require("./app/models");

 
app.use(cors());
app.use(
    cookieSession({
        name: "auth-session",
        keys: ["COOKIE_SECRET"], // Usar como variable de entorno secreta
        httpOnly: true
    })
);

// Conexión a MongoDB
mongoose.set('strictQuery', false);
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to MongoDB.");
    initial(); // Llama a la función de inicialización si es necesario
}).catch(err => {
    console.error("Connection error", err);
    process.exit();
});

// Rutas
require("./app/routes/auth.routes")(app);
require("./app/routes/homeproduct.routes.js")(app);
require("./app/routes/product.routes.js")(app);
require("./app/routes/checkout.routes.js")(app);
require("./app/routes/order.routes.js")(app);
require("./app/routes/payment.routes.js")(app);

// Ruta de webhook
app.use(webhookRouter); // Monta el enrutador de webhook en la ruta /webhook

// Error handling - 404 Not Found
app.use((req, res, next) => {
  res.status(404).send({ message: "Resource not found" });
});

// Error handling - 500 Internal Server Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Internal server error" });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

function initial() {
    // Asegurar roles iniciales
    const Role = db.role;
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({ name: "user" }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection");
            });

            new Role({ name: "moderator" }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'moderator' to roles collection");
            });

            new Role({ name: "admin" }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection");
            });
        }
    });
}
