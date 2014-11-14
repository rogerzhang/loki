Uize.module ({
	name:'Loki.LocServiceAdapters.WithExcludes',
	superclass:'Uize.Services.LocAdapter',
	required:'Loki.Utils.ExcludeUtils',
	builder:function (_superclass) {
		'use strict';

		return _superclass.subclass ({
			instanceMethods:{
				checkTranslatableString:function (_stringInfo) {
					var _project = this.project;
					return (
						_project.keyNameChecker ||
						(
							_project.keyNameChecker = Loki.Utils.ExcludeUtils.loadExclides (
								_project.rootFolderPath + '/exclude-resources'
							)
						)
					).isTranslatableString (_stringInfo);
				},

				isTranslatableString:function (_stringInfo) {
					return this.checkTranslatableString (_stringInfo);
				}
			}
		});
	}
});

