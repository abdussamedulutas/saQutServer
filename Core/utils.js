global.stackTrace = function(n)
{
    return new Error().stack.split('\n').slice(2+(n??0)).map(i => i.replace(/^\s*at\s*/,''))
}