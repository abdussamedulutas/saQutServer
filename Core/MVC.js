const http = require("http");
const fs = require("fs");

global.MVC = MVC;
const path = require("path");
global.ixir = require("./ixir");
global.crypto = require("./crypto");
global._cv = _cv;
global.bytesToSize = function(bytes) {
   if(bytes == 0) return "0 bytes";
   var i = Math.floor(Math.log(bytes) / Math.log(1024)),
   sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];

   return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
};

global.liveImport = function(path,change){
    let args_ = require(path);
    _cv("Live import stated watching",path);
    fs.watch(path,{},(event)=>{
        _cv("Live import updating module",path);
        change&&change();
        delete require.cache[require.resolve(path)];
        try{
            args_ = require(path);
        }catch(i){
            _cv("Live import error module",path);
        }
    })
    return {
        include:() => args_,
        close:() => fs.unwatchFile(path)
    }
}
function _cv()
{
    var text = [], i = 0;
    while(arguments[i] != null)
    {
        text.push(arguments[i++]);
    };
    var g = new Date();
    var ms = g.getMilliseconds();
    var sn = g.getSeconds();
    var dk = g.getMinutes();
    var st = g.getHours();

    sn = sn<10?"0"+sn:sn;
    dk = dk<10?"0"+dk:dk;
    st = st<10?"0"+st:st;
    process.stdout.write([st,dk,sn].join(":")+" | "+text.join(' ')+"\n");
};


/**
 * 
 * @param {http.IncomingMessage} request 
 * @param {http.OutgoingMessage} response 
 */
function MVC(request,response)
{
    this.response = response;
    this.request = request;
    this.method = request.method;
    this.url = new URL(request.url,"https://" + request.headers.host);
    this.settings = new MVCSettings();
    this.postData = {};
    this.post = (t) => this.postData[t];
    this.get = (t) => this.url.searchParams.get(t)
    this.files = {};

    this.cookie = new MVC.cookie(request,response);
    this.session = new MVC.session(request,response);
    this.session.CookieControl = this.cookie;

    this.controllerPath = "";
    this.setControllerPath = (t) => this.controllerPath = t;
    this.getControllerPath = () => this.controllerPath;
    /**
     * @type {MVCRouter}
     */
    this.router = null;
}
require("./statusCodes");
require("./datatransfer");
require("./cookie");
require("./session");
require("./request");
require("./statusCodes");
MVC.prototype.execute = async function()
{
    if(this.checkMultipartData())
    {
        if(this.settings.MultipartFormData.allow)
        {
            await this.ResolveMultiPartFormData();
        }
        else
        {
            return this.Send400BadRequest();
        }
    }
    if(this.checkUrlEncoded())
    {
        if(this.settings.urlencoded.allow)
        {
            await this.ResolveUrlEncoded();
        }
        else
        {
            return this.Send400BadRequest();
        }
    };
    let {request,filter} = this.router.execute(this);
    if(filter != null)
    {
        let stack = null;
        if(request.constructor.name == "Function")
        {
            stack = request(this);
        }else if(request.constructor.name == "AsyncFunction")
        {
            stack = await request(this);
        };
        if(this.getControllerPath() == null)
        {
            return this.Send500InternalServerError();
        };
        try
        {
            if(stack != 0xff)
            {
                var realPath = path.resolve(__dirname+"/../",this.getControllerPath())
                var R = require(realPath);
                R.init(this);
            }
        }
        catch(i)
        {
            this.Send500InternalServerError();
        }
    }else if(request == null && filter){
        this.Send200Ok();
    }else{
        this.Send404NotFound();
    }
};
function MVCSettings()
{
    this.MultipartFormData = {
        allow:true,
        MaxUploadFile:10e9,
        UploadsDir:__dirname+"/../Data/Uploads/"
    };
    this.urlencoded = {
        allow:true
    };
}

exports.MVC = MVC;
exports.MVCRouter = MVCRouter;


