// Description         : with a new button "AEdit" one can edit specific headers without reloading the section (or even, page)
// TO-DO               : add Open/close button
// Dependency          : jQuery
// UserPrefs           : None

AjaxEdit = {};


AjaxEdit.Click = function(sectionId, sectionName)
{
	$("#ajaxedit-textarea, #ajaxedit-saveBtn").remove();
	let hdr = $(`.ajaxedit-edit-button[section=${sectionId}]`).parent().parent();
	
	let data = {action: 'raw', title: mw.config.values.wgPageName, section: sectionId};
	return $.get(mw.util.wikiScript('index'), data).success(function(wikitext) {
		const rowHeight = Math.min(15, 1 + wikitext.split("\n").length);
		let textarea = $("<textarea></textarea>").attr({id: "ajaxedit-textarea", rows: rowHeight}).text(wikitext);
		let button = $('<button>Save</button>').attr("id", "ajaxedit-saveBtn").click(function(){
			AjaxEdit.Save(sectionId, sectionName, textarea.val()).success(function(){
				new mw.Api().get({action: "parse", page: mw.config.values.wgPageName}).done(function(response){
					var newHtml = response.parse.text["*"];
					$("#mw-content-text").html(newHtml);
					AjaxEdit.main();
				});
			});
		});
	
		$("<div></div>").append(textarea).append(button).appendTo(hdr);
	});
};


AjaxEdit.Save = function(sectionID, sectionName, sectionText)
{
	return $.ajax({
		url: mw.util.wikiScript( 'api' ),
		data: {
			format: 'json',
			action: 'edit',
			title: mw.config.values.wgPageName,
			section: sectionID,
			summary: `/* ${sectionName} */ edited using [[User:Dixtosa/AjaxEdit.js|AjaxEdit]]`,
			text: sectionText,
			token: mw.user.tokens.get('editToken')
		},
		dataType: 'json',
		type: 'POST',
		success: function( data ) {
			if ( data && data.edit && data.edit.result == 'Success' ) {
				mw.notify("successful");
			} else if ( data && data.error ) {
				mw.notify( 'Error: API returned error code "' + data.error.code + '": ' + data.error.info );
			}
		},
		error: function( xhr ) {
			mw.notify( 'Error: Request failed.' );
		}
	});
};

AjaxEdit.main = function()
{
	var cnt = 1;
	var rightBrackets = $(".mw-editsection > .mw-editsection-bracket:contains(']')");
	
	rightBrackets.each (function(){
		$item = $(this);
		var hdr = $item.parent().prev().text();
		var anchor = $('<a>Ædit</a>').addClass("ajaxedit-edit-button").attr("section", cnt).attr("href", `javascript:AjaxEdit.Click('${cnt}', '${hdr}')`);
		$item.before(", " + anchor[0].outerHTML);
		cnt++;
	});
};

if (mw.config.values.wgAction == "view")
	$(AjaxEdit.main);
