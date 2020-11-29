//var {
//    MVC,
//    MVCRouter
//} = require("./Core/MVC");
//
//require("http").createServer(request).listen(2000);
//
// 
//var liveRouter = liveImport(require.resolve("./Data/Router/router.js"),function(){
//    let _router = liveRouter.include()(new MVCRouter());
//    setImmediate(i=>{
//        router = _router;
//    })
//});
// let router = liveRouter.include()(new MVCRouter());
// function request(req,res)
// {
//     var http = new MVC(req,res);
//     http.router = router;
//     http.execute();
// };
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
    var http = require("http");
    /**
     * 
     * @param {http.IncomingMessage} req 
     * @param {http.OutgoingMessage} res 
     */
    this.request = function(req,res){
        if(server.suspended == true)
        {
            res.connection.destroy();
            return;
        }
        var http = new MVC(req,res);
        http.router = server.router;
        http.execute();
    };
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
    this._server.setTimeout(this.httpTimeout);
    this._server.listen(this.port,this.host);

    var realPath = path.resolve(__dirname+"/../",this.routerPath)
    this.liveRouter = liveImport(realPath,()=>{
        let _router = this.liveRouter.include()(new MVCRouter());
        process.nextTick(()=>{
            this.router = _router;
        })
    });
    this.router = this.liveRouter.include()(new MVCRouter());
};
HttpServer.prototype.suspend = function(){
    this.suspended = true;
};
HttpServer.prototype.resume = function(){
    this.suspended = false;
};
HttpServer.prototype.stop = function(){
    this._server.close();
    this.liveRouter.close();
};






exports.HttpServer = HttpServer;
exports.WebSocket = HttpServer;