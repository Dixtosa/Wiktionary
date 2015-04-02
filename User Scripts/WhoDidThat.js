//Description: A new button in the toolbar helps to trace the user who caused the revision including the selected text
//To-do: expand templates
//To-do: use binary-search instead of linear probing
//To-do: implement continuation


//working urls:
//https://en.wiktionary.org/w/api.php?titles=???????&action=query&prop=revisions&rvlimit=max
//https://en.wiktionary.org/w/api.php?titles=???????&action=query&prop=revisions&rvlimit=max&rvprop=ids|content
//https://en.wiktionary.org/w/api.php?titles=???????&action=query&prop=revisions&rvlimit=max&format=json
//https://www.mediawiki.org/wiki/API:Revisions

var text;
var page = mw.config.values.wgPageName;

function get_revision(revid)
{
	var ans = "";
	$.ajax({
			'url' : mw.util.wikiScript( 'index' ),
			'data': {
					'action' : 'raw',
					'title' : page,
					'oldid' : revid
			},
			'type': 'GET',
			'success': function( data ) { ans = data; } ,
			'error ': function( xhr ) { alert( 'Error    Request failed.' );} ,
			async:false
	});
	return ans;
}

function WhoDidThat()
{
	text = window.getSelection().toString();
	getHistory();
}

function getHistory()
{
	$.ajax({
			'url' : mw.util.wikiScript( 'api' ),
			'data' : {
				'titles' : page,
				'action' : 'query',
				'prop' : 'revisions',
				'rvlimit' : 'max',
				'format' : 'json'
			},
			'type' : 'GET',
			'success': function( data ) {
					var pageid = Object.keys(data.query.pages)[0];
					var revisions = data.query.pages[pageid].revisions;
					var revids = revisions.map(function(rev){ return rev.revid; });
					var ans = algorithm (text, revids);
					switch(ans)
					{
						case 0:
							alert("revisions.length <= 1");
							break;
						case -1:
							alert("from the begginng");
							break;
						default:
							//alert("revision number: " + ans);
							location = "https://en.wiktionary.org/w/index.php?title=" + page + "&diff=" + ans;
							break;
					}
			},
			'error ': function( xhr ) {
					alert( 'Error    Request failed.' );
			}
	});
	alert("It will take some time...");
	alert("Really.");
}

function algorithm(text, revisions)
{
	if (revisions.length <= 1) return 0; 
	
	for (var i = 1; i < revisions.length; i++)
	{
		//i - 1 contains 
		//check if i contains too
		if (get_revision(revisions[i]).search(text) == -1) return revisions[i - 1];
	}
	return -1;
}

if (mw.config.values.wgAction == "view")
	mw.util.addPortletLink( 'p-tb', 'javascript:WhoDidThat();', 'Who Did that?', 'id?', "", "");