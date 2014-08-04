/* TODO
	- add metrics for strings that contain HTML with inline style
		- maybe this can be done through some extensibility hook in the loc adapter base class that can allow the subclass to perform this additional, project-specific analysis
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWeb',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition',
		'Uize.Services.FileSystem',
		'Uize.Str.Search'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(^|\/)(en|lang)(-\d+)?(\.js)$/,
			_brandResourceFileRegExp = /(?:^|\/)(?:en|lang)-(\d+)\.js$/,
			_dereferenceRegExpComposition = Uize.Util.RegExpComposition ({
				allowedDereference:/RC(\.[a-zA-Z0-9_$]+)+/,
				dereference:/([:\+]\s*)({allowedDereference})\b/,
				dereferenceToken:/\{({allowedDereference})\}/,
				token:/\{({allowedDereference}|\d+)\}/
			}),
			_dereferenceRegExp = _dereferenceRegExpComposition.get ('dereference'),
			_dereferenceTokenRegExp = _dereferenceRegExpComposition.get ('dereferenceToken'),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				token:/\{[^\}]+\}/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			}),
			_stringReferenceRegExpComposition = Uize.Util.RegExpComposition ({
				identifier:/[a-zA-Z_$][a-zA-Z0-9_$]*/,
				reference:/(?:RC\.Lang\.{identifier}|langCommon|langLocal)(?:\.{identifier})+/,
				referenceWithCapture:/({reference})/,
				langLocalDeclarationWithCapture:/langLocal\s*=\s*(RC\.Lang(?:\.{identifier})+)/
			}),
			_langCommonRegExp = /^langCommon\./,
			_langLocalRegExp = /^langLocal\./
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					var
						m = this,
						_project = m.project
					;
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						function (_match,_folderPath,_fileLangCode,_brandSuffix,_fileExtension) {
							var
								_isPrimaryLanguage = _language == _project.primaryLanguage,
								_langCodeForFilename = _isPrimaryLanguage && _project.useOldPrimaryLanguageFileNaming
									? 'en'
									: _language.replace ('-','_')
							;
							return (
								_folderPath +
								(
									_project.useOldCommonLangFileNaming && _fileLangCode == 'lang'
										? 'lang' + (_isPrimaryLanguage ? '' : '-' + _langCodeForFilename)
										: _langCodeForFilename
								) +
								(_brandSuffix || '') +
								_fileExtension
							);
						}
					);
				},

				isBrandResourceFile:function (_filePath) {
					return _brandResourceFileRegExp.test (_filePath);
				},

				getResourceFileBrand:function (_filePath) {
					var _brandedMatch = _filePath.match (_brandResourceFileRegExp);
					return _brandedMatch ? _brandedMatch [1] : '';
				},

				isTranslatableString:function (_stringInfo) {
					return (
						!/(^BRAND_ID$|^FAX_SETTING_EMAIL$|EMERGENCY_NUMBER|_VIDEO_ID$|_IMG$)/.test (_stringInfo.key) &&
						!/^(https?:\/\/)/.test (_stringInfo.value)
					);
				},

				isStringKeyValid:function (_path) {
					return /^[A-Z][A-Z0-9$]*(_[A-Z0-9$]+)*$/.test (_path [_path.length - 1]);
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					var
						_strings = {},
						RC = {
							ns:function (_namespace) {
								var _path = '';
								Uize.forEach (
									_namespace.split ('.'),
									function (_namespacePart) {
										eval (_path + _namespacePart + ' || (' + _path + _namespacePart + ' = {})');
										_path += _namespacePart + '.';
									}
								);
								_strings [_namespace] = eval ('(' + _namespace + ')');
							},
							utils:{
								Lang:{extend:Uize.copyInto}
							}
						}
					;
					eval (_resourceFileText.replace (_dereferenceRegExp,'$1\'{$2}\''));
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					return Uize.map (
						Uize.keys (_strings),
						function (_namespace) {
							return (
								'RC.ns(\'' + _namespace + '\');\n' +
								'RC.utils.Lang.extend(' + _namespace + ', ' +
								Uize.Json.to (_strings [_namespace],{keyDelimiter:' : '}).replace (
									_dereferenceTokenRegExp,
									function (_match,_dereference) {return '\' + ' + _dereference + ' + \''}
								) +
								');\n'
							);
						}
					).join ('\n\n');
				},

				getReferencingCodeFiles:function () {
					return Uize.Services.FileSystem.singleton ().getFiles ({
						path:this.project.rootFolderPath,
						pathMatcher:/\.js$/,
						recursive:true
					});
				},

				getReferencesFromCodeFile:function (_filePath) {
					/* NOTE:
						This method is not yet reliable, since there is no easy pattern that can be used to find references. There is no simple convention that is used when referencing resource strings in SW's JS code. There is a mixture of complete path dereferences and capturing of local and common resource string objects, and the local variables used for capturing the references are not consistently named. Furthermore, some modules assign langLocal and langCommon properties on the instance, and then subclasses use these references, so in the subclasses there is no assignment statement that can be used to determine the namespace.
					*/
					var
						_referencesLookup = {},
						_fileText = Uize.Services.FileSystem.singleton ().readFile ({
							path:this.project.rootFolderPath + '/' + _filePath
						}),
						_langLocal
					;
					Uize.forEach (
						Uize.Str.Search.search (
							_fileText,
							_stringReferenceRegExpComposition.get ('referenceWithCapture')
						),
						function (_match) {
							var _stringId = _match [1];
							if (_langCommonRegExp.test (_stringId)) {
								_stringId = _stringId.replace (_langLocalRegExp,'RC.Lang.Common.');
							} else if (_langLocalRegExp.test (_stringId)) {
								if (!_langLocal) {
									var _langLocalMatch = _fileText.match (
										new RegExp (
											_stringReferenceRegExpComposition.get ('langLocalDeclarationWithCapture').source
										)
									);
									_langLocal = (_langLocalMatch ? _langLocalMatch [1] : 'RC.Lang.ZZZ') + '.';
								}
								_stringId = _stringId.replace (_langLocalRegExp,_langLocal);
							}
							(_referencesLookup [_stringId] || (_referencesLookup [_stringId] = [])).push ({
								filePath:_filePath,
								reference:_match [0],
								start:_match.start,
								end:_match.end
							});
						}
					);
					return _referencesLookup;
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_dereferenceRegExpComposition.get ('token')
			}
		});
	}
});

