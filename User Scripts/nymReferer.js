function createNewIfReferer(){
	var u = document.URL.split("&");
	var params = (u[u.length - 1]).split("=");
	if (params[0] == "Synonyms" || params[0] == "Antonyms"){
		wikitext = $("#wpTextbox1");
		wikitext.val("==Georgian==\n\n===Pronunciation===\n* {{ka-IPA}}\n\n===Adjective===\n{{ka-adj}}\n\n# \n\n===="+params[0]+"====\n* {{l|ka|"+decodeURI(params[1])+"}}");
	}
}
 
 
 
mw.loader.using( 'mediawiki.util', function () {
 
    // Wait for the page to be parsed
    $(document).ready( function () {
    	createNewIfReferer();
    	var news = $(".new");
    	news.each(function (int, elem) {
    		var header = $(elem).parent().parent().parent().filter("ul").prev().children(".mw-headline").text();
    		if (header=="Synonyms" || header == "Antonyms"){
    			console.log($(elem).attr("href", $(elem).attr("href")+"&"+header+"="+location.pathname.split("/")[2]));
    		}
    	});
    } );
} );

