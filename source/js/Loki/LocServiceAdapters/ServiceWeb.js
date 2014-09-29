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
                        //common non translated keys
						!/(^BRAND_ID$|^FAX_SETTING_EMAIL$|_VIDEO_ID$|_IMG$)/.test (_stringInfo.key) &&
                        //URLS for TELUS
                        !/HOW_TO_DO_CALLER_MY_VOICEMAIL_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_PHONES_AND_NUMBERS_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/CONFERENCING_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_USER_EXTENSION_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_MESSAGES_AND_NOTIFICATIONS_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_OUTBOUND_FAX_SETTINGS_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_SCREENING_GREETING_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_CALL_HANDLING_AND_FORWARDING_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_OUTBOUND_CALLER_ID_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/CONFERENCING_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_FORWARD_TO_PHONE_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_MY_NOTIFICATIONS_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_GET_MORE_HELP_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_USERS_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_DEPARTMENTS_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_PAGING_ONLY_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_COMPANY_INFO_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_PHONES_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_CALLER_HEAR_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_CALL_FORWARDING_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_VOICEMAIL_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_NOTIFICATION_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_USE_DEPT_LINK$/.test(_stringInfo.key) &&
                        !/HOW_TO_DO_GET_HELP_LINK$/.test(_stringInfo.key) &&
                        !/HELP_PANEL_AUTO_RECEPTIONIST_OVERVIEW_LINK$/.test(_stringInfo.key) &&
                        //URLs
						!/^(https?:\/\/)/.test (_stringInfo.value)
					);
				},

				isStringKeyValid:function (_path) {
					return /^[A-Z][A-Z0-9$]*(_[A-Z0-9$]+)*$/.test (_path [_path.length - 1]);
				},

				isResourceFile:function (_filePath) {
					return !/^widgets\//.test (_filePath) && _resourceFileRegExp.test (_filePath);
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
					throw new Error ('The implementation of the getReferencesFromCodeFile method is not reliable.');

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

