Uize.module ({
	name:'Loki.LocServiceAdapters.GoogleChrome',
	superclass:'Loki.LocServiceAdapters.WithExcludes',
	required:[
		'Uize.Util.RegExpComposition.WordSplitterHtml',
		'Uize.Util.RegExpComposition.PrintfWithParam',
		'Uize.Json'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(?:^|[\/\\])en-us\/strings\.js$/,
			_printfFormatPlaceholderRegExp = Uize.Util.RegExpComposition.PrintfWithParam.get ('placeholder'),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitterHtml.extend ({
				token:_printfFormatPlaceholderRegExp,
				wordSplitter:/({htmlTag}|{htmlEntity}|{whitespace}|{punctuation}|{number})/
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
				tokenRegExp:_printfFormatPlaceholderRegExp,
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

