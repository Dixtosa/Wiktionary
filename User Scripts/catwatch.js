// Fork of [[en:w:User:ais523/catwatch.js]]
// [[User:Dixtosa/WatchedCategories.js]]
/*  For documentation and other historical stuff refer to [[en:w:User:ais523/catwatch]]
*/
 
//my work: generalized (works on every wiki)
//         modernized the script (Jquerized)
 
// "use strict"

var cwwpajax;
var KEYWORD = "<span style = 'color:red;'>[CATWATCH]</span>";
var categoryName = getNamespaceName("14");//for other wikis ))

 
function getNamespaceName(id)
{
	var ans = "";
	$.ajax({
		'url': mw.util.wikiScript( 'api' ),
		'data': {
 
				'action': 'query',
				'meta': 'siteinfo',
				'format': 'json',
				'siprop': 'namespaces'
		},
		'success': function( data ) {
					if (data && data.query && data.query.namespaces)
						ans = data.query.namespaces[id]["*"];
		},
        'async': false //deprecated :// could be changed into continuation
	});
	return ans;
}
 
function cwOntoWatchlist(curTitle, curTimestamp, category)
{ 
	curTimestamp = new Date(curTimestamp);
	
	curTimestamp.setHours(curTimestamp.getHours()+4);
	curTimestamp = curTimestamp.toISOString();
	console.log(curTimestamp);
	
	var monthname=[];
	monthname['01']="January";
	monthname['02']="February";
	monthname['03']="March";
	monthname['04']="April";
	monthname['05']="May";
	monthname['06']="June";
	monthname['07']="July";
	monthname['08']="August";
	monthname['09']="September";
	monthname['10']="October";
	monthname['11']="November";
	monthname['12']="December";
	curTimestamp = new String(curTimestamp);
 
	var mn1, mn2, mn3, mn4;
 
	// Allow for different date styles:
	// January 29, 2001
	mn1=""+monthname[curTimestamp.substr(5,2)]+" "+new Number(curTimestamp.substr(8,2))+
		", "+curTimestamp.substr(0,4);
	// 29 January 2001
	mn2=""+new Number(curTimestamp.substr(8,2))+" "+monthname[curTimestamp.substr(5,2)]+
		" "+curTimestamp.substr(0,4);
	// 2001 January 29
	mn3=""+curTimestamp.substr(0,4)+" "+monthname[curTimestamp.substr(5,2)]+
		" "+new Number(curTimestamp.substr(8,2));
	// 2001-01-29
	mn4=""+curTimestamp.substr(0,4)+"-"+curTimestamp.substr(5,2)+"-"+curTimestamp.substr(8,2);
	
	
	var a=document.getElementsByTagName("h4"); //get dates in the watchlist
	var i=a.length;
	while(i--)
	{
		if(a[i].innerHTML==mn1||a[i].innerHTML==mn2||a[i].innerHTML==mn3||a[i].innerHTML==mn4)
		{
			var temp2;
			var temp=a[i].nextSibling.firstChild;
			if(temp === null) temp=a[i].nextSibling.nextSibling.firstChild;
			
			while(temp !== null)
			{
				if(temp.tagName)
					if(temp.tagName.toLowerCase() == "li" && temp.innerHTML.substr(0, KEYWORD.length) != KEYWORD)
					{
						console.log("asd"+temp);
						temp2=temp.innerHTML.match(/<span class="mw-changeslist-date">([0-9][0-9]):([0-9][0-9])(:[0-9][0-9])?<\/span>/i);
						temp2=new Number(temp2[1])*100+new Number(temp2[2]);
						if(temp2 < new Number(curTimestamp.substr(11,2) + curTimestamp.substr(14,2))) {temp2=temp; break;}
					}
				temp2=temp; temp=temp.nextSibling;
				if (temp === null) break;
			}
			temp=document.createElement("li");
			if (temp2 === null) return;
			if(a[i].nextSibling.firstChild!==null) // IE-like whitespace handling
				a[i].nextSibling.insertBefore(temp,temp2);
			else // Firefox-like whitespace handling
				a[i].nextSibling.nextSibling.insertBefore(temp,temp2);
 
			temp.innerHTML = KEYWORD + " (diff | hist) . . <a "+
							"href='"+mw.config.get('wgScriptPath')+"/index.php?title=" + categoryName + ":" + 
							encodeURI(category) + "'>" + categoryName + ":" + category + "</a>; " + curTimestamp.substr(11,2) +
							":" + curTimestamp.substr(14,2) + " . . (+ <a " + "href='" + mw.config.get('wgScriptPath') + '/index.php?title=' 
							+ encodeURI(curTitle) + "'>" + curTitle + "</a> " + "(<a href='"+mw.config.get('wgScriptPath')+"/index.php?title=" 
							+ encodeURI(curTitle) + "&diff=last'>last</a>))";
			return;
		}
	}
}
 
var WatchedCategories;
 
function catwatch_get_wikitext(pageTitle) {
	return $.ajax({
		url: mw.util.wikiScript( 'index' ),
		data: {
			action:	 'raw',
			title: pageTitle
		},
		type: 'GET',
		async : false
	});
}

$(function()
{
	if(mw.config.get('wgCanonicalSpecialPageName') == "Watchlist")
	{
		var sr=catwatch_get_wikitext('User:' + mw.config.get('wgUserName') + '/WatchedCategories.js'); //TODO: "User"
		eval(sr.responseText);
		
		if (WatchedCategories === undefined)
		{
			if (confirm("You don't have a category watchlist yet. Do you want to create one?\n\n"+
					"(Please provide the following debug information when reporting a problem if "+
					"this message comes up when you already have a category watchlist: "+
					(sr.responseText.length < 50 ? "responseText='" + sr.responseText+"'" :
					"responseText.length="+sr.responseText.length)+", statusText='"+sr.statusText
					+"'.)"))
			location.href = mw.util.wikiScript('api') +'?title=User:' + mw.config.values.wgUserName + '/WatchedCategories.js&action=edit';
		}
		else
		{
			var i;
			var categoriesToExtract = 1;
			for(i=0; i < WatchedCategories.length; i++)
			{
				(function (curCategory){
					$.ajax({
						url : mw.util.wikiScript('api'),
						data : {
							action : "query",
							list : "categorymembers",
							cmtitle : categoryName + ':'+ curCategory,
							cmlimit : categoriesToExtract,
							cmprop : "title|timestamp",
							cmsort : "timestamp",
							cmdir : "desc",
							format :"json"
						},
						type : "get",
						success: function(data)
						{
							for (var catit = 0; catit < categoriesToExtract; catit++)
							{
								var newentry = data.query.categorymembers[catit];
								cwOntoWatchlist(newentry.title, newentry.timestamp, curCategory);
							}
						}
					});
				})(WatchedCategories[i]);
			}
		}
	}
});