AJS.PagePermissions = AJS.PagePermissions || {};

AJS.toInit(function($) {

    var USER = "user",
        GROUP = "group";

    var contextPath = Confluence.getContextPath();
    var isEditPage = function(){
        return $("#rte-button-restrictions").parent().is(':visible');
    };

    var popup = null;
    var controls = null;
    var table = null;

    /**
     * Handles the AJAX calls to check for added users and groups, calling PermissionsTable.addEntry if found.
     */
    var permissionManager = {

        // Queries the server for whether an entityName represents a user or group
        // perform subsequent group check inside the callback of the user check so it occurs after the user check completes
        addNames : function (entityNames, entityType) {
            var pm = this;
            var entityNamesArray = entityNames.replace(/\s*,\s*/g, ",").split(",");
            var throbber = $("#waitImage");
            throbber.show();
            var params = {
                name: entityNamesArray,
                type: entityType || "",
                pageId: AJS.Meta.get('parent-page-id'),
                spaceKey: AJS.Meta.get('space-key')
            };
            $.getJSON(contextPath + "/pages/getentities.action", params, function(results) {
                throbber.hide();
                for (var i = 0, len = results.length; i < len; i++) {
                    var entity = results[i].entity;
                    // 1. Add permission row for entity
                    pm.addEntity(results[i]);

                    // 2. Remove from submitted names list
                    var index = $.inArray(entity.name, entityNamesArray);
                    entityNamesArray.splice(index, 1);
                }
                // 3. Didn't find anything for names - should only occur for names via the form
                controls.validator.handleNonExistentEntityNames(entityNamesArray);
            });
        },

        // Note - dupe validation can't be done before looking up the entity from a name because it depends on the entity type.
        addEntity : function(entityResult) {
            if (!entityResult)
                return;

            var entity = entityResult.entity;
            var report = entityResult.report;

            var currentPermissionType = controls.getPermissionType();
            if (controls.validator.isDuplicateEntityForType(entity, currentPermissionType)) {
                table.highlightEntityRow(entity, currentPermissionType);
                return;
            }

            var entry = {
                entity : entity,
                view : true,     // always give added users/groups both permissions
                edit : true,
                report : report
            };
            table.addRow(entry, currentPermissionType);
            Confluence.Binder.userHover(); // user hover bindings
            table.changedByUser();
            table.highlightEntityRow(entity, currentPermissionType);
            controls.nameField.removeFromNameInput(entity.name);
        },

        makePermissionStrings : function () {
            var permissions = table.makePermissionMap(false);
            return {
                viewPermissionsUsers : permissions.user.view.join(","),
                editPermissionsUsers : permissions.user.edit.join(","),
                viewPermissionsGroups : permissions.group.view.join(","),
                editPermissionsGroups : permissions.group.edit.join(",")
            };
        }
    };

    /*--------------------------------------------------------------------------
        Public methods called by pop ups and page-editor.js
    --------------------------------------------------------------------------*/
    $.extend(AJS.PagePermissions, {
        // Callback from Choose Users popup
        addUserPermissions : function (commaDelimitedUserNames) {
            permissionManager.addNames(commaDelimitedUserNames, USER);
        },

        // Callback from Choose Groups popup
        addGroupPermissions : function (commaDelimitedGroupNames) {
            permissionManager.addNames(commaDelimitedGroupNames, GROUP);
        },

        makePermissionStrings : permissionManager.makePermissionStrings,
        updateEditPageRestrictions: updateEditPageRestrictions
    });

    /**
     * Adds rows to the permission table based on JSON data received from the back end. The data should have three
     * parts :
     *      1. permissions - An array of permission arrays, containing :
     *          a. permissionType
     *          b. entityType
     *          c. entity name (username or groupname)
     *          d. owning content name, if not the current page
     *      2. users - A map of usernames to User objects
     *      3. groups - A map of groupnames to Group objects
     */
    function loadTableFromJson (data) {
        table.allowEditing(data.userCanEditRestrictions);
        table.resetInherited();
        if (!permissionManager.permissionsEdited)
            table.resetDirect();

        if (!data) return;

        // 1. First, build up map of permissions for entity. // UI-973
        // TODO - If this design stays, build the map at the back-end. dT
        for (var i = 0, len = data.permissions.length; i < len; i++) {
            var permission = data.permissions[i];
            var permissionType = permission[0].toLowerCase();   // will come in as "View", "Edit"
            var entityType = permission[1];
            var entityName = permission[2];
            var wrappedEntity = (entityType == USER) ? data.users[entityName] : data.groups[entityName];
            var owningContentId = permission[3];
            var owningContentTitle = permission[4];

            var inherited = +owningContentId && owningContentId != AJS.params.pageId;
            if (permissionManager.permissionsEdited && !inherited)
                continue;

            var entryForEntityForPage = {
                owningId: owningContentId,
                entity: wrappedEntity.entity,
                report: wrappedEntity.report
            };
            entryForEntityForPage[permissionType] = true;
            entryForEntityForPage.owningTitle = owningContentTitle;
            entryForEntityForPage.inherited = inherited;

            table.addRow(entryForEntityForPage, permissionType);
        }
        if(data.permissions.length > 0)
        	Confluence.Binder.userHover(); // user hover bindings

        table.saveBackup();
        table.refresh();
    }

    /**
     * Updates the restrictions button on the edit page.
     *
     * Also synchronizes the hidden permission fields from the permissions table and notifies the user if they are
     * changed from the originals.
     */
    function updateEditPageRestrictions () {

        var nameMap = table.makePermissionMap(false),
            restrictionButton = $("#rte-button-restrictions"),
            icon = restrictionButton.find(".icon"),
            text = restrictionButton.find(".trigger-text"),
            restrictions = [].concat(nameMap.group.view).concat(nameMap.user.view).concat(nameMap.group.edit).concat(nameMap.user.edit),
            inheritedRestrictions = $("#page-inherited-permissions-table-desc:visible"),
            allLockIconClasses = "icon-restricted icon-restricted-inherited icon-unrestricted";

        if (restrictions.length || inheritedRestrictions.length) {
            var lockIconClass = restrictions.length ? "icon-restricted" : "icon-restricted-inherited";
            icon.removeClass(allLockIconClasses).addClass(lockIconClass);
            text.text(AJS.I18n.getText("page.restrictions.restricted"));
        } else {
            icon.removeClass(allLockIconClasses).addClass("icon-unrestricted");
            text.text(AJS.I18n.getText("page.restrictions.none"));
        }

        /**
         * Updates the hidden fields that submit the edited permissions in the form. The fields are updated with the
         * data in the Permissions table.
         */
        permissionManager.permissionsEdited = false;
        var permissionStrs = permissionManager.makePermissionStrings();
        for (var key in permissionStrs) {
            var updatedPermStr = permissionStrs[key];
            $("#" + key).val(updatedPermStr);

            if (permissionManager.originalPermissions[key] != updatedPermStr) {
                permissionManager.permissionsEdited = true;
            }
        }
    }

    /**
     * Closes the dialog after saving or cancelling, scrolling the web page to where it was prior to opening.
     */
    function closeDialog () {
        controls.validator.resetValidationErrors();
        table.clearHighlight();
        AJS.$('.button-spinner').spinStop();
        popup.hide();
        window.scrollTo(permissionManager.bookmark.scrollX, permissionManager.bookmark.scrollY);
    }

    /**
     * Called when the user saves the permissions. If creating/editing a page, just updates the hidden permission inputs.
     * If on any other screen, saves the permissions to the backend.
     */
    function saveClicked () {
        // TODO - the disabling of the submit button should be in AJS.Dialog.
        // See: CONF-17867: prevent 'submit' to be clicked multiple times
        var submitButton = $(".permissions-update-button").disable();
        AJS.$('.button-spinner').spin();
        if (isEditPage()) {
            updateEditPageRestrictions();
            submitButton.enable();
            closeDialog();
        } else {
            var post = permissionManager.makePermissionStrings();
            post.pageId = AJS.params.pageId;
            $("#waitImage").show();

            AJS.safe.post(contextPath + "/pages/setpagepermissions.action", post, function(data) {
                $("#waitImage").hide();

                // If any permissions set, show padlock
                AJS.trigger("system-content-metadata.toggled-restrictions", {hasRestrictions: data.hasPermissions});
                submitButton.enable();
                closeDialog();
            }, "json");
        }
    }

    /**
     * Called when the user cancels the dialog via Cancel button or escape.
     */
    function cancel () {
        closeDialog();
        if (isEditPage()) {
            table.restoreBackup();
        }
        return false;
    }

    /**
     * Creates the permissions dialog with the main panel coming from a template, then initializes the Controls and Table
     * handlers.
     */
    function initPopup () {
        popup = AJS.ConfluenceDialog({
            width : 840,
            height: 530,
            id: "update-page-restrictions-dialog",
            onCancel: cancel
        });
        if (AJS.Meta.get("content-type") == 'blogpost') {
            popup.addHeader(AJS.I18n.getText("page.perms.dialog.heading.blog"));
        } else {
            popup.addHeader(AJS.I18n.getText("page.perms.dialog.heading"));
        }
        popup.addPanel("Page Permissions Editor", Confluence.Templates.PagePermissions.dialogPanel({currentUser: AJS.params.remoteUser, currentUserAvatar: AJS.params.currentUserAvatarUrl}));
        popup.addButton(AJS.I18n.getText("update.name"), saveClicked, "permissions-update-button");
        popup.addCancel(AJS.I18n.getText("close.name"), cancel);

        // CONFDEV-12853: Add help link via prepend() instead of append() to prevent FF display issue
        popup.popup.element.find(".dialog-title").prepend(Confluence.Templates.PagePermissions.helpLink());
        popup.popup.element.find(".dialog-button-panel").prepend("<div class='button-spinner'>&nbsp;</div>")

        // todo one day we will get rid of these hideous popups
        popup.popup.element.find("#userpicker-popup-link").click(function() {
            var picker = window.open(Confluence.getContextPath() +
                    '/spaces/openuserpicker.action?key=' + AJS.params.spaceKey +
                    '&startIndex=0&onPopupSubmit=AJS.PagePermissions.addUserPermissions', 'EntitiesPicker', 'status=yes,resizable=yes,top=100,left=200,width=700,height=680,scrollbars=yes');
            picker.focus();
            return false;
        });
        popup.popup.element.find("#grouppicker-popup-link").click(function() {
            var picker = window.open(Confluence.getContextPath() +
                    '/spaces/opengrouppicker.action?key=' + AJS.params.spaceKey +
                    '&startIndex=0&actionName=dosearchgroups.action&onPopupSubmit=AJS.PagePermissions.addGroupPermissions', 'EntitiesPicker', 'status=yes,resizable=yes,top=100,left=200,width=580,height=550,scrollbars=yes');
            picker.focus();
            return false;
        });
        controls = AJS.PagePermissions.Controls(permissionManager);
        var $table = $("#page-permissions-table").bind("changed", updateButtonsUnsavedChanges);
        table = AJS.PagePermissions.Table($table);
        permissionManager.table = table;
    }

    /**
     * Makes final changes to the popup and then displays it.
     */
    function showPopup (data) {
        permissionManager.bookmark = {
            scrollX : document.documentElement.scrollLeft,
            scrollY : document.documentElement.scrollTop
        };

        updateButtonsNoUnsavedChanges();

        controls.setVisible(data.userCanEditRestrictions);

        AJS.setVisible(".permissions-update-button", data.userCanEditRestrictions);

        popup.show();
    }

    /**
     * Gets page restrictions (direct and inherited), plus group/user details from the server (view) or dom (edit).
     * Also gets a flag if the user has permission to change restrictions or not from the server.
     */
    function loadPermissions(callback, editingPage) {
        if (!permissionManager.originalPermissions && isEditPage()) {
            permissionManager.originalPermissions = Confluence.Editor.getPagePermissions();
        }
        // If editingPage, Space and Parent Page may have changed due to the Location editor on the edit screen.
        var spaceKey = (editingPage && $("#newSpaceKey").val()) || AJS.Meta.get('space-key');
        var parentPageTitle = (editingPage && $("#parentPageString").val()) || "";
        var params = {
            pageId: AJS.Meta.get('page-id'),
            parentPageId: AJS.Meta.get('parent-page-id'),
            parentPageTitle: parentPageTitle,
            spaceKey: spaceKey
        };
        var url;
        if (AJS.params.newPage) {
            params.draftId = AJS.Meta.get('content-id');
        }

        $("#waitImage").show();

        if(isEditPage()) {
            url = contextPath + "/pages/geteditpagepermissions.action";
            $.extend(params, Confluence.Editor.getPagePermissions());
        } else {
            url = contextPath + "/pages/getpagepermissions.action";
        }

        $.getJSON(url, params, function(data) {
            $("#waitImage").hide();
            loadTableFromJson(data);
            callback(data);
        });
    }

    /**
     * Called when the user opens the popup from the view or edit screens.
     *
     * @param isEditingAPage true if the popup is being called from a create/edit page screen, false otherwise
     */
    function openPopup (isEditingAPage) {
        popup || initPopup();
        loadPermissions(showPopup, isEditingAPage);
    }

    function updateButtonsUnsavedChanges() {
        $(".permissions-update-button").enable();
        $(".button-panel-cancel-link").text(AJS.I18n.getText("cancel.name"));
    }

    function updateButtonsNoUnsavedChanges() {
        $(".permissions-update-button").disable();
        $(".button-panel-cancel-link").text(AJS.I18n.getText("close.name"));
    }

    $("#action-page-permissions-link").click(function (e) {
        e.preventDefault();
        openPopup(false);
    });

    AJS.bind('system-content-metadata.open-restrictions-dialog', function() {
        openPopup(false);
    });

    /**
     * Show dialog link for the Create/Edit page screen.
     */
    $("#rte-button-restrictions").live('click', function (e) {
        e.preventDefault();
        openPopup(true);
    });

    if (isEditPage()) {
        // Store original values of hidden permission fields for comparison on dialog save, to show "Unsaved changes"
        permissionManager.originalPermissions = Confluence.Editor.getPagePermissions();
    }
});
