AJS.toInit(function ($) {
   $("#includeServerLogs").click(function (e) {
        var serverIncludeBox = $(this);
        if (serverIncludeBox.prop('checked')) {
            $("#serverLogsDirectory").parent().fadeIn();
        } else {
            $("#serverLogsDirectory").parent().fadeOut();
        }
    });
});