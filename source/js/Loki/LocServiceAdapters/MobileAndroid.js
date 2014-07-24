Uize.module ({
	name:'Loki.LocServiceAdapters.MobileAndroid',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Loc.FileFormats.AndroidStrings'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /((?:^|\/)values)(\/strings(_[^\/\.]+)?\.xml)$/,
			_printfFormatPlaceholderRegExpComposition = Uize.Util.RegExpComposition ({
				// http://en.wikipedia.org/wiki/Printf_format_string#Format_placeholders
				parameter:/\d+\$/,
				flags:/[\+ \-#0]{0,5}/, // this isn't robust, since it shouldn't be possible to have 5 of the same flag
				width:/-?\d+/,
				precision:/\d+/,
				length:/hh?|ll?|[Lzjt]/,
				type:/[diufFeEgGxXoscPaAn%]/,
				specifier:/(?:{parameter})?(?:{flags})?(?:{width})?(?:\.{precision})?(?:{length})?{type}/,
				placeholder:/%{specifier}/,
				placeholderWithCapture:/%({specifier})/
			}),
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
					return _primaryLanguageResourcePath.replace (_resourceFilePathRegExp,'$1-' + _language + '$2');
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

				parseResourceFile:function (_resourceFileText) {
					return _Uize_Loc_FileFormats_AndroidStrings.from (_resourceFileText);
				},

				serializeResourceFile:function (_strings) {
					return _Uize_Loc_FileFormats_AndroidStrings.to (_strings);
				}
			},

			instanceProperties:{
				tokenRegExp:_printfFormatPlaceholderRegExpComposition.get ('placeholderWithCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

