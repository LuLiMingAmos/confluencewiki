AJS.toInit(function($) {
    $("a#websudo-drop.drop-non-websudo").click(function()
    {
        $.getJSON($(this).attr("href"), function() {
            $("li#confluence-message-websudo-message").slideUp(function(){
                // Once done, other elements like the sidebar
                AJS.trigger('confluence.header-resized');
            });
        });
        return false;
    });
});