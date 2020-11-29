MVC.prototype.Send200Ok = MVC.prototype.S200 = function(url){
	this.response.statusCode = 200;
	this.response.end();
};
MVC.prototype.Send204NoContent = MVC.prototype.S204 = function(message){
	this.response.writeHeader(204,{
		'Content-Optimization':'text-transform'
	});
	if(message) this.response.write(message);
	this.response.end();
};
MVC.prototype.SendStatus = function(i,mess){
	this.response.writeHeader(i,{
		'Content-Optimization':'text-transform'
	});
	if(mess) this.response.write(mess);
	this.response.end();
};
MVC.prototype.Send205ResetContent = MVC.prototype.S205 = function(message){
	this.response.writeHeader(205,{
		'Content-Optimization':'text-transform'
	});
	this.response.write(message);
	this.response.end();
};
MVC.prototype.Send301Redirect = MVC.prototype.S301 = function(url){
	this.response.writeHeader(301,{
		'Content-Type':'text/html',
		'Location':url
	});
	this.response.end();
};
MVC.prototype.Send307TempRedirect = MVC.prototype.S307 = function(url){
	this.response.writeHeader(307,{
		'Content-Type':'text/html',
		'Location':url
	});
	this.response.end();
};
MVC.prototype.Send304NotModified =MVC.prototype.S304 = function(){
	this.response.writeHeader(304,{
		'Content-Type':'text/html'
	});
	this.response.end();
};
MVC.prototype.Send400BadRequest = MVC.prototype.S400 = function(content){
	this.response.writeHeader(400,content ? {
		'Content-Type':'text/html'
	} : {});
	if(content) this.response.write(content);
	this.response.end();
};
MVC.prototype.Send403Forbidden = MVC.prototype.S403 = function(content){
	this.response.writeHeader(403,{'Content-Type':'text/html'});
	if(content) this.response.write(content);
	this.response.end();
};
MVC.prototype.Send404NotFound = MVC.prototype.S404 = function(content){
	this.response.statusCode = 404;
	if(content) this.response.write(content);
	this.response.end();
};
MVC.prototype.Send408Timeout = MVC.prototype.S408 = function(){
	this.response.writeHeader(408,{'Content-Type':'text/html'});
	this.response.end();
};
MVC.prototype.Send500InternalServerError = MVC.prototype.S500 = function(content){
	this.response.writeHeader(500,{
		'Content-Type':'text/html'
	});
	if(content) this.response.write(content);
	this.response.end();
};