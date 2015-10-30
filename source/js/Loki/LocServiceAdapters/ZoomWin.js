Uize.module ({
	name:'Loki.LocServiceAdapters.ZoomWin',
	superclass:'Uize.Services.LocAdapter',
	required:[
		'Uize.Util.RegExpComposition.WordSplitter',
		'Uize.Util.RegExpComposition.PrintfWithParam',
		'Uize.Parse.Xml.NodeList',
		'Uize.Parse.Xml.Util',
		'Uize.Services.FileSystem'
	],
	builder:function (_superclass) {
		'use strict';

		var
			_fileSystem = Uize.Services.FileSystem.singleton (),
			_resourceFilePathRegExp = /((?:^|\/)language_)en(\.xml)$/,
			_printfFormatPlaceholderRegExpComposition = Uize.Util.RegExpComposition.PrintfWithParam,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend ({
				token:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:/{whitespace}|{token}|{punctuation}|{number}/
			}),
			_primaryLanguageLocale = 'en'
		;

		/*** Utility Functions ***/
			function _processResourceFileXml (_resourceFileText,_stringNodeHandler) {
				var _resourceFileXml = new Uize.Parse.Xml.NodeList (_resourceFileText.replace (/<\?.*?\?>/,''));
				Uize.Parse.Xml.Util.recurseNodes (
					{childNodes:_resourceFileXml},
					function (_node) {
						if (_node.tagName) {
							var _tagName = _node.tagName.serialize ();
							if (/^ID\d+$/.test (_tagName))
								_stringNodeHandler (_tagName,_node)
							;
						}
					}
				);
				return _resourceFileXml;
			}

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_resourceFilePathRegExp,
						'$1' +
						(
							_language == this.project.primaryLanguage
								? _primaryLanguageLocale
								: _language
						) +
						'$2'
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText,_resourceFileInfo) {
					var _strings = {};
					_processResourceFileXml (
						_resourceFileInfo.language == this.project.primaryLanguage
							? _resourceFileText.slice (1) // strip BOM, since Node only supports UTF-8 and not UTF-8Y
							: _resourceFileText
						,
						function (_stringId,_node) {
							_strings [_stringId] = Uize.Parse.Xml.Util.getAttributeValue (_node,'text')
						}
					);
					return _strings;
				},

				serializeResourceFile:function (_strings,_resourceFileInfo) {
					return (
						'<?xml version="1.0" encoding="UTF-8" ?>' +
						_processResourceFileXml (
							_fileSystem.readFile ({
								path:_resourceFileInfo.path.replace (
									/((?:^|\/)language_)[^\.\/]+(\.xml)$/,
									'$1' + _primaryLanguageLocale + '$2'
								)
							}).slice (1),
							function (_stringId,_node) {
								if (_strings.hasOwnProperty (_stringId))
									Uize.Parse.Xml.Util.getAttribute (_node,'text').value.value = _strings [_stringId]
								;
							}
						).serialize ()
					);
				}
			},

			instanceProperties:{
				tokenRegExp:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

