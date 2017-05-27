// documentation: [[Wiktionary:Grease_pit/2016/April#Editable title]]

$(function() {
    if (mw.config.values.wgAction != "view") return;
    $("#firstHeading").prop("contenteditable", "true");
    $('#firstHeading').keypress(function(e) {
        var key = e.which;
        let newTitle = $('#firstHeading').contents().get(0).textContent;
        if (key == 13) {
            window.location = "/w/index.php?search=" + newTitle + "&title=Special:Search&go=Go";
            return false;
        }
    });
});

mw.loader.using(['jquery.ui.autocomplete'], function() {
    var ctrl = $("#firstHeading");
    ctrl.autocomplete({
        source: function(request, response) {
        	var prefix = ctrl.contents().get(0).textContent;
            new mw.Api().get({
                action: 'opensearch',
                search: prefix
            }).done(function(data) {
                response(data[1]);
            });
        },
        focus: function() {
            return false;
        },
        select: function(e, ui) {
            window.location.href = "/wiki/" + ui.item.value;
            return false;
        },
        open: function() {
            $(".ui-autocomplete")
                .css({})
                .position({
                    my: "right top",
                    at: "right bottom",
                    of: ctrl,
                    offset: "0",
                    collision: 'none fit'
                })
                .find('li').css({});
        }
    });
});
