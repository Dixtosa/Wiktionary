// Description is at: User:Dixtosa/minorEdit
// see the description to see what this script assumes

importScript("User:Dixtosa/XMLize.js");

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function doGeorgian(wikitext)
{
	//START of FUNCTIONS
	function removeHead(wikitext) {
		//TODO: noun forms
		wikitext = wikitext.replace("head|ka|noun", "ka-noun");
		wikitext = wikitext.replace("head|ka|adverb", "ka-adv");
		wikitext = wikitext.replace("head|ka|adjective", "ka-adj");
		wikitext = wikitext.replace("head|ka|proper noun", "ka-proper noun");
		wikitext = wikitext.replace("head|ka|proper_noun", "ka-proper noun");
		return wikitext;
	}
	function addPronunciation(wikitext)
	{
		var exceptionList = ["ალო"];
		if ($.inArray(mw.config.values.wgTitle, exceptionList) >= 0) return wikitext;
		
		var wikixml = XMLize(wikitext);
		wikixml.find(".Georgian .Pronunciation").remove();
		
		var first_h3 = wikixml.find (".Georgian > section").first();
		if (first_h3.attr("class") == "Alternative forms") first_h3 = first_h3.next();
		if (first_h3.attr("class") == "Etymology") first_h3 = first_h3.next();
		
		var hyphen = "\n* {{ka-hyphen}}";
		if ((mw.config.values.wgTitle.match(/[აეიოუ]/g) || "").length <= 1) hyphen = "";
		
		first_h3.before("<section class = 'Pronunciation' level = '3'><data>\n* {{ka-IPA}}" + hyphen + "\n\n</data></section>");
		return deXMLize(wikixml);
	}
	function fixDeclension(wikitext)
	{
	
		//remove erroneously added declension tables
		wikitext = wikitext.replace (/====[ ]?Declension[ ]?====\n{{ka-decl-adj-auto}}\n/, "");
		wikitext = wikitext.replace (/====[ ]?Declension[ ]?====\n{{ka-adj-decl.*?}}\n/, "");

		wikitext = wikitext.replace(/{{ka-noun-c\|.*plural.*}}/, "{{ka-infl-noun|-}}");
		wikitext = wikitext.replace(/{{ka-noun-c\|.*}}/, "{{ka-infl-noun}}");
		
		
		wikitext = wikitext.replace(/{{ka-noun-a\|.*plural.*}}/, "{{ka-infl-noun|-}}")
		wikitext = wikitext.replace(/{{ka-noun-a\|.*}}/, "{{ka-infl-noun}}")
		
		wikitext = wikitext.replace(/{{ka-noun-o\|.*plural.*}}/, "{{ka-infl-noun|-}}")
		wikitext = wikitext.replace(/{{ka-noun-o\|.*}}/, "{{ka-infl-noun}}")
		
		wikitext = wikitext.replace(/{{ka-noun-u\|.*plural.*}}/, "{{ka-infl-noun|-}}")
		wikitext = wikitext.replace(/{{ka-noun-u\|.*}}/, "{{ka-infl-noun}}")
		
		wikitext = wikitext.replace(/{{ka-noun-e\|.*plural.*}}/, "{{ka-infl-noun|-}}")
		wikitext = wikitext.replace(/{{ka-noun-e\|.*}}/, "{{ka-infl-noun}}")
	
		wikitext = wikitext.replace(/{{ka\-noun\-c\-2\|.*?\|.*?\|(.*?)\|.*plural.*}}/, "{{ka-infl-noun|$1|-}}")
		wikitext = wikitext.replace(/{{ka\-noun\-c\-2\|.*?\|.*?\|(.*?)\|.*}}/, "{{ka-infl-noun|$1}}");
		
		return wikitext;
	}
	//END of FUNCTIONS
	
	wikitext = fixDeclension(wikitext);
	wikitext = wikitext.replace("Declension", "Inflection");
	
	var regexReplace = {
		"{{IPA\\|.+?\\|lang=ka}}"  :  "{{ka-IPA}}"
	}
	
	var templateNames = ["ka-noun", "ka-adj", "ka-pron", "ka-adv",
						"ka-proper noun", "ka-verbal noun"];
						
	["ka", "hy", "xcl"].forEach(function(lang, ind, arr) {
		templateNames.push("l\\|" + lang);
		templateNames.push("m\\|" + lang);
	});
	
	templateNames.forEach(function(element, index, array){
		var regex="(" + element + ".*?)\\|tr\\=.+?(\\||\\}\\})(.*?)"; //or this pattern "\\|([^\\n]*?)(\\|tr=[^\\|}}]*)([^\\n]*?)}}"
		regexReplace[regex] = "$1$2$3";
	});

	
	wikitext = removeHead(wikitext);
	//replaces redundant transliterations in headword and l. also corrects IPA.
	for (var element in regexReplace){
		var re = new RegExp(element, "g");
		wikitext = wikitext.replace(re, regexReplace[element]);
	}
	
	wikitext = addPronunciation(wikitext);
	
	return wikitext;
	//document.editform.submit();
}

function doForAll(wikitext)
{
	function brackets_2_l(wikitext)
	{
		//var lang2code = {'Georgian' : 'ka', 'Russian' : 'ru', 'Armenian' : 'hy'};
		var possibleHeaders = ["Alternative forms", "Synonyms", "Antonyms", "Derived terms", "Related terms", "See also", "Hypernyms"];
		var wikixml = XMLize(wikitext);
		wikixml = splitByTemplateUse(wikixml);
		
		var data = wikixml.find("notemplate");
		data.each( function() {
			var elem = $(this);
			if ($.inArray(elem.closest("section").attr("class"), possibleHeaders) == -1) return;
			
			var datatext = elem.text();
			var language = elem.closest('[level="2"]').attr("class");
			if (language == "English") return;
			
			var langcode = "{{" + "subst" + ":langrev|"+ language + "}}" ;//lang2code[language];
			datatext = datatext.replace(/\[\[([^:]*?)\]\]/g, '{{l|' + langcode + '|$1}}');
			elem.text(datatext);
		});
		return deXMLize(wikixml);
	}
	
	return brackets_2_l(wikitext);
}

function clean(wikitext)
{
	wikitext = doForAll(wikitext);
	wikitext = doGeorgian(wikitext);
	return wikitext;
}
function cleanup()
{
	var wikitext = $("#wpTextbox1").val();
	$("#wpTextbox1").val(clean(wikitext));
}

function initMinorEdit() {
	// Wait for the page to be parsed
	$(document).ready( function () {
		
		$ ("#wpDiff").after ("<input value = 'Minor Cleanup' type = 'submit' onclick='cleanup(); return false;' />")
		
		//var mcLink = mw.util.addPortletLink( 'p-tb', 'javascript:cleanup();', 'Minor changes', 'minorchangesid');

		//$( mcLink ).click( function ( event ) {
		//	event.preventDefault();
		//	cleanup();
		//} );
	});
}

if (mw.config.values.wgAction == "edit" && (mw.config.values.wgPageName == "User:Dixtosa/minorEdits/test" || mw.config.values.wgNamespaceNumber === 0))
	mw.loader.using('mediawiki.util', initMinorEdit); //not sure what this does but whatever xD
