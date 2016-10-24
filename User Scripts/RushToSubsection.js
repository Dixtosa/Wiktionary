if (['Watchlist', 'Recentchanges', 'Recentchangeslinked'].indexOf(mw.config.values.wgCanonicalSpecialPageName) > -1
	&& mw.config.values.wgAction == 'view' ) 
$(() => {
	$(".mw-changeslist ul li .mw-title a").attr("href", function() {
		let rightArrowLink = $(this).parent().parent().find(".autocomment").parent().prev();
		if (rightArrowLink.length == 1) return rightArrowLink.attr("href");
	});
});
