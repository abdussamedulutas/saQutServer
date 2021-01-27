const {
    HttpServer,WebSocket
} = require("./Core/Server");

var httpServer = new HttpServer();
httpServer.setPort(2000);
httpServer.setHost("0.0.0.0");
httpServer.setRouterPath(__dirname+"/Data/Router/HTTP2000.js");
httpServer.enableWebSocket();
httpServer.setTimeout(30000);
httpServer.start();
httpServer.on("verbose",function(obj){
    console.log("verbose/> " + obj.text);
})
httpServer.on("warning",function(obj){
    console.log("warning/> " + obj.text);
})
httpServer.on("error",function(obj){
    console.log("error/> " + obj.text);
})