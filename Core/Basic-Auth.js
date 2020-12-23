function BasicAuthorization()
{
    this.WantAuthPass = function(response,pageCallback){
        response.writeHeader(401,{
            'WWW-Authenticate':'Basic'
        });
        pageCallback && pageCallback(response);
        response.end();
    };
    this.getRequestAuthPass = function(request){
        return request.headers['authorization'];
    };
    this.getAuthPass = function(request,password){
        var requestedPass = this.getRequestAuthPass(request);
        var uc = null;
        if(requestedPass == null || !(uc = /^\w+\s+(.*)$/.exec(requestedPass)))
        {
            return false;
        }else{
            return uc[1] == password;
        }
    };

    this.UserName = "admin";
    this.Password = "root";
    this.Base64 = null;

    this.isPassUp = false;
    this.liveRequest = function(request){
        if(!this.Base64)
        {
            this.Base64 = Buffer([this.UserName,this.Password].join(":")).toString("base64");
        }
        return this.getAuthPass(request,this.Base64);
    };
    this.liveResponse = (response) => this.WantAuthPass(response);
};
MVC.httpAuth = BasicAuthorization;