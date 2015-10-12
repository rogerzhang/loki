/* filename patterns...

	[notificationId]__[templateType]__[brandId]__[localeId].hbs

	e.g. activateYourAccount__email_html__1210__en_US.hbs
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.UnsTemplates',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.WordSplitterHtml',
		'Uize.Util.Matchers.AttributeMatcher',
		'Uize.Loc.Pseudo.Xml',
		'Uize.Str.Has'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExpComposition = Uize.Util.RegExpComposition ({
				notificationType:/[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*/,
				templateType:/[a-z]+_[a-z]+/,
				brandId:/\d{4}/,
				localeCode:/[a-z]+_[A-Z]+/,
				filename:/(^|\/)({notificationType})__({templateType})__({brandId})__({localeCode})(\.hbs)$/
			}),
			_resourceFileRegExp = new RegExp (_resourceFileRegExpComposition.get ('filename').source),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitterHtml.extend ({
				token:/\{\{(.+?)\}\}/,
				wordSplitter:/{htmlTag}|{htmlEntity}|{token}|{whitespace}|{punctuation}|{number}/
			}),
			_xmlPseudoLocalizeOptions = {
				attributeMatcher:Uize.Util.Matchers.AttributeMatcher.resolve ([
					'title',
					'img@alt',
					'[input|textarea]@placeholder'
				])
			}
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1$2__$3__$4__' + _language.replace ('-','_') + '$6'
					);
				},

				stringHasHtml:function (_stringPath) {
					return Uize.Str.Has.hasSuffix (_stringPath [0].match (_resourceFileRegExp) [3],'_html');
				},

				pseudoLocalizeString:function (_stringInfo,_pseudoLocalizeOptions) {
					var
						m = this,
						_stringValue = _stringInfo.value,
						_pseudoLocalized =
							m.stringHasHtml (_stringInfo.path,_stringValue) &&
							Uize.Loc.Pseudo.Xml.pseudoLocalize (
								_stringValue
									.replace (/(<(?:img|input|meta)\s+[^>]+[^\/])>/gi,'$1/>')
									.replace (/<br>/gi,'<br/>'),
								Uize.copyInto (_xmlPseudoLocalizeOptions,_pseudoLocalizeOptions)
							)
					;
					return (
						!_pseudoLocalized ||
							// the string hasn't been pseudo-localized yet (because it didn't contain HTML)
						_pseudoLocalized.length < _stringValue.length * .8
							// there must be some other errors in the HTML that prevent it from being parsed correctly
							? _superclass.doMy (m,'pseudoLocalizeString',arguments)
							: _pseudoLocalized
					);
				},

				getResourceFileBrand:function (_filePath) {
					var _resourceFileMatch = _filePath.match (_resourceFileRegExp);
					return _resourceFileMatch ? _resourceFileMatch [4] : '';
				},

				isResourceFile:function (_filePath) {
					var _resourceFileMatch = _filePath.match (_resourceFileRegExp);
					return _resourceFileMatch && _resourceFileMatch [5] == 'en_US';
				},

				parseResourceFile:function (_resourceFileText) {
					return {contents:_resourceFileText};
				},

				serializeResourceFile:function (_strings) {
					return _strings.contents;
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('token')
			}
		});
	}
});

