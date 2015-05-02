Uize.module ({
	name:'Loki.Test.Loki.LocServiceAdapters.ServiceWeb',
	builder:function () {
		'use strict';

		var
			/*** no strings ***/
				_stringsNoStrings = {
					'RC.Lang.Wizard.Foo':{
					}
				},
				_fileNoStrings = [
					'RC.ns(\'RC.Lang.Wizard.Foo\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Foo, {});',
					''
				].join ('\n'),

			/*** multiple strings ***/
				_stringsMultipleStrings = {
					'RC.Lang.Wizard.Foo':{
						STRING_ONE:'This is string one',
						STRING_TWO:'This is string two',
						STRING_THREE:'This is string three'
					}
				},
				_fileMultipleStrings = [
					'RC.ns(\'RC.Lang.Wizard.Foo\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Foo, {',
					'	STRING_ONE : \'This is string one\',',
					'	STRING_TWO : \'This is string two\',',
					'	STRING_THREE : \'This is string three\'',
					'});',
					''
				].join ('\n'),

			/*** hierarchical strings ***/
				_stringsHierarchicalStrings = {
					'RC.Lang.Wizard.Foo':{
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
					}
				},
				_fileHierarchicalStrings = [
					'RC.ns(\'RC.Lang.Wizard.Foo\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Foo, {',
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
					'});',
					''
				].join ('\n'),

			/*** multiple namespaces ***/
				_stringsMultipleNamespaces = {
					'RC.Lang.Wizard.Foo':{
						FOO_STRING_ONE:'This is Foo string one',
						FOO_STRING_TWO:'This is Foo string two'
					},
					'RC.Lang.Wizard.Bar':{
						BAR_STRING_ONE:'This is Bar string one',
						BAR_STRING_TWO:'This is Bar string two'
					},
					'RC.Lang.Wizard.Baz':{
						BAZ_STRING_ONE:'This is Baz string one',
						BAZ_STRING_TWO:'This is Baz string two'
					}
				},
				_fileMultipleNamespaces = [
					'RC.ns(\'RC.Lang.Wizard.Foo\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Foo, {',
					'	FOO_STRING_ONE : \'This is Foo string one\',',
					'	FOO_STRING_TWO : \'This is Foo string two\'',
					'});',
					'',
					'',
					'RC.ns(\'RC.Lang.Wizard.Bar\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Bar, {',
					'	BAR_STRING_ONE : \'This is Bar string one\',',
					'	BAR_STRING_TWO : \'This is Bar string two\'',
					'});',
					'',
					'',
					'RC.ns(\'RC.Lang.Wizard.Baz\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Baz, {',
					'	BAZ_STRING_ONE : \'This is Baz string one\',',
					'	BAZ_STRING_TWO : \'This is Baz string two\'',
					'});',
					''
				].join ('\n'),

			/*** JS expressions ***/
				_stringsJsExpressions = {
					'RC.Lang.Wizard.Foo':{
						STRING_ONE:'{RC.Config.Foo} This is string one',
						STRING_TWO:'This is {RC.Config.Bar} string two',
						STRING_THREE:'This is string three {RC.Config.Baz}',
						STRING_FOUR:'{RC.Config.Foo} This is {RC.Config.Bar} string four {RC.Config.Baz}'
					}
				},
				_fileJsExpressions = [
					'RC.ns(\'RC.Lang.Wizard.Foo\');',
					'RC.utils.Lang.extend(RC.Lang.Wizard.Foo, {',
					'	STRING_ONE : \'\' + RC.Config.Foo + \' This is string one\',',
					'	STRING_TWO : \'This is \' + RC.Config.Bar + \' string two\',',
					'	STRING_THREE : \'This is string three \' + RC.Config.Baz + \'\',',
					'	STRING_FOUR : \'\' + RC.Config.Foo + \' This is \' + RC.Config.Bar + \' string four \' + RC.Config.Baz + \'\'',
					'});',
					''
				].join ('\n')
		;

		return Uize.Test.resolve ({
			title:'Test for Loki.LocServiceAdapters.ServiceWeb Module',
			test:[
				Uize.Test.requiredModulesTest ('Loki.LocServiceAdapters.ServiceWeb'),
				Uize.Test.staticMethodsTest ([
					['Loki.LocServiceAdapters.ServiceWeb.parseResourceFile',[
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
						],
						['A resource file being parsed may contain strings for multiple namespaces',
							_fileMultipleNamespaces,
							Uize.clone (_stringsMultipleNamespaces)
						],
						['A resource file being parsed may contain JavaScript concatenation expressions if the value true is specified for the optional second argument, and such concatenation expressions are normalized to ',
							[_fileJsExpressions,true],
							Uize.clone (_stringsJsExpressions)
						]
					]],
					['Loki.LocServiceAdapters.ServiceWeb.serializeResourceFile',[
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
						],
						['A strings object being serialized may contain strings for multiple namespaces',
							Uize.clone (_stringsMultipleNamespaces),
							_fileMultipleNamespaces
						],
						['A strings object being serialized may contain special tokens that are serialized to JavaScript concatenation expressions if the value true is specified for the optional second argument',
							[Uize.clone (_stringsJsExpressions),true],
							_fileJsExpressions
						]
					]]
				])
			]
		});
	}
});

