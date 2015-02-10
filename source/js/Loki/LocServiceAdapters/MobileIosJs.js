Uize.module ({
	name:'Loki.LocServiceAdapters.MobileIosJs',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp =
				/(^|\/RCTargets\/)([^\/]+)(\/RCSPSetupAndSettings\.rcswv\/mobileweb\/core\/js\/src\/messages_)en_US(\.js)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				tokenName:/[\da-zA-Z_]+/,
				token:/%{tokenName}%/,
				tokenWithNameCapture:/%({tokenName})%/,
				wordSplitter:/({whitespace}|{token}|{punctuation}|{number})/
			}),
			_rcTragetFolderNameToBrandId = {
				'ATTVR':'3420',
				'BT':'',
				'Clearwire':'',
				'RCInternational':'1210',
				'RCMobile':'1210',
				'RCUK':'3710',
				'Rogers':'',
				'T-Mobile':'8510',
				'TELUS':'7310'
			},
			_bomChar = '﻿',
			_copyrightDateSerialized = '\'+date(2014)+\'',
			_copyrightDateMormalized = '%copyrightDate%'
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						'$1$2$3' + _language.replace ('-','_') + '$4'
					);
				},

				getResourceFileBrand:function (_filePath) {
					var _brandedMatch = _filePath.match (_resourceFilePathRegExp);
					return (_brandedMatch && _rcTragetFolderNameToBrandId [_brandedMatch [2]]) || '';
				},

				stringHasHtml:Uize.returnFalse,

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					var RCM = {Message:{}};
					eval (_resourceFileText.slice (1).replace (_copyrightDateSerialized,_copyrightDateMormalized));
					return RCM.Message [_resourceFileInfo.language.replace ('-','_')];
				},

				serializeResourceFile:function (_messages,_resourceFileInfo) {
					return (
						_bomChar +
						'function date(y){\n' +
						'	return y > new Date().getFullYear() ? y : new Date().getFullYear();\n' +
						'}\n' +
						'\n' +
						'RCM.Message.' + _resourceFileInfo.language.replace ('-','_') + ' = ' +
						Uize.Json.to (_messages).replace (_copyrightDateMormalized,_copyrightDateSerialized)
					);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

