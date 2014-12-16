var wikitextOld = "";
var cursorPos = -1;
var wpTextbox1 = $("#wpTextbox1");

function getCursorPosition(){
	return document.getElementById("wpTextbox1").selectionStart;
}
function setCursor(pos){
	document.getElementById("wpTextbox1").selectionStart = pos;
	document.getElementById("wpTextbox1").selectionEnd =   pos;
}
function isEditAreaActive(){
	return wpTextbox1.length && wpTextbox1.is(":focus");
}

function myUpdateTextbox(text, context, isFinal)//textbox is dummie. assumes template
{
	var wikitext = wpTextbox1.val();
	var index = getCursorPosition();
	
	if (isFinal){
		wikitextOld = "";
		cursorPos = -1;
		return ;
	}
	else
	{
		if (wikitextOld == "")
		{
			wikitextOld=wikitext;
			cursorPos = index;
		}
		else if (context.data.$container.is(':visible'))
		{
			alert("dzveli?");
			wikitext = wikitextOld;
			index = cursorPos;
		}
	}
	
	for(var l = index; l>=0 && wikitext[l]!="{"; l--); l++;
	text = text.substring(9);
	wpTextbox1.val(wikitext.substring(0, l) + text + wikitext.substring(index));
	setCursor(text.length);
}
function applicableForTemplate()
{
	var wikitext = wpTextbox1.val();
	var index = document.getElementById("wpTextbox1").selectionStart;
	var myquery="";
	if (index >= 2)
	{
		var leftGood = false, rightGood = false;
		var ind;
		var myquery = "";
		for(ind = index-1; ind>=0 && /[A-zა-ჰа-я\-]/.test(wikitext[ind]); ind--)
			myquery = wikitext[ind] + myquery;
		
		console.log(myquery);
		
		if (ind >= 1 && wikitext.substr(ind - 1, 2) == "{{") leftGood = true;
		ind=index;
		if (ind == wikitext.length || /\s/.test(wikitext[ind]) ) rightGood=true;
		
		if (myquery.length > 0 && leftGood && rightGood) return myquery;
		else return "";
	}
	else return "";
}

