Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWebJedi',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Data.JavaProperties',
		'Uize.Data.Flatten',
		'Uize.Services.FileSystem',
		'Uize.Str.Search'
	],
	superclass:'Uize.Services.LocAdapter',
	builder:function (_superclass) {
		'use strict';

		var
			_resourceFileRegExp = /(^|\/)(messages)(\.properties)$/,
			_brandResourceStringRegExp = /-(\d+)$/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition ({
				punctuation:/[\?!\.;,&=\-\(\)\[\]"]/,
				number:/\d+(?:\.\d+)?/,
				whitespace:/\s+/,
				htmlTag:/<(?:.|[\r\n\f])+?>/,
				tokenName:/[\da-zA-Z_]+/,
				token:/\{{tokenName}\}/,
				tokenWithNameCapture:/\{({tokenName})\}/,
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

				getStringBrand:function (_resourceStringPath) {
					var _brandedMatch =
						(_resourceStringPath [_resourceStringPath.length - 1]).match (_brandResourceStringRegExp)
					;
					return _brandedMatch ? _brandedMatch [1] : '';
				},

				isResourceFile:function (_filePath) {
					return _resourceFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return Uize.Data.Flatten.unflatten (Uize.Data.JavaProperties.from (_resourceFileText),'.');
				},

				serializeResourceFile:function (_strings) {
					return Uize.Data.JavaProperties.to (Uize.Data.Flatten.flatten (_strings,'.'));
				},

				getReferencingCodeFiles:function () {
					return Uize.Services.FileSystem.singleton ().getFiles ({
						path:this.project.codeFolderPath,
						pathMatcher:/\.xhtml$/,
						recursive:true
					});
				},

				getReferencesFromCodeFile:function (_filePath) {
					var _referencesLookup = {};
					Uize.forEach (
						Uize.Str.Search.search (
							Uize.Services.FileSystem.singleton ().readFile ({
								path:this.project.codeFolderPath + '/' + _filePath
							}),
							/#\{messages\[['"]([^'"]+)['"]\]\}/
						),
						function (_match) {
							var _stringId = _match [1];
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
				tokenRegExp:_wordSplitterRegExpComposition.get ('tokenWithNameCapture'),
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter')
			}
		});
	}
});

