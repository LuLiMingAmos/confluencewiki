AJS.toInit(function ($) {
    $("#ellipsis").live('click', function () {
        try {
            $("#breadcrumbs .hidden-crumb").removeClass("hidden-crumb");
            $(this).addClass("hidden-crumb");
            AJS.trigger("breadcrumbs.expanded");
        } catch(e) {
            AJS.log(e);
        }
    });
});
