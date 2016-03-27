AJS.toInit(function ($) {
    var dialog = null,
        createDialog = function () {
            var $createSpaceForm = $(Confluence.Templates.CreateSpace.createPersonalSpaceForm({
                    atlToken: $("#atlassian-token").prop("content")
                })),

                submitCallback = function () {
                    $createSpaceForm.submit();
                },

                dialog = new AJS.ConfluenceDialog({
                    width: 540,
                    height: 300,
                    id: 'create-personal-space-dialog',
                    closeOnOutsideClick: true,
                    onSubmit: submitCallback
                });

            dialog.addHeader(AJS.I18n.getText('create.personal.space.title'));
            dialog.addPanel("Panel 1", $createSpaceForm);

            dialog.addSubmit(AJS.I18n.getText('space.create.form.submit.button'), submitCallback);

            dialog.addCancel(AJS.I18n.getText('cancel.name'), function () {
                dialog.hide();
            });

            dialog.gotoPage(0);
            dialog.gotoPanel(0);
            return dialog;
        },

        showDialog = function () {
            if (dialog == null) {
                dialog = createDialog();
            }

            dialog.show();
            $("#create-personal-space-dialog button.button-panel-submit-button").focus();
        };

    $('.create-personal-space-link').click(function () {
        showDialog();
        return false;
    });
});
