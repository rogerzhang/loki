Uize.module ({
	name:'Loki.LocServiceAdapters.CloudCti',
	required:[
		'Uize.Json',
		'Uize.Util.RegExpComposition'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(^|\/)(en)(\.js)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				wordSplitter:/({htmlTag}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						'$1' + _language.split ('-') [0] + '$3'
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					var
						_strings,
						angular = {
							module:function () {
								return {
									factory:function (_name,_provider) {
										_strings = _provider ();
									}
								}
							}
						}
					;
					eval (_resourceFileText);
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					return (
						'var rcOpenCTIApp = angular.module(\'localization\',[]);\n' +
						'rcOpenCTIApp.factory(\'localize\',function(){\n' +
						'	return ' + Uize.Str.Lines.indent (Uize.Json.to (_strings),1,'\t',false) + '\n' +
						'});'
					);
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:null
			}
		});
	}
});

