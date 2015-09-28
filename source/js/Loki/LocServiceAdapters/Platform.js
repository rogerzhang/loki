Uize.module ({
	name:'Loki.LocServiceAdapters.Platform',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Loc.FileFormats.JavaProperties'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(.+_)(en_US)(\.properties)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				tokenName:/[\da-zA-Z_]+/,
				token:/\$\{{tokenName}\}/,
				tokenWithNameCapture:/\$\{({tokenName})\}/,
				wordSplitter:/({token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1' + _language.replace ('-','_') + '$3'
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return Uize.Loc.FileFormats.JavaProperties.from (_resourceFileText);
				},

				serializeResourceFile:function (_strings) {
					return Uize.Loc.FileFormats.JavaProperties.to (_strings);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

