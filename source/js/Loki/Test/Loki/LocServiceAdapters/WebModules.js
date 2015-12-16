Uize.module ({
	name:'Loki.Test.Loki.LocServiceAdapters.WebModules',
	builder:function () {
		'use strict';

		var
			/*** no strings ***/
				_stringsNoStrings = {
				},
				_fileNoStrings = [
					'export default {};'
				].join ('\n'),

			/*** multiple strings ***/
				_stringsMultipleStrings = {
					STRING_ONE:'This is string one',
					STRING_TWO:'This is string two',
					STRING_THREE:'This is string three'
				},
				_fileMultipleStrings = [
					'export default {',
					'	STRING_ONE : \'This is string one\',',
					'	STRING_TWO : \'This is string two\',',
					'	STRING_THREE : \'This is string three\'',
					'};'
				].join ('\n'),

			/*** hierarchical strings ***/
				_stringsHierarchicalStrings = {
					STRING_ONE:'This is string one',
					STRING_TWO:'This is string two',
					GROUP_ONE:{
						GROUP_ONE_STRING_ONE:'This is group one string one',
						GROUP_ONE_STRING_TWO:'This is group one string two',
						GROUP_TWO:{
							GROUP_TWO_STRING_ONE:'This is group two string one',
							GROUP_TWO_STRING_TWO:'This is group two string two'
						}
					},
					GROUP_THREE:{
						GROUP_THREE_STRING_ONE:'This is group three string one',
						GROUP_THREE_STRING_TWO:'This is group three string two'
					}
				},
				_fileHierarchicalStrings = [
					'export default {',
					'	STRING_ONE : \'This is string one\',',
					'	STRING_TWO : \'This is string two\',',
					'	GROUP_ONE : {',
					'		GROUP_ONE_STRING_ONE : \'This is group one string one\',',
					'		GROUP_ONE_STRING_TWO : \'This is group one string two\',',
					'		GROUP_TWO : {',
					'			GROUP_TWO_STRING_ONE : \'This is group two string one\',',
					'			GROUP_TWO_STRING_TWO : \'This is group two string two\'',
					'		}',
					'	},',
					'	GROUP_THREE : {',
					'		GROUP_THREE_STRING_ONE : \'This is group three string one\',',
					'		GROUP_THREE_STRING_TWO : \'This is group three string two\'',
					'	}',
					'};'
				].join ('\n')
		;

		return Uize.Test.resolve ({
			title:'Test for Loki.LocServiceAdapters.WebModules Module',
			test:[
				Uize.Test.requiredModulesTest ('Loki.LocServiceAdapters.WebModules'),
				Uize.Test.staticMethodsTest ([
					['Loki.LocServiceAdapters.WebModules.getLanguageResourcePath',[
						['A path for a translatable language resource file can be generated from the path for the primary language resource file',
							['lang/common/index-en_US.js','fr-CA'],
							'lang/common/index-fr_CA.js'
						]
					]],
					['Loki.LocServiceAdapters.WebModules.getStringBrand',[
						['When the last element in the path of a string is a non-zero number, then that number is treated as the brand code',
							[['lang/common/index-en_US.js','FOO',3701]],
							'3701'
						],
						['When the last element in the path of a string is the number 0, then the string is considered to be brand neutral',
							[['lang/common/index-en_US.js','FOO',0]],
							''
						],
						['When the last element in the path of a string is not a number, then the string is considered to be brand neutral',
							[['lang/common/index-en_US.js','FOO']],
							''
						]
					]],
					['Loki.LocServiceAdapters.WebModules.isResourceFile',[
						['When the path of a file matches the pattern for a primary language resource file, then the value true is returned',
							'lang/common/index-en_US.js',
							true
						],
						['When the path of a file matches the pattern for a translatable language resource file but not the pattern for a primary language resource file, then the value false is returned',
							'lang/common/index-fr_CA.js',
							false
						],
						['When the path of a file does not match the pattern for a resource file, then the value false is returned',
							'foo/bar/baz/qux.js',
							false
						]
					]],
					['Loki.LocServiceAdapters.WebModules.parseResourceFile',[
						['A resource file being parsed may contain no strings',
							_fileNoStrings,
							Uize.clone (_stringsNoStrings)
						],
						['A resource file being parsed may contain multiple strings',
							_fileMultipleStrings,
							Uize.clone (_stringsMultipleStrings)
						],
						['A resource file being parsed may contain hierarchically structured strings',
							_fileHierarchicalStrings,
							Uize.clone (_stringsHierarchicalStrings)
						]
					]],
					['Loki.LocServiceAdapters.WebModules.serializeResourceFile',[
						['A strings object being serialized may contain no strings',
							Uize.clone (_stringsNoStrings),
							_fileNoStrings
						],
						['A strings object being serialized may contain multiple strings',
							Uize.clone (_stringsMultipleStrings),
							_fileMultipleStrings
						],
						['A strings object being serialized may contain a hierarchy of strings',
							Uize.clone (_stringsHierarchicalStrings),
							_fileHierarchicalStrings
						]
					]]
				])
			]
		});
	}
});

