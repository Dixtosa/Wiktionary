// Description         : this is a very small script that does one thing, but does it well. Unix FTW. 
// Real description    : adds unwatch button between "diff" and "hist"
// Idea by             : when [[User:Hippietrail]]'s version stopped working I reimplemented it.
// Problems/to-do      : None
// Dependency          : None
// UserPrefs           : None 

function unwatch(Title)
{
	let title = decodeURIComponent(Title);
	new mw.Api().unwatch(title).done (function( data ) {
		if ( data && data.message.search ("been removed from") > 0) {
			$(`.mw-changeslist li .mw-title:contains('${title.replace("'", "\\'")}')`).parent().hide("slow");
		} else {
			mw.notify( 'The edit query returned an error.' + JSON.stringify(data) );
		}
	})
	.fail ( function() {
		mw.notify( 'The ajax request failed.' );
	});
}
 
function addUnwatch()
{
	$("a:contains('diff')").after(function(index) {
		//I'm vegetarian
		var escapedTitle = this.title.replace("'", "%27");
		return ` | <a href='javascript: unwatch("${escapedTitle}")'>unwatch</a>`;
	});
}

if (mw.config.values.wgCanonicalSpecialPageName == 'Watchlist' && mw.config.values.wgAction == 'view' ) 
{
	mw.loader.using(['mediawiki.api.watch'], function () {
		$(addUnwatch);
	});
}
