AJS.$(function ($) {
    var protocolsToPorts = {
        "pop3": 110,
        "pop3s": 995,
        "imap": 143,
        "imaps": 993
    };
    var $portInput = $("#port");
    $("select[name='protocol']").change(function () {
        var protocol = $(this).val();
        if (!protocolsToPorts.hasOwnProperty(protocol)) {
            alert("Protocol: " + protocol + " is not a supported protocol.");
        } else {
            $portInput.val(protocolsToPorts[protocol]);
        }
    });
});
