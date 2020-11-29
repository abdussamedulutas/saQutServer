const {
    HttpServer,WebSocket
} = require("./Core/Server");

var httpServer = new HttpServer();
httpServer.setPort(2000);
httpServer.setHost("0.0.0.0");
httpServer.setRouterPath(__dirname+"/Data/Router/HTTP2000.js");
httpServer.enableWebSocket();
httpServer.setTimeout(30);
httpServer.start();