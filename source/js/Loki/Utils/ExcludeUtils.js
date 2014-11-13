Uize.module({
	name: 'Loki.Utils.ExcludeUtils',
	required:'Uize.Services.FileSystem',
	builder: function(_superclass) {
		'use strict';

		return Uize.package({
			loadExclides: function(fileName) {
				console.log('Reading excludes from: "' + fileName + '"');

				var resultFunction = Uize.returnTrue;

				var fs = Uize.Services.FileSystem.singleton();
				if (fs.fileExists({path: fileName})) {
					var excludesContent = fs.readFile({
						path: fileName
					});
					var excludes = excludesContent ? excludesContent.split('\n') : [];
					excludes = filterExcludes(excludes);
					var checkerRegexp = prepareRegexp(excludes);

					if (checkerRegexp) {
						resultFunction = function(_stringInfo) {
							return !checkerRegexp.test(_stringInfo.key);
						}
					}
				}

				return  {
					isTranslatableString: resultFunction
				};

				function filterExcludes(excludes) {
					var result = [];
					excludes.forEach(function(item){
						var value = item ? item.replace(/((([#])|([//]{2,})).*|\s)/g, '') : '';
						if (value) {
							result.push(value);
						}
					});
					return result;
				}

				function prepareRegexp(excludes) {
					var result = [];

					excludes.forEach(function(item){
						var value = item ? item.replace(/([\.{}\)\(])/g, '\\$1').replace(/\*/g, '.*').replace(/[?]/g, '.') : '';
						if (value) {
							result.push('^' + value + '$');
						}
					});
					if (result.length > 0){
						return new RegExp('(' + result.join('|')+ ')');
					}

					return null;
				}
			}
		});
	}
});

