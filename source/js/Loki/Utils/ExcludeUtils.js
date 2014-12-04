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
							//Example of _stringInfo
							//{ key: 'HEADER_USER_PASSWORD',
							//	value: 'Voice Manager Password',
							//	path:
							//	[ 'en_US/messages.js',           //File name
							//		'BRANDS',                    //the rest are parts of JS namespace
							//		'7310',
							//		'mailboxSecurity',
							//		'HEADER_USER_PASSWORD' ] }
							//So, we are analyzing only JS namespace info (without file path)

							return !checkerRegexp.test(_stringInfo.path.slice(1).join('.'));
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

