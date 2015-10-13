Uize.module ({
	name:'Loki.LocServiceAdapters.WebModules',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition.WordSplitter',
		'Uize.Json'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(.+[_\-\/])(en_US)(\.js)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				tokenName:/[\da-zA-Z_]+/,
				token:/\{({tokenName})\}/,
				wordSplitter:/{token}|{whitespace}|{punctuation}|{number}/
			})
		;

		return _superclass.subclass ({
			staticMethods:{
				parseResourceFile:function (_resourceFileText) {
					return Uize.Json.from (
						_resourceFileText
							.replace (/^\s*module\s*\.\s*exports\s*=/,'')
							.replace (/;\s*$/,'')
					);
				},

				serializeResourceFile:function (_strings) {
					return 'module.exports = ' + Uize.Json.to (_strings) + ';';
				}
			},

			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1' + _language.replace ('-','_') + '$3'
					);
				},

				getStringBrand:function (_resourceStringPath) {
					var _brand = +_resourceStringPath [_resourceStringPath.length - 1];
					return (_brand || '') + '';
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return this.Class.parseResourceFile (_resourceFileText);
				},

				serializeResourceFile:function (_strings) {
					return this.Class.serializeResourceFile (_strings);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('token'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

