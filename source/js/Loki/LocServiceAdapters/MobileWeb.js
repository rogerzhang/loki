Uize.module ({
	name:'Loki.LocServiceAdapters.MobileWeb',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /(^|\/)en_US(\/messages\.js)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]+/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				tokenName:/[\da-zA-Z]+/,
				token:/%{tokenName}%/,
				tokenWithNameCapture:/%({tokenName})%/,
				wordSplitter:/({whitespace}|{token}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						'$1' + _language.replace ('-','_') + '$2'
					);
				},

				isBrandResourceString:function (_resourceStringPath,_resourceStringText) {
					return _resourceStringPath [0] == 'BRANDS';
				},

				stringHasHtml:function () {
					return false;
				},

				isTranslatableString:function (_stringInfo) {
					return (
						!/(Email$|URL$)/.test (_stringInfo.key) &&
						!/^(https?:\/\/)/.test (_stringInfo.value)
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					var RCM = {};
					eval (_resourceFileText);
					return RCM.Message;
				},

				serializeResourceFile:function (_messages) {
					return 'RCM.Message = ' + Uize.Json.to (_messages);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

