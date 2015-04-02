//Description: inserts a random word from [[User:Ungoliant MMDCCLXIV/missing translations]] type of lists to the left of "pt-userpage".
 
var rnd = Math.floor(Math.random() * 3000);
var missingLink = "User:Ungoliant MMDCCLXIV/missing translations";
var missingLang = "ka";
var missingURL = missingLink + "/" + missingLang;
 
function get_wikitext(pagename) {
    var ans;
    $.ajax({
        url: mw.util.wikiScript('index'),
        data: {
            action: 'raw',
            title: pagename,
        },
        type: 'GET',
        success: function(data) {
            ans = (data);
        },
        error: function(xhr) {
            alert('Error: Request failed.');
        },
        async: false
    });
    return ans;
}
 
if (localStorage[missingURL] === undefined)
    localStorage[missingURL] = get_wikitext(missingURL);
 
var data = localStorage[missingURL];
var rnd_term = $.trim(data.split("# ")[rnd]).replace ("[[", "").replace ("]]", "");
var link_rnd_term = rnd_term.replace("(", "").replace(")", "").replace("(", "").replace(/\d/g, "");
mw.util.addPortletLink('p-personal', "/wiki/" + link_rnd_term, rnd_term, 'rndID', "0idea", "", "#pt-userpage");
$("[title=0idea]").css({color:"gray"}); //LOL