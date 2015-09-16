Uize.module ({
	name:'Loki.Test.Loki.LocServiceAdapters.AdminWeb',
	builder:function () {
		'use strict';

		var
			_bomChar = '﻿',
			_stringKeyColumnName = 'strConstant'
		;

		return Uize.Test.resolve ({
			title:'Test for Loki.LocServiceAdapters.AdminWeb Module',
			test:[
				Uize.Test.requiredModulesTest ('Loki.LocServiceAdapters.AdminWeb'),
				Uize.Test.staticMethodsTest ([
					['Loki.LocServiceAdapters.AdminWeb.parseResourceFile',[
						['The BOM character is stripped before parsing, and the first row is treated as the header providing column names',
							[
								_bomChar +
								[
									'strConstant	1033',
									'title	This is the title'
								].join ('\n'),
								'en-US'
							],
							{
								title:'This is the title'
							}
						],
						['The resource file may contain no strings',
							[
								_bomChar +
								[
									'strConstant	1033'
								].join ('\n'),
								'en-US'
							],
							{}
						],
						['The resource file may contain columns for multiple languages',
							[
								_bomChar +
								[
									'strConstant	1031	1033	3084',
									'title	Dies ist der titel	This is the title	Tel est le titre'
								].join ('\n'),
								'de-DE'
							],
							{
								title:'Dies ist der titel'
							}
						],
						['The resource file may contain multiple strings',
							[
								_bomChar +
								[
									'strConstant	1031	1033	3084',
									'title	Dies ist der titel	This is the title	Tel est le titre',
									'description	Dies ist die beschreibung	This is the description	Ceci est la description'
								].join ('\n'),
								'fr-CA'
							],
							{
								title:'Tel est le titre',
								description:'Ceci est la description'
							}
						],
						['Strings whose values are the empty string code are converted to actual empty strings during parsing',
							[
								_bomChar +
								[
									'strConstant	1031	1033',
									'title	~	This is the title',
									'description	~	This is the description'
								].join ('\n'),
								'de-DE'
							],
							{
								title:'',
								description:''
							}
						],
						['Strings whose values contain backslash-escaped line break characters are unescaped to produce strings with actual line break characters during parsing',
							[
								_bomChar +
								[
									'strConstant	1031	1033',
									'title	Dies ist\\n der titel	This is the title',
									'description	Dies ist\\r die beschreibung	This is the description'
								].join ('\n'),
								'de-DE'
							],
							{
								title:'Dies ist\n der titel',
								description:'Dies ist\r die beschreibung'
							}
						]
					]],
					['Loki.LocServiceAdapters.AdminWeb.serializeResourceFile',[
						['The BOM character is added as a prefix when serializing the resource file, and the first row is treated as the header providing column names',
							[
								{
									title:'Dies ist der titel'
								},
								'de-DE',
								_bomChar +
								[
									'strConstant	1031	1033',
									'title	~	This is the title'
								].join ('\n')
							],
							_bomChar +
							[
								'strConstant	1031	1033',
								'title	Dies ist der titel	This is the title'
							].join ('\n')
						],
						['When the previous version of the resource file does not contain a column for the languge of strings being serialized, a column is added as needed',
							[
								{
									title:'Dies ist der titel',
									description:'Dies ist die beschreibung'
								},
								'de-DE',
								_bomChar +
								[
									'strConstant	1033',
									'title	This is the title',
									'description	This is the description'
								].join ('\n')
							],
							_bomChar +
							[
								'strConstant	1031	1033',
								'title	Dies ist der titel	This is the title',
								'description	Dies ist die beschreibung	This is the description'
							].join ('\n')
						],
						['When the previous version of the resource file contains columns for languages other than the language being serialized, the values of the strings on those columns are respected and left as is',
							[
								{
									title:'Dies ist der titel',
									description:'Dies ist die beschreibung'
								},
								'de-DE',
								_bomChar +
								[
									'strConstant	1033	3084',
									'title	This is the title	Tel est le titre',
									'description	This is the description	Ceci est la description'
								].join ('\n')
							],
							_bomChar +
							[
								'strConstant	1031	1033	3084',
								'title	Dies ist der titel	This is the title	Tel est le titre',
								'description	Dies ist die beschreibung	This is the description	Ceci est la description'
							].join ('\n')
						],
						['When string values for the language being serialized are empty strings, they are converted to the empty string code during serialization',
							[
								{
									title:'',
									description:''
								},
								'de-DE',
								_bomChar +
								[
									'strConstant	1033',
									'title	This is the title',
									'description	This is the description'
								].join ('\n')
							],
							_bomChar +
							[
								'strConstant	1031	1033',
								'title	~	This is the title',
								'description	~	This is the description'
							].join ('\n')
						],
						['When string values for the language being serialized contain line break characters, those line break characters are backslash-escaped during serialization',
							[
								{
									title:'Dies ist\n der titel',
									description:'Dies ist\r die beschreibung'
								},
								'de-DE',
								_bomChar +
								[
									'strConstant	1033',
									'title	This is the title',
									'description	This is the description'
								].join ('\n')
							],
							_bomChar +
							[
								'strConstant	1031	1033',
								'title	Dies ist\\n der titel	This is the title',
								'description	Dies ist\\r die beschreibung	This is the description'
							].join ('\n')
						]
					]]
				])
			]
		});
	}
});

