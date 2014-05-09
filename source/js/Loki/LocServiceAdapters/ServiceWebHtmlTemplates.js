Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWebHtmlTemplates',
	required:'Uize.Util.RegExpComposition',
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /\.html$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]+/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				tokenName:/[a-zA-Z0-9_\.]+/,
				token:/%{tokenName}%/,
				tokenWithCapture:/%({tokenName})%/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						(_language == this.project.primaryLanguage ? '' : '-' + _language) + '.html'
					);
				},

				isBrandResourceFile:function (_filePath) {
					return /-\d+\.html$/.test (_filePath);
				},

				isResourceFile:function (_filePath) {
					return !/(^|\/)templates\//.test (_filePath) && _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return {html:_resourceFileText};
				},

				serializeResourceFile:function (_strings) {
					return _strings.html;
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithCapture')
			}
		});
	}
});

