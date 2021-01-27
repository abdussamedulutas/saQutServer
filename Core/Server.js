const { EventEmitter } = require("events");
const { inherits } = require("util");
require("./utils");
const path = require("path");
function HttpServer()
{
    this.port = 80;
    this.host = "0.0.0.0";
    this.routerPath = null;
    this.isSecureHttp = {
        enabled:false,
        cert:null,
        bundle:null,
        private:null
    };
    this.useWebSocket = false;
    this._server = null;
    this.router = null;
    this.liveRouter = null;

    var {
        MVC,
        MVCRouter
    } = require("./MVC");
    var server = this;
    this.sockets = [];
    this.request = function(req,res){
        server.emit("request",req,res);
        var http = new MVC(req,res);
        http.server = server;
        http.router = server.router;
        http.execute();
        res.on("finish",()=>{
            server.sockets = server.sockets.filter((socket,index) => index != k);
        })
    }
};
inherits(HttpServer,EventEmitter);

HttpServer.prototype.setPort = function(i){
    this.port = i;
};
HttpServer.prototype.setHost = function(i){
    this.host = i;
};
HttpServer.prototype.setRouterPath = function(i){
    this.routerPath = i;
};
HttpServer.prototype.enableWebSocket = function(){
    this.useWebSocket = true;
};
HttpServer.prototype.setTimeout = function(i){
    this.httpTimeout = i;
};
HttpServer.prototype.disableWebSocket = function(){
    this.useWebSocket = false;
};
HttpServer.prototype.start = function(){
    var {MVCRouter} = require("./MVC");
    let http = require("http")
    this._server = http.createServer(this.request);
    this._server.setTimeout(this.httpTimeout,()=>{
        this.emit("warning",{
            text:"Connection timeout",
            stace:stackTrace()
        })
    });
    this._server.maxConnections = Infinity;
    this._server.listen(this.port,this.host,()=>{
        this.emit("verbose",{
            text:"Port is listenning " + this.port,
            stace:stackTrace()
        })
    });

    var realPath = path.resolve(__dirname+"/../",this.routerPath)
    this.liveRouter = liveImport(realPath,()=>{
        try{
            let _router = this.liveRouter.include()(new MVCRouter());
            process.nextTick(()=>{
                this.router = _router;
            })
        }catch(i){
            this.emit("error",{
                text:this.routerPath+" cannot reapplied",
                stace:stackTrace()
            })
        }
    });
    this.router = this.liveRouter.include()(new MVCRouter());
};
HttpServer.prototype.suspend = function(){
    this._server.maxConnections = -1;
    this.emit("warning",{
        text:"Port is suspended, port is "+this.port,
        stace:stackTrace()
    })
};
HttpServer.prototype.resume = function(){
    this._server.maxConnections = Infinity;
    this.emit("verbose",{
        text:"Port is resumed, port is "+this.port,
        stace:stackTrace()
    })
};
HttpServer.prototype.stop = function(){
    this._server.close();
    this.liveRouter.close();
    this.emit("verbose",{
        text:"Port is stopped, port is "+this.port,
        stace:stackTrace()
    })
};






exports.HttpServer = HttpServer;
exports.WebSocket = HttpServer;