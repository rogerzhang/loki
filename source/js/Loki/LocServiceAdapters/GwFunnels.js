Uize.module ({
	name:'Loki.LocServiceAdapters.GwFunnels',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /(^|\/)(en\/US|en_us\/([a-z0-9-]+))(\.php)$/,
			_brandResourceFileRegExp = /\/brand-([0-9]+)\.php$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				tokenName:/[\da-zA-Z_]+/,
				token:/\{{tokenName}\}/,
				tokenWithNameCapture:/\{({tokenName})\}/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						function (_match,_start,_folderLanguageCode, _fileName,_fileExtension) {
							return (
								_start +
								(
									_folderLanguageCode == 'en/US'
										? _language.replace ('-','/')
										: _language.replace ('-','_').toLowerCase () + '/' + _fileName
								) +
								_fileExtension
							);
						}
					);
				},

				getStringBrand:function (_resourceStringPath) {
					/* NOTE:
						this behavior is deprecated and will be removed in release 7.2
					*/
					var _stringKey = _resourceStringPath [_resourceStringPath.length - 1];
					return _stringKey.indexOf ('TELUS') > -1 ? '7310' : _stringKey.indexOf ('AT&T') > -1 ? '3420' : '';
				},

				getResourceFileBrand:function (_resourceFilePath) {
					var _brandedMatch = _resourceFilePath.match (_brandResourceFileRegExp);
					return _brandedMatch ? _brandedMatch [1] : '';
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					/* NOTE:
						This is by no means a robust way to parse these PHP array style resource files, but it's a quick and dirty way to get things moving forward, and it seems we're lucky that the PHP associative array syntax is close enough to JSON to be able to parse it after some massaging based upon simplifying assumptions.
					*/
					return (
						_resourceFileText
							? Uize.Json.from (
								_resourceFileText
									.replace (  // replace leading with open curly brace
										/^(.*(\r?\n))*.*array\s*\(/,
										'{'
									)
									.replace (  // replace trailing with close curly brace
										/,?(\s*\r?\n)*\s*\)\s*;(\s*\r?\n)*\s*$/,
										'}'
									)
									.replace (  // replace linebreaks and leading padding to eliminate multi-line strings
										/(\n|\r|\r\n)+\s+/g,
										' '
									)
									.replace (  // replace "' => '" with "':'"
										/(['"])\s*=>\s*\1/g,
										'$1:$1'
									)
							)
							: {}
					);
				},

				gatherResources:function () {
					/* NOTE:
						Normally, it is not necessary for adapters to override the adapter base class' implementation of this method, but in the GwFunnels project we have some Yii resource files for the primary language where the values are empty and are expected to be defaulted to the key. This is different to the contents of the resource files for the non-Yii PHP code, where the value is always filled and equal to the key.

						We don't want to always default the empty values to the keys in the parseResourceFile method, because that method is also used for parsing the resource files for other, non-primary languages, and we want empty values in those resource files to potentially indicate missing translations.
					*/
					var _primaryLanguageResources = _superclass.doMy (this,'gatherResources');
					Uize.forEach (
						_primaryLanguageResources,
						function (_resourceFileStrings,_resourceFileSubPath) {
							Uize.map (_resourceFileStrings,'value || key',_resourceFileStrings);
						}
					);
					return _primaryLanguageResources;
				},

				serializeResourceFile:function (_messages) {
					return (
						'<?php\n' +
						'\n' +
						'return array(' +
						Uize.Json.to (
							_messages,
							{quoteChar:'\'',keyDelimiter:' => ',whenToQuoteKeys:'always'}
						).slice (1,-1) +
						');'
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