function MVCRouter(){
    /**
     * @type {{filter:MVCRouterFilter,request:Function}[]}
     */
    this.mvcFilters = [];
    this.execute = function(mvc){
        for(var filterSettings of this.mvcFilters)
        {
            if(filterSettings.filter.execute(mvc))
            {
                return filterSettings;
            }
        };
        return {filter:null,request:null};
    };
};
/**
 * 
 * @param {(callback:MVCRouterFilter)=>{}} callback 
 */
MVCRouter.prototype.filter = function(callback)
{
    var t = {
        request:(func) => t._requestFunct = func
    };
    var filter = new MVCRouterFilter();
    if(callback.constructor.name == "Function")
    {
        callback(filter);
        setImmediate(()=>{
            this.mvcFilters.push({
                filter:filter,
                request:t._requestFunct
            })
        })
    }else if(callback.constructor.name == "AsyncFunction"){
        callback(filter).then(() => {
            this.mvcFilters.push({
                filter:filter,
                request:t._requestFunct
            })
        })
    }
    return t;
};
function MVCRouterFilter(){
    this.cookieFilter = false;
    this.postFilter = false;
    this.getFilter = false;
    this.urlRegexFilter = false;
    this.urlTextFilter = false;
    this.hostFilter = false;
    this.portFilter = false;
    this.originFilter = false;

    this.cookieFilters = [];
    this.postFilters = [];
    this.getFilters = [];
    this.urlRegexFilters = [];
    this.urlTextFilters = [];
    this.hostFilters = [];
    this.portFilters = [];
    this.httpFilters = [];
    this.originFilters = [];
}

MVCRouterFilter.prototype.cookie = function(key)
{
    this.cookieFilter |= true;
    this.cookieFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.post = function(key)
{
    this.postFilter |= true;
    this.postFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.get = function(key)
{
    this.getFilter |= true;
    this.getFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.regex = function(key)
{
    this.urlRegexFilter |= true;
    this.urlRegexFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.text = function(key)
{
    this.urlTextFilter |= true;
    this.urlTextFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.host = function(key)
{
    this.hostFilter |= true;
    this.hostFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.port = function(key)
{
    this.portFilter |= true;
    this.portFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.http = function(key)
{
    this.httpFilter |= true;
    this.httpFilters.push(key);
    return this;
};
MVCRouterFilter.prototype.origin = function(key)
{
    this.originFilter |= true;
    this.originFilters.push(key);
    return this;
};
/**
 * @param {MVC} mvc
 */
MVCRouterFilter.prototype.execute = function(mvc)
{
    var path = mvc.url.pathname;
    var cookieControl = mvc.cookie;
    if(this.urlTextFilter)
    {
        let flag = false;
        this.urlTextFilters.filter(i => typeof i == "string").map(text =>{
            if(text == path)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.urlRegexFilter)
    {
        let flag = false;
        this.urlRegexFilters.filter(i => i instanceof RegExp).map(text =>{
            if(text.test(path))
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.cookieFilter)
    {
        let flag = false;
        this.cookieFilters.filter(i => typeof i == "string").map(text =>{
            if(cookieControl.get(text) !== null)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.postFilter)
    {
        let flag = false;
        this.postFilters.filter(i => typeof i == "string").map(text =>{
            if(mvc.post(text) !== null)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.getFilter)
    {
        let flag = false;
        this.getFilters.filter(i => typeof i == "string").map(text =>{
            if(mvc.get(text) !== null)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.hostFilter)
    {
        let flag = false;
        this.hostFilters.filter(i => typeof i == "string").map(text =>{
            if(mvc.request.headers.host == text)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.portFilter)
    {
        let flag = false;
        let port = new URL("https://"+mvc.request.headers.host).port;
        this.portFilters.filter(i => i instanceof Number).map(text =>{
            if(port == text)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.httpFilter)
    {
        let flag = false;
        let header = mvc.request.headers;
        this.httpFilters.filter(i => typeof i == "string").map(text =>{
            if(header[text] !== undefined)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    if(this.originFilter)
    {
        let flag = false;
        let origin = mvc.request.headers.origin;
        this.originFilters.filter(i => typeof i == "string").map(text =>{
            if(origin == text)
            {
                flag = true
            }
        })
        if(!flag) return false
    }
    return true;
}