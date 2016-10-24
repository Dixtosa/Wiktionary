// Description         : adds several parameteres to redlinks so that after clicking it 
//                       wikitext will be automatically filled with some initial data
// Dependency          : None
// UserConfig          : None
// Problems/to-do      : the assumptions written below
//                       UserConfig for creationrules?
//                       get defintion for synonyms
// 						 use modules for rules?

// types of greenifying: translation, from synonym, from antonym, alterative form(?)

// <nowiki>

function pasteIfReferred(){
	let word = mw.util.getParamValue("FROM");
	if (word === null) return true;
	wikitext = $("#wpTextbox1");
	let header = mw.util.getParamValue("HEAD");
	let lang = mw.util.getParamValue("LANG").split(".");
	let language = lang[0], langcode = lang[1];
	let partOfSpeech = mw.util.getParamValue("POS");
	let gloss = mw.util.getParamValue("GLOSS");

	entry = `\
==${language}==

===${partOfSpeech}===
{{head|${langcode}|${partOfSpeech.toLowerCase()}}}

# `;
	if (header == "Translations")
	{
		entry += "[[" + word + "]]";
		if (gloss)
			entry += " {{gloss|" + gloss + "}}";
	}
	else if (header == "Alternative forms") {
		entry += `{{alternative form of|${word}|lang=${langcode}}}`;
	}
	else {
		entry += "\n\n====" + header + "====";
		entry += `\n* {{l|${langcode}|${word}}}`;
	}
	
	wikitext.val(entry);
	return false;
}



mw.loader.using( 'mediawiki.util', function () {
	// Wait for the page to be parsed
	$(document).ready( function () {
		if (pasteIfReferred() && mw.config.values.wgAction == "view" && !mw.config.values.wgCanonicalSpecialPageName)
		{
			let news = $("a.new");
			news.each(function (index, elem) {
				elem = $(elem);
				let header = elem.parentsUntil("#mw-content-text").last().prevUntil(":header").andSelf().prev().filter(":header");// filter is due to andSelf
				
				if (header.length === 0) //a.new's that are without header (e.g. {{also|title_that_does_not_exist}})
					return ;
				
				let parentOfHeader = "h" + (header.prop("tagName")[1] - 1);

				let headertext = header.children().first().text();
				let PoS = header.prevAll(parentOfHeader).first().children().first().text();
				let language = header.prevAll("h2").first().children().first().text();

				//this assumes that <anchor> is in between <span>
				let langcode = elem.parent().attr("lang");

				let newhref = elem.attr("href");

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
					var nf = elem.closest(".NavFrame").children().first().clone(); nf.find("span").remove();
					newhref += "&GLOSS=" + nf.text();//.slice(1, -3);
					
					try {
						language = elem.closest("li").contents()[0].wholeText.slice(0, -2);//trim ': '
					}
					catch(e) {
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

				elem.attr("href", newhref).css("color", "rgb(34, 204, 0)");
			});
		}
	} );
} );

//</nowiki>
