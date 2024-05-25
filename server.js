const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        name: "auth-session",
        keys: ["COOKIE_SECRET"], // should use as secret environment variable
        httpOnly: true
    })
);
app.get("/",(req,res)=>{
    res.send("Hola");
})

const dbConfig = require("./app/config/db.config.js");
const db = require("./app/models");

const Role = db.role;
mongoose.set('strictQuery', false);
mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Successfully connected to MongoDB.");
  // Llama a la función de inicialización si es necesario
  initial();
}).catch(err => {
  console.error("Connection error", err);
  process.exit();
});

  require("./app/routes/auth.routes")(app);

 
  require("./app/routes/homeproduct.routes.js")(app);
  require("./app/routes/product.routes.js")(app);
  require("./app/routes/checkout.routes.js")(app);
  require("./app/routes/order.routes.js")(app);

const PORT = process.env.PORT || 8080;



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
          new Role({
            name: "user"
          }).save(err => {
            if (err) {
              console.log("error", err);
            }
    
            console.log("added 'user' to roles collection");
          });
    
          new Role({
            name: "moderator"
          }).save(err => {
            if (err) {
              console.log("error", err);
            }
    
            console.log("added 'moderator' to roles collection");
          });
    
          new Role({
            name: "admin"
          }).save(err => {
            if (err) {
              console.log("error", err);
            }
    
            console.log("added 'admin' to roles collection");
          });
        }
      });
}