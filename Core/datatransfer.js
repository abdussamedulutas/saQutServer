const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
MVC.prototype.FileStream = function(filepath,options){
	var mvc = this;
	options = options || {};
	if(!filepath) throw new Error("MVC.prototype.FileStream; should not filepath value is null");
	fs.stat(filepath,(error,fileinfo)=>{
		if(error){
			this.S404();
			return;
		};
		var mimeType,j = {};
		if(options.mimetype){
			mimeType = options.mimetype
			j['X-Content-Type-Options'] = 'nosniff';
		}else{
			mimeType = mime.lookup(options.filename || filepath);
			if(mimeType) j['X-Content-Type-Options'] = 'nosniff';
			else mimeType = "application/octet-stream"
		}
		var PartialContent = require("./partialcontent");
		var pContent = new PartialContent(mvc.request,mvc.response);
		pContent.FilePath = filepath;
		pContent.Size = fileinfo.size;
		var ETag = (fileinfo.mtime+filepath).tomd5();
		if(mvc.request.headers["if-none-match"])
		{
			if(mvc.request.headers["if-none-match"] == ETag)
			{
				_cv("ftp("+mimeType+") etag: "+(options.filename ? " : "+options.filename : path.basename(filepath)));
				mvc.Send304NotModified();
				return;
			}
		};
		if(mvc.request.headers["if-match"])
		{
			if(mvc.request.headers["if-match"] != ETag)
			{
				_cv("ftp("+mimeType+") etag: "+(options.filename ? " : "+options.filename : path.basename(filepath)));
				mvc.Send304NotModified();
				return
			}
		};
		if(pContent.ControlSet()){
			var t = pContent.createRangerObj();
			pContent.SendPart({"Content-Type":mimeType});
			return;
		}else{
			var readStream = fs.createReadStream(filepath);
			var ContentEncoding = optimization.detectBestCompressContent(this.request.headers,mimeType,fileinfo.size)[0];
			var EncodingEngine = optimization[ContentEncoding];
			j["Etag"] = ETag;
			j["Accept-Ranges"] = "bytes";
			if(ContentEncoding == "noEngine") j["Content-Length"] = fileinfo.size;
			if(mimeType) j["Content-Type"] = mimeType;
			Object.assign(j,optimization.headers);
			if(options.bestClientCache){
				j["Last-Modified"] = fileinfo.mtime;
				j["Cache-Control"] = "public, max-age="+(options.bestClientCache.time || 604800)+", immutable";
			}
			if(ContentEncoding != "noEngine") j["Content-Encoding"] = EncodingEngine.svname;
			if(options.download == null || options.download == true){
				if(options.filename) j["Content-Disposition"] = "attachment; filename=\""+options.filename+"\"";
			};
			options.extraHeaders && Object.assign(j,options.extraHeaders);
			try{
				var h;
				var that = this;
				var fsize = 0;
				this.response.writeHead(200,j);
				if(this.Method == "GET" || (this.Method != "HEAD")){
					if(EncodingEngine.stream == null) h = readStream;
					else h = readStream.pipe(new EncodingEngine.stream());
					h && h.on("end",()=>{
						h;
						_cv("ftp("+mimeType+")"+(ContentEncoding!="noEngine"?"<"+EncodingEngine.svname+">":"")+" "+(options.filename ? " : "+options.filename : path.basename(filepath)) + " | " +bytesToSize(fileinfo.size)+(ContentEncoding!="noEngine"?"->"+bytesToSize(fsize):""));
					});
					h && h.on("data",(data)=>{
						fsize += data.length;
					});
					h && h.pipe(this.response);
				}else if(this.Method == "HEAD"){
					this.end();
				}
			}catch(i){
				_cv("FileStream Error:",i.message);
			};
		}
	});
};
MVC.prototype.DataStream = function(data,options){
	options = options || {};
	if("string" == typeof data){
		data = Buffer.from(data);
	}else if(data instanceof Buffer && data.toString() == "[object Object]"){
		data = Buffer.from(JSON.stringify(data));
		if(options.mimetype == null){
			options.mimetype = "application/json; charset=utf8";
		};
	};
	var mimeType = (options.mimetype) ||  "application/octet-stream";
	var ContentEncoding = optimization.detectBestCompressContent(this.request.headers,mimeType,data.length)[0];
	var EncodingEngine = optimization[ContentEncoding];
	var j = {};
	if(options.ETag) j["Etag"] = options.ETag;
	if(ContentEncoding == "noEngine") j["Content-Length"] = data.length;
	if(mimeType) j["Content-Type"] = mimeType;
	Object.assign(j,optimization.headers);
	if(ContentEncoding != "noEngine") j["Content-Encoding"] = EncodingEngine.svname;
	if(options.download != null || options.download == true){
		if(options.filename) j["Content-Disposition"] = "attachment; filename=\""+options.filename+"\"";
		else j["Content-Disposition"] = "attachment;";
	};
	if(ContentEncoding == "noEngine") this.response.writeHead(200,j);
	var h;
	options.extraHeaders && Object.assign(j,options.extraHeaders);
	var that = this;
	_cv(((options && ((options.core&&'<'+options.core+'>') || (options.protocol&&'{'+options.protocol+'}') || "data")) || options.filename)+"("+mimeType+") "+(options.filename||bytesToSize(data.length)));
	if(EncodingEngine.stream == null) this.response.end(data);
	else{
		EncodingEngine.compress(data,(err,data)=>{
			if(err) throw err;
			j["Content-Length"] = data.length;
			that.response.writeHead(200,j);
			that.response.end(data);
		});
	};
	h && h.pipe(this.response);
};
MVC.prototype.AjaxResponse = function(data,type,isBeautiy){
	switch(type && type.toLowerCase()){
		case "json":{
			this.DataStream(JSON.stringify(data,isBeautiy?isBeautiy:0),{
				mimetype:"application/json"
			});
		};
		case "bin":{
			this.DataStream(data);
			break;
		};
		case "utf8":{
			this.DataStream(data,{
				mimetype:"text/plain; charset=utf8"
			});
		}
		case "json+utf8":
		default:{
			this.DataStream(JSON.stringify(data,null,isBeautiy?isBeautiy:0),{
				mimetype:"application/json; charset=utf8"
			});
		}
	};
};


