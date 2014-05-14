Uize.module ({
	name:'Loki.LocServiceAdapters.ServiceWebJedi',
	required:[
		'Uize.Util.RegExpComposition',
		'Uize.Parse.JavaProperties.Document',
		'Uize.Parse.JavaProperties.Property',
		'Uize.Data.Flatten',
		'Uize.Services.FileSystem',
		'Uize.Str.Search',
		'Uize.Json'
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
					return Uize.Data.Flatten.unflatten (Uize.Parse.JavaProperties.Document.toHash (_resourceFileText),'.');
				},

				serializeResourceFile:function (_strings) {
					return Uize.Parse.JavaProperties.Document.fromHash (Uize.Data.Flatten.flatten (_strings,'.'));
				},

				usage:function (_params,_callback) {
					var
						m = this,
						_allReferencesLookup = {},
						_codeFolderPath = m.project.codeFolderPath,
						_fileSystem = Uize.Services.FileSystem.singleton (),
						_referencingFiles = _fileSystem.getFiles ({
							path:_codeFolderPath,
							pathMatcher:/\.xhtml$/,
							recursive:true
						})
					;

					m.prepareToExecuteMethod (_referencingFiles.length + 3);

					/*** build lookup of string references ***/
						Uize.forEach (
							_referencingFiles,
							function (_filePath) {
								Uize.forEach (
									Uize.Str.Search.search (
										_fileSystem.readFile ({path:_codeFolderPath + '/' + _filePath}),
										/#\{messages\[['"]([^'"]+)['"]\]\}/
									),
									function (_match) {
										var _stringId = _match [1];
										(_allReferencesLookup [_stringId] || (_allReferencesLookup [_stringId] = [])).push ({
											filePath:_filePath,
											reference:_match [0],
											start:_match.start,
											end:_match.end
										});
									}
								);
								m.stepCompleted ('scanned for resource string references in file: ' + _filePath);
							}
						);

					/*** gather resources for primary language ***/
						var _primaryLanguageResources = m.gatherResources ();
						m.stepCompleted ('gathered resources for primary language');

					/*** analyze resource string usage ***/
						var
							_unreferenced = [],
							_references = {},
							_multiReferenced = {}
						;
						Uize.Data.Flatten.flatten (
							_primaryLanguageResources,
							function (_path) {
								var
									_stringId = _path.slice (1).join ('.'),
									_stringReferences = _allReferencesLookup [_stringId]
								;
								if (_stringReferences) {
									_references [_stringId] = _stringReferences;
									if (_stringReferences.length > 1)
										_multiReferenced [_stringId] = _stringReferences.length
									;
								} else {
									_unreferenced.push (_stringId);
								}
							}
						)
						m.stepCompleted ('analyzed resource usage');

					/*** write report file ***/
						var _usageReportFilePath = m.workingFolderPath + 'metrics/usage-report.json'
						_fileSystem.writeFile ({
							path:_usageReportFilePath,
							contents:Uize.Json.to ({
								unreferenced:_unreferenced,
								multiReferenced:_multiReferenced,
								references:_references
							})
						});
						m.stepCompleted ('created usage report file: ' + _usageReportFilePath);

					_callback ();
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:/\{(\d+)\}/g
			}
		});
	}
});

