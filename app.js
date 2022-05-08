var express = require('express');
var app = express();

const serveStatic = require('serve-static')
const path = require('path')


app.use(serveStatic(path.join(__dirname, '/')))


const port = process.env.PORT || 3000


app.listen(port , ()=>{
    console.log(path.join(__dirname, '/'))
    console.log("http://localhost:3000/")
    
})