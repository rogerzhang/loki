Uize.module ({
	name:'Loki.Build.PluralsModules',
	required:[
		'Uize.Services.FileSystem',
		'Uize.Json',
		'Uize.Loc.Plurals.RuleParser',
		'Uize.Build.Util',
		'Uize.Build.Loc',
		'Uize.Services.LocAdapter',
		'Uize.Str.Trim'
	],
	builder:function () {
		'use strict';

		return Uize.package ({
			perform:function (_params) {
				var
					_fileSystem = Uize.Services.FileSystem.singleton (),
					_projectName = _params.project,
					_config = _params.moduleConfigs ['Loki.Build.PluralsModules'],
					_project = _config.projects [_projectName],
					_locProject = Uize.Build.Loc.getProjectConfig (_params,_projectName),
					_pluralRules = Uize.Json.from (_fileSystem.readFile ({path:_config.cldrPluralsPath})),
					_pluralRulesMapsByLanguage = Uize.map (
						_pluralRules.supplemental ['plurals-type-cardinal'],
						function (_languagePlurals,_language) {
							var _pluralRulesMap = {};
							Uize.forEach (
								_languagePlurals,
								function (_pluralRule,_pluralRuleName) {
									_pluralRulesMap [_pluralRuleName.replace (/^pluralRule-count-/,'')] = _pluralRule;
								}
							);
							return _pluralRulesMap;
						}
					),
					_pluralModulePathTemplate = Uize.Build.Util.compileJstFile (_project.pluralModulePathTemplate),
					_pluralModuleTemplate = Uize.Build.Util.compileJstFile (_project.pluralModuleTemplate),
					_pluralCategoryFunction = Uize.Build.Util.compileJstFile (
						_params.sourcePath + '/' + _params.modulesFolder +
						'/Loki/Build/PluralsModules/PluralCategoryFunctionTemplate.jst'
					),
					_rootFolderPath = _locProject.rootFolderPath
				;

				/*** generate the per language plurals modules under Uize.Loc.Plurals.Langs ***/
					Uize.forEach (
						[_locProject.pseudoLocale].concat (
							Uize.Services.LocAdapter.resolveProjectLanguages (_locProject).languagesSuperset
						),
						function (_language) {
							_fileSystem.writeFile ({
								path:
									_rootFolderPath + '/' +
									Uize.Str.Trim.trim (_pluralModulePathTemplate ({language:_language})),
								contents:_pluralModuleTemplate ({
									language: _language,
									pluralCategoryFunction:_pluralCategoryFunction ({
										pluralRulesFunction:Uize.Loc.Plurals.RuleParser.rulesToJsFunctionStr (
											_pluralRulesMapsByLanguage [_language] ||
											_pluralRulesMapsByLanguage [_language.split ('-') [0]]
										)
									})
								})
							});
							console.log ('Generated plural module for ' + _language);
						}
					);
			}
		});
	}
});

