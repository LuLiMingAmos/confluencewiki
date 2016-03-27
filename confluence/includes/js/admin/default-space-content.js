AJS.toInit(function ($) {
    $("#customise-button").click(function () {
        $("form .edit-content").removeClass("hidden");
        $("form .default-content").addClass("hidden");
        $("#default-space-content-form textarea").focus();
        return false;
    })
});