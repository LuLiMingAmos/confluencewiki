AJS.toInit(function($) {
    var popup,
        maxChars = 140;

    function createPopUp() {
        /** HACK: Passing in a non-falsy value results in an invalid attribute value for the dialog's height.
         * This actually results in the default browser value of 'auto' being given to the dialog.
         * This hack enables the dialog's contents to dictate its size, thus enabling better i18n support.
         */
        var notAHeight = 'idontthinksohal';
        var popup = new AJS.Dialog(650, notAHeight, "update-user-status-dialog");
        var $dialog = popup.popup.element;
        var template = $(Confluence.Templates.UserStatus.dialogContent({maxChars: maxChars}));
        popup.addHeader(AJS.I18n.getText("status.dialog.heading"));
        popup.addPanel(AJS.I18n.getText("status.dialog.panel.title"), template);
        popup.addButton(AJS.I18n.getText("status.dialog.button.update"), updateStatus, "status-update-button");
        popup.addCancel(AJS.I18n.getText("cancel.name"), function (dialog) {dialog.hide(); return false;});
        popup.setError = function(html) {
            $(".error-message", $dialog).html(html)
        };

        return popup;
    }

    function validate(text) {
        var error;

        if (!text) {
            error = AJS.I18n.getText("status.message.error.blank");
        } else if (!$.trim(text)) {
            // The message was just whitespace
            error = AJS.I18n.getText("status.message.error.onlywhitespace");
        } else if (text.length > maxChars) {
            error = AJS.I18n.getText("status.message.error.too.long", maxChars);
        }

        if (error) {
            popup.setError(error);
        }

        return !error;
    }

    function setCurrentStatus(status) {
        $(".current-user-latest-status .status-text").html(status.text);

        $(".current-user-latest-status a[id^=view]").each(function() {
            var $this = $(this),
                href = $this.attr("href");
            $this.attr("href", href.replace(/\d+$/, status.id))
                   .text(status.friendlyDate)
                   .attr("title", new Date(status.date).toLocaleString());
        });
    }

    function getLatestStatus() {
        $.getJSON(Confluence.getContextPath() + "/status/current.action", function(data) {
            if (data.errorMessage) {
                popup.setError(data.errorMessage);
            }
            else {
                setCurrentStatus(data);
            }
        });
    }

    var updateStatus = function() {
        var $dialog = popup.popup.element,
            $input = $("#status-text", $dialog),
            $updateButton = $(".status-update-button", $dialog),
            text = $input.val(),
            reEnableForm,
            updateTask;

        function disableForm() {
            $input.blur();
            $input.prop("disabled", true).prop("readonly", true);
            $updateButton.prop("disabled", true);

            return function() {
                try {
                    $input.focus();
                } catch(err){} // focus might fail in IE8
                $input.prop("disabled", false).prop("readonly", false);
                $updateButton.prop("disabled", false);
            }
        }

        reEnableForm = disableForm();

        if (!validate(text)) {
            reEnableForm();
            return false;
        }

        updateTask = AJS.safe.ajax({
            url: Confluence.getContextPath() + "/status/update.action",
            type: "POST",
            dataType: "json",
            data: {
                "text": text
            }
        });

        // Always re-enable the form.
        updateTask.done(reEnableForm).fail(reEnableForm);

        updateTask.done(function(data) {
            if (data.errorMessage) {
                popup.setError(data.errorMessage);
            }
            else {
                setCurrentStatus(data);
                $input.val("");
                $dialog.fadeOut(200, function() {
                    popup.hide();
                });
            }
        });

        updateTask.fail(function(xhr, text, error) {
            AJS.log("Error updating status: " + text);
            AJS.log(error);
            popup.setError("There was an error - " + error);
        });

        return updateTask.promise();
    };

    var bindBehaviour = function(popup) {
        var $dialog = popup.popup.element,
            $input = $("#status-text", $dialog),
            $charsLeft = $(".chars-left", $dialog),
            $updateButton = $(".status-update-button", $dialog);

        $input.keydown(function(e) {
            if (e.keyCode == 13) { // Enter
                updateStatus();
            }
        }).bind("blur focus change " + (!$.browser.msie ? "paste input" : "keyup"), function() {
            var text = $(this).val(),
                length = maxChars - text.length;

            // Toggle the disabled state of the button.
            $updateButton.prop("disabled", !text.length);

            $charsLeft.text(Math.abs(length))
                .toggleClass("close-to-limit", length < 20)
                .toggleClass("over-limit", length < 0);
        });
        $("form", $dialog).submit(function(e) {
            e.preventDefault();
            updateStatus();
        });
    };

    var statusTarget = "#create-user-status-link";
    $(statusTarget).click(function(e) {
        var dropDown = $(this).parents(".ajs-drop-down")[0];
        dropDown && dropDown.hide();

        if (typeof popup == "undefined") {
            popup = createPopUp();
            bindBehaviour(popup);
        }
        getLatestStatus();
        popup.setError("");
        popup.show();
        $("#update-user-status-dialog #status-text").prop("readonly", false).prop("disabled", false).focus();
        return AJS.stopEvent(e);
    });
});
