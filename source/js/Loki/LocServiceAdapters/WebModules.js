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

		/*** Utility Functions ***/
			function _staticMethodCaller (_methodName) {
				return function () {return this.Class [_methodName].apply (this,arguments)};
			}

		return _superclass.subclass ({
			staticMethods:{
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
					return Uize.Json.from (
						_resourceFileText
							.replace (/^\s*export\s*default/,'')
							.replace (/;\s*$/,'')
					);
				},

				serializeResourceFile:function (_strings) {
					return 'export default ' + Uize.Json.to (_strings,{keyDelimiter:' : '}) + ';';
				}
			},

			instanceMethods:{
				getLanguageResourcePath:_staticMethodCaller ('getLanguageResourcePath'),
				getStringBrand:_staticMethodCaller ('getStringBrand'),
				isResourceFile:_staticMethodCaller ('isResourceFile'),
				parseResourceFile:_staticMethodCaller ('parseResourceFile'),
				serializeResourceFile:_staticMethodCaller ('serializeResourceFile')
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('token'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

