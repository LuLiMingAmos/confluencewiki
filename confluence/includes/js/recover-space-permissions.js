AJS.toInit(function ($) {
    var recoverPermissionsLinks = AJS.$('#space-permissions-table .recover-permissions-link'),
        user = AJS.Meta.get("remote-user");

    recoverPermissionsLinks.on('click', function (event) {

        var $link = AJS.$(this),
            spaceKey = $link.data('space-key'),
            dialog = new AJS.Dialog({
                width: 400,
                height: 210,
                id: "recover-permissions-dialog",
                closeOnOutsideClick: true
            });


        setUpDialog(dialog, user, spaceKey);
        dialog.show();

        event.preventDefault();
    });

    var setUpDialog = function(dialog, user, spaceKey){
        // dialog code
        dialog.addHeader(AJS.I18n.getText("admin.defaultspacepermissions.spaces.recoverpermissions.dialog.title"));

        dialog.addPanel("message", "<p>" + AJS.I18n.getText("admin.defaultspacepermissions.spaces.recoverpermissions.dialog.content") + "</p>", "recover-permissions-panel-body");

        dialog.addButton(AJS.I18n.getText("ok"), function (dialog) {
            AJS.safe.ajax({
                type : 'POST',
                url : AJS.Meta.get("context-path") + "/admin/permissions/grantspacepermissions.action",
                data : {spaceKey: spaceKey}
            }).done(function() {
                //refresh the page to pick up new permission changes
                location.reload();

            }).fail(function() {
                AJS.log('Space Permissions: Failed to recover space permissions for ' + user + ' to the ' + spaceKey + ' space.');

            }).always(function() {
                dialog.remove();
            });
        });

        dialog.addLink(AJS.I18n.getText("cancel.name"), function (dialog) {
            dialog.remove();
        }, "#");
    };
});