Uize.module ({
	name:'Loki.LocServiceAdapters.GwFunnels',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /(^|\/)en\/US(\.php)$/,
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
						'$1' + _language.replace ('-','/') + '$2'
					);
				},

				getStringBrand:function (_resourceStringPath) {
					/* NOTE:
						It's unfortunate that we have to do this kind of hackery to try to determine the brand for a resource string, but the GW funnel code does not have a more definitive / deliberate provision for brand-specific resource at this stage.
					*/
					var _stringKey = _resourceStringPath [_resourceStringPath.length - 1];
					return _stringKey.indexOf ('TELUS') > -1 ? '7310' : _stringKey.indexOf ('AT&T') > -1 ? '3420' : '';
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
										/^<\?php(\s*\r?\n)*\s*return\s+array\s*\(/,
											'{'
										)
									.replace (  // replace trailing with close curly brace
										/,?(\s*\r?\n)*\s*\)\s*;(\s*\r?\n)*\s*$/,
										'}'
									)
									.replace (  // replace "' => '" with "':'"
										/(['"])\s*=>\s*\1/g,
										'$1:$1'
									)
							)
							: {}
					);
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

