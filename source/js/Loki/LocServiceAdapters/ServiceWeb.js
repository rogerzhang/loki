Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWeb',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(^|\/)(en|lang)(-\d+)?(\.js)$/,
			_dereferenceRegExpComposition = Uize.Util.RegExpComposition ({
				allowedDereference:/RC(\.[a-zA-Z0-9_$]+)+/,
				dereference:/([:\+]\s*)({allowedDereference})\b/,
				dereferenceToken:/\{({allowedDereference})\}/,
				token:/\{({allowedDereference}|\d+)\}/
			}),
			_dereferenceRegExp = _dereferenceRegExpComposition.get ('dereference'),
			_dereferenceTokenRegExp = _dereferenceRegExpComposition.get ('dereferenceToken'),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]+/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				token:/\{[^\}]+\}/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					var m = this;
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						function (_match,_folderPath,_fileLangCode,_brandSuffix,_fileExtension) {
							return (
								_folderPath +
								(_fileLangCode == 'lang' && _language == m.project.primaryLanguage ? 'lang' : _language) +
								(_brandSuffix || '') +
								_fileExtension
							);
						}
					);
				},

				isBrandResourceFile:function (_filePath) {
					return /(^|\/)(en|lang)(-\d+)\.js$/.test (_filePath);
				},

				isTranslatableString:function (_stringInfo) {
					return (
						!/(^BRAND_ID$|^FAX_SETTING_EMAIL$|EMERGENCY_NUMBER|_VIDEO_ID$|_IMG$)/.test (_stringInfo.key) &&
						!/^(https?:\/\/)/.test (_stringInfo.value)
					);
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
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_dereferenceRegExpComposition.get ('token')
			}
		});
	}
});

