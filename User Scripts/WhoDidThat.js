//Description: A new button in the toolbar helps to trace the user who caused the revision including the selected text
//To-do: expand templates?
//To-do: use binary-search instead of linear probing
//To-do: problems with deleted revisions

//working urls:
//https://en.wiktionary.org/w/api.php?titles=???????&action=query&prop=revisions&rvlimit=max
//https://en.wiktionary.org/w/api.php?titles=???????&action=query&prop=revisions&rvlimit=max&rvprop=ids|content
//https://en.wiktionary.org/w/api.php?titles=???????&action=query&prop=revisions&rvlimit=max&format=json
//https://www.mediawiki.org/wiki/API:Revisions


if (mw.config.values.wgAction == "view"){
	mw.loader.using( ['mediawiki.util'] ).then( function () {
		mw.util.addPortletLink( 'p-tb', 'javascript:WhoDidThat();', 'Who did that? (blame)', 'WhoDidThatJsBtn', "Find out who introduced selected text?", "");
	});	
}

function WhoDidThat()
{
	let text = window.getSelection().toString();
	if (text === "") mw.notify("Nothing is selected on the page!");
	else goToRevision(text);

	
	mw.loader.load("mediawiki.notify");
	//inner functions
	function search_algorithm(text, revisions)
	{
		if (revisions.length <= 1) return 0; 
		
		for (var i = 1; i < revisions.length; i++)
		{
			if (revisions[i].texthidden !== undefined) continue;
			if (revisions[i]["*"].search(text) == -1) return revisions[i - 1].revid;
		}
		return -1;
	}
	
	function goToRevision(text, pContinueData)
	{
	
		mw.notify("The script may take some time...");
		
		var params = {
				'titles' : mw.config.values.wgPageName,
				'action' : 'query',
				'prop' : 'revisions',
				'rvlimit' : 'max',
				'rvprop': 'ids|content', //'ids|flags|timestamp|comment|user|content',
				'format' : 'json'
		};
		if (pContinueData && pContinueData.rvcontinue)
			params.rvcontinue = pContinueData.rvcontinue;
		
		$.get(mw.util.wikiScript( 'api' ), params, function( data ) {
					var continueData = data.continue;
					var articleId = mw.config.values.wgArticleId;
					var revisions = data.query.pages[articleId].revisions;
					var ans = search_algorithm(text, revisions);
					if (ans === -1 && continueData)
					{
						return goToRevision(text, continueData);
					}
					switch(ans)
					{
						case 0:
							alert("revisions.length <= 1");
							break;
						case -1:
							alert("from the beginning");
							break;
						default:
							location.href = "/w/index.php?title=" + articleId + "&diff=" + ans;
							break;
					}
			}).fail(function( xhr ) {
					alert( 'Error    Request failed.' );
			});
	}
}
