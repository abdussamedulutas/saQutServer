const cookie = require("cookie");
function Cookie(request,response)
{
    this.newdata = {};
    this.data = request.headers.cookie && cookie.parse(request.headers.cookie) || {};
    this.get = function(name){
        return this.data[name]
    };
    this.set = function(name,value){
        this.data[name]  = this.newdata[name] = value;
    };
    this.remove = function(name){
        this.newdata[name] =  cookie.serialize(name,"deleted",{ expires:new Date(0)});
    };
    this.flush = function(){
        var cookieString = Object.values(this.newdata).join(';');
        response.setHeader("cookie",cookieString);
    };
}
MVC.cookie = Cookie;