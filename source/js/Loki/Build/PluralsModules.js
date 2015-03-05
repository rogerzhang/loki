/*
	- from project name, load project, determine supported languages superset
*/

Uize.module ({
	name:'Loki.Build.PluralsModules',
	required:[
		'Uize.Services.FileSystem',
		'Uize.Json',
		'Uize.Loc.Plurals.RuleParser',
		'Uize.Build.Util'
	],
	builder:function () {
		'use strict';

		return Uize.package ({
			perform:function (_params) {
				var
					_fileSystem = Uize.Services.FileSystem.singleton (),
					_projectName = _params.project,
					_moduleConfigs = _params.moduleConfigs,
					_config = _moduleConfigs ['Loki.Build.PluralsModules'],
					_project = _config.projects [_projectName],
					_locConfig = _moduleConfigs ['Uize.Build.Loc'],
					_locProject = _locConfig.projects [_projectName],
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
					_rootFolderPath = _locProject.rootFolderPath
				;

				/*** generate the per language plurals modules under Uize.Loc.Plurals.Langs ***/
					Uize.forEach (
						['en-US','en-GB','fr-CA','en-ZZ'],
						function (_language) {
							_fileSystem.writeFile ({
								path:_rootFolderPath + '/' + _pluralModulePathTemplate ({language:_language}),
								contents:_pluralModuleTemplate ({
									pluralCategoryFunction:
										'function (v) {\n' +
										'	return \'other\';\n' +
										'}'
								})
							});
							console.log ('Generated plural module for ' + _language);
						}
					);
			}
		});
	}
});