const zlib = require("zlib");
var optimization = {};
let _FONT_CR = /^(font)\//;                           //br,gzip,deflate
let _JSON_XML_CR = /^text\/|application\/(json|xml|pdf|rtf|sql)/; //gzip,br,deflate
let _SND_IMG_CR = /^(audio|image|video)\//;                //-no-
optimization.detectBestCompressContent = function(headers,mimetype,size)
{
    var list = [];
    var t = optimization.AutoDetectContent(headers);
    if(size && size >= 10e6){
        list.push("noEngine");
    }else if(_FONT_CR.test(mimetype)){
        if(t.gzip) list.push("GnuZipEngine");
        if(t.br) list.push("brotliEngine");
        if(t.deflate) list.push("DeflateEngine");
    }else if(_JSON_XML_CR.test(mimetype)){
        if(t.gzip) list.push("GnuZipEngine");
        if(t.br) list.push("brotliEngine");
        if(t.deflate) list.push("DeflateEngine");
    }else if(_SND_IMG_CR.test(mimetype)){
        list.push("noEngine");
    }else{
        if(size != null && size < 1e6){
            if(t.gzip) list.push("GnuZipEngine");
            if(t.deflate) list.push("DeflateEngine");
        }
    }
    if(list.length == 0) list.push("noEngine");
    return list;
};
optimization.AutoDetectContent = function(headers)
{
    var acceptEncoding = headers["accept-encoding"];
    var supported = {};
    if (/\bdeflate\b/m.test(acceptEncoding)) {
        supported["deflate"] = true;
    }
    if (/\bgzip\b/.test(acceptEncoding)) {
        supported["gzip"] = true;
    };
    if (/\bbr\b/.test(acceptEncoding)) {
        supported["br"] = true;
    };
    return supported;
};
optimization.DeflateEngine = function(data,callback){
    var promise = new HTTPPromise();
    zlib.deflate(data, (err, buffer) => {
        if(err){
            if(HTTP.Verbose) console.trace('optimization.DeflateEngine: Error');
            return promise.errored(err,"ContentEngine");
        }
        callback(buffer,"deflate");
        promise.successed();
    });
    return promise;
};
optimization.DeflateEngine.svname = "deflate";
optimization.DeflateEngine.stream = zlib.createDeflate;
optimization.DeflateEngine.compress = zlib.deflate;
/**
 * 
 * @param {Buffer|String} data 
 * @param {Function} callback 
 * @return {void}
 */
optimization.GnuZipEngine = function(data,callback){
    var promise = new HTTPPromise();
    zlib.gzip(data, (err, buffer) => {
        if(err){
            if(HTTP.Verbose) console.trace('optimization.GnuZipEngine: Error');
            return promise.errored(err,"ContentEngine");
        }
        callback(buffer,"gzip");
        promise.successed();
    });
    return promise;
};
optimization.GnuZipEngine.svname = "gzip";
optimization.GnuZipEngine.stream = zlib.createGzip;
optimization.GnuZipEngine.compress = zlib.gzip;
/**
 * 
 * @param {Buffer|String} data 
 * @param {Function} callback 
 * @return {void}
 */
optimization.brotliEngine = function(data,callback){
    var promise = new HTTPPromise();
    zlib.brotliCompress(data, (err, buffer) => {
        if(err){
            if(HTTP.Verbose) console.trace('optimization.brotliEngine: Error');
            return promise.errored(err,"ContentEngine");
        }
        callback(buffer,"brotli");
        promise.successed();
    });
    return promise;
};
optimization.brotliEngine.stream = zlib.createBrotliCompress;
optimization.brotliEngine.svname = "br";
optimization.brotliEngine.compress = zlib.brotliCompress;
/**
 * 
 * @param {Buffer|String} data 
 * @param {Function} callback 
 * @return {void}
 */
optimization.noEngine = function(data,callback){
    callback(data);
    return new HTTPPromise({success:true});
};
optimization.noEngine.stream = null;
optimization.noEngine.svname = "";

optimization.headers = {
    'Tk':'N',
    'Content-Owner':"saQut Copyright (c)",
    'Software':"Nodeus",
    "Server": "Sihheranime/148.10.0 nodejs/11.15.0 (Linux/manjaro) PHP/7.2.3 Perl/v5.16.3",
    "X-Powered-By": "NodeJS/Sihheranime",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods":"GET,HEAD,POST",
    "X-Frame-Options":"SAMEORIGIN"
};