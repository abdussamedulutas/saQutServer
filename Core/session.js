const v8 = require("v8");
const crypto = require('crypto');
const chars = ['q','Q','w','W','e','E','r','R','t','T','y','Y','u','U','i','I','o','O','p','P','A','a','S','s','D','d','F','f','G','g','H','h','J','j','K','k','L','l','Z','z','X','x','C','c','V','v','B','b','N','n','M','m','1','2','3','4','5','6','7','8','9','0'];
let clearMoreThan = "> -10 second, -1 day, -20 minute";
const fs = require("fs");
const path = require("path");

function RandomSessionID()
{
    let random16 = [];
    let randomBuffer = crypto.randomBytes(8);
    randomBuffer.forEach(function(byte){
        random16.push(byte.toString(32));
    });
    return (['DL_','ZK_','QE#','IM'][randomBuffer[0]%4])+random16.join('')+(['A','L','I','C','A','N'][randomBuffer[1]%6]);
};
function SaveSession(path,data)
{
    return new Promise(function(ok){
        let buf = /*JSON.stringify(data);*/v8.serialize(data);
        return fs.writeFileSync(path,buf,"utf8",err=>{
            if(err) _cv(err.message);
            ok();
        });
    })
};
function LoadSession(path)
{
    return new Promise(function(result){
        fs.readFile(path,"utf8",(err,data)=>{
            result(/*JSON.parse(data);*/v8.deserialize(data));
        });
    })
};
function ExistsSession(path)
{
    return new Promise(function(result){
        fs.exists(path,(exists)=>{
            result(exists);
        })
    });
};
function Session()
{
    this.TempFilePath = path.normalize(__dirname + "/../Datas/Sessions/");
    this.data = {};
    this.CookieControl = null;
    this.CookieName = 'sessionid';
    this.CookieKey = null;
    this.SessionFilePath = "";

    this.validUrl = '/';
    this.Capsule = {
        C_DATE : ixir.now().toIXIRFormat(),
        M_DATE : ixir.now().toIXIRFormat()
    };
	this.SetDefaultName = (n)=>{
		this.CookieName = n
	};
    this.setRandomKey = () => this.CookieKey = RandomSessionID();
    this._isopen = false;
    this.isOpen = async function(){
        var ckName = this.CookieControl.Get(this.CookieName);
        if(ckName){
            var SessionFilePath = this.TempFilePath + ckName + ".nses";
            if(await ExistsSession(SessionFilePath)){
                this.CookieKey = ckName;
                await this.Read();
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    this.Public = Session.Public;
    this.Create = async function(){
        this.setRandomKey();
        this.SessionFilePath = this.TempFilePath + this.CookieKey + ".nses";
        await SaveSession(this.SessionFilePath,Session.Capsule.to(this.data,this.Capsule));
        this.CookieControl.set(this.CookieName,this.CookieKey);
        this.CookieControl.flsuh();
    };
	this.clear = function(){
		this.data = {};
	};
    this.Write = async function(){
        this.SessionFilePath = this.TempFilePath + this.CookieKey + ".nses";
        await SaveSession(this.SessionFilePath,Session.Capsule.to(this.data,this.Capsule));
    };
    this.Flush = async function(){
        await this.Write();
    };
    this.Read = async function(){
        this.CookieKey = this.CookieControl.get(this.CookieName);
        this.SessionFilePath = this.TempFilePath + this.CookieKey + ".nses";
        this.Capsule = Session.Capsule.from(await LoadSession(this.SessionFilePath));
        this.data = this.Capsule.data;
    };
    this.Destroy = async function(){
        this.CookieControl.remove(this.CookieName);
        this.CookieControl.flush();
        this.SessionFilePath = this.TempFilePath + this.CookieKey + ".nses";
        fs.unlink(this.SessionFilePath,function(err){
            if(err) return;
            _cv("Session.js","old nses cleaned",this.CookieKey)
        })
    };
};
Session.Public = {};
Session.Capsule = function(){
    this.G_IP = "0.0.0.0";
    this.L_IP = "0.0.0.0";
    this.G_PORT = 8080;
    this.L_PORT = 0;
    this.C_DATE = null;
    this.M_DATE = null;
    this.data = null;
};
Session.Capsule.from = function(o){
    let c = new Session.Capsule();
    for(var f in o){
        if(c[f] !== undefined){
            c[f] = o[f];
        }
    };
    if(typeof c.C_DATE == "number") c.C_DATE = new ixir(c.C_DATE).toIXIRFormat();
    if(typeof c.M_DATE == "number") c.M_DATE = new ixir(c.M_DATE).toIXIRFormat();
    return c;
};
Session.Capsule.to = function(data,capsule){
    let c = (capsule && Session.Capsule.from(capsule)) || new Session.Capsule();
    c.data = data;
    c.M_DATE = new ixir(c.M_DATE).toIXIRFormat();
    return c;
};
var globalSessionDirectory = path.normalize(__dirname + "/../Datas/Sessions/");
Session.oldNaviveRemoves = function(){
    fs.readdir(globalSessionDirectory,function(err,files){
        if(err) return;
        files.forEach(function(filepath){
            fs.readFile(globalSessionDirectory+filepath,function(err,data){
                if(err) return;
                var rawcapsule = v8.deserialize(data);
                var overtime = new ixir(rawcapsule.M_DATE);
                var now = new ixir(ixir.now());
                if(overtime.isBefore(now.add(clearMoreThan))){
                    fs.unlink(globalSessionDirectory+filepath,function(err){
                        if(err) return;
                        _cv("Session.js","old nses cleaned",filepath)
                    })
                }
            });
        });
        _cv("Session.js","old nses scan ended");
    })
};

Session.oldNaviveRemoves();
var h = ixir.dateToValue(new ixir(clearMoreThan).date)
setInterval(function(){
    Session.oldNaviveRemoves();
},-h*100);

Session.prototype.oldNaviveRemoves = Session.oldNaviveRemoves;
MVC.session = Session;