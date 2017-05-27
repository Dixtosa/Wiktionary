// Descriptions   : A geek's shortcuts Ctrl+S saves and Ctrl+X deletes current line
// [[Category:Wiktionary scripts|s]]

function CtrlX(textarea)
{
	var lines = textarea.val().split("\n");
	var sz = 0;
	var s = document.getElementById("wpTextbox1").selectionStart;
	var e = document.getElementById("wpTextbox1").selectionEnd;

	if (e != s) return false;

	var newval = "";
	var newpos = -1;
	for (var i = 0; i < lines.length; i++)
	{
		if (sz <= s && s <= sz + lines[i].length)
			newpos = sz;
		else
			newval += lines[i] + "\n";
		sz += lines[i].length + 1;
	}
	textarea.val(newval);
	document.getElementById("wpTextbox1").selectionStart = newpos;
	document.getElementById("wpTextbox1").selectionEnd = newpos;
	textarea.focus();
	return true;
}

function CtrlS()
{
	$("#wpSave").click();
	return true;
}

if (mw.config.values.wgAction == "edit")
{
	$("#wpTextbox1").keydown( function(event){
		var performed = 0;
		if (event.ctrlKey && event.which == 88) performed |= CtrlX($(this));
		if (event.ctrlKey && event.which == 83) performed |= CtrlS();
		if (performed === 1) {
			event.preventDefault();
			return false;
		}
		return true;
	});
}
