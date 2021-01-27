module.exports = function(router)
{
    router.filter(filter => {
        filter.regex(/^\/$/);
    }).request(mvc => mvc.setControllerPath("htdocs/logicrestfully/request.js"));

    router.filter(filter => {
        filter.regex(/^\/assets\/.+/);
    }).request(mvc => {
        mvc.FileStream("htdocs/logicrestfully/View/" + mvc.url.pathname);
        return 0xff
    });

    router.filter(filter => {
        filter.regex(/^\/(core|util|main|map)\..+/);
    }).request(mvc => {
        mvc.FileStream("htdocs/logicrestfully/View/core/" + mvc.url.pathname);
        return 0xff
    });
    return router;
};