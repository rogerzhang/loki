Uize.module ({
	name:'Loki.LocServiceAdapters.MicRecorder',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Json',
		'Uize.Str.Lines'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(^|\/)(en)(\/Messages\.as)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				wordSplitter:/({whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					var m = this;
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						function (_match,_start,_folderLanguageCode,_slashAndFileName) {
							return _start + _language.replace ('-','_') + _slashAndFileName;
						}
					);
				},

				getStringBrand:function (_resourceStringPath) {
					return _resourceStringPath [0] == 'Brands' ? _resourceStringPath [1] + '' : '';
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					var
						_startMatch = /public static const Messages\s*:\s*\*\s*=/g.exec (_resourceFileText),
						_endMatch = /\}\s*\}\s*$/.exec (_resourceFileText),
						_startPos = _startMatch.index + _startMatch [0].length
					;
					return Uize.Json.from (_resourceFileText.slice (_startPos,_endMatch.index));
				},

				serializeResourceFile:function (_strings,_language) {
					return (
						'package com.ringcentral.i18n.' + _language.replace ('-','_') + ' {\n' +
						'	public class Messages {\n' +
						'		public function Messages() {\n' +
						'		}\n' +
						'\n' +
						'		public static const Messages : * = ' +
							Uize.Str.Lines.indent (Uize.Json.to (_strings),2,'\t',false) + '\n' +
						'	}\n' +
						'}\n'
					);
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

