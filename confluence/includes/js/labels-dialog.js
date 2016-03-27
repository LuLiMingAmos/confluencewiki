AJS.toInit(function($) {

    if(!Confluence.Templates.Labels) {
        return;
    }

    var dialog = null;

    var close = function () {
        $("#"+dialog.id).find(".label-list").removeClass("editable");
        dialog.hide();
        return false;
    };

    var initDialog = function () {
        dialog = AJS.ConfluenceDialog({
            width : 600,
            height: 250,
            id: "edit-labels-dialog",
            onCancel: close
        });
        dialog.addHeader(AJS.I18n.getText("labels.name"));
        dialog.addPanel("Label Editor", Confluence.Templates.Labels.dialog());
        dialog.addCancel(AJS.I18n.getText("close.name"), close);
        dialog.addHelpText(AJS.I18n.getText("labels.dialog.shortcut.tip"), {shortcut: "l"});
        // CONFDEV-12853: Add help link via prepend() instead of append() to prevent FF display issue
        dialog.popup.element.find(".dialog-title").prepend(Confluence.Templates.Labels.helpLink());
        $("#add-labels-form").submit(function(e) {
        	var input = $("#labels-string");
            e.preventDefault();
            var dialogLabelList = $("#dialog-label-list");
            AJS.Labels.addLabel(input.val(), dialogLabelList.attr("entityid"), dialogLabelList.attr("entitytype"));
            input.focus();
            setTimeout(function(){
                $("#labels-autocomplete-list").find('.aui-dropdown').addClass("hidden");
            });
        });

        AJS.Labels.bindAutocomplete();
    };

    $('#rte-button-labels').live('click', function (e) {
        AJS.Labels.openDialog();
    });

    $(".show-labels-editor").click(function (e) {
        e.preventDefault();
        var target = $(e.target).closest(".labels-section-content");
        AJS.Labels.openDialog(target);
    });

    /**
     * Bind the click event for the supplied elements so that it will open
     * the dialog.
     *
     * @param $elements a jQuery wrapped collection of elements to bind the click event for.
     */
    AJS.Labels.bindOpenDialog = function($elements) {
        $elements.click(function (e) {
            e.preventDefault();
            var $target = $(e.target).closest(".labels-section-content");
            if ($target.length) {
                AJS.Labels.openDialog($target);
            } else {
                AJS.Labels.openDialog();
            }
        });
    };

    /**
     * @param labelSectionContent - the element containing the labels to be edited, defined in
     *   labels-editor-content.vm, requires entityid and entitytype attributes, as well as a child node with
     *   class label-list.
     */
    AJS.Labels.openDialog = function(labelSectionContent) {
        var entityType, entityId, labelUrl, dialogLabelList;

        if (!dialog) {
            initDialog();
        }

        if (labelSectionContent){
            entityId = labelSectionContent.attr("entityid");
            entityType = labelSectionContent.attr("entitytype");
        } else {
            //Otherwise, we are in the editor, editing a page/blogpost
            entityType = AJS.Meta.get("content-type");
            entityId = AJS.Meta.get("page-id");
        }

        labelUrl = AJS.Labels.routes.list(entityType, entityId);
        dialogLabelList = $("#dialog-label-list");

        dialogLabelList.attr("entityid", entityId);
        dialogLabelList.attr("entitytype", entityType);

        var openDialog = function() {
            dialog.show();
            $("#labels-string").val("").focus();
            // to bind label suggestions plugin
            AJS.trigger("labels.dialog.open");
        }

        var populateDialog = function(data) {
            dialogLabelList.html(
                Confluence.Templates.Labels.dialogLabelList({
                    "labels": data.labels,
                    "spaceKey": AJS.Meta.get("space-key"),
                    "editable": true
                })
            );
            openDialog();
        }

        if (AJS.Labels.isNewPage()) {
            //Don't try to live update the labels for a new page
            if (!dialogLabelList.find("ul").children().size()) {
                //If it's the first time the dialog is opened for a new page, check for possible template labels
                var labelString = $("#createPageLabelsString").val() || "";
                var labelList = AJS.Labels.parseLabelStringToArray(labelString);
                populateDialog({"labels" : labelList});
            } else {
                openDialog();
            }
        } else {
            AJS.$.ajax({url: labelUrl,
                        cache: false,
                        success: populateDialog,
                        error: function(request, textStatus) {
                            AJS.Labels.setLabelError("Unable to fetch current labels from the server.");
                            openDialog();
                        }
            });
        }

        $("#dialog-label-list").attr("data-ready", "true");

    };
});
