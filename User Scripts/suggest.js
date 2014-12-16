var api, map, resultRenderCache, searchboxesSelectors, $searchRegion = $('#simpleSearch, #searchInput').first(),
	$searchInput = $('#searchInput');


function computeResultRenderCache(context) {
	var $form, baseHref, linkParams;
	$form = context.config.$region.closest('form');
	baseHref = $form.attr('action');
	baseHref += baseHref.indexOf('?') > -1 ? '&' : '?';
	linkParams = {};
	$.each($form.serializeArray(), function (idx, obj) {
		linkParams[obj.name] = obj.value;
	});
	return {
		textParam: context.data.$textbox.attr('name'),
		linkParams: linkParams,
		baseHref: baseHref
	};
}

function renderFunction(text, context) {
	if (!resultRenderCache) {
		resultRenderCache = computeResultRenderCache(context);
	}
	resultRenderCache.linkParams[resultRenderCache.textParam] = text;
	this.text(text).wrap($('<a>').attr('href', resultRenderCache.baseHref + $.param(resultRenderCache.linkParams)).attr('title', text).addClass('mw-searchSuggest-link'));
}

function specialRenderFunction(query, context) {
	var $el = this;
	if (!resultRenderCache) {
		resultRenderCache = computeResultRenderCache(context);
	}
	resultRenderCache.linkParams[resultRenderCache.textParam] = query;
	if ($el.children().length === 0) {
		$el.append($('<div>').addClass('special-label').text(mw.msg('searchsuggest-containing')), $('<div>').addClass('special-query').text(query)).show();
	} else {
		$el.find('.special-query').text(query);
	}
	if ($el.parent().hasClass('mw-searchSuggest-link')) {
		$el.parent().attr('href', resultRenderCache.baseHref + $.param(
			resultRenderCache.linkParams) + '&fulltext=1');
	} else {
		$el.wrap($('<a>').attr('href', resultRenderCache.baseHref + $.param(resultRenderCache.linkParams) + '&fulltext=1').addClass('mw-searchSuggest-link'));
	}
}


function myresponse(text)
{
	var wpTextbox1 = $("#wpTextbox1");
	var wikitext = wpTextbox1.val();
	var index = document.getElementById("wpTextbox1").selectionStart;
	wpTextbox1.val(wikitext.substring(0, index)+text+wikitext.substring(index));
}






searchboxesSelectors = ['#searchInput', '#powerSearchText', '#searchText', '.mw-searchInput', '#wpTextbox1'];
$(searchboxesSelectors.join(', ')).suggestions({
	fetch:
	function (query, response)
	{
		//alert(response);
		var wpTextbox1 = $("#wpTextbox1");
		if (wpTextbox1.length && wpTextbox1.is(":focus") === true)
		{
			var wikitext = wpTextbox1.val();
			NameSpace = "";
			var index = document.getElementById("wpTextbox1").selectionStart;
			if (index >= 2)
			{
				var leftGood = false, rightGood = false;
				var ind;
				var myquery = "";
				for(ind = index-1; ind>=0 && /[A-zა-ჰа-я\-]/.test(wikitext[ind]); ind--)
					myquery = wikitext[ind] + myquery;

				if (ind >= 1 && wikitext.substr(ind - 1, 2) == "{{") leftGood = true;
				ind=index;
				if (ind == wikitext.length || /\s/.test(wikitext[ind]) ) rightGood=true;
				if (myquery.length > 0 && leftGood && rightGood)
				{
					NameSpace = "Template:";
					query = myquery;
				}
				else return ;
			}
		}
		var node = this[0];
		api = api || new mw.Api();
		$.data(node, 'request', api.get({
			action: 'opensearch',
			search: NameSpace + query,
			namespace: 0,
			suggest: ''
		}).done(function (data) {
			//if (myquery.length > 0 && leftGood && rightGood) alert ("data: " + data);
			//alert ("data[1]: " + data[1]);
			if (myquery.length > 0 && leftGood && rightGood) myresponse(data);
		}));
	},
	cancel: function () {
		var node = this[0],
			request = $.data(node, 'request');
		if (request) {
			request.abort();
			$.removeData(node, 'request');
		}
	},
	result: {
		render: renderFunction,
		select: function () {
			return true;
		}
	},
	cache: true,
	highlightInput: true
}).bind('paste cut drop', function () {
	$(this).trigger('keypress');
}).each(function () {
	var $this = $(this);
	$this.data('suggestions-context').data.$container.css('fontSize', $this.css('fontSize'));
});

$searchInput.
suggestions({
	special: {
		render: specialRenderFunction,
		select: function ($input) {
			$input.closest('form').append($('<input type="hidden" name="fulltext" value="1"/>'));
			return true;
		}
	},
	$region: $searchRegion
});
$searchInput.closest('form').find('.mw-fallbackSearchButton').remove();
