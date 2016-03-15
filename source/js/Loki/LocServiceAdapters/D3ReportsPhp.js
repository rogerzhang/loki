Uize.module({
    name: 'Loki.LocServiceAdapters.D3ReportsPhp',
    superclass: 'Loki.LocServiceAdapters.WithExcludes',
    required: [
        'Uize.Util.RegExpComposition.WordSplitter'
    ],
    builder: function (_superclass) {
        'use strict';

        var
            _resourceFilePathRegExp = /(^|\/)en-us(\/message\.php)$/i,
            _wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend({
                tokenName: /[\da-zA-Z_]+/,
                token: /%({tokenName})%/,
                wordSplitter: /{whitespace}|{token}|{punctuation}|{number}/
            })
            ;


        var phpArrayParser = {
            parse: function(str) {
                var singleQuote = /^'((?:\\'|[^'])*?)'$/;
                var doubleQuote = /^"((?:\\"|[^"])*?)"$/;
                var keyValueReg = /('(?:\\'|[^'])*?'|"(?:\\"|[^"])*?")\s*?=>\s*('(?:\\'|[^'])*?'|"(?:\\"|[^"])*?")/g;

                var exec,

                    res = {};

                while(exec = keyValueReg.exec(str)) {
                    var key = exec[1], value = exec[2];
                    res[getJsString(key)] = getJsString(value);
                }

                return res;

                function getJsString(orgStr) {


                    var str = orgStr;
                    if(singleQuote.test(orgStr)) {
                        str = singleQuote.exec(orgStr)[1];
                    }

                    if(doubleQuote.test(orgStr)) {
                        console.warn("WARN! DON'T use \" outside:", orgStr );
                        str = doubleQuote.exec(orgStr)[1].replace(/\\"/g,'"');
                    }

                    return str;
                }
            },
            serialize: function(obj) {
                var items = [];

                Object.keys(obj).forEach(function(key){
                    items.push( "    '" + key + "' => '" + obj[key] +"'");
                });

                var strArr = [
                    '<?php',
                    'return array(',
                    items.join(',\n'),
                    ');'
                ];

                return strArr.join('\n');
            }
        };

        return _superclass.subclass({
            instanceMethods: {
                getLanguageResourcePath: function (_primaryLanguageResourcePath, _language) {
                    return _primaryLanguageResourcePath.replace(
                        _resourceFilePathRegExp,
                        '$1' + _language.toLowerCase() + '$2'
                    );
                },

                isTranslatableString: function (_stringInfo) {
                    return (
                        this.checkTranslatableString(_stringInfo) && !/^(https?:\/\/)/.test(_stringInfo.value)
                    );
                },

                isResourceFile: function (_filePath) {
                    return _resourceFilePathRegExp.test(_filePath);
                },

                parseResourceFile: function (_resourceFileText) {
                    return phpArrayParser.parse(_resourceFileText);
                },

                serializeResourceFile: function (_messages) {
                    return phpArrayParser.serialize(_messages);
                }
            },

            instanceProperties: {
                tokenRegExp: _wordSplitterRegExpComposition.get('token'),
                wordSplitter: _wordSplitterRegExpComposition.get('wordSplitter')
            }
        });
    }
});

