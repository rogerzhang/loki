Uize.module ({
	name:'Loki.LocServiceAdapters.Prompts',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Loc.FileFormats.Po'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(?:^|[\/\\])en_US\.po$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				tokenName:/[^<>]+/,
				token:/<{tokenName}>/,
				tokenWithCapture:/<({tokenName})>/,
				wordSplitter:/({token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace ('en_US',_language.replace ('-','_'));
				},

				stringHasHtml:Uize.returnFalse,

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					var _strings = Uize.Loc.FileFormats.Po.from (_resourceFileText);
					if (_resourceFileInfo.isPrimaryLanguage)
						Uize.map (
							_strings,
							function (_value,_key) {
								return Uize.isArray (_value) ? Uize.map (_value,function () {return _key}) : _key;
							},
							_strings
						)
					;
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					return Uize.Loc.FileFormats.Po.to (_strings);
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithCapture')
			}
		});
	}
});