var hasOwn = Object.hasOwnProperty;
$.suggestions = {
	cancel: function (context) {
		if (context.data.timerID !== null) {
			clearTimeout(context.data.timerID);
		}
		if ($.isFunction(context.config.cancel)) {
			context.config.cancel.call(context.data.$textbox);
		}
	},
	hide: function (context) {
		context.data.$container.find('.suggestions-result-current').removeClass('suggestions-result-current');
		context.data.$container.hide();
	},
	restore: function (context) {
		context.data.$textbox.val(context.data.prevText);
	},
	update: function (context, delayed) {
		cursorPos = getCursorPosition();
		function maybeFetch() {
			var val = context.data.$textbox.val(),
				cache = context.data.cache,
				cacheHit;
				//alert(val + "\n\n\n" + cache + "\n\n\n" + cacheHit);
			if (val.length === 0) {
				$.suggestions.hide(context);
				context.data.prevText = '';
			} else if (val !== context.data.prevText || !context.data.$container.is(':visible')) {
				context.data.prevText = val;
				if (context.config.cache && hasOwn.call(cache, val)) {
					if (+new Date() - cache[val].timestamp < context.config.cacheMaxAge) {
						context.data.$textbox.suggestions('suggestions', cache[val].suggestions);
						cacheHit = true;
					} else {
						delete cache[val];
					}
				}
				if (!cacheHit && typeof context.config.fetch === 'function') {
					context.config.fetch.call(context.data.$textbox, val, function (suggestions) {
						context.data.$textbox.
						suggestions('suggestions', suggestions);
						if (context.config.cache) {
							cache[val] = {
								suggestions: suggestions,
								timestamp: +new Date()
							};
						}
					});
				}
			}
			$.suggestions.special(context);
		}
		$.suggestions.cancel(context);
		if (delayed) {
			context.data.timerID = setTimeout(maybeFetch, context.config.delay);
		} else {
			maybeFetch();
		}
	},
	special: function (context) {
		if (typeof context.config.special.render === 'function') {
			setTimeout(function () {
				var $special = context.data.$container.find('.suggestions-special');
				context.config.special.render.call($special, context.data.$textbox.val(), context);
			}, 1);
		}
	},
	configure: function (context, property, value) {
		var newCSS, $result, $results, $spanForWidth, childrenWidth, i, expWidth, maxWidth, text;
		switch (property) {
			case 'fetch':
			case 'cancel':
			case 'special':
			case 'result':
			case '$region':
			case 'expandFrom':
				context.config[property] = value;
				break;
			case 'suggestions':
				context.config[property] = value;
				if (context.data !== undefined) {
					if (context.data.$textbox.val().length === 0) {
						$.suggestions.hide(context);
					} else {
						context.data.$container.show();
						newCSS
							= {
								top: context.config.$region.offset().top + context.config.$region.outerHeight(),
								bottom: 'auto',
								width: context.config.$region.outerWidth(),
								height: 'auto'
							};
						context.config.expandFrom = (function (expandFrom) {
							var regionWidth, docWidth, regionCenter, docCenter, docDir = $(document.documentElement).css('direction'),
								$region = context.config.$region;
							if (context.config.positionFromLeft) {
								expandFrom = 'left';
							} else if ($.inArray(expandFrom, ['left', 'right', 'start', 'end', 'auto']) === -1) {
								expandFrom = 'auto';
							}
							if (expandFrom === 'auto') {
								if ($region.data('searchsuggest-expand-dir')) {
									expandFrom = $region.data('searchsuggest-expand-dir');
								} else {
									regionWidth = $region.outerWidth();
									docWidth = $(document).width();
									if (regionWidth > (0.85 * docWidth)) {
										expandFrom = 'start';
									} else {
										regionCenter = $region.offset().left + regionWidth / 2;
										docCenter = docWidth / 2;
										if (Math.abs(regionCenter - docCenter) < (0.10 * docCenter)) {
											expandFrom = 'start';
										} else {
											expandFrom = regionCenter > docCenter ? 'right' : 'left';
										}
									}
								}
							}
							if (expandFrom === 'start') {
								expandFrom = docDir === 'rtl' ? 'right' : 'left';
							} else if (
								expandFrom === 'end') {
								expandFrom = docDir === 'rtl' ? 'left' : 'right';
							}
							return expandFrom;
						}(context.config.expandFrom));
						if (context.config.expandFrom === 'left') {
							newCSS.left = context.config.$region.offset().left;
							newCSS.right = 'auto';
						} else {
							newCSS.left = 'auto';
							newCSS.right = $('body').width() - (context.config.$region.offset().left + context.config.$region.outerWidth());
						}
						context.data.$container.css(newCSS);
						$results = context.data.$container.children('.suggestions-results');
						$results.empty();
						expWidth = -1;
						for (i = 0; i < context.config.suggestions.length; i++) {
							text = context.config.suggestions[i];
							$result = $('<div>').addClass('suggestions-result').attr('rel', i).data('text', context.config.suggestions[i]).mousemove(function () {
								context.data.selectedWithMouse = true;
								$.suggestions.highlight(context, $(this).closest('.suggestions-results .suggestions-result'), false);
							}).appendTo($results);
							if (typeof context.config.result.render === 'function') {
								context.config.result.render.call($result, context.config.suggestions[i], context);
							} else {
								$result.
								text(text);
							}
							if (context.config.highlightInput) {
								$result.highlightText(context.data.prevText);
							}
							$spanForWidth = $result.wrapInner('<span>').children();
							childrenWidth = $spanForWidth.css('position', 'absolute').outerWidth();
							$spanForWidth.contents().unwrap();
							if (childrenWidth > $result.width() && childrenWidth > expWidth) {
								expWidth = childrenWidth + (context.data.$container.width() - $result.width());
							}
						}
						if (expWidth > context.data.$container.width()) {
							maxWidth = context.config.maxExpandFactor * context.data.$textbox.width();
							context.data.$container.width(Math.min(expWidth, maxWidth));
						}
					}
				}
				break;
			case 'maxRows':
				context.config[property] = Math.max(1, Math.min(100, value));
				break;
			case 'delay':
				context.config[property] = Math.max(0, Math.min(1200, value));
				break;
			case 'cacheMaxAge':
				context.config[property] = Math.max(1, value);
				break;
			case 'maxExpandFactor':
				context.config[property] = Math.max(1, value);
				break;
			case 'cache':
			case 'submitOnClick':
			case 'positionFromLeft':
			case 'highlightInput':
				context.config[property] = !!value;
				break;
		}
	},
	highlight: function (context, result, updateTextbox) {
		var selected = context.data.$container.find('.suggestions-result-current');
		if (!result.get || selected.get(0) !== result.get(0)) {
			if (result === 'prev') {
				if (selected.hasClass('suggestions-special')) {
					result = context.data.$container.find('.suggestions-result:last');
				} else {
					result = selected.prev();
					if (!(result.length && result.hasClass('suggestions-result'))) {
						result = selected.parents('.suggestions-results > *').prev().find('.suggestions-result').eq(0);
					}
					if (selected.length === 0) {
						if (context.data.$container.find('.suggestions-special').html() !== '') {
							result = context.data.$container.find('.suggestions-special');
						} else {
							result = context.data.$container.find('.suggestions-results .suggestions-result:last');
						}
					}
				}
			} else if (result === 'next') {
				if (selected.length === 0) {
					result = context.data.$container.find('.suggestions-results .suggestions-result:first');
					if (result.length === 0 && context.data.$container.find('.suggestions-special').html() !== '') {
						result = context.data.$container.find('.suggestions-special');
					}
				} else {
					result
						= selected.next();
					if (!(result.length && result.hasClass('suggestions-result'))) {
						result = selected.parents('.suggestions-results > *').next().find('.suggestions-result').eq(0);
					}
					if (selected.hasClass('suggestions-special')) {
						result = $([]);
					} else if (result.length === 0 && context.data.$container.find('.suggestions-special').html() !== '') {
						result = context.data.$container.find('.suggestions-special');
					}
				}
			}
			
			setCursor(cursorPos);
			selected.removeClass('suggestions-result-current');
			result.addClass('suggestions-result-current');
		}
		if (updateTextbox) {
			if (result.length === 0 || result.is('.suggestions-special')) {
				$.suggestions.restore(context);
			} else {
				if (isEditAreaActive()) myUpdateTextbox(result.data('text'), context, false);
				else{
					context.data.$textbox.val(result.data('text'));
					context.data.$textbox.change();
				}
			}
			context.data.$textbox.trigger('change');
		}
	},
	keypress: function (e, context, key) {
		var selected, 
			wasVisible = context.data.$container.is(':visible'),
			preventDefault = false;
		
		//console.log(isEditAreaActive() +""+ wasVisible+""+context.data.$container.length);
		
		switch (key) {
			case 40:
				if (isEditAreaActive() && !wasVisible)
				{
					preventDefault = false;
					break;
				}
				if (wasVisible) {
					$.suggestions.highlight(context, 'next', true);
					context.data.selectedWithMouse = false;
				} else {
					$.suggestions.update(context, false);
				}
				preventDefault = true;
				break;
			case 38:
				if (isEditAreaActive() && !wasVisible)
				{
					preventDefault = false;
					break;
				}
				if (wasVisible) {
					$.suggestions.highlight(context, 'prev', true);
					context.data.selectedWithMouse = false;
				}
				preventDefault = wasVisible;
				break;
			case 27:
				$.suggestions.hide(context);
				$.suggestions.restore(context);
				$.suggestions.cancel(context);
				context.data.$textbox.trigger('change');
				preventDefault = wasVisible;
				break;
			case 13:
				if (isEditAreaActive() && !wasVisible)
				{
					preventDefault = false;
					break;
				}
				preventDefault = wasVisible;
				selected = context.data.$container.find('.suggestions-result-current');
				$.suggestions.hide(context);
				if (selected.length === 0 || context.data.selectedWithMouse) {
					$.suggestions.cancel(context);
					preventDefault = false;
				} else if (selected.is('.suggestions-special')) {
					if (typeof context.config.special.select === 'function') {
						if (context.config.special.select.call(selected, context.data.$textbox) === true) {
							preventDefault = false;
						}
					}
				} else {
					$.suggestions.highlight(context, selected, true);
					if (typeof context.config.result.select === 'function') {
						if (context.config.result.select.call(selected, context.data.$textbox) === true) {
							preventDefault = false;
						}
					}
				}
				break;
			default:
				if (isEditAreaActive() && applicableForTemplate() == "") break;
				console.log("+");
				$.suggestions.update(context, true);
				break;
		}
		if (preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
};

$.fn.suggestions = function () {
	var returnValue, args = arguments;
	$(this).each(function () {
		var context, key;
		context = $(this).data('suggestions-context');
		if (context === undefined || context === null) {
			context = {
				config: {
					fetch: function () {},
					cancel: function () {},
					special: {},
					result: {},
					$region: $(this),
					suggestions: [],
					maxRows: 7,
					delay: 120,
					cache: false,
					cacheMaxAge: 60000,
					submitOnClick: false,
					maxExpandFactor: 3,
					expandFrom: 'auto',
					highlightInput: false
				}
			};
		}
		if (args.length > 0) {
			if (typeof args[0] === 'object') {
				for (key in args[0]) {
					$.suggestions.configure(context, key, args[0][key]);
				}
			} else if (typeof args[0] === 'string') {
				if (args.length > 1) {
					$.suggestions.configure(context, args[0], args[1]);
				} else if (returnValue === null || returnValue === undefined) {
					returnValue = (args[0] in context.config ? undefined : context.config[args[0]]);
				}
			}
		}
		if (context.data === undefined) {
			context.data = {
				timerID: null,
				prevText: null,
				cache: {},
				visibleResults: 0,
				mouseDownOn: $([]),
				$textbox: $(
					this),
				selectedWithMouse: false
			};
			context.data.$container = $('<div>').css('display', 'none').addClass('suggestions').append($('<div>').addClass('suggestions-results').mousedown(function (e) {
				context.data.mouseDownOn = $(e.target).closest('.suggestions-results .suggestions-result');
			}).mouseup(function (e) {
				var $result = $(e.target).closest('.suggestions-results .suggestions-result'),
					$other = context.data.mouseDownOn;
				context.data.mouseDownOn = $([]);
				if ($result.get(0) !== $other.get(0)) {
					return;
				}
				if (!(e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)) {
					$.suggestions.highlight(context, $result, true);
					if (typeof context.config.result.select === 'function') {
						context.config.result.select.call($result, context.data.$textbox);
					}
					setTimeout(function () {
						$.suggestions.hide(context);
					}, 0);
				}
				context.data.$textbox.focus();
			})).append($('<div>').addClass('suggestions-special').mousedown(function (e) {
				context.data.mouseDownOn = $(e.target).closest('.suggestions-special');
			}).mouseup(function (e) {
				var $special = $(e.target).closest(
						'.suggestions-special'),
					$other = context.data.mouseDownOn;
				context.data.mouseDownOn = $([]);
				if ($special.get(0) !== $other.get(0)) {
					return;
				}
				if (!(e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)) {
					if (typeof context.config.special.select === 'function') {
						context.config.special.select.call($special, context.data.$textbox);
					}
					setTimeout(function () {
						$.suggestions.hide(context);
					}, 0);
				}
				context.data.$textbox.focus();
			}).mousemove(function (e) {
				context.data.selectedWithMouse = true;
				$.suggestions.highlight(context, $(e.target).closest('.suggestions-special'), false);
			})).appendTo($('body'));
			$(this).attr('autocomplete', 'off').keydown(function (e) {
				context.data.keypressed = e.which;
				context.data.keypressedCount = 0;
			}).keypress(function (e) {
				context.data.keypressedCount++;
				$.suggestions.keypress(e, context, context.data.keypressed);
			}).keyup(function (e) {
				if (context.data.keypressedCount === 0) {
					$.suggestions.keypress(e, context, context.data.keypressed);
				}
			}).blur(function () {
				if (context.data.mouseDownOn.length > 0) {
					return;
				}
				$.suggestions.
				hide(context);
				$.suggestions.cancel(context);
			});
		}
		$(this).data('suggestions-context', context);
	});
	return returnValue !== undefined ? returnValue : $(this);
};



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


function pickSearchTerm(WikiText)
{
	if (isEditAreaActive())
	{
		var query = applicableForTemplate();
		if (query != "")
		{
			return "Template:" + query;
		}
	}
	return WikiText;
}

searchboxesSelectors = ['#searchInput', '#powerSearchText', '#searchText', '.mw-searchInput', '#wpTextbox1'];
$(searchboxesSelectors.join(', ')).suggestions({
	fetch:
	function (query, response)
	{
		var node = this[0];
		api = api || new mw.Api();
		$.data(node, 'request', api.get({
			action: 'opensearch',
			search: pickSearchTerm(query),
			namespace: 0,
			suggest: ''
		}).done(function (data) {
			response(data[1]);
		}));
	},
	cancel: function ()
	{
		if (false && cursorPos>0 && isEditAreaActive())
		{
			document.getElementById("wpTextbox1").selectionStart = cursorPos - 1;
			document.getElementById("wpTextbox1").selectionEnd = cursorPos - 1;
		}
	
		var node = this[0],
			request = $.data(node, 'request');
		if (request) {
			request.abort();
			$.removeData(node, 'request');
		}
	},
	result: {
		render: renderFunction,
		select: function (text, context) {
			myUpdateTextbox(text, context, true);
			return fasle;
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
