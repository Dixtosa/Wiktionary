//TO-DO: see User:Dixtosa
// <nowiki>
// Closed for modification open for extension xD
deepCollection = [];


function deepCheckEnglishForCategories()
{
	var api = new mw.Api();
	var query = {
				'action': 'query',
				'titles': undefined,
				'redirects': 1,
				'prop': 'categories',
				'cllimit': 1000,
				'continue': ''
	};
	categoriesForTitles = [];
	var curPageCats = [];
	
	var defLinks = $(".defEditButton").parent().parent().find('a[href^="/wiki"]');
	query["titles"] = defLinks.map(function() { return $(this).text();}).get().join('|') + "|" + mw.config.values.wgTitle;
	
	api.get(query).then(function(result)
	{
		for (var pageid in result.query.pages) {
			var title = result.query.pages[pageid].title;
			var cats = (result.query.pages[pageid].categories || []).map(function(val, ind){ return val.title;});
			categoriesForTitles[title] = cats;
		}
		curPageCats = categoriesForTitles[mw.config.values.wgTitle] || [];		
	
		var catHtml = "";
		defLinks.each(function(){ 
			var langHeader = $(this).parentsUntil("#mw-content-text").last().prevUntil("h2").last().prev();
			var language = langHeader.find(".mw-headline").text();
			var langcode = (new LangMetadata()).cleanLangCode(language);
			var term = $(this).text();
			var cats = categoriesForTitles[term];
			
			for (var i = 0; i < cats.length; i++)
			{
				var value = cats[i].match(/Category:en:(.*)$/);
				if (value === null) continue;
				value = "Category:" + langcode + ":" + value[1];
				if (curPageCats.indexOf(value) >= 0) continue;
				catHtml += '</br> <input type="checkbox" value="' + value + '" checked data-lang = "' + language + '">' + value + " (" + this.outerHTML + ")";
			}
		});
		
		$("#sodeepjs").append("<div id = 'deep_suggestedcategories'>Suggested categories: </div>");
		$("#deep_suggestedcategories").append(catHtml);
	}, console.log);

	return function(wikitext)
	{
		var res = wikitext;
		var wikixml = WikiXml.parseWikitext(wikitext, {wrapCategory: true, wrapSplitter: true, wrapInterwikis: true});

		var checkedValues = $("#deep_suggestedcategories :checked");
		checkedValues.each(function() {
			var specificLang = wikixml.find("." + $(this).attr("data-lang"));
		
			var newWikitext = "[[" + $(this).attr("value") + "]]";
			newWikitext = "<category>" + newWikitext + "\n</category>";
			var node = specificLang.find("splitter, category, interwikis");
			if (node.length === 0)
			{
				specificLang.append(newWikitext);
			}
			else
				$(node.get(0)).before(newWikitext);
		});
		return WikiXml.toWikitext(wikixml);
	};
}
deepCollection.push(deepCheckEnglishForCategories);


var changeWikitextPlugin = [];
function deepSave(source)
{
	let summary = "edited by [[User:Dixtosa/sodeep.js|sooodeep]]";
	$(source).text("Saving");
	
	new mw.Api()
	.edit(mw.config.values.wgPageName, function ( revision ) {
		let wikitext = revision.content;
		for (var i = 0; i < changeWikitextPlugin.length; i++)
		{
			wikitext = (changeWikitextPlugin[i])(wikitext);
		}
		return {text: wikitext, summary: summary};
	})
	.then( function () {
		mw.notify ( 'Saved! ');
	});
}
function goDeep()
{
	$("#firstHeading").before("<div id = 'sodeepjs'><button type='button'  onclick = 'deepSave(this)'>Save</button></div>");
	changeWikitextPlugin = deepCollection.map(function (plugin) { return plugin(); });
}

if (mw.config.values.wgNamespaceNumber === 0 && mw.config.values.wgAction == "view")
{
	mw.loader.using(['mediawiki.api.edit'], function () {
		$( () => {
			$ ("#ca-talk").after("<li> <span> <a onclick = 'return goDeep();'> Go deep </a> </span> </li>");
		});
	});
}

// </nowiki>
