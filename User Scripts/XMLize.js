// Author : Dixtosa
// Known users of this script: [[User:Dixtosa/minorEdits.js]]

//Lexemes (tags) are: section, category, splitter, interwikis

if (!window.WikiXmlLoaded)
{
	window.WikiXmlLoaded = true;
	function doNotInterpertSpecialCharacters(wikitext)
	{
		//making sure some of the <data> will not be interpreted
		wikitext = wikitext.replace (new RegExp("&", "g"), "&amp;"); //for entities
		wikitext = wikitext.replace (new RegExp("<", "g"), "&lt;"); //for comments
		return wikitext;
	}
	function wrapTemplate(wikixml)
	{	
		wikixml.find("data").each( function() {
			var elem = $(this);
			var txt = doNotInterpertSpecialCharacters(elem.text());
			//nowiki can also be employed :?
			txt = txt.replace (new RegExp("{{", "g"), "<template>{{");
			txt = txt.replace (new RegExp("}}", "g"), "}}</template>");
			elem.html(txt);
		});
		wikixml.find("data").contents().filter(function(){ return this.nodeType == 3; }).wrap("<notemplate/>");
		return wikixml;
	}
	
	window.WikiXml = {};
	
	window.WikiXml.defaultOptions = {
		"wrapCategory": false,
		"wrapSplitter": false,
		"wrapTemplate": false,
		"wrapInterwikis": false
	};
	
	window.WikiXml.parseWikitext = function(wikitext, options)
	{
		options = options || {};
		for (var opt in window.WikiXml.defaultOptions)
		{
			if (options[opt] === undefined) options[opt] = window.WikiXml.defaultOptions[opt];
		}
		
		wikitext = doNotInterpertSpecialCharacters(wikitext);
		
		var wikilist = wikitext.split("\n");
		var upto = wikilist.length - 1;
		if (wikilist[upto] === "")
			wikilist.pop(), upto--; //last char is always a newline in editting mode
		
		var interwikis = "";
		if (options.wrapInterwikis)
		{
			var line = wikilist[upto];
			while(/\[\[...?:.+\]\]/.test(line) && upto > 0)
			{
				interwikis = line + "\n" + interwikis;
				upto--;
				line = wikilist[upto];
			}
		}
		
		let oldLevel = 1;
		
		let wikixml = "<xml><data>";
		for (let index = 0; index <= upto; index++)
		{
			let line = wikilist[index];
			if (line[0] == '=' && line[line.length - 1] == '=')
			{
				wikixml += "</data>";
				let curLevel = (line.split ("=").length - 1) / 2;
				if (curLevel >= oldLevel + 2 && oldLevel != 1)
				{
					curLevel = oldLevel + 1;
					//myalert("something wrong in wikitext:\ncurLevel: " + curLevel + ", oldlevel: " + oldLevel + "\nline: " + line);
					//return undefined;
				}
	
				if (oldLevel >= curLevel) {
					wikixml += Array (oldLevel - curLevel + 2).join("</section>");
				}
				oldLevel = curLevel;
				let sectionName = line.replace(/=/g, "");
				if (oldLevel == 2) //language sections should have underscores for languages like Old_Georgian.
					sectionName = sectionName.replace(/ /g, "_");
				
				wikixml += "<section class = '" + sectionName + "' level = '" + oldLevel + "'>";
				wikixml += "<data>";
			}
			else
			{
				let pre = "", post = "";
				if (line == "----" && options.wrapSplitter)
				{
					pre = "</data><splitter>";
					post = "</splitter><data>";
				}
				if (line.startsWith("[[Category:") && options.wrapCategory)
				{
					pre = "</data><category>";
					post = "</category><data>";
				}
				
				wikixml += pre + line + post;
			}
			wikixml += "\n";
		}
		
		//close sections. 
		wikixml += "</data>";
		let curLevel = 2;
		if (oldLevel >= curLevel) {
			wikixml += Array (oldLevel - curLevel + 2).join("</section>");
		}
		
		wikixml += "<interwikis>" + interwikis + "</interwikis>";
		
		wikixml += "</xml>";
		wikixml = $($.parseXML(wikixml));
		
		if (options.wrapTemplate)
		{
			wikixml = wrapTemplate(wikixml);
		}
		return wikixml;
	};
	
	
	
	window.WikiXml.toWikitext = function(wikixml)
	{
		wikixml.find("section").map(function(){ 
			var This = $(this);
			var header = This.attr("class");
			var level = parseInt(This.attr("level"));
			if (level == 2)
				header = header.replace(/_/g, " ");
				
			level = Array(level + 1).join("=");
			This.prepend(level + header + level);
		});
		return wikixml.text(); //commenting out as I do not remember what it did - .slice(0, -1);
	};
	
	
	//sanity check
	window.WikiXml.test = function(options)
	{
		try
		{
			var wpTextbox1 = $("#wpTextbox1");
			var new_wpTexbox1 = WikiXml.toWikitext(WikiXml.parseWikitext(wpTextbox1.text(), options));
			if (new_wpTexbox1 != wpTextbox1.text())
			{
				console.log(new_wpTexbox1);
				throw "mismatch between original and deXMLized XMLized original wikitext\n";
			}
			myalert("test #N: XMLization works!");
		}
		catch(e)
		{
			myalert (e);
		}
	};
	if (mw.config.values.wgPageName == "User:Dixtosa/XMLize.js/test" && mw.config.values.wgAction == "edit")
	{
		window.WikiXml.test({});
		window.WikiXml.test({wrapInterwikis});
		window.WikiXml.test({wrapCategory});
	}
}
