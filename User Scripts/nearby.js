// complete rewrite of hippietrail's obsolete [[User:Hippietrail/nearbypages.js]].
// TODO: query only when visible


function WiktNearby() {
	this.hasDiacritics = ["English", "French"]; //these languages have weird sortkey generation procedure
	this.hasWeirderSortkeyGeneration = ["Japanese"]; //these languages have even weirder sorkey generation mechanism than the ones listed above
	this.needFetchCurSortkeys = false;
	this.sortkeys = {}; //[lang] -> sortkey
	
	// entry point
	this.initialize = function() {
		mw.util.addCSS(".loader{border:3px solid #ccc;border-top:3px solid #7a0000;border-radius:50%;width:6px;height:6px;animation:spin 0.9s linear infinite}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}");
		
		var that = this;
		var pairs;
		if (!window.tabbedLanguages)
			pairs = this.getLanguageElementPairs();
		else
			pairs = this.getLanguageElementPairsForTabbed();

		pairs.forEach(function(pair){
			var lang = pair.lang;
			var $elem = pair.elem;
			that.queryAndDisplay(lang, $elem);
		});
	};

	this.getLanguageElementPairs = function() {
		return $("#bodyContent h2>.mw-headline").map((index, headline_elem) => {
			var s = $(headline_elem);
			var lang = s.text();
			if ($.inArray(lang, this.hasWeirderSortkeyGeneration) >= 0)
				this.needFetchCurSortkeys = true;
			
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
		return $("#bodyContent .languageContainer").map((index, headline_elem) => {
			var s = $(headline_elem);
			var lang = s.attr("id"); lang = lang.substring(0, lang.length - "container".length);
			if ($.inArray(lang, this.hasWeirderSortkeyGeneration) >= 0)
				this.needFetchCurSortkeys = true;
			
			var $elem = $("<div class = 'nearbypages-container'>»&nbsp;<div class='loader'></div></div>");
			s.prepend($elem);
			s.prepend("<h3>Nearby</h3>");
			return {
				lang: lang,
				elem: $elem
			};
		}).get();
	};

	this.getSortkeyPrefix = function(lang)
	{
		console.log("getSortkeyPrefix: ", lang);
		var fetchSortkeys = () =>
		{
			if (this.sortkeys.length > 0)
				return Promise.resolve(this.sortkeys);
			
			
			var getCatsParams = {
				action: "query",
				format: "json",
				titles: mw.config.values.wgTitle,
				clprop: "sortkey",
				prop: "categories",
				clcategories: this.hasWeirderSortkeyGeneration.map(l => "Category:" + l + " lemmas").join("|")
			};
			var prms = new mw.Api().get(getCatsParams).then(r => {
				console.log("mw.Api: ", r);
				
				r.query.pages[mw.config.get("wgArticleId")].categories.forEach((val) => {
					var lang = val.title.match("Category:(.*) lemmas");
					if (lang !== null) {
						lang = lang[1];
						this.sortkeys[lang] = val.sortkeyprefix;
					}
				});
				return this.sortkeys;
			});
			return Promise.resolve(prms);
		};
		
		if (this.needFetchCurSortkeys)
			return Promise.resolve(fetchSortkeys().then(sortkeys => sortkeys[lang]));
		else
			return Promise.resolve(mw.config.values.wgTitle);
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
			cmsort: "sortkey"
		};
		
		this.getSortkeyPrefix(lang).then(function(title) {
			console.log("title: " + title);
			params["cmstartsortkeyprefix"] = title;
			return params;
		}).then(function(params)
		{
			var nextStuff, prevStuff;
			new mw.Api().get(params).then(function(response) {
				response.query.categorymembers.shift();
				nextStuff = response.query.categorymembers.map(item => $("<a></a>").attr("href", mw.util.getUrl(item.title)).text(item.title)[0].outerHTML).join(" • ");
				params.cmdir = "desc";
				return new mw.Api().get(params);
			}).then(function(response) {
				response.query.categorymembers.reverse();
				if ($.inArray(lang, that.hasDiacritics) < 0)
					response.query.categorymembers.pop();
				else
					response.query.categorymembers.shift();
				prevStuff = response.query.categorymembers.map(item => $("<a></a>").attr("href", mw.util.getUrl(item.title)).text(item.title)[0].outerHTML).join(" • ");
				var cur = "<strong class='selflink'>" + mw.config.values.wgTitle + "</strong>";
				$elem.html("»&nbsp;" + prevStuff + " • " + cur + " • " + nextStuff);
			});
		});
	};
}

if (mw.config.values.wgNamespaceNumber === 0)
	$(() => {
		mw.loader.using(['mediawiki.util', 'mediawiki.api'], () => {
			new WiktNearby().initialize();
		});
	});
