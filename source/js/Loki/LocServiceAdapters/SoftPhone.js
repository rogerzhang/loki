/* REFERENCE MATERIAL
	- https://qt-project.org/wiki/QtInternationalization
	- http://qt-project.org/doc/qt-4.8/linguist-ts-file-format.html
	- http://qt-project.org/doc/qt-5/qstring.html#argument-formats
	- http://pubs.opengroup.org/onlinepubs/009695399/functions/printf.html
	- http://www.getlocalization.com/docs/file-formats/qt-ts/
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.SoftPhone',
	required:[
		'Uize.Loc.FileFormats.QtTs',
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.Printf'
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
				printfToken:Uize.Util.RegExpComposition.Printf.get ('specifier'),
				printfTokenWithCapture:Uize.Util.RegExpComposition.Printf.get ('specifierWithCapture'),
				argToken:/%\d+/,
				argTokenWithCapture:/%(\d+)/,
				token:/{printfToken}|{argToken}/,
				tokenWithCapture:/{printfTokenWithCapture}|{argTokenWithCapture}/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			}),
			_localeToFilenameLocaleMap = {
				'en-GB':'uk',
				'en-US':'us',
				'fr-CA':'fr',
				'ru-RU':'ru',
				'en-ZZ':'tw'
			}
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1_lang_' +  (_localeToFilenameLocaleMap [_language] || _language.replace ('-','_')) + '.ts'
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
							function (_contextStrings,_contextName) {
								Uize.map (
									_contextStrings,
									function (_value,_key) {
										return Uize.isArray (_value) ? Uize.map (_value,function () {return _key}) : _key;
									},
									_contextStrings
								)
							}
						);
					}
					return _strings;
				},

				serializeResourceFile:function (_strings,_language) {
					return Uize.Loc.FileFormats.QtTs.to (_strings,{language:_language});
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithCapture')
			}
		});
	}
});

