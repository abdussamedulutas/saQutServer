"use strict";
/**
 * @class
 * @type {ixir}
 * @returns ixir
 * @param {number|ixir|ixir.date|Date|String} _date
 * @param {?String} lang
 */
function ixir(_date,lang)
{
	this.lang = lang ? lang : "en";
	this.value = 0;
	this.date = ixir.Init(_date);
	/**
	 * @public
	 */
	this.add = function(arg,newvalue){
		var arg1 = ixir.dateToValue(ixir.Init(arg));
		var arg2 = ixir.dateToValue(this.date);
		var value = arg2 + arg1;
		if(newvalue) return new ixir(value);
		else return this.date = ixir.valueToDate(value);
	};
	this.diff = function(arg,newvalue){
		var arg1 = ixir.dateToValue(ixir.Init(arg));
		var arg2 = ixir.dateToValue(this.date);
		var value = arg2 - arg1;
		if(newvalue) return new ixir(value);
		else return this.date = ixir.valueToDate(value);
	};
	this.different = function(arg,newvalue){
		var arg1 = ixir.dateToValue(ixir.Init(arg));
		var arg2 = ixir.dateToValue(this.date);
		var value = arg1 - arg2;
		if(newvalue) return new ixir(value);
		else return this.date = ixir.valueToDate(value);
	};
	this.isAfter = function(arg){
		var arg1 = ixir.dateToValue(ixir.Init(arg));
		var arg2 = ixir.dateToValue(this.date);
		return arg2 > arg1
	};
	this.isBefore = function(arg){
		var arg1 = ixir.dateToValue(ixir.Init(arg));
		var arg2 = ixir.dateToValue(this.date);
		return arg2 < arg1
	};
};
ixir.lang = 'en';
ixir.SortDates = function(arg){
	var args = [];
	if(arg instanceof Array)
	{
		args = arg
	}else{
		args = _argumentsCounter.apply(this,arguments);
	};
	for(var h = 0;h<args.length;h++){
		args[h] = ixir.dateToValue(ixir.Init(args[h]));
	};
	args = args.sort();
	for(var h = 0;h<args.length;h++){
		args[h] = ixir.Init(args[h]);
	};
	return args;
};
var _argumentsCounter = function(){
	var args = [],i = -1,k;
	while(k = arguments[++i]){
		args.push(arguments[i]);
	};
	return args;
}
ixir.now = function()
{
	return ixir.Init(new Date());
};

