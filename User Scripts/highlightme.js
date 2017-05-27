// Real description    : highlights your username in history and adds "show bots" checkbox
// Problems/to-do      : maybe a button somewhere "show my contrib" instead of highlighting
// Dependency          : ES6

if (mw.config.values.wgAction == "history")
{
	$( () => {
		var username = mw.config.values.wgUserName;
		$(".mw-userlink").filter((i, elem) => elem.text == username).css({"color" : "black", "font-weight" : "bold"});
		$("#mw-history-compare .historysubmit").first().after("show bots").after($("<input id='show-bots' type='checkbox' checked/>").change(() => {
			$(".mw-userlink").filter((i, elem) => elem.text.toUpperCase().endsWith("BOT")).parentsUntil("#pagehistory").toggle(); // see talk page;
		}));
	});
}
