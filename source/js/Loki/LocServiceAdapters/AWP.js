Uize.module({
    name: 'Loki.LocServiceAdapters.AWP',
    superclass: 'Loki.LocServiceAdapters.WithExcludes',
    required:'Uize.Util.RegExpComposition.WordSplitter',
    builder: function (_superclass) {
        'use strict';

        var
            _resourceFilePathRegExp = /(^|\/)en_US(\/messages\.json)$/,
            _wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitter.extend({
                tokenName: /[\da-zA-Z_]+/,
                token: /%({tokenName})%/,
                wordSplitter: /{whitespace}|{token}|{punctuation}|{number}/
            })
            ;

        return _superclass.subclass({
            instanceMethods: {
                getLanguageResourcePath: function (_primaryLanguageResourcePath, _language) {
                    return _primaryLanguageResourcePath.replace(
                        _resourceFilePathRegExp,
                        '$1' + _language.replace('-', '_') + '$2'
                    );
                },

                getStringBrand: function (_resourceStringPath) {
                    return _resourceStringPath [1] == 'BRANDS' ? _resourceStringPath [2] + '' : '';
                },

                stringHasHtml: Uize.returnFalse,

                isTranslatableString: function (_stringInfo) {
                    return (
                        this.checkTranslatableString(_stringInfo) && !/^(https?:\/\/)/.test(_stringInfo.value)
                    );
                },

                isResourceFile: function (_filePath) {
                    return _resourceFilePathRegExp.test(_filePath);
                },

                parseResourceFile: function (_resourceFileText) {
                    return JSON.parse(_resourceFileText);
                },

                serializeResourceFile: function (_messages) {
                    return JSON.stringify(_messages, null, 4);
                }
            },

            instanceProperties: {
                tokenRegExp: _wordSplitterRegExpComposition.get('token'),
                wordSplitter: _wordSplitterRegExpComposition.get('wordSplitter')
            }
        });
    }
});