ixir.int = parseInt;
ixir.Init = function(o,debug){
	var that = new ixir.date();
	if(!o){
		return that;
	};
	if(o instanceof Array && o.length >= 3){
		that.year = o[0];
		that.month = o[1];
		that.day = o[2];
		if(o[3]) that.hour = o[3];
		if(o[4]) that.minute = o[4];
		if(o[5]) that.second = o[5];
	}else if(o instanceof ixir.date){
		that.year = o.year;
		that.month = o.month;
		that.day = o.day;
		that.hour = o.hour;
		that.minute = o.minute;
		that.second = o.second;
	}else if(o instanceof ixir){
		that = o.date;
	}else if(typeof o == "number" || o instanceof Date){
		that = ixir.valueToDate(ixir.dateToValue(o));
	}else if(typeof o == "string"){
		if(ixir.keyStoken.isKeystoken(o)){
			that = ixir.keyStoken(o.substring(1))
		}else{
			var yd = ixir.string.format(o);
			if(yd){
				that = yd;
			}else{
				try{
					that = ixir.dateToValue(new Date(o));
				}catch(i){
					throw new Error("Could not convert for Argument use; Invalid data");
				}
			}
		}
	}else if(
		typeof o == "object" && (
			o.second !== undefined ||
			o.minute !== undefined ||
			o.hour !== undefined ||
			o.day !== undefined ||
			o.month !== undefined ||
			o.year !== undefined
		)
	){
		if(o.year) that.year = o.year;
		if(o.month) that.month = o.month;
		if(o.day) that.day = o.day;
		if(o.hour) that.hour = o.hour;
		if(o.minute) that.minute = o.minute;
		if(o.second) that.second = o.second;
	}else{
		if(debug){
			debug();
		}else throw new Error("Could not convert Date to ixir value; Invalid data type");
	};
	that.calculate();
	return that;
};
ixir.keyStoken = function(text){
	var dateObject = new ixir.date();
	text = text.split(/\s*,\s*/);
	for(var u = 0;u < text.length;u++){
		var val = function(name,value){
			if(value.charAt(0) == "-" || value.charAt(0) == "+")
			{
				dateObject[name] += parseFloat(value);
			}else{
				dateObject[name] = parseFloat(value);
			}
		}
		var key = text[u].match(/([+-]?\s*[\d\.]+)\s*(\w+)|([+-])(.*)/),value,isAdd;
		if(!key[1] && key[3])
		{	
			value = key[4], isAdd = key[3] == "+";
			key = "date";
		}else{
			value = key[1];
			key = key[2];
		}
		switch(key.toLowerCase())
		{
			case "y":
			case "year":
			case "yyyy":
				val("year",value);
				break;
			case "month":
			case "mon":
			case "m":
				val("month",value);
				break;
			case "day":
				val("day",value);
				break;
			case "date":
			case "d":
				if(isAdd) dateObject.add(value);
				else dateObject.diff(value);
				break;
			case "hour":
			case "hr":
			case "h":
				val("hour",value);
				break;
			case "min":
			case "minute":
				val("minute",value);
				break;
			case "s":
			case "sec":
			case "second":
				val("second",value);
				break;
		}
	};
	return dateObject;
};
ixir.keyStoken.isKeystoken = function(text){
	return text.charAt(0) == '>';
};
ixir.string = {};
ixir.string.formats = {
	DateTime : [/*13:22:54 20/08/2018 | 20/08/2018 13:22:54 */
		/^(\d+:\d+)(:\d+)?\s*(\d+[\.\\\/-]\d+[\.\\\/-]\d+)|(\d+[\.\\\/-]\d+[\.\\\/-]\d+)\s+(\d+:\d+)(:\d+)?$/ig,
		function(s){
			var formats = ixir.string.formats;
			var date = new ixir.date();
			var t,e;
			if(s[4])
			{
				t = formats.Time[0].exec(s[5]+(s[6]||""));
				e = formats.Date[0].exec(s[4]);
			}else{
				t = formats.Time[0].exec(s[1]+(s[2]||""));
				e = formats.Date[0].exec(s[3]);
			};
			if(t)
			{
				formats.Time[1](t,date);
			};
			if(e)
			{
				formats.Date[1](e,date);
			};
			return date;
		},function(date){
			var time = "";
			time += [
				date.day < 10 ? "0" + date.day : date.day,
				date.month < 10 ? "0" + date.month : date.month,
				date.year < 10 ? "000" : (
					date.year < 100 ? "00" + date.year : (
						date.year < 1000 ? "0" : date.year
					)
				)
			].join(".");
			if(!(date.second == 0 && date.minute == 0 && date.hour== 0)){
				time += " "+[
					date.hour < 10 ? "0" + date.hour : date.hour,
					date.minute < 10 ? "0" + date.minute : date.minute,
					date.second < 10 ? "0" + date.second : date.second
				].join(":");
			};
			return time;
		}
	],
	IXIRFormat : [/*12:27:00 @ 25.02.2018 */
		/^(\d+:\d+)(:\d+)?\s*@\s*(\d+[\.\\\/-]\d+[\.\\\/-]\d+)$/ig,
		function(s){
			var formats = ixir.string.formats;
			var date = new ixir.date();
			var t = formats.Time[0].exec(s[1]+(s[2]||""));
			var e = formats.Date[0].exec(s[3]);
			if(t)
			{
				formats.Time[1](t,date);
			};
			if(e)
			{
				formats.Date[1](e,date);
			};
			return date;
		},function(date){
			var k = "";
			k += ixir.string.formats.Time[2](date);
			if(date.month == 0 && date.year == 0 && date.day == 0){
				return k;
			}else{
				return k + " @ " + (date.day < 10 ? "0"+date.day : date.day) + "." + (date.month < 10 ? "0"+date.month : date.month) + "." + date.year
			}
		}
	],
	Time : [/*12:27:12 | 12:27*/
		/^(\d{1,2})[:\.](\d{2})([:\.]\d{2})?$/i,
		function(s,x){
			var date = x || new ixir.date();
			date.hour = ixir.int(s[1]);
			date.minute = ixir.int(s[2]);
			if(s[3]) date.second = ixir.int(s[3].substring(1));
			return date;
		},
		function(date){
			var t = "";
			t += date.hour < 10 ? "0"+date.hour:date.hour;
			t += ':' + (date.minute < 10 ? "0"+date.minute:date.minute);
			t += date.second == 0 ? '' : date.second < 10 ? ":0"+date.second : ':'+date.second;
			return t;
		}
	],
	Date : [/*00.00.0000 00/00/0000 0.0.00*/
		/^(\d{1,2})[\.\\\/-](\d{1,2})[\.\\\/-](\d{2,4})$/i,
		function(s,x){
			var date = x || new ixir.date();
			date.day = ixir.int(s[1]);
			date.month = ixir.int(s[2]);
			if(s[3].length != 4)
			{
				var _c = (new Date().getFullYear()).toString();
				if(s[3].length == 3)
				{
					date.year = _c.charAt(0) + s[3]
				}else if(s[3].length == 2){
					date.year = _c.charAt(0) + _c.charAt(1) + s[3]
				};
				date.year = ixir.int(date.year);
			}else date.year = ixir.int(s[3]);
			return date;
		},function(date){
			return [(date.day < 10 ? "0"+date.day : date.day),(date.month < 10 ? "0"+date.month : date.month),date.year].join('.');
		}
	],
	ISODateTime : [/*0000-00-00 00:00:00.000000*/
		/^(\d{4})-(\d{2})-(\d{2})\s*(\d{2})\:(\d{2})\:(\d{2})(\.\d+)?$/i,
		function(s,x){
			var date = x || new ixir.date();
			date.day = ixir.int(s[3]);
			date.month = ixir.int(s[2]);
			date.year = ixir.int(s[1]);
			date.hour = ixir.int(s[4]);
			date.minute = ixir.int(s[5]);
			date.second = ixir.int(s[6]);
			return date;
		},function(date){
			return  (date.year < 10 ? "0"+date.year : date.year)+'-'+
			(date.month < 10 ? "0"+date.month : date.month)+'-'+
			(date.day < 10 ? "0"+date.day : date.day)+' '+
			(date.hour < 10 ? "0"+date.hour : date.hour)+':'+
			(date.minute < 10 ? "0"+date.minute : date.minute)+':'+
			(date.second < 10 ? "0"+date.second : date.second);
		}
	],
	ISODate: [/*0000-00-00*/
		/^(\d{4})-(\d{2})-(\d{2})$/i,
		function(s,x){
			var date = x || new ixir.date();
			date.day = ixir.int(s[3]);
			date.month = ixir.int(s[2]);
			date.year = ixir.int(s[1]);
			return date;
		},function(date){
			return  (date.year < 10 ? "0"+date.year : date.year)+'-'+
			(date.month < 10 ? "0"+date.month : date.month)+'-'+
			(date.day < 10 ? "0"+date.day : date.day);
		}
	],
	ISOTime : [/*00:00:00.000000*/
		/^(\d{2})\:(\d{2})\:(\d{2})(\.\d+)?$/i,
		function(s,x){
			var date = x || new ixir.date();
			date.hour = ixir.int(s[1]);
			date.minute = ixir.int(s[2]);
			date.second = ixir.int(s[3]);
			return date;
		},function(date){
			return (date.hour < 10 ? "0"+date.hour : date.hour)+':'+
			(date.minute < 10 ? "0"+date.minute : date.minute)+':'+
			(date.second < 10 ? "0"+date.second : date.second);
		}
	]
};


