Uize.module ({
	name:'Loki.LocServiceAdapters.ZoomEmailTemplates',
	superclass:'Uize.Services.LocAdapter',
	required:'Uize.Util.RegExpComposition.WordSplitterHtml',
	builder:function (_superclass) {
		'use strict';

		var
			_templateFileRegExp = /(en_US)(\/.+\.ftl$)/,
			_wordSplitterRegExpComposition = Uize.Util.RegExpComposition.WordSplitterHtml.extend ({
				ftlTag:/<\/?#(?:.|[\r\n\f])+?\S>/,
					/* IMPORTANT:
						This regular expression pattern is an over-simplification in order to avoid having to actually write a parser for parsing the FTL expression language. A problem with FTL is that it allows expressions inside its XML-like tags to contain ">" characters, such as in conditional expressions. This presents a problem for a typical XML parser, since XML does not permit this and ">" characters would need to be represented using XML entities inside XML documents.

						Therefore, a simplifying assumption is made in the regular expression that the end of an FTL "tag" must be a ">" character that is preceded by a non-whitespace character, since typically the ">" character used in expressions is padded with whitespace. As an example, this assumption allows the regular expression to match against the following...

						<#if tollFreeNumbers?? && ((tollFreeNumbers?size) > 0)>

						Without this assumption, the regular expression might regard the ">" character in the conditional expression as the end of the tag.

						Now, this assumption requires that the authors of the templates follow a simple coding style - the true ">" closing character for an FTL tag must never be preceded by whitespace. The only other alternative is to truly parse the FTL expressions to avoid incorrectly seeing an end of a tag, which is an excessive effort considering that this regular expression is used only to form the word splitter that is used for producing word count metrics and determining words that should be pseudo-localized.
					*/
				tokenExpression:/[^\}]+/,
				token:/\$\{({tokenExpression})\}/,
				wordSplitter:/{ftlTag}|{htmlTag}|{htmlEntity}|{token}|{whitespace}|{punctuation}|{number}/
			}),
			_ftlTagRegExp = _wordSplitterRegExpComposition.get ('ftlTag')
		;

		return _superclass.subclass ({
			instanceMethods:{
				getLanguageResourcePath:function (_primaryLanguageResourcePath,_language) {
					return _primaryLanguageResourcePath.replace (
						_templateFileRegExp,
						_language.replace ('-','_') + '$2'
					);
				},

				stringHasHtml:function _method (_stringPath,_value) {
					return _method.former.call (this,_stringPath,_value.replace (_ftlTagRegExp,''));
				},

				isResourceFile:function (_filePath) {
					return _templateFileRegExp.test (_filePath);
				},

				parseResourceFile:function (_resourceFileText) {
					return {ftl:_resourceFileText};
				},

				serializeResourceFile:function (_strings) {
					return _strings.ftl;
				}
			},

			instanceProperties:{
				wordSplitter:_wordSplitterRegExpComposition.get ('wordSplitter'),
				tokenRegExp:_wordSplitterRegExpComposition.get ('token')
			}
		});
	}
});

