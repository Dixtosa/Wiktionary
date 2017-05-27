// todo: identify posts by section name too
// <nowiki>

if (mw.config.values.wgAction == 'view')
$(function(){
	let enabledOnPagesRegex = /^Wiktionary:/;
	
	if (['Contributions'].indexOf(mw.config.values.wgCanonicalSpecialPageName) > -1)
	mw.loader.using("moment", function () {
		$(".mw-contributions-list li a.mw-contributions-title").on("click auxclick", function(){
			let editTimestamp = moment($(this).parent().find("a.mw-changeslist-date").text(), "HH:mm, D MMMM YYYY");
			let signature = editTimestamp.utc().format("HH:mm, D MMMM YYYY");
			let signature_secondary = editTimestamp.subtract(1, "minutes").utc().format("HH:mm, D MMMM YYYY");
			localStorage["WT:skipToPost.js:signature-primary"] = signature;
			localStorage["WT:skipToPost.js:signature-secondary"] = signature_secondary;
		});
	});
	
	if (['Watchlist'].indexOf(mw.config.values.wgCanonicalSpecialPageName) > -1)
	mw.loader.using("moment", function(){
		new mw.Api().get({
			"action": "query",
			"format": "json",
			"list": "watchlist",
			"wlprop":"ids|title|user|timestamp",
			"wlallrev":"false",
			"wlshow":"!bot",
			"wllimit": 150}).then(function(response){
				$(".mw-changeslist li .mw-title a").on("click auxclick", function(){
					let elem = $(this);
					let revId = elem.parentsUntil("li").parent().find(".mw-changeslist-diff").attr("href").match(/&diff=(\d+)&/)[1];
					let f = response.query.watchlist.filter(function(e){ return e.revid == revId;})[0];
					if (f) {
						let editTimestamp = moment(f.timestamp);// "2017-05-15T17:21:57Z";
						let signature = editTimestamp.utc().format("HH:mm, D MMMM YYYY");
						let signature_secondary = editTimestamp.subtract(1, "minutes").utc().format("HH:mm, D MMMM YYYY");
						localStorage["WT:skipToPost.js:signature-primary"] = signature;
						localStorage["WT:skipToPost.js:signature-secondary"] = signature_secondary;
					}
				});
			});
		});
	
	if (!mw.config.values.wgPageName.match(enabledOnPagesRegex)) return;
	var timestampToSearch = localStorage["WT:skipToPost.js:signature-primary"];
	var timestampToSearch_secondary = localStorage["WT:skipToPost.js:signature-secondary"];
	if (timestampToSearch)
	{
		var possiblePosts = $(`p:contains('${timestampToSearch}'),li:contains('${timestampToSearch}'),dd:contains('${timestampToSearch}')`);
		if (possiblePosts.length === 0) {
			timestampToSearch = timestampToSearch_secondary;
			possiblePosts = $(`p:contains('${timestampToSearch}'),li:contains('${timestampToSearch}'),dd:contains('${timestampToSearch}')`);
		}
		if (possiblePosts.length === 0)
			mw.notify(`skipToPost.js: timestamp not found on the page (${timestampToSearch})`);
		else
		{
			$(possiblePosts.last()[0].childNodes).each(function(){
				var elem = $(this);
				if (elem.find(":contains(' (UTC)')").length === 0) { elem.wrap("<span class='lamedixtosa'>"); }
			});
			$(".lamedixtosa").wrapAll( "<div id='SkipToPostJs-highlighted-post' style='color: green; border: lime 1px solid; border-radius: 10px;' />");
			window.location.hash="#SkipToPostJs-highlighted-post";
		}
		delete localStorage["WT:skipToPost.js:signature-primary"];
		delete localStorage["WT:skipToPost.js:signature-secondary"];
	}
});
// </nowiki>
