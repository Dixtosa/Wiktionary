// Description         : this is a very little script and does a very little thing, but does it well.
// Real description xD : highlights your username in history (shows your contribution)
// Problems/to-do      : maybe a button somewhere "show my contrib" instead of highlighting
// Dependency          : None
// UserPrefs           : None



if (mw.config.values.wgAction == "history")
{
	$( () => {
		var username = mw.config.values.wgUserName;
		$(".mw-userlink").filter((i, elem) => elem.text == username).css({"color" : "black", "font-weight" : "bold"});
	});
}
