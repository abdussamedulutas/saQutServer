const mime = require("mime-types");
const fs = require("fs");
const {Duplex} = require("stream");
const path = require("path");
MVC.prototype.FileStream = function(filepath,options){
	var mvc = this;
	options = options || {};
	if(!filepath) throw new Error("MVC.prototype.FileStream; should not filepath value is null");
	fs.stat(filepath,(error,fileinfo)=>{
		if(error){
			this.server.emit("warning",{
				text:"file not found",
				stace:stackTrace()
			})
			this.S404();
			return;
		};
		if(!fileinfo.isFile()){
			this.server.emit("warning",{
				text:"cannot send directory",
				stace:stackTrace()
			})
			this.S404();
			return;
		}
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
				this.server.emit("verbose",{
					text:"matched etag " + filepath,
					stace:stackTrace()
				})
				mvc.Send304NotModified();
				return;
			}
		};
		if(mvc.request.headers["if-match"])
		{
			if(mvc.request.headers["if-match"] != ETag)
			{
				this.server.emit("verbose",{
					text:"matched etag " + filepath,
					stace:stackTrace()
				})
				mvc.Send304NotModified();
				return
			}
		};
		if(pContent.ControlSet()){
			this.server.emit("verbose",{
				text:"Sending partial content data",
				stace:stackTrace()
			})
			pContent.SendPart({"Content-Type":mimeType});
			return;
		}else{
			var readStream = fs.createReadStream(filepath);
			var compressStrategy = new HttpCompressStrategy(this.request.headers,mimeType,fileinfo.size);
			j["Etag"] = ETag;
			j["Accept-Ranges"] = "bytes";
			if(compressStrategy.strategy[0] == "") j["Content-Length"] = fileinfo.size;
			if(mimeType) j["Content-Type"] = mimeType;
			Object.assign(j,Optimizationheaders);
			if(options.bestClientCache){
				j["Last-Modified"] = fileinfo.mtime;
				j["Cache-Control"] = "public, max-age="+(options.bestClientCache.time || 604800)+", immutable";
			}
			if(compressStrategy.strategy[0] != "") j["Content-Encoding"] = compressStrategy.strategy[0];
			if(options.download == null || options.download == true){
				if(options.filename) j["Content-Disposition"] = "attachment; filename=\""+options.filename+"\"";
			};
			options.extraHeaders && Object.assign(j,options.extraHeaders);
			try{
				var fsize = 0;
				this.response.writeHead(200,j);
				if(this.Method == "GET" || (this.Method != "HEAD")){
					var stream = compressStrategy.pipe(readStream);
					stream.on("end",()=>{
						this.server.emit("verbose",{
							text:"ftp("+mimeType+")"+(compressStrategy.strategy[0]!=""?"<"+compressStrategy.strategy[0]+">":"")+" "+(options.filename ? " : "+options.filename : path.basename(filepath)) + " | " +bytesToSize(fileinfo.size)+(compressStrategy.strategy[0]==""?"->"+bytesToSize(fsize):""),
							stace:stackTrace()
						})
					});
					stream.on("data",(data)=>{
						fsize += data.length;
					});
					stream.pipe(this.response);
				}else if(this.Method == "HEAD"){
					this.end();
				}
			}catch(i){
				this.server.emit("verbose",{
					text:"FileStream Error: " + i.message,
					stace:stackTrace()
				})
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
	var compressStrategy = new HttpCompressStrategy(this.request.headers,mimeType,fileinfo.size);
	var j = {};
	if(options.ETag) j["Etag"] = options.ETag;
	if(ContentEncoding == "noEngine") j["Content-Length"] = data.length;
	if(mimeType) j["Content-Type"] = mimeType;
	Object.assign(j,Optimizationheaders);
	if(compressStrategy.strategy[0]!="") j["Content-Encoding"] = compressStrategy.strategy[0];
	if(options.download != null || options.download == true){
		if(options.filename) j["Content-Disposition"] = "attachment; filename=\""+options.filename+"\"";
		else j["Content-Disposition"] = "attachment;";
	};
	if(ContentEncoding == "noEngine") this.response.writeHead(200,j);
	var h;
	options.extraHeaders && Object.assign(j,options.extraHeaders);
	try{
		var fsize = 0;
		this.response.writeHead(200,j);
		if(this.Method == "GET" || (this.Method != "HEAD")){
			var stream = compressStrategy.getStream(data);
			stream.on("end",()=>{
				this.server.emit("verbose",{
					text:"data("+mimeType+")"+(compressStrategy.strategy[0]!=""?"<"+compressStrategy.strategy[0]+">":"")+compressStrategy.strategy[0]==""?"->"+bytesToSize(fsize):"",
					stace:stackTrace()
				})
			});
			stream.on("data",(data)=>{
				fsize += data.length;
			});
			stream.pipe(this.response);
		}else if(this.Method == "HEAD"){
			this.end();
		}
	}catch(i){
		this.server.emit("error",{
			text:"Cannot response: "+i.message,
			stace:stackTrace()
		})
	};
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
function HttpCompressStrategy(headers,mimetype,size)
{
	let _FONT_CR = /^(font)\//;
	let _JSON_XML_CR = /^text\/|application\/(json|xml|pdf|rtf|sql)/;
	let _SND_IMG_CR = /^(audio|image|video)\//;
	var list = [];
    var t = this.AutoDetectContent(headers);
    if(size && size >= 10e6){
        list.push("");
    }else if(_FONT_CR.test(mimetype)){
        if(t.gzip) list.push("gzip");
        if(t.br) list.push("br");
        if(t.deflate) list.push("deflate");
    }else if(_JSON_XML_CR.test(mimetype)){
        if(t.gzip) list.push("gzip");
        if(t.br) list.push("br");
        if(t.deflate) list.push("deflate");
    }else if(_SND_IMG_CR.test(mimetype)){
        list.push("");
    }else{
        if(size != null && size < 1e6){
            if(t.gzip) list.push("gzip");
            if(t.deflate) list.push("deflate");
        }
    }
    if(list.length == 0) list.push("");
    this.strategy = list;
}
HttpCompressStrategy.prototype.AutoDetectContent = function(headers)
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

HttpCompressStrategy.prototype.pipe = function(stream)
{
	var first = this.strategy[0];
	switch(first)
	{
		case "deflate": return stream.pipe(zlib.createDeflate());
		case "gzip": return stream.pipe(zlib.createGzip());
		case "br": return stream.pipe(zlib.createBrotliCompress());
		case "": return stream;
	}
}
HttpCompressStrategy.prototype.getStream = function(content)
{
	var result = null;
	var T = new Duplex({
		write:function(){
			return false;
		},
		read:function(){
			return false;
		}
	});
	var first = this.strategy[0];
	switch(first)
	{
		case "deflate": result = T.pipe(zlib.createDeflate()); break;
		case "gzip": result = T.pipe(zlib.createGzip()); break;
		case "br": result = T.pipe(zlib.createBrotliCompress()); break;
	};
	T.push(content);
	return result;
}
var Optimizationheaders = {
    'Tk':'N',
    'Content-Owner':"saQut Copyright (c)",
    'Software':"Nodeus",
    "Server": "Sihheranime/148.10.0 nodejs/11.15.0 (Linux/manjaro) PHP/7.2.3 Perl/v5.16.3",
    "X-Powered-By": "NodeJS/Sihherainyme",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods":"GET,HEAD,POST",
    "X-Frame-Options":"SAMEORIGIN"
};