ixir.string.format = function(arg,word){
	if(typeof arg == "string"){
		var k;
		for(var l in ixir.string.formats)
		{
			if(k = new RegExp(ixir.string.formats[l][0]).exec(arg)){
				return ixir.string.formats[l][1](k);
			}
		};
		return false;
	}else if(arg instanceof ixir.date){
		return (ixir.string.formats[word][2] && ixir.string.formats[word][2](arg));
	}else if(arg instanceof ixir){
		return (ixir.string.formats[word][2] && ixir.string.formats[word][2](arg.date));
	}
};
ixir.valueToDate = function(nval,calcLeapYear){
	var srs = ixir.source;
	var val = Math.abs(nval);
	var _date = new ixir.date();
	_date.negative = nval < 0;
	if(val instanceof ixir.date) _date.second = val.second;
	else if(typeof val == "number") _date.second = val;

	if(_date.second > srs.minuteseconds-1)
	{
		_date.minute += parseInt(_date.second / srs.minuteseconds);
		_date.second = _date.second % srs.minuteseconds
	};
	if(_date.minute > srs.hourminutes-1)
	{
		_date.hour += parseInt(_date.minute / srs.hourminutes);
		_date.minute = _date.minute % srs.hourminutes
	};
	if(_date.hour > srs.dayhours-1)
	{
		_date.day += parseInt(_date.hour / srs.dayhours);
		_date.hour = _date.hour % srs.dayhours
	};
	if(_date.day > ixir.rangeMonthDay(_date.day)){
		var t = ixir.dayMonth(_date.day);
		_date.month = parseInt(t[0]);
		_date.day = t[1]
	}
	if(_date.month > srs.yearmonths-1){
		_date.year += parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	}else if(_date.month < 0){
		_date.year -= parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	};
	if(!calcLeapYear) return _date;
	var appendDay = 0;
	appendDay += parseInt(_date.year / 4);
	_date.day += appendDay;
	if(_date.day > 30){
		var t = ixir.dayMonth(_date.day);
		_date.month = parseInt(t[0]);
		_date.day = t[1]
	};
	if(_date.month > srs.yearmonths-1){
		_date.year += parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	}else if(_date.month < 0){
		_date.year -= parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	};
	return _date;
};
ixir.source = {
	strings:{
		monthname : {
			tr:["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
			en:["January","February","March","April","May","June","July","August","September","October","November","December"]
		},
		dayname : {
			tr:["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],
			en:["Sunday","Monday","Tuesday","Wednesday","Thirsday","Friday","Saturday"]
		}
	},
	Month : [
		31,28,31,30,31,30,31,31,30,31,30,31
	],
	minuteseconds:60,
	hourminutes:60,
	dayhours:24,
	weekdays:7,
	yearmonths:12,
	lang:"en"
};

ixir.date = function(o){
	this.negative = false;
	//this.milad = false;
	this.year = 0;
	this.month = 0;
	this.day = 0;
	this.hour = 0;
	this.minute = 0;
	this.second = 0;
	//calculated
	this.week = 0;
	this.weekday = 0;
	this.monthname = '';
	this.dayname = '';
};
ixir.date.prototype.value = function(){
	return ixir.dateToValue(this);
};
ixir.date.prototype.getDay = function(){
	return this.date().getDay();
};
ixir.date.prototype.date = function(){
	if(this.negative)
	{
		var u = new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second).getTime();
		return new Date(-u);
	}else{
		return new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second);
	}
};
ixir.date.prototype.getWeek = function()
{
	var date = this.date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	var week1 = new Date(date.getFullYear(), 0, 4);
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}
ixir.date.prototype.calculate = function(lang){
	var redate = ixir.valueToDate(ixir.dateToValue(this)),
		week = redate.getWeek(),
		day = redate.getDay(),
		dayname = ixir.source.strings.dayname[ixir.lang],
		Month = ixir.source.strings.monthname[ixir.lang];
	this.year = redate.year;
	this.month = redate.month;
	this.day = redate.day;
	this.hour = redate.hour;
	this.minute = redate.minute;
	this.second = redate.second;
	this.weekday = day;
	this.dayname = dayname[day];
	this.week = week;
	this.monthname = Month[this.month-1];
	this.negative = redate.negative;
}
ixir.prototype.update = function(){
	return this.date.calculate(this.lang);
}
ixir.prototype.getDay = function(){
	return this.date.getDay();
};
ixir.formats={};
ixir.setProperty = function(key){
	ixir.date.prototype["to"+key] = 
	ixir.date.prototype["to"+key.toLowerCase()] = function(){
		return ixir.string.formats[key][2](this)
	};
	ixir.prototype["to"+key] = 
	ixir.prototype["to"+key.toLowerCase()] = function(){
		return ixir.string.formats[key][2](this.date)
	};
	ixir.formats[key.toLowerCase()]=1;
};
ixir.prototype.format = function(key){
	return ixir.formats[key.toLowerCase()] && this["to"+key]();
};
for(var key in ixir.string.formats) ixir.setProperty(key);
ixir.dateToValue = function(_date,leapYear){
	var value = 0;
	if(_date instanceof ixir){
		_date=_date.date;
		value += _date.second;
		value += ixir.minSec(_date.minute);
		value += ixir.hourSec(_date.hour);
		value += ixir.daySec(_date.day);
		value += ixir.monthSec(_date.month)
		value += ixir.yearSec(_date.year,leapYear);
		value = _date.negative ? -value : value
	}else if(_date instanceof ixir.date){
		value += _date.second;
		value += ixir.minSec(_date.minute);
		value += ixir.hourSec(_date.hour);
		value += ixir.daySec(_date.day);
		value += ixir.monthSec(_date.month)
		value += ixir.yearSec(_date.year,leapYear);
		value = _date.negative ? -value : value
	}else if(_date instanceof Date){
		value += _date.getSeconds();
		value += ixir.minSec(_date.getMinutes());
		value += ixir.hourSec(_date.getHours());
		value += ixir.daySec(_date.getDate());
		value += ixir.monthSec(_date.getMonth()+1)
		value += ixir.yearSec(_date.getFullYear());
	}else if(typeof _date == "number"){
		value = _date;
	}else if(typeof _date == "string"){
		value = _date;
	}else{
		throw new Error("Could not convert Date to ixir value; Invalid data type");
	};
	return value;
};

