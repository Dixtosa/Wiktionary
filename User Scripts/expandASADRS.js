// Description       : With a new button "add" one can expand specific headers without reloading the section (or even, page)
// TO-DO             : Take templated lists into account
// TO-DO             : Add sorting
// Dependency        : ES6
// <nowiki>

ASADRS = {};
ASADRS.expandableHeaders = ["Alternative forms", "Synonyms", "Antonyms", "Derived terms", "Related terms", "See also"]; //ASADRS; got it?

ASADRS.main = function()
{
	let section = 1;
	let lastLang = "";
	let leftBrackets = $(".mw-editsection > .mw-editsection-bracket:contains('[')");
	leftBrackets.each ((i, item) => {
        item=$(item);
        let headerText = item.parent().prev().text();
        if (item.parent().parent().prop("tagName") == "H2")
        {
        	lastLang = headerText;
        }
		if (ASADRS.expandableHeaders.indexOf(headerText) >= 0){
			item.after(`<a href="javascript:ASADRS.expand(${section}, '${headerText}', '${lastLang}'); ">add</a>, `);
		}
		section++;
	});
};


ASADRS.expand = function(section, sectionName, language)
{
	let word = prompt("Enter a word");
    if (word === null) return ;
	let params = {
		// returns function
		edit: ASADRS.changeWikitext(word, language, section),
		// The function to call to change the HTML
		redo: ASADRS.redo(word, language, section),
		// The function to call to unchange the HTML (REQUIRED so that undo works)
		undo: ASADRS.undo(word, section),
		summary: `${sectionName} [[User:Dixtosa/expandASADRS.js|expanded]]`
	};
	new Editor().addEdit(params);
};

ASADRS.changeWikitext = function(word, language, section)
{
	return (wikitext) => {
		let n = 0;
		let langHeaderRegexp = new RegExp("==.+==", "g");
		let langcode = `{{subst:#invoke:languages/templates|getByCanonicalName|${language}}}`;
		return wikitext.replace(langHeaderRegexp, function(match, pos, original){
			n++;
			return match + ((n === section) ? `\n* {{l|${langcode}|${word}}}`:"");
		});
	};
};

ASADRS.redo = function(word, language, section)
{
	return () => {
		let langcode = `{{#invoke:languages/templates|getByCanonicalName|${language}}}`;
		let newhtml = $(`<li><span><a href="/wiki/${word}#${language}" title="${word}">${word}</a></span></li>`);
		let ul = $('.mw-headline').eq(section - 1).parent().next();
		ul.prepend(newhtml);
		
		mw.loader.using("mediawiki.api.parse", () => {
			new mw.Api().parse(`{{l|${langcode}|${word}}}`).done(function(html){
				newhtml.html(html);
			});
		});
	};
};

ASADRS.undo = function(word, section)
{
	return () => {
		let ul = $('.mw-headline').eq(section - 1).parent().next();
		ul.children().first().remove();
	};
};

if (mw.config.values.wgAction == "view")
	$(document).ready(ASADRS.main);
//</nowiki>
