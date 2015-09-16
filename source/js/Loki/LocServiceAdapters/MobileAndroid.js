Uize.module ({
	name:'Loki.LocServiceAdapters.MobileAndroid',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.PrintfWithParam',
		'Uize.Loc.FileFormats.AndroidStrings',
		'Uize.Services.FileSystem',
		'Uize.Str.Search'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /((?:^|\/)values)(\/strings(_[^\/\.]+)?\.xml)$/,
			_printfFormatPlaceholderRegExpComposition = Uize.Util.RegExpComposition.PrintfWithParam,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				token:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:/(^@.+$|{whitespace}|{token}|{punctuation}|{number})/
			}),
			_Uize_Loc_FileFormats_AndroidStrings = Uize.Loc.FileFormats.AndroidStrings
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						'$1-' + _language.replace ('-','-r') + '$2'
					);
				},

				isTranslatableString:function (_stringInfo) {
					return (
						_stringInfo.value.charAt (0) != '@' // values that start with "@" are links to other strings
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				isBrandResourceFile:function (_filePath) {
					return /(^|\/)strings_branded\.xml$/.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					var _strings = _Uize_Loc_FileFormats_AndroidStrings.from (_resourceFileText);
					if (_resourceFileInfo.isPrimaryLanguage) {
						Uize.forEach (
							_strings,
							function (_stringValue,_stringKey) {
								if (Uize.isPlainObject (_stringValue)) {
									var _other = _stringValue.other;
									_stringValue.zero || (_stringValue.zero = _other);
									_stringValue.two || (_stringValue.two = _other);
									_stringValue.few || (_stringValue.few = _other);
									_stringValue.many || (_stringValue.many = _other);
								}
							}
						);
					}
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					return _Uize_Loc_FileFormats_AndroidStrings.to (_strings);
				},

				getReferencingCodeFiles:function () {
					return Uize.Services.FileSystem.singleton ().getFiles ({
						path:this.project.codeFolderPath,
						pathMatcher:/\.(java|xml)$/,
						recursive:true
					});
				},

				getReferencesFromCodeFile:function (_filePath) {
					var _referencesLookup = {};
					Uize.forEach (
						Uize.Str.Search.search (
							Uize.Services.FileSystem.singleton ().readFile ({
								path:this.project.codeFolderPath + '/' + _filePath
							}),
							/\.xml$/.test (_filePath) ? /@string\/([a-zA-Z0-9_$]+)/ : /\bR\.string\.([a-zA-Z0-9_$]+)/
						),
						function (_match) {
							var _stringId = _match [1];
							(_referencesLookup [_stringId] || (_referencesLookup [_stringId] = [])).push ({
								reference:_match [0],
								start:_match.start,
								end:_match.end
							});
						}
					);
					return _referencesLookup;
				}
			},

			instanceProperties:{
				tokenRegExp:_printfFormatPlaceholderRegExpComposition.get ('placeholderWithCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

