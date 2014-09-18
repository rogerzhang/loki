Uize.module ({
	name:'Loki.LocServiceAdapters.SoftPhone',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Loc.FileFormats.QtTs'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(.+?)_lang_(us)\.ts$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				// TODO: provide support for correct token format (appears to be sprintf)
				tokenName:/[a-zA-Z0-9_]+/,
				token:/<\${tokenName}\$>|\[{tokenName}\]/,
				tokenWithCapture:/<\$({tokenName})\$>|\[({tokenName})\]/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1_lang_' + _language.split ('-') [1].toLowerCase () + '.ts'
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					var _strings = Uize.Loc.FileFormats.QtTs.from (_resourceFileText);
					if (_resourceFileInfo.isPrimaryLanguage) {
						Uize.forEach (
							_strings,
							function (_contextStrings,_contextName) {Uize.map (_contextStrings,'key',_contextStrings)}
						);
					}
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					// TODO: add support for providing language code to serializer, since the .ts file appear to need this
					return Uize.Loc.FileFormats.QtTs.to (_strings);
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithCapture')
			}
		});
	}
});

