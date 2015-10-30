Uize.module ({
	name:'Loki.LocServiceAdapters.ZoomMacAndIos',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Loc.FileFormats.MacStrings',
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.WordSplitter'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /(^|\/)en(\.lproj\/Localizable\.strings)$/,
			_macOsStringFormatSpecifierRegExpComposition = Uize.Util.RegExpComposition ({
				// https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Strings/Articles/formatSpecifiers.html
				code:/[@%dDuUxXoOfeEgGcCsSPaAF]/,
				lengthModifier:/hh?|ll?|[qLztj]/,
				lengthModifierAndCode:/(?:{lengthModifier})?{code}/,
				specifier:/%({lengthModifierAndCode})/
			}),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				token:_macOsStringFormatSpecifierRegExpComposition.get ('specifier'),
				wordSplitter:/{whitespace}|{token}|{punctuation}|{number}/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (_resourceFilePathRegExp,'$1' + _language + '$2');
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

