/**
 * Description:
 * Author: apple
 * Date: 2017/7/10.
 */

var express = require('express');
var fs = require('fs');
var app = express();

app.get('/getbank',function (req,res) {
   fs.readFile(__dirname + '/data/' + 'bank.json',  'utf8', function(err,data){
       if(err){
           console.error(err);
           return;
       }

       // 输出 JSON 格式
       res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
       //res.end(JSON.stringify(data));
       res.end(data);
   }) ;
});

app.get('/', function(req, res){
    "use strict";
    res.redirect('/page/index.html');
});

var server = app.use(express.static("static")).listen(8002,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
});
