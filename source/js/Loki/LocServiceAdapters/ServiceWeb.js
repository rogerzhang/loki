/* TODO
	- add metrics for strings that contain HTML with inline style
		- maybe this can be done through some extensibility hook in the loc adapter base class that can allow the subclass to perform this additional, project-specific analysis
*/

Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWeb',
	superclass:'Loki.LocServiceAdapters.WithExcludes',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition',
		'Uize.Util.RegExpComposition.WordSplitterHtml',
		'Uize.Services.FileSystem',
		'Uize.Str.Search',
		'Uize.Util.Html.Encode'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_fileSystem = Uize.Services.FileSystem.singleton (),
			_resourceFileRegExp = /(^|\/)(en_US)(-\d+)?(\.js)$/,
			_brandResourceFileRegExp = /(?:^|\/)en_US-(\d+)\.js$/,
			_dereferenceRegExpComposition = Uize.Util.RegExpComposition ({
				allowedDereference:/RC(\.[a-zA-Z0-9_$]+)+/,
				dereference:/([:\+]\s*)({allowedDereference})\b/,
				dereferenceToken:/\{({allowedDereference})\}/,
				token:/\{({allowedDereference}|\d+)\}/
			}),
			_dereferenceRegExp = _dereferenceRegExpComposition.get ('dereference'),
			_dereferenceTokenRegExp = _dereferenceRegExpComposition.get ('dereferenceToken'),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitterHtml.extend ({
				token:/\{[^\}]+\}/,
				wordSplitter:/{htmlTag}|{htmlEntity}|{token}|{whitespace}|{punctuation}|{number}/
			}),
			_stringReferenceRegExpComposition = Uize.Util.RegExpComposition ({
				identifier:/[a-zA-Z_$][a-zA-Z0-9_$]*/,
				reference:/((?:RC\.Lang\.{identifier}|langCommon|langLocal)(?:\.{identifier})+)/,
				langLocalDeclaration:/langLocal\s*=\s*(RC\.Lang(?:\.{identifier})+)/
			}),
			_langCommonRegExp = /^langCommon\./,
			_langLocalRegExp = /^langLocal\./
		;

		/*** Private Instance Methods ***/
			function _allowJsExpressions (m) {
				return m.project.allowJsExpressions == null || !!m.project.allowJsExpressions;
			}

		return _superclass.subclass ({
			staticMethods:{
				parseResourceFile:function (_resourceFileText,_mustAllowJsExpressions) {
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
					eval (
						_mustAllowJsExpressions
							? _resourceFileText.replace (_dereferenceRegExp,'$1\'{$2}\'')
							: _resourceFileText
					);
					return _strings;
				},

				serializeResourceFile:function (_strings,_mustAllowJsExpressions) {
					return Uize.map (
						Uize.keys (_strings),
						function (_namespace) {
							var _stringsAsJson = Uize.Json.to (_strings [_namespace],{keyDelimiter:' : '});
							return (
								'RC.ns(\'' + _namespace + '\');\n' +
								'RC.utils.Lang.extend(' + _namespace + ', ' +
								(
									_mustAllowJsExpressions
										? _stringsAsJson.replace (
											_dereferenceTokenRegExp,
											function (_match,_dereference) {return '\' + ' + _dereference + ' + \''}
										)
										: _stringsAsJson
								) +
								');\n'
							);
						}
					).join ('\n\n');
				}
			},

			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						function (_match,_folderPath,_fileLangCode,_brandSuffix,_fileExtension) {
							return _folderPath + _language.replace ('-','_') + (_brandSuffix || '') + _fileExtension;
						}
					);
				},

				getResourceFileBrand:function (_filePath) {
					var _brandedMatch = _filePath.match (_brandResourceFileRegExp);
					return _brandedMatch ? _brandedMatch [1] : '';
				},

				isTranslatableString:function (_stringInfo) {
					return (
						this.checkTranslatableString(_stringInfo) && // URLs
						!/^(https?:\/\/)/.test(_stringInfo.value)
					);
				},

				isStringKeyValid:function (_path) {
					return /^[A-Z][A-Z0-9$]*(_[A-Z0-9$]+)*$/.test (_path [_path.length - 1]);
				},

				isResourceFile:function (_filePath) {
					return !/^widgets\//.test (_filePath) && _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return this.Class.parseResourceFile (_resourceFileText,_allowJsExpressions (this));
				},

				serializeResourceFile:function (_strings) {
					return this.Class.serializeResourceFile (_strings,_allowJsExpressions (this));
				},

				getReferencingCodeFiles:function () {
					return _fileSystem.getFiles ({
						path:this.project.rootFolderPath,
						pathMatcher:/\.js$/,
						recursive:true
					});
				},

				getReferencesFromCodeFile:function (_filePath) {
					throw new Error ('The implementation of the getReferencesFromCodeFile method is not reliable.');

					/* NOTE:
						This method is not yet reliable, since there is no easy pattern that can be used to find references. There is no simple convention that is used when referencing resource strings in SW's JS code. There is a mixture of complete path dereferences and capturing of local and common resource string objects, and the local variables used for capturing the references are not consistently named. Furthermore, some modules assign langLocal and langCommon properties on the instance, and then subclasses use these references, so in the subclasses there is no assignment statement that can be used to determine the namespace.
					*/
					var
						_referencesLookup = {},
						_fileText = _fileSystem.readFile ({path:this.project.rootFolderPath + '/' + _filePath}),
						_langLocal
					;
					Uize.forEach (
						Uize.Str.Search.search (
							_fileText,
							_stringReferenceRegExpComposition.get ('reference')
						),
						function (_match) {
							var _stringId = _match [1];
							if (_langCommonRegExp.test (_stringId)) {
								_stringId = _stringId.replace (_langLocalRegExp,'RC.Lang.Common.');
							} else if (_langLocalRegExp.test (_stringId)) {
								if (!_langLocal) {
									var _langLocalMatch = _fileText.match (
										new RegExp (_stringReferenceRegExpComposition.get ('langLocalDeclaration').source)
									);
									_langLocal = (_langLocalMatch ? _langLocalMatch [1] : 'RC.Lang.ZZZ') + '.';
								}
								_stringId = _stringId.replace (_langLocalRegExp,_langLocal);
							}
							(_referencesLookup [_stringId] || (_referencesLookup [_stringId] = [])).push ({
								reference:_match [0],
								start:_match.start,
								end:_match.end
							});
						}
					);
					return _referencesLookup;
				},

				init:function (_params,_callback) {
					/*** load local Loki config, if present in project codebase ***/
						var
							_project = _params.project,
							_localConfigFilePath = _project.rootFolderPath + '/loki-config.json'
						;
						if (_fileSystem.fileExists ({path:_localConfigFilePath}))
							Uize.mergeInto (
								_project,
								Uize.Json.from (_fileSystem.readFile ({path:_localConfigFilePath}))
							)
						;

					_superclass.doMy (this,'init',arguments);
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_dereferenceRegExpComposition.get ('token')
			}
		});
	}
});

