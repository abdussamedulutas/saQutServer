module.exports = function(router)
{
    router.filter(filter =>{
        filter.text("/");
        filter.text("/ee");
    }).request(mvc => {
        mvc.setControllerPath("./htdocs/firstproject/request.js");
    });
    return router;
};