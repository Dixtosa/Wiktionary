// <nowiki>
// Description: adds a new button "add wikipedia", which unsurprisingly adds {{wikipedia|lang=}} to every language that lacks it while the article with the same name exists there.
// TODO: only works for Georgian uk ru and hy
// TODO: does not check if there is a link already under External links

importScript("User:Dixtosa/XMLize.js");
importScript("User:Dixtosa/minorEdits.js");

var lang2wlangcode = {
	"Georgian" : "ka",
	"English":"en",
	"Ukrainian" : "uk",
	"Russian" : "ru",
	"Armenian" : "hy",
	"Mingrelian" : "xmf"
};
function exists(wlangcode, article)
{
	return $.ajax({
		'url': 'https://' + wlangcode + '.wikipedia.org/w/api.php',
		'data': {
				'action': 'mobileview', // ugly hack
				'page': article,
				'format': 'json',
				'origin': 'https://en.wiktionary.org'
		},
		'dataType': 'json'
		}
	);
}

function addWiki()
{
	new mw.Api()
	.edit( mw.config.values.wgPageName, function ( revision ) {
		return changePromise( revision.content )
				.then( function ( p ) {
						return { text: p.wikitext,
								summary: p.summary};
				} );
	})
	.then( function () {
		mw.notify ( 'Saved! ');
	});
}

function changePromise(wikitext)
{
	let addedCount = 0;
	let deferreds = [];
	let wikixml = WikiXml.parseWikitext (wikitext);
	let datas = wikixml.find("[level=2] > data:first-child");

	datas.each(function (i, elem) {
		let lang = $(elem).parent().attr("class");
		let code = lang2wlangcode[lang];
		if (code && $(elem).text().search("wiki") == -1)
		{
			deferreds.push(
			exists(code, mw.config.values.wgTitle).success(function(result){
				if (result && result.mobileview)
				{
					$(elem).prepend(`\n{{wikipedia|lang=${code}}}`);
					addedCount++;
				}
			}));
		}
	});
	
	return $.when(...deferreds).then(function(){
		let wikitext = WikiXml.toWikitext(wikixml);
		wikitext = clean(wikitext);
		return {
			wikitext: wikitext,
			summary: addedCount > 0 ? "[[User:Dixtosa/addWiki.js|Added]] link(s) to Wikipedia articles" : "Minor changes"
		};
	});
}

if (mw.config.values.wgNamespaceNumber === 0 && mw.config.values.wgAction == "view") 
{
	mw.loader.using(['mediawiki.api.edit'], function () {
		$( () => {
			$("#ca-talk").after("<li> <span> <a onclick = 'return addWiki();'> Add Wikipedia </a> </span> </li>");
		});
	});
}
// </nowiki>
