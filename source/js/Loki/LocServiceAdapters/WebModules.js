Uize.module ({
	name:'Loki.LocServiceAdapters.WebModules',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Json'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(.+[_\-\/])(en_US)(\.js)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				tokenName:/[\da-zA-Z_]+/,
				token:/\{{tokenName}\}/,
				tokenWithNameCapture:/\{({tokenName})\}/,
				wordSplitter:/({token}|{whitespace}|{punctuation}|{number})/
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
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

