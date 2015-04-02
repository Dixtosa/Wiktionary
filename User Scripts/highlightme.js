// Description         : this is a very little script, but does one thing well.
// Real description xD : highlights your username in history (shows your contribution)
// Problems/to-do      : maybe a button somewhere "show my contrib" instead of highlighting
// Dependency          : None
// UserPrefs           : None
 
function highlight(uname)
{
	var me = $ (".mw-userlink").filter(function(){ return $(this).text() == uname; });
	me.css({"color" : "black", "font-weight" : "bold"});
}
 
if (mw.config.values.wgAction == "history")
    highlight(mw.config.values.wgUserName);