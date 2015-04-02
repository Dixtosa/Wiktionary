// Description         : Shows popup list of suggestions (templates and main namespace) when you type {{ and template name or type [[.
// Problems/to-do      : not tested yet; no way to cancel. maybe we can move popuplist to the center of screen.
// Dependency          : None
// UserPrefs           : None


var wpTextbox1;
var wikitext;
var wikitextindex;

function myselect(ui)
{
	console.log("ui.item" + JSON.stringify(ui.item));

	var l = wikitextindex; for(; l >= 0 && wikitext[l] != "{" && wikitext[l] != "["; l--); l++;
	text = ui.item.value;
	if (wikitext[l - 1] == "{")
		text = text.substring(9);

	wpTextbox1.val(wikitext.substring(0, l) + text + wikitext.substring(wikitextindex));
	wikitext = document.getElementById("wpTextbox1").value;
	document.getElementById("wpTextbox1").setSelectionRange(l+text.length, l+text.length);
}
function isEditAreaActive()
{
	return $ ("#wpTextbox1").length && $ ("#wpTextbox1").is(":focus");
}

function cutTerm()
{
	wikitext = document.getElementById("wpTextbox1").value;
	wikitextindex = document.getElementById("wpTextbox1").selectionStart;

	var NameSpace = "", query = "";
	if (isEditAreaActive())
	{
		var index = document.getElementById("wpTextbox1").selectionStart;
		if (index >= 2)
		{
			var ind;
			var myquery = "";
			for(ind = index-1; ind>=0 && /[a-zA-Zა-ჰа-яА-Я\:\-]/.test(wikitext[ind]); ind--)
				myquery = wikitext[ind] + myquery;
 			
			if (!(index == wikitext.length || /\s/.test(wikitext[index]) )) return "";
 			console.log("myquery: " + myquery);

 			if (ind >= 1) {
 				opening = wikitext.substr(ind - 1, 2);
 				if (opening == "{{") {
 					NameSpace = "Template:";
					query = myquery;
 				}
 				if (opening == "[[") {
					query = myquery;
 				}
 			}
		}
	}
	console.log("NameSpace + query: " + NameSpace + query);
	return NameSpace + query;
}
mw.loader.using('jquery.ui.autocomplete', function () {
	if (mw.config.values.wgAction != "edit") return ;
	
	wpTextbox1 = $("#wpTextbox1");
	wikitext = wpTextbox1.val();
	wikitextindex = document.getElementById("wpTextbox1").selectionStart;
	
	$('#wpTextbox1').autocomplete({
		minLength: 2,
		select: function( event, ui ) {
			myselect(ui);
			return false;
		},
		source: function (request, response) {
			$.getJSON(
				mw.util.wikiScript('api'), {
					format: 'json',
					action: 'opensearch',
					search: cutTerm()
				}, function (arr) {
					if (arr && arr.length > 1) {
						response(arr[1]);
					} else {
						response([]);
					}
				}
			);
		}
	});
});
