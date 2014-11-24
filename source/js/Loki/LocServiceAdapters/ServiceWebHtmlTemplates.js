Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWebHtmlTemplates',
	superclass:'Uize.Services.LocAdapter',
	required:'Uize.Util.RegExpComposition',
	builder:function (_superclass) {
		'use strict';

		/*
			HTML Template Naming

			- US English (primary language)...
				foo.html
				foo-[brandId].html

			- translatable languages...
				foo-[localeCode].html
				foo-[brandId]-[localeCode].html
		*/

		var
			_htmlFileRegExp = /\.html$/,
			_translatedHtmlFileRegExp = /-[a-zA-Z]+_[a-zA-Z]+\.html$/,
			_brandResourceFileRegExp = /-(\d+)\.html$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
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
						_htmlFileRegExp,
						(_language == this.project.primaryLanguage ? '' : '-' + _language.replace ('-','_')) + '.html'
					);
				},

				isTranslatableString:function (_stringInfo) {
					var _filePath = _stringInfo.path [0];
					return !(
						/\/letterOfAuthorization\/.*TELUS\.html$/.test (_filePath)
					);
				},

				getResourceFileBrand:function (_filePath) {
					var _brandedMatch = _filePath.match (_brandResourceFileRegExp);
					return _brandedMatch ? _brandedMatch [1] : '';
				},

				isResourceFile:function (_filePath) {
					return (
						!/(^|\/)templates\//.test (_filePath) &&
							// ignore files under the "templates" folder
						_filePath.indexOf ('/tests/') == -1 &&
							// ignore files with paths that contain a "tests" folder
						_filePath.indexOf ('rclibtest/') == -1 &&
							// ignore files with paths that contain an "rclibtest" folder
						_htmlFileRegExp.test (_filePath) &&
						!_translatedHtmlFileRegExp.test (_filePath)
							// ignore the translated HTML template files
					);
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

