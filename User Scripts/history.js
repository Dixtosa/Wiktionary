//[[User:Dixtosa/history]]

function historyjs_deleteTerm(elem)
{
	let li = $(elem).parent();
	let term = li.find("a.hj_termLink").text().replace(/ /g, "_");
	localStorage["hj_" + historyjs_curlang] = localStorage["hj_" + historyjs_curlang].replace(":" + term + ":", ":");
	li.hide(500);
}

function historyjs_changeLanguage(lang)
{
	historyjs_curlang = lang;
	historyjs_historyPage();
}

function historyjs_historyPage()
{
	let html = "";
	html += "<div id = 'historyjs_languages'><ul></ul></div>";
	html += "<div id = 'historyjs_terms'><ul></ul></div>";
	$("#mw-content-text").html(html);

	historyjsIncludeLanguages.forEach(function(lang)
	{
		$("#historyjs_languages ul").append(
			$("<li></li>").append($("<a></a>").text(lang).click(() => {historyjs_changeLanguage(lang);}))
		);
		if (lang != historyjs_curlang) return;
		
		lang = "hj_" + lang;
		localStorage[lang].split(":").slice(1, -1).forEach((term, index) => {
			let deleteLink = $(`<a href ="#" onclick = "historyjs_deleteTerm(this);">delete</a>`);
			let termLink = $(`<a class='hj_termLink'></a>`).text(term.replace(/_/g, " ")).attr("href", mw.util.getUrl(term));
			$("#historyjs_terms ul").prepend($("<li></li>").append(deleteLink).append(" • ").append(termLink));
		});
	});
}

if (typeof historyjsIncludeLanguages == "undefined")
	historyjsIncludeLanguages = ["English", "Russian"];

if (mw.config.values.wgAction == "view")
{
	let pageName = mw.config.values.wgPageName;
	if (pageName == "User:" + mw.config.values.wgUserName + "/history")
	{
		historyjs_curlang = historyjsIncludeLanguages[0];

		historyjs_historyPage();
	}
	else if (mw.config.values.wgNamespaceNumber === 0)
	{
		//$.ready(function() {
			historyjsIncludeLanguages.forEach(function(lang)
			{
				if ($("#" + lang).length > 0)
				{
					lang = "hj_" + lang;
					if (typeof localStorage[lang] == "undefined") localStorage[lang] = ":";
					if (localStorage[lang].search(":" + pageName + ":") == -1)
					{
						localStorage[lang] += pageName + ":";
					}
				}
			});
		//});
	}
}
