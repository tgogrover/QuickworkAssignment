//require all pakages
const express=require('express');
const app=express();
require('dotenv').config()
const credentialAPI=require('./API/credentialAPI')


// express middleware
app.use(credentialAPI)
//port configuration
app.listen((process.env.PORT),()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})
