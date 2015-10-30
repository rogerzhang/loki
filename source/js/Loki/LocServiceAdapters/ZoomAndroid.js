Uize.module ({
	name:'Loki.LocServiceAdapters.ZoomAndroid',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition.WordSplitter',
		'Uize.Util.RegExpComposition.PrintfWithParam',
		'Uize.Loc.FileFormats.AndroidStrings'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /((?:^|\/)values)(\/strings(_[^\/\.]+)?\.xml)$/,
			_printfFormatPlaceholderRegExpComposition = Uize.Util.RegExpComposition.PrintfWithParam,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				token:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:/{whitespace}|{token}|{punctuation}|{number}/
			}),
			_Uize_Loc_FileFormats_AndroidStrings = Uize.Loc.FileFormats.AndroidStrings
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						'$1-' + _language.replace ('-','-r') + '$2'
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					return _Uize_Loc_FileFormats_AndroidStrings.from (_resourceFileText);
				},

				serializeResourceFile:function (_strings) {
					return _Uize_Loc_FileFormats_AndroidStrings.to (_strings);
				}
			},

			instanceProperties:{
				tokenRegExp:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

