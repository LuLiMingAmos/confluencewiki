AJS.toInit(function ($) {

    var pathTextBox = $("#backupPath");

    $("#backupOption\\.default").click(function(e) {
        pathTextBox.val($("#defaultPath").val());
    });

    $('#backupOption\\.default').click(function (e) {
        pathTextBox.prop("disabled", true);
    });

    $('#backupOption\\.custom').click(function (e) {
        pathTextBox.prop("disabled", false);
    });

});
