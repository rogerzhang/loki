/* filename patterns...

	[notificationId]__[templateType]__[brandId]__[localeId].hbs

	e.g. activateYourAccount__email_html__1210__en_US.hbs
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.UnsTemplates',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.WordSplitterHtml'
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
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1$2__$3__$4__' + _language.replace ('-','_') + '$6'
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

