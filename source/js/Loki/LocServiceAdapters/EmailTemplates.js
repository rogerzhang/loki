/* filename patterns...

	e-mail templates...
		email-7310-en_US-1501-branded-bodyhtml.txt
		email-7310-en_US-1501-branded-bodytext.txt
		email-7310-en_US-1501-branded-subject.txt

	strresources...
		string-en_US-20.txt

	tiers...
		tier-7310-en_US-7312.txt

	banners...
		smtp_nbanners-en_US-1310-banner01-1-bodyhtml.txt
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.EmailTemplates',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.WordSplitterHtml',
		'Uize.Services.FileSystem'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_filenameLocaleCodeRegExp = /[a-z]{2}_[A-Z]{2}/,
			_emailTemplateResourceFileRegExp = /email-(\d+)-en_US-(\d+)-branded-(bodyhtml|bodytext|subject)\.txt$/,
			_resourceFileRegExp = /\ben_US\b.*\.txt$/,
			_brandedRegExpComposition = Uize.Util.RegExpComposition ({
				filenameLocaleCode:_filenameLocaleCodeRegExp,
				brandId:/\d{4}/,
				branded:/({brandId})-{filenameLocaleCode}/
			}),
			_brandedRegExp = new RegExp (_brandedRegExpComposition.get ('branded').source), // strip the g
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitterHtml.extend ({
				tokenName:/@?[a-zA-Z0-9_]+/,
				token:/<\$({tokenName})\$>|\[({tokenName})\]/,
				wordSplitter:/{htmlTag}|{htmlEntity}|{token}|{whitespace}|{punctuation}|{number}/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (_filenameLocaleCodeRegExp,_language.replace ('-','_'));
				},

				getResourceFileBrand:function (_filePath) {
					var _brandedMatch = _filePath.match (_brandedRegExp);
					return _brandedMatch ? _brandedMatch [1] : '';
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return {contents:_resourceFileText};
				},

				serializeResourceFile:function (_strings) {
					return _strings.contents;
				},

				preview:function (_params,_callback) {
					var
						m = this,
						_languages = m.getLanguages (),
						_primaryLanguageResources = m.gatherResources (),
						_fileSystem = Uize.Services.FileSystem.singleton (),
						_tokens = m.project.tokens || {}
					;
					m.prepareToExecuteMethod (_languages.length);
					Uize.forEach (
						_languages,
						function (_language) {
							Uize.forEach (
								_primaryLanguageResources,
								function (_resourceFileStrings,_resourceFileSubPath) {
									var _resourceFileSubPathMatch = _resourceFileSubPath.match (_emailTemplateResourceFileRegExp);
									_fileSystem.writeFile ({
										path:
											m.workingFolderPath + 'previews/' +
											(
												_resourceFileSubPath.match (_emailTemplateResourceFileRegExp) [3] == 'bodyhtml'
													? _resourceFileSubPath.replace (/\.txt$/,'.html')
													: _resourceFileSubPath
											),
										contents:_resourceFileStrings.contents.replace (
											m.tokenRegExp,
											function () {
												for (
													var
														_arguments = arguments,
														_argumentNo = _arguments.length - 2, // last 2 arguments are index and source
														_tokenName
													;
													!_tokenName && --_argumentNo >= 1;
												)
													_tokenName = _arguments [_argumentNo]
												;
												var _token = _tokens [_tokenName];
												return (_token && _token.value) || _arguments [0];
											}
										)
									});
								}
							);
							m.stepCompleted ('Created previews for language ' + _language);
						}
					);
					_callback ();
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('token')
			}
		});
	}
});

