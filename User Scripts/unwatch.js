// Description         : this is a very small script that does one thing, but does it well. Unix FTW. 
// Real description xD : adds unwatch button between "diff" and "hist"
// Idea by             : after [[User:Hippietrail]]'s version stopped working I reimplemented it.
// Problems/to-do      : The response of AJAX request says title is deprecated :(
// Dependency          : None
// UserPrefs           : None 

function unwatch(Title)
{
	Title = decodeURIComponent(Title);
	$.ajax({
		url: mw.util.wikiScript( 'api' ),
		type: 'POST',
		data: {
			format: 'json',
			action: 'watch', //or unwatch :?
			title: Title,
			unwatch: 1,
			uselang: "en", 
			token: mw.user.tokens.get( 'watchToken' )
		}
	})
	.done (function( data ) {
		if ( data && data.watch && data.watch.message && data.watch.message.search ("has been removed from") > 0) {
			console.log( 'Page edited!' );
 
			//remove from watchlist
			$(".mw-changeslist li .mw-title:contains('" + Title.replace("'", "\\'") + "')").parent().hide("slow");
		} else {
			alert( 'The edit query returned an error.' );
		}
	})
	.fail ( function() {
		alert( 'The ajax request failed.' );
	});
}
 
function addUnwatch()
{
	var arr = $ ("a:contains('diff')"); //probably a bit sloppy
	arr.after(function(i) {
		//I'm vegetarian
		return " | <a href='javascript: unwatch(\"" + arr[i].title.replace("'", "%27") + "\")'>unwatch</a>";
	});
}

if( wgCanonicalSpecialPageName == 'Watchlist' && wgAction == 'view' ) $(addUnwatch);
