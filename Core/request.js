const querystring = require("querystring");
const multiparty = require("multiparty");
MVC.prototype.checkMultipartData = function()
{
    if(this.request.headers["content-type"])
    {
        if(/^multipart[\/]form-data;/.test(this.request.headers["content-type"]))
        {
            this.emit("verbose",{
                text:"Multipart request detected",
                stace:stackTrace()
            })
            return true
        }
    }
    return false
};
MVC.prototype.checkUrlEncoded = function()
{
    if(this.request.headers["content-type"])
    {
        if(/application\/x-www-form-urlencoded;?/.test(this.request.headers["content-type"]))
        {
            this.emit("verbose",{
                text:"x-www-form-urlencoded request detected",
                stace:stackTrace()
            })
            return true
        }
    }
    return false
};
MVC.prototype.ResolveUrlEncoded = async function()
{
    var buffer = [];
    await new Promise(ok=>{
        this.request.on("data",(chunk) => buffer.push(chunk));
        this.request.on("end",() =>{
            ok();
        });
    });
    var data = Buffer.concat(buffer).toString();
    this.postData = querystring.parse(data);
    this.emit("verbose",{
        text:"x-www-form-urlencoded request decoded",
        stace:stackTrace()
    })
};
MVC.prototype.ResolveMultiPartFormData = async function()
{
    await new Promise(ok=>{
        var formdata = new multiparty.Form({
            uploadDir:this.MultipartFormData.UploadsDir,
            maxFilesSize:this.MultipartFormData.MaxUploadFile,
            autoFiles:false
        });
        formdata.parse(this.request,(error,fields,files)=>{
            if(!error)
            {
                this.postData = fields;
                this.filesData = files;
                this.emit("verbose",{
                    text:"multipart request parsed",
                    stace:stackTrace()
                })
            }
            ok();
        });
    })
};
