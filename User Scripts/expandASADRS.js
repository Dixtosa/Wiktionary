//TO-DO: jQuerization

var language;

//ASADRS
var expandableHeaders = ["Alternative forms", "Synonyms", "Antonyms", "Derived terms", "Related terms", "See also"];
var regexp = "==.+==";

function determineLanguage(section)
{
	var cnt = 1;
	$('.mw-headline').each (function(i, item){
		if (cnt <= section && item.parentElement.tagName == "H2"){
			language = item.innerHTML;
		}
		cnt++;
	});
}
function main()
{
	var cnt = 1;
	$('.mw-headline').each (function(i, item){
		if (expandableHeaders.indexOf(item.innerHTML) >= 0){
			item.nextSibling.firstChild.innerHTML += '<a href="javascript:expand (' + cnt + ', \'' + item.innerHTML + '\'); ">add</a>, ';
		}
		cnt++;
	});
}

function expand(section, sectionName)
{
	var word = prompt("Enter a word");
	var editor = Editor();
	determineLanguage(section);
	editor.addEdit({

			edit: function(wikitext){ return changeWikitext(wikitext, word, section)},

			// The function to call to change the HTML
			redo: function(){ redo(word, section)},

			// The function to call to unchange the HTML (REQUIRED so that undo works)
			undo: function(){ undo(word, section)},

			// The edit summary
			summary: sectionName + " [[User:Dixtosa/expandASADRS.js|expanded]]; "
		});
}


function changeWikitext(wikitext, word, section)
{
	var n = 0;
	var langcode = "{{" + "subst:#invoke:languages/templates|getByCanonicalName|" + language + "}}";
	wikitext = wikitext.replace(new RegExp(regexp, "g"), function(match, pos, original){
		n++;
		return match + ((n === section) ? "\n* {{l|"+langcode+"|"+word+"}}":"");
	});
	return wikitext;
}
function redo(word, section)
{
	var newhtml = '<li><span class="Geor" lang="ka" xml:lang="ka"><a href="/wiki/'+word+'#'+language+'" title="'+word+'">'+word+'</a></span></li>';
	var ul = $('.mw-headline')[section - 1].parentElement.nextSibling.nextSibling;
	ul.innerHTML = newhtml + ul.innerHTML;
}
function undo(word, section)
{
	var ul = $('.mw-headline')[section - 1].parentElement.nextSibling.nextSibling;
	ul.removeChild(ul.children[0]);
}

mw.loader.using('mediawiki.util', function () {
	if (mw.config.values.wgAction == "view")
		$(document).ready(main);
});
