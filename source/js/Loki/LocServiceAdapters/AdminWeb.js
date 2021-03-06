/* REFERENCE
	- http://www.science.co.il/Language/Locale-codes.asp
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.AdminWeb',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition.WordSplitter',
		'Uize.Data.Csv',
		'Uize.Data.NameValueRecords',
		'Uize.Services.FileSystem',
		'Uize.Array.Sort',
		'Uize.Str.BackslashEscapedLinebreaks'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_fileSystem = Uize.Services.FileSystem.singleton (),
			_resourceFileRegExp = /(?:^|[\/\\])LanguageDictionary\.csv$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				tokenName:/[a-zA-Z0-9_]+/,
				token:/{({tokenName})}/,
				wordSplitter:/{token}|{whitespace}|{punctuation}|{number}/
			}),
			_bomChar = '﻿',
			_stringKeyColumnName = 'strConstant',
			_emptyStringCode = '~',
			_localeToLcid = {
				'da':'1030',
				'de-AT':'3079',
				'de-DE':'1031',
				'de-CH':'2055',
				'en-CA':'4105',
				'en-GB':'2057',
				'en-IE':'6153',
				'en-US':'1033',
				'en-ZZ':'9999',
				'es-ES':'1034',
				'es-MX':'2058',
				'es-VE':'8202',
				'fi':'1035',
				'fr-BE':'2060',
				'fr-CA':'3084',
				'fr-CH':'4108',
				'fr-FR':'1036',
				'ja-JP':'1041',
				'ko':'1042',
				'it-IT':'1040',
				'nl-NL':'1043',
				'no-NO':'2068',
				'pt-BR':'1046',
				'pt-PT':'2070',
				'ru-RU':'1049',
				'ru-MO':'2073',
				'th':'1054',
				'zh-CN':'2052',
			},
			_dictionaryCsvEncodingOptions = {
				hasHeader:true,
				rowType:'object',
				valueDelimiter:'\t'
			}
		;

		function _parseCsvFromResourceFileText (_resourceFileText) {
			return Uize.Data.Csv.from (_resourceFileText.slice (1),_dictionaryCsvEncodingOptions);
		}

		return _superclass.subclass ({
			staticMethods:{
				parseResourceFile:function (_resourceFileText,_language) {
					return Uize.map (
						Uize.Data.NameValueRecords.toHash (
							_parseCsvFromResourceFileText (_resourceFileText),
							_stringKeyColumnName,
							_localeToLcid [_language]
						),
						function (_stringValue) {
							_stringValue = Uize.Str.BackslashEscapedLinebreaks.from (_stringValue || '');
							return _stringValue == _emptyStringCode ? '' : _stringValue;
						}
					);
				},

				serializeResourceFile:function (_strings,_language,_resourceFileText) {
					var _dictionaryRecords = _parseCsvFromResourceFileText (_resourceFileText);

					/*** stitch in column for language ***/
						var _lcid = _localeToLcid [_language];
						Uize.forEach (
							_dictionaryRecords,
							function (_resourceString) {
								_resourceString [_lcid] = Uize.Str.BackslashEscapedLinebreaks.to (
									_strings [_resourceString [_stringKeyColumnName]] || _emptyStringCode
								);
							}
						);

					/*** re-serialize to all languages CSV file and return ***/
						return _bomChar + Uize.Data.Csv.to (
							_dictionaryRecords,
							Uize.copyInto (
								_dictionaryCsvEncodingOptions,
								{
									columns:Uize.Array.Sort.sortBy (
										Uize.keys (_dictionaryRecords [0]),
										function (_value) {return _value == _stringKeyColumnName ? -1 : +_value}
									)
								}
							)
						);
				}
			},

			instanceMethods:{
				getLanguageResourcePath:Uize.returnX,

				isResourceFile:function (_filePath) {return _resourceFileRegExp.test (_filePath)},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					return this.Class.parseResourceFile (_resourceFileText,_resourceFileInfo.language);
				},

				serializeResourceFile:function (_strings,_resourceFileInfo) {
					return this.Class.serializeResourceFile (
						_strings,
						_resourceFileInfo.language,
						_fileSystem.readFile ({path:_resourceFileInfo.path,encoding:this.project.resourceFileEncoding})
					);
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('token')
			}
		});
	}
});

