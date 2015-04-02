// Author : Dixtosa
// Known users of this script: User:Dixtosa/minorEdits.js
 
function doNotInterpertSpecialCharacters(wikitext)
{
	//making sure some of the <data> will not be interpreted
	wikitext = wikitext.replace (new RegExp("&", "g"), "&amp;"); //for entities
	wikitext = wikitext.replace (new RegExp("<", "g"), "&lt;"); //for comments
	return wikitext;
}
function XMLize(wikitext)
{
	wikitext = doNotInterpertSpecialCharacters(wikitext);
 
	var wikilist = wikitext.split("\n");
	var oldLevel = 1;
	var wikixml = "<xml><data>";
	for (var i = 0, line = wikilist[0]; i < wikilist.length; i++, line = wikilist[i])
	{
		if (line[line.length - 1] == line[0] && line[0] == '=')
		{
			wikixml += "</data>";
			var curLevel = (line.split ("=").length - 1) / 2;
			if (oldLevel + 2 <= curLevel)
				return alert("something wrong in wikitext");
 
			if (oldLevel >= curLevel) {
				wikixml += Array (oldLevel - curLevel + 2).join("</section>");
			}
			oldLevel = curLevel;
			wikixml += "<section class = '" + line.replace(/=/g, "") + "' level = '" + oldLevel + "'>";
			wikixml += "<data>";
		}
		else
		{
			wikixml += line;
		}
		wikixml += "\n";
	}
 
	//close sections. 
	wikixml += "</data>";
	var curLevel = 2;
	if (oldLevel >= curLevel) {
		wikixml += Array (oldLevel - curLevel + 2).join("</section>");
	}			
	wikixml += "</xml>";
	wikixml = $($.parseXML(wikixml));
	return wikixml;
}
 
 
 
function deXMLize(wikixml)
{
	wikixml.find("section").map(function(){ 
		var This = $(this);
		var header = This.attr("class");
		var level = parseInt(This.attr("level"));
		level = Array(level + 1).join("=");
		This.prepend(level + header + level);
	});
	return wikixml.text().slice(0, -1);
}
 
//START of OPERATIONS ON XML
function splitByTemplateUse(wikixml)
{	
	wikixml.find("data").each( function() {
		var elem = $(this);
		var txt = doNotInterpertSpecialCharacters(elem.text());
		//nowiki can also be employed :?
		txt = txt.replace (new RegExp("{{", "g"), "<templateuse>{{");
		txt = txt.replace (new RegExp("}}", "g"), "}}</templateuse>");
		elem.html(txt);
	});
	wikixml.find("data").contents().filter(function(){ return this.nodeType == 3; }).wrap("<notemplate/>")
	return wikixml;
}
//END of OPERATIONS ON XML
 
 
 
if (mw.config.values.wgPageName == "User:Dixtosa/XMLize.js/test" && mw.config.values.wgAction == "edit")
{
	try
	{
		var wpTextbox1 = $("#wpTextbox1");
		var new_wpTexbox1 = deXMLize(XMLize(wpTextbox1.text()));
		if (new_wpTexbox1 != wpTextbox1.text())
		{
			console.log(new_wpTexbox1);
			throw "mismatch between original and deXMLized XMLized original wikitext\n";
		}
		alert("XMLization works!");
	}
	catch(e)
	{
		alert (e);
	}
}