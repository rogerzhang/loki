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
			_tokenRegExpComposition = Uize.Util.RegExpComposition ({
				macOsStringFormatSpecifier:_macOsStringFormatSpecifierRegExpComposition.get ('specifier'),
				macOsStringFormatSpecifierWithCapture:
					_macOsStringFormatSpecifierRegExpComposition.get ('specifierWithCapture'),
				brandTokenName:/[a-zA-Z_0-9]+/,
				brandToken:/<{brandTokenName}>/,
				brandTokenWithNameCapture:/<({brandTokenName})>/,
				token:/{macOsStringFormatSpecifier}|{brandToken}/,
				tokenWithNameCapture:/{macOsStringFormatSpecifierWithCapture}|{brandTokenWithNameCapture}/,
			}),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				brandToken:/<[a-zA-Z_0-9]+>/,
				token:_tokenRegExpComposition.get ('token'),
				wordSplitter:/({whitespace}|{token}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				extract:function (_params,_callback) {
					/* TODO:
						- need to add support for extracting strings from .xib files
					*/
					var
						m = this,
						_project = m.project,
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
						_codeFolderPath = _project.codeFolderPath || _project.rootFolderPath,
						_stringLiteralParser = new Uize.Parse.Code.StringLiteral,
						_filesToScan = _fileSystem.getFiles ({
							path:_codeFolderPath,
							pathMatcher:/\.m$/,
							recursive:true
						}),
						_filesToScanLength = _filesToScan.length
					;
					m.prepareToExecuteMethod (_filesToScan.length + 2);
					m.stepCompleted ('Obtain list of source code files to scan: ' + _filesToScanLength + ' files');
					Uize.forEach (
						_filesToScan,
						function (_filePath) {
							_localizerMethodRegExp.lastIndex = 0;
							var
								_totalExtractedStrings = 0,
								_sourceFileText = _fileSystem.readFile ({path:_codeFolderPath + '/' + _filePath}),
								_match
							;
							while (_match = _localizerMethodRegExp.exec (_sourceFileText)) {
								_stringLiteralParser.parse (_sourceFileText,_match.index + _match [0].length);
								var _string = _stringLiteralParser.value;
								_strings [_string] = _string;
								_totalExtractedStrings++;
							}
							m.stepCompleted (
								'Scanned file and extracted strings' + ' ' +
								(_totalExtractedStrings ? '█' : ':') + ' ' +
								_filePath +
								(_totalExtractedStrings ? ' -- ' + _totalExtractedStrings + ' EXTRACTED' : '')
							);
						}
					);
					m.distributeResources (_resources,_project.primaryLanguage);
					m.stepCompleted ('Updated resource files for primary language');
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
				tokenRegExp:_tokenRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

