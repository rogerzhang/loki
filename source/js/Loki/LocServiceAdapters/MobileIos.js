Uize.module ({
	name:'Loki.LocServiceAdapters.MobileIos',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Loc.FileFormats.MacStrings',
		'Uize.Services.FileSystem',
		'Uize.Parse.Code.StringLiteral',
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.WordSplitter',
		'Uize.Str.Search'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_fileSystem = Uize.Services.FileSystem.singleton (),
			_resourceFilePathRegExp = /(^|\/)en-US(\.lproj\/Localizable\.strings)$/,
			_macOsStringFormatSpecifierRegExpComposition = Uize.Util.RegExpComposition ({
				// https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Strings/Articles/formatSpecifiers.html
				code:/[@%dDuUxXoOfeEgGcCsSPaAF]/,
				lengthModifier:/hh?|ll?|[qLztj]/,
				lengthModifierAndCode:/(?:{lengthModifier})?{code}/,
				specifier:/%({lengthModifierAndCode})/
			}),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				macOsStringFormatSpecifier:_macOsStringFormatSpecifierRegExpComposition.get ('specifier'),
				brandTokenName:/[a-zA-Z_0-9]+/,
				brandToken:/<({brandTokenName})>/,
				token:/{macOsStringFormatSpecifier}|{brandToken}/,
				wordSplitter:/{whitespace}|{token}|{punctuation}|{number}/
			}),

			/*** Variables for Reference Scanning ***/
				_getLineAndChar = Uize.Str.Search.getLineAndChar,
				_localizerMethods = [
					'NSLocalizedStringFromTableInBundle',
					'NSLocalizedString',
					'RCSPLocalizedString',
					'RCSPLocalizedStringFromTableInBundle',
					'RCLocalizedString',
					'RCDLocalizedString'
				],
				_localizerMethodRegExp = new RegExp ('(' + _localizerMethods.join ('|') + ')\\s*\\(\\s*@','g'),
				_stringLiteralParser = new Uize.Parse.Code.StringLiteral
		;

		/*** Private Instance Methods ***/
			function _getCodeFolderPath (m) {
				var _project = m.project;
				return _project.codeFolderPath || _project.rootFolderPath;
			}

		return _superclass.subclass ({
			instanceMethods:{
				getReferencingCodeFiles:function () {
					return _fileSystem.getFiles ({
						path:_getCodeFolderPath (this),
						pathMatcher:/\.m$/,
						recursive:true
					});
				},

				getReferencesFromCodeFile:function (_filePath) {
					var
						_referencesLookup = {},
						_sourceFileText = _fileSystem.readFile ({path:_getCodeFolderPath (this) + '/' + _filePath}),
						_match
					;
					_localizerMethodRegExp.lastIndex = 0;
					while (_match = _localizerMethodRegExp.exec (_sourceFileText)) {
						var
							_referenceStart = _match.index,
							_referenceIdStart = _referenceStart + _match [0].length
						;
						_stringLiteralParser.parse (_sourceFileText,_referenceIdStart);
						var
							_stringId = _stringLiteralParser.value,
							_referenceEnd = _referenceIdStart + _stringLiteralParser.length
						;
						(_referencesLookup [_stringId] || (_referencesLookup [_stringId] = [])).push ({
							reference:_sourceFileText.slice (_referenceStart,_referenceEnd),
							start:_getLineAndChar (_sourceFileText,_referenceStart),
							end:_getLineAndChar (_sourceFileText,_referenceEnd)
						});
					}
					return _referencesLookup;
				},

				extract:function (_params,_callback) {
					/* TODO:
						- need to add support for extracting strings from .xib files
					*/
					var
						m = this,
						_strings = {},
						_resources = {'RCSoftPhoneApp/Localizations/en-US.lproj/Localizable.strings':_strings},
						_filesToScan = this.getReferencingCodeFiles ()
					;
					m.prepareToExecuteMethod (_filesToScan.length + 2);
					m.stepCompleted ('Obtained list of source code files to scan: ' + _filesToScan.length + ' files');
					Uize.forEach (
						_filesToScan,
						function (_filePath) {
							var
								_stringIds = Uize.keys (m.getReferencesFromCodeFile (_filePath)),
								_totalExtractedStrings = _stringIds.length
							;
							Uize.forEach (_stringIds,function (_stringId) {_strings [_stringId] = _stringId});
							m.stepCompleted (
								'Scanned file and extracted strings' + ' ' +
								(_totalExtractedStrings ? '█' : ':') + ' ' +
								_filePath +
								(_totalExtractedStrings ? ' -- ' + _totalExtractedStrings + ' EXTRACTED' : '')
							);
						}
					);
					m.distributeResources (_resources,m.project.primaryLanguage);
					m.stepCompleted ('Updated resource files for primary language');
					_callback ();
				},

				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (_resourceFilePathRegExp,'$1' + _language + '$2');
				},

				isTranslatableString:function (_stringInfo) {
					return true;
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return Uize.Loc.FileFormats.MacStrings.from (_resourceFileText);
				},

				serializeResourceFile:function (_messages) {
					return Uize.Loc.FileFormats.MacStrings.to (_messages);
				}
			},

			instanceProperties:{
				tokenRegExp:_wordSplitterRegExpComposition.get ('token'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

