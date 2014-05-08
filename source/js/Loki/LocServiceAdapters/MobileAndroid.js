Uize.module ({
	name:'Loki.LocServiceAdapters.MobileAndroid',
	required:[
		'Uize.Parse.Xml.NodeList',
		'Uize.Util.Html.Encode',
		'Uize.Data.NameValueRecords',
		'Uize.Util.RegExpComposition'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFilePathRegExp = /((?:^|\/)values)(\/strings(_[^\/\.]+)?\.xml)$/,
			_printfFormatPlaceholderRegExpComposition = Uize.Util.RegExpComposition ({
				// http://en.wikipedia.org/wiki/Printf_format_string#Format_placeholders
				parameter:/\d+\$/,
				flags:/[\+ \-#0]{0,5}/, // this isn't robust, since it shouldn't be possible to have 5 of the same flag
				width:/-?\d+/,
				precision:/\d+/,
				length:/hh?|ll?|[Lzjt]/,
				type:/[diufFeEgGxXoscPaAn%]/,
				specifier:/(?:{parameter})?(?:{flags})?(?:{width})?(?:\.{precision})?(?:{length})?{type}/,
				placeholder:/%{specifier}/,
				placeholderWithCapture:/%({specifier})/
			}),
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"<>]+/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				token:_printfFormatPlaceholderRegExpComposition.get ('placeholder'),
				wordSplitter:/(^@.+$|{whitespace}|{token}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (_resourceFilePathRegExp,'$1-' + _language + '$2');
				},

				isTranslatableString:function (_stringInfo) {
					return (
						_stringInfo.value.charAt (0) != '@' // values that start with "@" are links to other strings
					);
				},

				isResourceFile:function (_filePath) {
					return _resourceFilePathRegExp.test (_filePath);
				},

				isBrandResourceFile:function (_filePath) {
					return /(^|\/)strings_branded\.xml$/.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					function _isTag (_node,_tagName) {
						return _node.tagName && _node.tagName.serialize () == _tagName;
					}
					var
						_xliffNodeList = new Uize.Parse.Xml.NodeList (_resourceFileText.replace (/<\?.*?\?>/,'')),
						_strings = {}
					;
					Uize.forEach (
						Uize.findRecord (
							_xliffNodeList.nodes,
							function (_node) {return _isTag (_node,'resources')}
						).childNodes.nodes,
						function (_node) {
							function _getStringName () {
								return _node.tagAttributes.attributes [0].value.value;
							}
							if (_isTag (_node,'string')) {
								_strings [_getStringName ()] = Uize.map (
									_node.childNodes.nodes,
									function (_node) {
										return (_isTag (_node,'xliff:g') ? _node.childNodes.nodes [0] : _node).text || '';
									}
								).join ('');
							} else if (_isTag (_node,'string-array')) {
								var _stringsArray = _strings [_getStringName ()] = [];
								Uize.forEach (
									_node.childNodes.nodes,
									function (_node) {
										if (_isTag (_node,'item'))
											_stringsArray.push (_node.childNodes.nodes [0].text)
										;
									}
								);
							}
						}
					);
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					var _encodeHtml = Uize.Util.Html.Encode.encode;
					return (
						'<?xml version="1.0" encoding="utf-8"?>\n' +
						'<resources xmlns:xliff="urn:oasis:names:tc:xliff:document:1.2">\n' +
						Uize.map (
							Uize.Data.NameValueRecords.fromHash (_strings),
							function (_record) {
								var _value = _record.value;
								return (
									'\t<string name="' + _value + '">' +
									(
										Uize.isArray (_value)
											? (
												'\n' +
												Uize.map (
													_value,
													function (_value) {return '\t\t<item>' + _encodeHtml (_value) + '</item>'}
												).join ('\n') +
												'\t'
											)
											: _encodeHtml (_value)
									) +
									'</string>'
								);
							}
						).join ('\n') +
						'</resources>\n'
					);
				}
			},

			instanceProperties:{
				tokenRegExp:_printfFormatPlaceholderRegExpComposition.get ('placeholderWithCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

