AJS.Labels = (function($) {

    var initLabelCount = function() {
        var num_labels = 0;
        if (AJS.Meta.get('num-labels')) {
            // existing pages will store num-labels here
            num_labels = AJS.Meta.get('num-labels');
        } else if ($('#createPageLabelsString').val()) {
            // templates, new pages and copied pages will store labels in the create page form
            num_labels = $.trim($('#createPageLabelsString').val()).split(/\s+/).length;
        }
        if (num_labels != 0) {
            AJS.Meta.set('num-labels', num_labels);
            $('#rte-button-labels').trigger("updateLabel");
        }
    }
    AJS.bind("init.rte-control", initLabelCount);
    /**
     * Converts a space delimited string of labels stored in a form field on new pages into an
     * array of label objects eg ("notes my:label" => [{"name":"notes", "id": 1},{"name":"label","id":2, "prefix":"my"}])
     *
     * @param labelString a space delimited string of labels
     * @return {Array} an array containing labels objects
     */
    var parseLabelStringToArray = function (labelString) {
        labelString = AJS.$.trim(labelString);
        if (!labelString) {
            return [];
        }

        var labelList = [];
        var id = new Date().getTime();
        $(labelString.split(/\s+/)).each(function(index, value){
            // check string for prefix delimited by ':'
            var label = value.split(":"),
                prefix,
                name = label[0];
            if (label.length === 2) {
                prefix = label[0];
                name = label[1];
            }
            labelList.push({name: name, prefix: prefix, id: id});
            id++;
        });
        return labelList;
    };

    var defaults = {
        labelView: ".label-list",
        labelItem: ".aui-label",
        noLabelsMessage: ".no-labels-message",
        idAttribute: "data-label-id",
        labelsFormFieldId: AJS.Meta.get('labels-form-field-id') || "createPageLabelsString"
    };

    var path = Confluence.getContextPath();

    var routes = {
        "base": path + "/rest/ui/1.0/",
        "getRestEndPoint": function(entityType) {
            var endpoint = (entityType == "attachment") ? "attachment/" :
                             (entityType == "template") ? "template/"   :
                                (entityType == "space") ? "space/"      :
                                                          "content/";
            return this.base + endpoint;
        },
        "index": path + "/labels/autocompletelabel.action?maxResults=3", // legacy
        "validate": function() {
            return this.getRestEndPoint() + "labels/validate";
        },
        "add": function(entityType, entityId) {
            return this.getRestEndPoint(entityType) + entityId + "/labels";
        },
        "remove": function(entityType, entityId, labelId) {
            return this.getRestEndPoint(entityType) + entityId + "/label/" + labelId;
        },
        "list": function(entityType, entityId) {
            return this.getRestEndPoint(entityType) + entityId + "/labels";
        }
    };

    var isNewPage = function() {
        return !!document.getElementById("createpageform") || !!document.getElementById("createpagetemplate");
    };
    var isSpaceAdminPage = function() { return $(".space-administration").length; };

    /**
     * Method finds and returns a jQuery wrapped set containing the label elements
     *
     * @method findLabelView
     * @param {String} entityid ex. 1638430
     * @param {String} entitytype ex. blogpost
     * @return {Object} Returns a jQuery wrapped set
     */
    function findLabelView(entityid, entitytype){
    	if(!(entityid && entitytype)){
    		var dialogLabelList = $("#dialog-label-list");
    		entityid = dialogLabelList.attr("entityid");
    		entitytype = dialogLabelList.attr("entitytype");
    	}
    	
    	// if we have no entityid and no entitytype, assume only one label view on the page, this is the legacy behaviour.
    	if(!(entityid && entitytype))
    		return $(defaults.labelView);

        var labelSection =$(".labels-section-content").filter(function(){
    		return this.getAttribute("entityid") == entityid && this.getAttribute("entitytype") == entitytype;
    	});
    	return labelSection.find(defaults.labelView);
    };


    var labelAction = function(result) {
        setLabelError();

        if (result && result.promise) {
            result.always([resetForm, enableForm]);

            /* show or hide the "No Labels" text depending on whether there are any labels to display */
            result.done(function ($newLabels, $labelLists) {
                // Trigger label count text update in Editor
                AJS.Meta.set('num-labels', findLabelView().first().find(defaults.labelItem).size());
                $("#rte-button-labels").trigger("updateLabel");
                var $pageLabelList = $labelLists.not(".editable");
                if ($labelLists.find(".aui-label").length === 0) {
                    $pageLabelList.find(".labels-edit-container").before(Confluence.Templates.Labels.nolabels());
                } else {
                    $pageLabelList.find(".no-labels-message").remove();
                }
            });
        }
        return result;
    };

    var disableForm = function() {
        $("#labels-string, #add-labels-editor-button").attr({
            "disabled": "disabled",
            "aria-disabled": true
        });
    };

    var enableForm = function() {
        $('#labels-string, #add-labels-editor-button').removeAttr("disabled aria-disabled");
    };

    var resetForm = function() {
        $("#labels-string").val('');
    };

    var setLabelError = function(message) {
        message = message || null;
        var selector = "#label-operation-error-message";
        $(selector).empty().toggle(!!message);
        AJS.messages.warning(selector, { body: message });
    };

    var addLabels = function(labelString, entityId, entityType) {
        if (!labelString) return false;
        disableForm();
        // On a new Confluence page, labels are stored in a <input> element until the page is saved
        // adding new labels appends them to the value of this element
        var labelsField = $("#" + defaults.labelsFormFieldId);
        if (isNewPage()) {
            var labelsIfField = (labelsField.val() + " " + labelString).split(/\s+/);
            var uniqueLabels = [];
            AJS.$.each(labelsIfField, function(index, label) {
                if (AJS.$.inArray(label, uniqueLabels) === -1) {
                    uniqueLabels.push(label);
                }
            });
            labelString = uniqueLabels.join(" ");
        }

        var newLabels = parseLabelStringToArray(labelString);

        var request = {
                url: isNewPage() ? routes.validate() : routes.add(entityType, entityId),
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(newLabels)
            },
            labelsTask,
            callbacks = $.Deferred();

        // Make the request.
        labelsTask = AJS.$.ajax(request);

        labelsTask.done(function(data) {
            var $dialogLabelList = $("#dialog-label-list").find(".label-list"),
                $pageLabelList = findLabelView(entityId, entityType).not(".editable"),
                newLabels = data.labels;

            if (isNewPage()) {
                // Request successful, so labelString didn't have any illegal characters in it. Update the form field.
                labelsField.val(labelString);

                var id = new Date().getTime();
                AJS.$.each(newLabels, function(index, label) {
                    label.id = id++; // add temp id to labels so they can be individually removed
                });
                $dialogLabelList.empty();
            }
            $dialogLabelList.html(Confluence.Templates.Labels.labels({"labels": newLabels, "spaceKey" : AJS.Meta.get("space-key"), "editable": true}));
            // need to add the labels in the page .before() the edit pen
            $pageLabelList.find("li.aui-label").remove();
            $pageLabelList.find("li.labels-edit-container").before(Confluence.Templates.Labels.labels({"labels": newLabels, "spaceKey" : AJS.Meta.get("space-key")}));

            callbacks.resolve(newLabels, $pageLabelList.add($dialogLabelList));
        });

        labelsTask.fail(function(xhr, status) {
            var errorMessage;
            if (status === "timeout") {
                errorMessage = AJS.I18n.getText("xhr.timeout");
            } else {
                try {
                    errorMessage = JSON.parse(xhr.responseText).message;
                } catch (e) {
                    errorMessage = status;
                    AJS.log("Unexpected error when adding labels: " + e.message);
                }
            }
            AJS.log("Failed to add labels: " + errorMessage);
            AJS.log("Failed to add labels xhr: " + xhr.responseText);
            setLabelError(errorMessage);
            callbacks.reject(status);
        });

        return callbacks.promise();
    };

    var removeLabel = function(label, entityId, entityType) {
        if (!label) return false;
        label = label.jquery ? label : $(label);

        // Space admin page does not follow the common labels dialog convention
        // It's just different.
        if (isSpaceAdminPage()) {
            entityId = AJS.Meta.get("space-key");
            entityType = 'space';
        }

        var labelId = label.attr(defaults.idAttribute),
            tag = $.trim(label.find("a").text()),
            removeLabelTask,
            request = {
                type: "DELETE",
                dataType: "json",
                contentType: "application/json",
                data: {}
            },
            callbacks = $.Deferred();

        if (isNewPage()) {
            removeLabelTask = $.Deferred();
            removeLabelTask.resolve();
        } else {
            request.url = routes.remove(entityType, entityId, labelId);
            removeLabelTask = AJS.$.ajax(request);
        }

        removeLabelTask.done(function() {
            var labelView = findLabelView(entityId, entityType);
            // Space admin page does not follow the common labels dialog convention
            // It's just different.
            if (isSpaceAdminPage()) {
                labelView = $('#space-categories-list');
            }
            var list = labelView.find(defaults.labelItem);
            var labels = list.filter("["+defaults.idAttribute+"='"+labelId+"']");
            labels.fadeOut("normal", function() {
                labels.remove();
                callbacks.resolve(label, labelView);
            });
        });
        removeLabelTask.fail(function(xhr, status) {
            AJS.log(status);
            setLabelError(status == "timeout" ? AJS.I18n.getText("xhr.timeout") : status);
            callbacks.reject(status);
        });

        isNewPage() && callbacks.done(function() {
            // FIXME: Add set theory to scoped Labels collection object. Use it.
            // This only runs for new pages/pageTemplates because this input field doesn't exist when editing.
            var labelsField = $("#" + defaults.labelsFormFieldId);
            var value = labelsField.val();
            var labels = value.split(/\s+/);
            labels = $.grep(labels, function(text) { return (!text || text == tag); }, true);
            labelsField.val(labels.join(' '));
        });

        return callbacks.promise();
    };

    // Binds the autocomplete labels ajax call to the labels input field.
    // Labels are added on select of the autocomplete drop down if the input field is within a form.
    var bindAutocomplete = function() {
        var labelInput = $("#labels-string"),
            addLabelOnSelect = labelInput.parents("#add-labels-form").length;

        if (!labelInput.length) {
            return;
        }

        var dropDownPlacement = function (dropDown) {
            $("#labels-autocomplete-list").append(dropDown);
        };

        var onselect = function (selection) {
            if (selection.find("a.label-suggestion").length) {

                var span = $("span", selection),
                    contentProps = $.data(span[0], "properties"),
                    value = labelInput.val(),
                    labelArray = [];

                if(addLabelOnSelect) {
                    labelArray = value.split(/\s+/);

                    labelArray[labelArray.length - 1] = contentProps.name;
                    labelInput.val(labelArray.join(' '));
                } else {
                    // this hacky code was copied from uberlabels.js
                    var tokens = AJS.Labels.queryTokens,
                        last_token_pos = -1,
                        this_token_pos,
                        token = "";

                    for (var i = 0, ii=tokens.length; i < ii; i++) {
                        token = tokens[i];
                        this_token_pos = value.lastIndexOf(token);

                        if (this_token_pos > last_token_pos) {
                            last_token_pos = this_token_pos;
                        }
                    }

                    if (last_token_pos != -1) {
                        var new_value = value.substr(0, last_token_pos);
                        var whitespace = value.substr(last_token_pos + token.length).match(/^\s+/);
                        if (whitespace)
                            new_value += whitespace[0];
                        labelInput.val(new_value + contentProps.name);
                    }
                    else {
                        labelInput.val(contentProps.name);
                    }
                }
            }
        };
        var onshow = function() {
            if (!$("#labels-autocomplete-list .label-suggestion").length || labelInput.val() === "") {
                this.hide();
            }
            else if(!addLabelOnSelect) {
                // remove hrefs if we're not going to add the label on select
                var labels = $("#labels-autocomplete-list a.label-suggestion");
                for(var i=0,ii=labels.length; i<ii; i++) {
                    labels.get(i).href = "#";
                }
            }
        };
        var url = "/labels/autocompletelabel.action?maxResults=3";
        $(window).bind("quicksearch.ajax-success", function(e, data) {
            if (data.url == url) {
                AJS.Labels.queryTokens = (data.json && data.json.queryTokens) || [];
                return false;
            }
        });
        $(window).bind("quicksearch.ajax-error", function(e, data) {
            if (data.url == url) {
                AJS.Labels.queryTokens = [];
                return false;
            }
        });
        labelInput.quicksearch(url, onshow, {
            makeParams: function(val) {
                return {
                    query: val,
                    contentId: AJS.params.pageId || ""
                };
            },
            dropdownPlacement : dropDownPlacement,
            ajsDropDownOptions : {
                selectionHandler: function (e, selection) {
                        onselect(selection);
                        this.hide();
                        e.preventDefault();
                    }
                }
        });
    };

    $(".label-list.editable .aui-icon-close").live("click", function(e) {
        e.preventDefault();
        var dialogLabelList = $("#dialog-label-list");
        AJS.Labels.removeLabel($(this).closest('li'), dialogLabelList.attr("entityid"), dialogLabelList.attr("entitytype"));
    });
    // Make the labels on the space admin page editable.
    AJS.toInit(function(){
        if (isSpaceAdminPage()) {
            // bind autocomplete for space admin label field (find a better place for this?)
            AJS.Labels.bindAutocomplete();
            $(".label-list").addClass("editable");
        }
    });

    return {
        addLabel: function(labelString, entityId, entityType) {
            return labelAction(addLabels(labelString, entityId, entityType));
        },
        removeLabel: function(label, entityId, entityType) {
            return labelAction(removeLabel(label, entityId, entityType));
        },
        bindAutocomplete: bindAutocomplete,
        isNewPage: isNewPage,
        routes: routes,
        setLabelError: setLabelError,
        parseLabelStringToArray: parseLabelStringToArray
    };
})(AJS.$);