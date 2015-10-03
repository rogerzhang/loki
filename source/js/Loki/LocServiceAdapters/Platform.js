Uize.module ({
	name:'Loki.LocServiceAdapters.Platform',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition.WordSplitter',
		'Uize.Loc.FileFormats.JavaPropertiesUnicode'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(.+_)(en_US)(\.properties)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				tokenName:/[\da-zA-Z_]+/,
				token:/\$\{({tokenName})\}/,
				wordSplitter:/{token}|{whitespace}|{punctuation}|{number}/
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
					return Uize.Loc.FileFormats.JavaPropertiesUnicode.from (_resourceFileText);
				},

				serializeResourceFile:function (_strings) {
					return Uize.Loc.FileFormats.JavaPropertiesUnicode.to (_strings);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('token'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

