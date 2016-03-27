AJS.toInit(function ($) {
    var dialogWidth = 400;
    var dialogHeight = 250;

    Confluence.MoveBlogPostDialog = function (options) {
        var blogPostTitle = AJS.Meta.get('page-title');
        options = $.extend({
            spaceKey: AJS.Meta.get('space-key'),
            spaceName: AJS.Meta.get('space-name'),
            title: AJS.I18n.getText("move.blogpost.dialog.title"),
            buttonName: AJS.I18n.getText("move.name"),
            moveHandler: function (dialog) {
                AJS.debug("No move handler defined. Closing dialog.");
                dialog.remove();
            },
            cancelHandler: function (dialog) {
                dialog.remove();
                return false;
            }
        }, options);

        var dialog = AJS.ConfluenceDialog({
            width : dialogWidth,
            height: dialogHeight,
            id: "move-blogpost-dialog"
        });

        dialog.addHeader(options.title);
        dialog.addPanel(AJS.I18n.getText("move.blogpost.dialog.panel.title"), Confluence.Templates.MoveBlogPost.dialogPanel(), "move-blogpost-dialog-panel", "move-blogpost-dialog-panel-id");

        $("#new-space").auiSelect2(Confluence.UI.Components.SpacePicker.build());

        var moveFunction = function (dialog) {
            var newSpaceKey = $("#new-space").val();
            options.moveHandler(dialog, newSpaceKey, errorHandler);
        };

        function errorHandler(error) {
            $("#move-blogpost-dialog .move-errors").empty();
            AJS.messages.error("#move-blogpost-dialog .move-errors", {
                body: error,
                closeable: false
            })
        }

        dialog.addButton(options.buttonName, moveFunction, "move-button");
        dialog.addCancel(AJS.I18n.getText("cancel.name"), options.cancelHandler);

        dialog.show();
        return dialog;
    }

    function viewBlogPostMoveHandler(dialog, newSpaceKey, errorHandler) {
        dialog = dialog.popup.element;
        dialog.addClass("waiting");
        $("button", dialog).prop("disabled", true);
        var throbber = $("<div class='throbber'></div>");
        dialog.append(throbber);
        var killSpinner = Raphael.spinner(throbber[0], 100, "#666");

        function error(message) {
            errorHandler(message);
            dialog.removeClass("waiting");
            killSpinner();
            $("button", dialog).prop("disabled", false);
        }

        function sendAnalytics(eventName) {
            AJS.trigger('analyticsEvent', {name: eventName, data: {newSpaceKey: newSpaceKey, oldSpaceKey: AJS.params.spaceKey, blogPostId: AJS.params.pageId}});
        }

        if (newSpaceKey === "") {
            error(AJS.I18n.getText("move.blogpost.dialog.no.space.selected"));
            return;
        }

        $.ajax({
            url: contextPath + "/pages/moveblogpost.action",
            type: "GET",
            dataType: "json",
            data: {
                blogPostId: AJS.params.pageId,
                spaceKey: newSpaceKey
            },
            error: function () {
                error(AJS.I18n.getText("move.blogpost.dialog.move.failed"));
                sendAnalytics('moveblogpost.ajaxError');
            },
            success: function (data) {
                var errors = [].concat(data.validationErrors || []).concat(data.actionErrors || []).concat(data.errorMessage || []);
                if (errors.length > 0) {
                    error(errors[0]);
                    sendAnalytics('moveblogpost.serverValidationError');
                    return;
                }
                sendAnalytics('moveblogpost.success');
                window.location.href = contextPath + data.blogPost.url + (data.blogPost.url.indexOf("?") >= 0 ? "&" : "?") + "moved=true";
            }
        });
    }

    $("#action-move-blogpost-dialog-link").click(function (e) {
        e.preventDefault();

        if ($("#move-blogpost-dialog").length > 0) {
            $("#move-blogpost-dialog, body > .shadow, body > .aui-blanket").remove();
        }

        new Confluence.MoveBlogPostDialog({
            moveHandler: viewBlogPostMoveHandler
        });

        return false;
    });
});