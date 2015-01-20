// <nowiki>
var language;

//ASADRS
var List0 = ["Alternative forms", "Synonyms", "Antonyms", "Derived terms", "Related terms", "See also"];
//var List3 = List0.map (function(s){ return "==="+s+"==="});
//var List4 = List3.map (function(s){ return "="+s+"="});
//var List5 = List4.map (function(s){ return "="+s+"="});
//var List = List3.concat(List4).concat(List5);
//var regexp = "(" + List.join("|") + ")";
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
		if (List0.indexOf(item.innerHTML) >= 0){
			item.nextSibling.firstChild.innerHTML += '<a href="javascript:expand ('+cnt+')">add</a>, ';
		}
		cnt++;
    });
}
function expand(section)
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
            summary: "Added to ASADRS"
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



// Make sure the utilities module is loaded (will only load if not already)
mw.loader.using('mediawiki.util', function () {
 
    // Wait for the page to be parsed
    $(document).ready(main);
});