ixir.secMin = function(val){
	return val / ixir.source.minuteseconds
};
ixir.secHour = function(val){
	return val / (ixir.source.minuteseconds*ixir.source.hourminutes)
};
ixir.secDay = function(val){
	return val / (ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.secMonth = function(val){
	return ixir.monthDay(val) / (ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.secYear = function(val,leapYear){
	return val / (365*ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours  * (leapYear?1.25:1))
};
ixir.minSec = function(val){
	return val * ixir.source.minuteseconds
};
ixir.minHour = function(val){
	return val / (ixir.source.minuteseconds*ixir.source.hourminutes)
};
ixir.minDay = function(val){
	return val / (ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.minMonth = function(val){
	return ixir.monthDay(val) / (ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.minYear = function(val,leapYear){
	return val / (365*ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours * (leapYear?1.25:1))
};

ixir.hourSec = function(val){
	return val * ixir.source.minuteseconds*ixir.source.hourminutes
};
ixir.hourMin = function(val){
	return val / (ixir.source.hourminutes)
};
ixir.hourDay = function(val){
	return val / ixir.source.dayhours
};
ixir.hourMonth = function(val){
	return ixir.monthDay(val) / ixir.source.dayhours
};
ixir.hourYear = function(val,leapYear){
	return val / (365*ixir.source.dayhours * (leapYear?1.25:1))
};


ixir.daySec = function(val){
	return val * ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours
};
ixir.dayMin = function(val){
	return val / (ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.dayHour = function(val){
	return val * ixir.source.dayhours
};
ixir.dayYear = function(val,leapYear){
	return val / (365*ixir.source.dayhours * (leapYear?1.25:1))
};

ixir.monthInDay = function(month){
	return ixir.source.Month[month % ixir.source.yearmonths]
};
ixir.monthDay = function(dayStart,dayStop)
{
	var ndayStart = Math.abs(dayStart),nsdayStop = dayStop ? Math.abs(dayStop) : null;
	var day = 0;
	if(nsdayStop==null){
		nsdayStop=ndayStart;
		ndayStart=0
	}else if(ndayStart==null && nsdayStop!=null){
		ndayStart = nsdayStop;
		nsdayStop++
	}
	for(var f=ndayStart;f<nsdayStop;f++) day += ixir.monthInDay(f);
	return dayStart < 0 ? -day : day;
};
ixir.monthHour = function(val){
	return ixir.monthDay(val) * ixir.source.dayhours
};
ixir.monthMin = function(val){
	return ixir.monthDay(val) * ixir.source.dayhours * ixir.source.hourminutes
};
ixir.monthSec = function(val){
	return ixir.monthDay(val) * ixir.source.dayhours * ixir.source.hourminutes * ixir.source.minuteseconds
};
ixir.monthYear = function(val){
	return val / ixir.source.yearmonths
};


ixir.yearMonth = function(val){
	return val * ixir.source.yearmonths
};
ixir.yearDay = function(val,leapYear){
	return parseInt(val * 365 * (leapYear?1.25:1))
};
ixir.yearHour = function(val,leapYear){
	return parseInt(val * 365 * ixir.source.dayhours * (leapYear?1.25:1))
};
ixir.yearMin = function(val,leapYear){
	return parseInt(val * 365 * ixir.source.dayhours * ixir.source.hourminutes * (leapYear?1.25:1))
};
ixir.yearSec = function(val,leapYear){
	return parseInt(val * 365 * ixir.source.dayhours * ixir.source.hourminutes * ixir.source.minuteseconds * (leapYear?1.25:1))
};


ixir.dayMonth = function(day){
	var month = 0;
	while(true)
		if(day >= ixir.monthInDay(month))
		{
			day -= ixir.monthInDay(month);
			month++
		}else break;
	if(day != 0) month += day / ixir.monthInDay(month);
	return [month,day]
};
ixir.rangeMonthDay = function(day)
{
	var month = 0;
	while(true) if(day > ixir.monthInDay(month)){
		day -= ixir.monthInDay(month); 
		month++
	}else break;
	return ixir.source.Month[month % ixir.source.yearmonths]
};
/* Version 2 */

ixir.isAfter = function(a,b){
	var arg1 = ixir.dateToValue(ixir.Init(a));
	var arg2 = ixir.dateToValue(ixir.Init(b));
	return arg2 > arg1
};
ixir.isBefore = function(a,b){
	var arg1 = ixir.dateToValue(ixir.Init(a));
	var arg2 = ixir.dateToValue(ixir.Init(b));
	return arg2 < arg1
};
ixir.prototype.isBetween = function(arg1,arg2){
	let
		a1 = ixir.dateToValue(ixir.Init(arg1)),
		a2 = ixir.dateToValue(this.date),
		a3 = ixir.dateToValue(ixir.Init(arg2)),x,y;
	if(a1 < a2){
		x = a1;
		y = a3;
	}else{
		x = a3;
		y = a1;
	};
	if(x < a2 < y || x > a2 > y){
		return true;
	}else return false;
};
ixir.prototype.toString = ixir.date.prototype.toString = ixir.prototype.toIXIRFormat;

module.exports = ixir;

/* Version 3 */

ixir.filter = function(timeFunction,date1,date2,func){
	var startdate = new ixir(date1),
		day1 = ixir.dateToValue(ixir.Init(date1)),
		day2 = ixir.dateToValue(ixir.Init(date2)),
		timeCount = day2 - day1,
		step = ixir.daySec(1),
		totalTime = 0,
		different,j,newDate;
	switch(timeFunction){
		case "hour":
			ixir.hourSec(1);
			break;
		case "day":
			ixir.daySec(1);
			break;
		case "month":
			ixir.monthSec(1);
			break;
		case "year":
			ixir.yearSec(1);
			break;
	};
	startdate.date.calculate();
	for(j = 0;j<timeCount;j+=step){
		newDate = startdate.add({second:j},true);
		newDate.date.calculate();
		if(func(newDate.date)){
			totalTime+=step;
		}
	};
	return totalTime/step;
};
ixir.loop = ixir.filter;
ixir.dayFilter = function(date1,date2,callback){
	return ixir.filter("day",date1,date2,callback)
};
ixir.hourFilter = function(date1,date2,callback){
	return ixir.filter("hour",date1,date2,callback)
};
ixir.monthFilter = function(date1,date2,callback){
	return ixir.filter("month",date1,date2,callback)
};
ixir.yearFilter = function(date1,date2,callback){
	return ixir.filter("year",date1,date2,callback)
};

/*
	ixir - Date time format convers	ion, mathematical operation and with javascript speed-up referance library

	var j = new ixir("08.08.2008");
	console.log(j.toString());		>> 00:00 @ 08.08.2008

	j.add("> +5 day");
	console.log(j.toString());		>> 00:00 @ 13.08.2008

	j.add("> -80 minute, 1 year");
	console.log(j.toString());		>> 22:40 @ 12.08.2009
	**********************************************************************************************
	var start = new ixir({year:2012,day:15,month:5,hour:12});
	var end = new ixir({year:2013,day:20,month:5,hour:13});

	ixir.isAfter(start,end);	>> true
	ixir.isBefore(start,end);	>> false

	end.diff(start,true);		>> { negative: false,
										year: 1,
										month: 0,
										day: 5,
										hour: 1,
										minute: 0,
										second: 0,
										week: 1,
										weekday: 6,
										monthname: 'January',
										dayname: 'Saturday'
									}
	*******************************************************************************************

	ixir.lang = "en";
	var j = new ixir("13:17:28 @ 01/08/2004");
	j.date.dayname 			>> "Wednesday";
	j.date.monthname		>> "September";
	j.date.week				>> 36
	j.date.weekday 			>> 3
	
	ixir.lang = "tr";
	j.date.calculate();
	j.date.dayname 			>> "Çarşamba";
	j.date.monthname		>> "Eylül";
	j.date.week				>> 36
	j.date.weekday 			>> 3
	*******************************************************************************************

	var s1 = new ixir("18/07/1998");
	var s2 = new ixir("18/07/1999");
	var s3 = new ixir("18/07/2000")

	ixir.SortDates([s3,s1,s2]);		>> [s1,s2,s3]
	******************************************************************

	var j = new ixir("01.01.2003");
	j.isBetween(
		new ixir("01.08.2003"),
		new ixir("25.12.2002")
	)							>> true
*/