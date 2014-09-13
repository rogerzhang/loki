Uize.module ({
	name:'Loki.LocServiceAdapters.EmailTemplates',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Services.FileSystem'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /email-(\d+)-en_US-(\d+)-branded-(bodyhtml|bodytext|subject)\.txt$/,
				/* examples...

					email-7310-en_US-1501-branded-bodyhtml.txt
					email-7310-en_US-1501-branded-bodytext.txt
					email-7310-en_US-1501-branded-subject.txt
				*/
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				tokenName:/[a-zA-Z0-9_]+/,
				token:/<\${tokenName}\$>|\[{tokenName}\]/,
				tokenWithCapture:/<\$({tokenName})\$>|\[({tokenName})\]/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'email-$1-' + _language.replace ('-','_') + '-$2-branded-$3.txt'
					);
				},

				getResourceFileBrand:function (_filePath) {
					var _brandedMatch = _filePath.match (_resourceFileRegExp);
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
									var _resourceFileSubPathMatch = _resourceFileSubPath.match (_resourceFileRegExp);
									_fileSystem.writeFile ({
										path:
											m.workingFolderPath + 'previews/' +
											(
												_resourceFileSubPath.match (_resourceFileRegExp) [3] == 'bodyhtml'
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
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithCapture')
			}
		});
	}
});

