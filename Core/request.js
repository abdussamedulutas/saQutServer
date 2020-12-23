const querystring = require("querystring");
const multiparty = require("multiparty");
MVC.prototype.checkMultipartData = function()
{
    if(this.request.headers["content-type"])
    {
        if(/^multipart[\/]form-data;/.test(this.request.headers["content-type"]))
        {
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
            }
            ok();
        });
    })
};