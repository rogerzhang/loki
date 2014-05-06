Uize.module ({
	name:'Loki.LocServiceAdapters.MobileIos',
	required:[
		'Uize.Data.MacStrings',
		'Uize.Services.FileSystem',
		'Uize.Parse.Code.StringLiteral',
		'Uize.Util.RegExpComposition'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /(^|\/)en.lproj(\/Localizable\.strings)$/,
			_macOsStringFormatSpecifierRegExpComposition = Uize.Util.RegExpComposition ({
				// https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Strings/Articles/formatSpecifiers.html
				code:/[@%dDuUxXoOfeEgGcCsSPaAF]/,
				lengthModifier:/hh?|ll?|[qLztj]/,
				lengthModifierAndCode:/(?:{lengthModifier})?{code}/,
				specifier:/%{lengthModifierAndCode}/,
				specifierWithCapture:/%({lengthModifierAndCode})/
			}),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]+/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				brandToken:/<[a-zA-Z_0-9]+>/,
				token:_macOsStringFormatSpecifierRegExpComposition.get ('specifier'),
				tokenWithNameCapture:_macOsStringFormatSpecifierRegExpComposition.get ('specifierWithCapture'),
				wordSplitter:/({whitespace}|{token}|{brandToken}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				extract:function (_params,_callback) {
					/* TODO:
						- need a starting folder that may be different from root folder for resource files
							- so, this would need to be configurable in the config section for this project
						- need to know where to put extermalized strings
						- need to add support for extracting strings from .xib files
					*/
					var
						m = this,
						_strings = {},
						_resources = {'RCSoftPhoneApp/Localizations/en.lproj/Localizable.strings':_strings},
						_localizerMethods = [
							'NSLocalizedStringFromTableInBundle',
							'NSLocalizedString',
							'RCSPLocalizedString',
							'RCSPLocalizedStringFromTableInBundle',
							'RCLocalizedString'
						],
						_localizerMethodRegExp = new RegExp ('(' + _localizerMethods.join ('|') + ')\\s*\\(\\s*@','g'),
						_fileSystem = Uize.Services.FileSystem.singleton (),
						_sourceRootPath = '../svn/rc/IOS-TELUS-RESKINNING',
						_stringLiteralParser = new Uize.Parse.Code.StringLiteral
					;
					_fileSystem.getFiles ({
						path:_sourceRootPath,
						pathMatcher:function (_path) {
							if (/\.m$/.test (_path)) {
								_localizerMethodRegExp.lastIndex = 0;
								var
									_sourceFileText = _fileSystem.readFile ({path:_sourceRootPath + '/' + _path}),
									_match
								;
								while (_match = _localizerMethodRegExp.exec (_sourceFileText)) {
									_stringLiteralParser.parse (_sourceFileText,_match.index + _match [0].length);
									var _string = _stringLiteralParser.value;
									_strings [_string] = _string;
								}
							}
						},
						recursive:true
					});
					 m.distributeResources (_resources,'en-US');
					_callback ();
				},

				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						'$1' + _language.split ('-') [0] + '.lproj$2'
					);
				},

				isBrandResourceString:function (_resourceStringPath,_resourceStringText) {
					return false;
				},

				isTranslatableString:function (_stringInfo) {
					return true;
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return Uize.Data.MacStrings.from (_resourceFileText);
				},

				serializeResourceFile:function (_messages) {
					return Uize.Data.MacStrings.to (_messages);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

