function expandabledotjs_changeWikitext(wikitext, number, text)
{
	var replaceCounter = 0;
	var prefix = "* [["
	var suffix = "]]";
	wikitext = wikitext.replace(/{{expandable(.*?)}}/g,
								function(match, capture)
								{
									if (replaceCounter++ == number)
									{
										capture = capture.split("|");
										if (capture.length == 2){
											prefix = capture[1];
											suffix = "";
										}
										else if (capture.length == 3) {
											prefix = capture[1];
											suffix = capture[2];
										}
										prefix = decodeURIComponent(prefix);
										suffix = decodeURIComponent(suffix);
										return match + "\n" + prefix + text + suffix;
									}
									else return match;
								}
				);
	return wikitext;
}

function insertStuff(number)
{
	var text = $("#expandabledotjs" + number).val();
	var editor = Editor();
	editor.addEdit({
 
			edit: function(wikitext){ return expandabledotjs_changeWikitext(wikitext, number, text); },
 
			redo: function(){ $("#expandabledotjs"+number).next().after("<ul><li>" + text + "</li></ul>"); },
 
			undo: function(){ $("#expandabledotjs"+number).next().next().remove(); },
 
			summary: "[[User:Dixtosa/expandable.js|expanded]]; "
		});
}

var eachCounter = -1;
$(".expandabledotjs").replaceWith(
	function()
	{
		eachCounter++;
		return "<form><input type = 'text' id = 'expandabledotjs" + eachCounter + "' /><input type='submit' value='+' onclick='javascript:insertStuff("+eachCounter+"); return false;'></form>";
	});
