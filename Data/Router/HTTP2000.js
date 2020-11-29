module.exports = function(router)
{
    router.filter(filter =>{
        filter.regex(/^\//);
    }).request(mvc => {
        var path = mvc.url.pathname;
        if(path == "/"){
            path = "/index.html";
        };
        mvc.FileStream("/run/media/saqut/Depom/Çalışma Masası/defaultTema"+path);
        return 0xff
    });
    return router;
};