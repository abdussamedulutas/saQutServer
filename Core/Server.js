const { EventEmitter } = require("events");
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
        var http = new MVC(req,res);
        http.router = server.router;
        http.execute();
        res.on("finish",()=>{
            server.sockets = server.sockets.filter((socket,index) => index != k);
        })
    }
};

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
        _cv("Server<HTTP> : Connection timeout");
    });
    this._server.maxConnections = Infinity;
    this._server.listen(this.port,this.host);

    var realPath = path.resolve(__dirname+"/../",this.routerPath)
    this.liveRouter = liveImport(realPath,()=>{
        try{
            let _router = this.liveRouter.include()(new MVCRouter());
            process.nextTick(()=>{
                this.router = _router;
            })
        }catch(i){}
    });
    this.router = this.liveRouter.include()(new MVCRouter());
};
HttpServer.prototype.suspend = function(){
    this._server.maxConnections = -1;
};
HttpServer.prototype.resume = function(){
    this._server.maxConnections = Infinity;
};
HttpServer.prototype.stop = function(){
    this._server.close();
    this.liveRouter.close();
};






exports.HttpServer = HttpServer;
exports.WebSocket = HttpServer;