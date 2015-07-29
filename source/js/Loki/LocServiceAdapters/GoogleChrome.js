Uize.module ({
	name:'Loki.LocServiceAdapters.GoogleChrome',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.PrintfWithParam',
		'Uize.Json'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(?:^|[\/\\])en-us\/strings\.js$/,
			_printfFormatPlaceholderRegExpComposition = Uize.Util.RegExpComposition.PrintfWithParam,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				token:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:/({token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace ('en-us/',_language.toLowerCase () + '/');
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return eval ('(function () {' + _resourceFileText + '; return localeStrings;}) ()');
				},

				serializeResourceFile:function (_strings) {
					return 'var localeStrings = ' + Uize.Json.to (_strings);
				}
			},

			instanceProperties:{
				tokenRegExp:_printfFormatPlaceholderRegExpComposition.get ('placeholderWithCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

