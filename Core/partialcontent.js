/**
 * This experiement module
 */
module.exports = PartialContent;
function PartialContent(request,response)
{
    this.FilePath = "";
    this.is416 = false;
    //                      range   Start  End  |Top.size  first    not support
    this.ExpressionRole = /^bytes\s*=?\s*(\d*)-?(\d*)\/?(\d*)$|^(bytes)$|^(none)$|/i;
    this.Range = request.headers.range;
    this.ControlSet = function()
    {
        var range = this.createRanger();
        if(!this.Range) return false;
        if (range.start >= this.Size || range.end >= this.Size) {
            this.is416 = true;
            responseHeaders['Content-Range'] = 'bytes */' + this.Size; // File size.
            mvc.response.writeHeader(416,{
                'Content-Range':'bytes */' + this.Size
            });
            mvc.response.end();
            return true;
        }else return true;
    };
    this.SendPart = function(e_header){
        var header = {};
        if(this.is416) return;
        var range = this.createRanger();
        var start = range.Start;
        var end = range.End;
    
        // Indicate the current range. 
        header['Content-Range'] = 'bytes ' + start + '-' + end + '/' + this.Size;
        header['Content-Length'] = start == end ? 0 : (end - start + 1);
        header['Accept-Ranges'] = 'bytes';
        header['Cache-Control'] = 'no-cache';

        Object.assign(header,e_header);
        response.writeHeader(206,header);
        var file = fs.createReadStream(this.FilePath, {
            start: start,
            end: end
        });
        file.on('open', function () {
            file.pipe(response);
        });
    };
    this.createRanger = function(){
        var range = this.Range;
        if (range == null || range.length == 0)
            return null;
        var array = range.split(/bytes=([0-9]*)-([0-9]*)/);
        var start = parseInt(array[1]);
        var end = parseInt(array[2]);
        var result = {
            Start: isNaN(start) ? 0 : start,
            End: isNaN(end) ? (this.Size - 1) : end
        };
    
        if (!isNaN(start) && isNaN(end)) {
            result.Start = start;
            result.End = this.Size - 1;
        }
    
        if (isNaN(start) && !isNaN(end)) {
            result.Start = this.Size - end;
            result.End = this.Size - 1;
        }
    
        return result;
    };
    this.createRangerObj = function(){
        var range = this.Range;
        if (range == null || range.length == 0)
            return null;
        var array = range.split(/bytes=([0-9]*)-([0-9]*)/);
        var start = parseInt(array[1]);
        var end = parseInt(array[2]);
        var result = {
            Start: isNaN(start) ? 0 : start,
            End: isNaN(end) ? (this.Size - 1) : end
        };
    
        if (!isNaN(start) && isNaN(end)) {
            result.Start = start;
            result.End = this.Size - 1;
        }
    
        if (isNaN(start) && !isNaN(end)) {
            result.Start = this.Size - end;
            result.End = this.Size - 1;
        }
    
        return [result.Start,result.End];
    };
    this.EndSize = null;
    this.StartByte = null;
    this.Size = null;
    this.DefaultPrecache = 1e6/*1.000mb*/;
};