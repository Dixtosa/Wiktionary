// Description:   can make basic lists expandable without reloading a page
//				  can be tested here [[User:Dixtosa/Georgian protologisms]]
// Problems/Todo: see below "BAD_CODE"
// can enjoy mw.api.parse and +- character offset

let expandable = {};
expandable.changeWikitext = function(wikitext, number, text)
{
	let replaceCounter = 0;
	let prefix = "* [[";
	let suffix = "]]";
	let newlines = "\n";
	wikitext = wikitext.replace(/{{expandable(.*?)}}/g,
		function(match, capture) {
			if (replaceCounter++ == number) {
				capture = capture.split("|");
				if (capture.length == 2) {
					[prefix, suffix] = [capture[1], ""];
				}
				else if (capture.length == 3) {
					[prefix, suffix] = [capture[1], capture[2]];
				}
				else if (capture.length > 3) {
					[prefix, suffix] = [capture[1], capture[2]];

					let offsetY = capture[3].match(/y=(\d+)/);
					if (offsetY !== null) {
						newlines += "\n".repeat(parseInt(offsetY[1]));
					}
				}
				[prefix, suffix] = $.map([prefix, suffix], decodeURIComponent);
				
				return match + newlines + prefix + text + suffix;
			}
			else return match;
		}
	);
	return wikitext;
};

function insertStuff(number)
{
	let $expandable = $("#expandabledotjs" + number);
	let text = $expandable.val();
	new Editor().addEdit({
		edit: wikitext => expandable.changeWikitext(wikitext, number, text),

		redo: () => { $expandable.next().after("<ul><li>" + text + "</li></ul>"); },

		undo: () => { $expandable.next().next().remove(); },

		summary: "[[User:Dixtosa/expandable.js|expanded]]; "
	});
}

let eachCounter = -1;
$(".expandabledotjs").replaceWith(() => {
	eachCounter++;
	let textInput = $("<input type = 'text'/>").attr("id", "expandabledotjs" + eachCounter); //BAD_CODE
	let submit = $(`<input type='submit' value='+' onclick='javascript:insertStuff(${eachCounter}); return false;'>`);
	return $("<form></form>").css("display", "inline").append(textInput).append(submit);
});

$(".expandabledotjs_affix").css("display", "inline").each(function() {
	$(this).text(decodeURIComponent($(this).text()));
});
