const express = require("express");
const connectDb = require("./util/dbInit");
const bodyParser = require('body-parser');
const validateToken = require("./middeware/validateTokenHandler");

connectDb()
const app = express();

// middleware provided by express to access the body data 
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

app.listen(5001,(req,res)=>{
    console.log(`server start at port 5001`);
})
// use for the file access to public
app.use('/public/profiles', express.static(__dirname + '/public/profiles'));

// registrations
app.use("/api",require("./route/userRoutes"))

// orders 
app.use("/api/orders",require("./route/orderRoutes"))



//  note sharing application where user can share notes accross users 
//  tables - users,notes,shared
// userRoute
// notes route