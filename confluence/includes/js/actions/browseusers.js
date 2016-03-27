AJS.toInit(function ($) {
    // TODO - should still reset form when tab changed?
//        $("#create-user-form :text").val("");
//        $("#create-user-form :password").val("");
//        $(".error").remove();

    originalHref = location.href,
    originalTabId = $('#manage-users-tabs li.active-tab a').attr('id');

    function wireTabChangeToHistory(tabDivId) {
        $(tabDivId).find('.tabs-menu').delegate('a', 'tabSelect', function (e, data) {
            var tab = data.tab;
            if (tab.data('i-was-fired-by-memoir')) {
                tab.data('i-was-fired-by-memoir', false);
                return;
            }

            var tabId = tab.attr('id');
            var url = (tabId == originalTabId) ? originalHref : tab.attr('href').split('#')[0];

            // Update the URL to reflect the new tab
            memoir.pushState({ tabId: tabId }, '', url);
        });

        // Called when the user goes back and forward in the browser's history, switch tabs.
        memoir.bind('memoir.popstate', function(e) {
            var tab = $('#' + e.state.tabId);
            tab.data('i-was-fired-by-memoir', true);    // don't want this tab-switch to affect history.
            tab.click();
        });
    }

    var $sendEmailCheckbox = $("#sendEmail");
    var $passwordFieldGroups = $("#password, #confirm").closest(".field-group");
    function passwordDefinitionToggle(active) {
        $passwordFieldGroups.toggle(active);
    }

    $("#sendEmail").click(function() {
        passwordDefinitionToggle(!this.checked);
    });

    wireTabChangeToHistory('#manage-users-tabs');
    passwordDefinitionToggle(!$sendEmailCheckbox.is(':checked'));
});
