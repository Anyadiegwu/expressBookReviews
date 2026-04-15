const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.session && req.session.authorization && req.session.authorization.accessToken) {
        token = req.session.authorization.accessToken;
    }

    if (!token) {
        return res.status(403).json({ message: "User not authenticated. Please login first." });
    }

    jwt.verify(token, "access", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired access token. Please login again." });
        }
        
        req.user = user;   
        next();
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
