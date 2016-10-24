// almost complete rewrite of hippietrail's obsolete [[User:Hippietrail/nearbypages.js]].
// Uses MW API. and needs two queries per language
// TODO: query only when visible


function WiktNearby() {
	this.hasDiacritics = ["English", "French"]; //these languages have weird sortkey generation procedure

	// entry point
	this.execute = function() {
		mw.util.addCSS(".loader{border:3px solid #ccc;border-top:3px solid #7a0000;border-radius:50%;width:6px;height:6px;animation:spin 0.9s linear infinite}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}");
		
		var that = this;
		var pairs;
		if (!window.tabbedLanguages)
			pairs = this.getLanguageElementPairs();
		else
			pairs = this.getLanguageElementPairsForTabbed();

		$.each(pairs, function(index, pair){
			var lang = pair.lang;
			var $elem = pair.elem;
			that.queryAndDisplay(lang, $elem);
		});
	};

	this.getLanguageElementPairs = function() {
		return $("#bodyContent h2>.mw-headline").map(function() {
			var s = $(this);
			var lang = s.attr("id");
			var $elem = $("<div class = 'nearbypages-container'>»&nbsp;<div class='loader' style='display:inline-block;'></div></div>");
			s.parent().after($elem);
			s.parent().after("<h3>Nearby</h3>");
			return {
				lang: lang,
				elem: $elem
			};
		}).get();
	};

	this.getLanguageElementPairsForTabbed = function() {
		return $("#bodyContent .languageContainer").map(function() {
			var s = $(this);
			var lang = s.attr("id"); lang = lang.substring(0, lang.length - "container".length);
			var $elem = $("<div class = 'nearbypages-container'>»&nbsp;<div class='loader'></div></div>");
			s.prepend($elem);
			s.prepend("<h3>Nearby</h3>");
			return {
				lang: lang,
				elem: $elem
			};
		}).get();
	};

	this.queryAndDisplay = function(lang, $elem) {
		var that = this;

		if (!window.NearbyPagesConfig) window.NearbyPagesConfig = {};
		var quantity = window.NearbyPagesConfig.quantity || 5;

		var params = {
			action: "query",
			cmlimit: quantity + 1,
			format: "json",
			list: "categorymembers",
			cmtitle: "Category:" + lang + " lemmas",
			cmstartsortkeyprefix: mw.config.values.wgTitle,
			cmsort: "sortkey"
		};

		new mw.Api().get(params).done(function(response) {
			response.query.categorymembers.shift();
			var nextStuff = response.query.categorymembers.map(item => $("<a></a>").attr("href", "http://en.wiktionary.org/wiki/" + item.title).text(item.title)[0].outerHTML).join(" • ");

			params.cmdir = "desc";
			new mw.Api().get(params).done(function(response) {
				response.query.categorymembers.reverse();
				if ($.inArray(lang, that.hasDiacritics) < 0)
					response.query.categorymembers.pop();
				else
					response.query.categorymembers.shift();

				var prevStuff = response.query.categorymembers.map(item => $("<a></a>").attr("href", "http://en.wiktionary.org/wiki/" + item.title).text(item.title)[0].outerHTML).join(" • ");
				var cur = "<strong class='selflink'>" + mw.config.values.wgTitle + "</strong>";

				$elem.html("»&nbsp;" + prevStuff + " • " + cur + " • " + nextStuff);
			});
		});
	};
}

// we need a globally visible JSONP callback
var wiktNearby;

if (mw.config.values.wgNamespaceNumber === 0)
	$(function() {
		wiktNearby = new WiktNearby();
		wiktNearby.execute();
	});
