// Description         : adds several parameteres to redlinks so that after clicking it 
//                       wikitext will be automatically filled with some initial data
// Dependency          : None
// UserConfig          : None
// Problems/to-do      : the assumptions written below
//                       UserConfig for creationrules?
//                       get defintion for synonyms


function pasteIfReferred(){
	var word = mw.util.getParamValue("FROM");
	if (word === null) return true;
	wikitext = $("#wpTextbox1");
	var header = mw.util.getParamValue("HEAD");
	var lang = mw.util.getParamValue("LANG").split(".");
	var language = lang[0], langcode = lang[1];
	var PoS = mw.util.getParamValue("POS");

	entry = "==" + language + "==\n";

	entry += "\n===" + PoS + "===\n";
	entry += "{{head|" + langcode + "|" + PoS.toLowerCase() + "}}\n";
	entry += "\n# "; // Definition
	if (header == "Translations")
	{
		entry += "[[" + word + "]]";
	} 
	else if (header == "Alternative forms") {
		entry += "{{alternative form of|" + word + "|lang=" + langcode + "}}";
	}
	else {
		entry += "\n\n====" + header + "====";
		entry += "\n* {{l|" + langcode + "|" + word + "}}";
	}
	
	wikitext.val(entry);
	return false;
}



mw.loader.using( 'mediawiki.util', function () {
	// Wait for the page to be parsed
	$(document).ready( function () {
		if (pasteIfReferred() && mw.config.values.wgAction == "view" && !wgCanonicalSpecialPageName)
		{
			var news = $("a.new");
			news.each(function (int, elem) {
				elem = $(elem);
				var header = elem.parentsUntil("#mw-content-text").last().prevUntil(":header").andSelf().prev().filter(":header");// filter is due to andSelf
				
				var parentOfHeader;
				try {
					parentOfHeader = "h" + (header.prop("tagName")[1]-1);
				}
				catch(e){
					//a.new's that are wo header (e.g. {{also|askldjajkl;sdf;asjk}} XD)
					return ;
				}

				var headertext = $(header.children()[0]).text();
				var PoS = $($(header.prevAll(parentOfHeader)[0]).children()[0]).text();
					
				var language = $($(header.prevAll("h2")[0]).children()[0]).text();
				//this assumes that <anchor> is in between <span>
				var langcode = elem.parent().attr("lang");

				var newhref = elem.attr("href");

				if (headertext == "Synonyms" || headertext == "Antonyms")
				{
					newhref += "&FROM=" + mw.config.values.wgTitle;
					newhref += "&HEAD=" + headertext;
					newhref += "&LANG=" + language+"."+langcode;
					newhref += "&POS=" + PoS;

				}
				else if (headertext == "Translations")
				{
					newhref += "&FROM=" + mw.config.values.wgTitle;
					newhref += "&HEAD=Translations";
					try{
						language = elem.closest("li").contents()[0].wholeText.slice(0, -2);//trim ': '
					}
					catch(e){
						return ;
					}
					newhref += "&LANG=" + language+"."+langcode;
					newhref += "&POS=" + PoS;
				}
				else if (headertext == "Alternative forms")
				{
					newhref += "&FROM=" + mw.config.values.wgTitle;
					newhref += "&HEAD=Alternative forms";
					newhref += "&LANG=" + language+"."+langcode;
				}

				elem.attr("href", newhref);
			});
		}
	} );
} );
