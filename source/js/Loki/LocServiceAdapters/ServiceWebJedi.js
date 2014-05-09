Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWebJedi',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Parse.JavaProperties.Document',
		'Uize.Parse.JavaProperties.Property',
		'Uize.Data.Flatten'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(^|\/)(messages)(\.properties)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]+/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				token:/\{\d+\}/,
				wordSplitter:/({htmlTag}|{token}|{whitespace}|{punctuation}|{number})/
			})
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					var m = this;
					return _primaryLanguageResourcePath.replace (
						_resourceFileRegExp,
						function (_match,_folderPath,_fileNamePrefix,_fileExtension) {
							return (
								_folderPath +
								_fileNamePrefix +
								(_language == m.project.primaryLanguage ? '' : '_' + _language.replace ('-','_')) +
								_fileExtension
							);
						}
					);
				},

				isBrandResourceString:function (_resourceStringPath,_resourceStringText) {
					return /-\d+$/.test (_resourceStringPath [_resourceStringPath.length - 1]);
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					var _strings = {};
					Uize.forEach (
						(new Uize.Parse.JavaProperties.Document (_resourceFileText)).items,
						function (_item) {
							if (_item.name && _item.value)
								_strings [_item.name.name] = _item.value.value
							;
						}
					);
					_strings = Uize.Data.Flatten.unflatten (_strings,'.');
					return _strings;
				},

				serializeResourceFile:function (_strings) {
					var
						_javaPropertiesDocument = new Uize.Parse.JavaProperties.Document (),
						_items = _javaPropertiesDocument.items
					;
					Uize.forEach (
						Uize.Data.Flatten.flatten (_strings,'.'),
						function (_stringValue,_stringKey) {
							var _property = new Uize.Parse.JavaProperties.Property ('key=value');
							_property.name.name = _stringKey;
							_property.value.value = _stringValue;
							_items.push (_property);
						}
					);
					return _javaPropertiesDocument.serialize ();
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:/\{(\d+)\}/g
			}
		});
	}
});

