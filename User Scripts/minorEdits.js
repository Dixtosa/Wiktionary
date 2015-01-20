function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function addPron(wikitext)
{
	if (wikitext.indexOf("Pronunciation") != -1) return wikitext;
 
	l = [
	"Verbal noun", "Noun", "Adjective", "Verb",
	"Adverb", "Pronoun", "Preposition", "Conjunction", 
	"Phrase", "Interjection", "Proper noun"];
	str = "(" + (l.map (function(s){ return "==="+s+"==="})).join("|") + ")";
	var re = new RegExp(str);
	var pos = re.exec(wikitext).index;
 
	var res = wikitext.substring(0,pos) + "===Pronunciation===\n* {{ka-IPA}}\n\n" + wikitext.substring(pos);
	return res;
}

function removeHead(wikitext)
{
	wikitext = wikitext.replace("head|ka|noun", "ka-noun");
	wikitext = wikitext.replace("head|ka|adjective", "ka-adj");
	return wikitext;
}
function changeMinorly()
{
	
	var templateNames = ["ka-noun", "ka-adj", "ka-pron", "ka-adv",
						"ka-proper noun", "ka-verbal noun"].map(escapeRegExp);//.map(escapeRegExp);
	var regexReplace = {
		"\\{\\{IPA\\|.+?\\|lang\\=ka\\}\\}" : "{{ka-IPA}}",
		"l\\|ka\\|(.+?)\\|.+?\\}\\}"      : "l|ka|$1}}"
	};
	
	templateNames.forEach(function(element, index, array){
		var regex="(" + element + ".*?)\\|tr\\=.+?(\\||\\}\\})(.*?)";
		regexReplace[regex] = "$1$2$3";
	});

	
	var texbox = document.getElementById("wpTextbox1");
	var wikitext = $("#wpTextbox1").val();
	wikitext = removeHead(wikitext);
	wikitext = addPron(wikitext);
	
	for (var element in regexReplace){
		var re = new RegExp(element, "g");
		wikitext = wikitext.replace(re, regexReplace[element]);
	}
 
	$("#wpTextbox1").val(wikitext);
	//document.editform.submit();
}
 
 
// Make sure the utilities module is loaded (will only load if not already)
mw.loader.using( 'mediawiki.util', function () {
 
    // Wait for the page to be parsed
    $(document).ready( function () {
    	//var specialchars = document.getElementById ('editpage-specialchars'); specialchars.innerHTML = "";
 
 
        var ka_recent_changes = mw.util.addPortletLink( 'p-personal', 'https://en.wiktionary.org/w/index.php?title=Special:RecentChangesLinked&hidemyself=1&namespace=0&associated=1&target=Wiktionary%3AGeorgian+transliteration&showlinkedto=1', 'ka-recchanges', 'recentchangesid');
        var minor_changes = mw.util.addPortletLink( 'p-tb', '#', 'Minor changes', 'minorchangesid');
 
        $( minor_changes ).click( function ( event ) {
            event.preventDefault();
            changeMinorly();
        } );
    } );
} );
