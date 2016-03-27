AJS.Confluence.SpacePermissions = {
    updateField: function(id, valueToAdd) {
        var input = AJS.$("#" + id);
        if (valueToAdd != ""){
            var val = input.val();
            input.val(val == "" ? valueToAdd : val + ", " + valueToAdd);
        }
    },
    updateGroupsField: function(groups) {
        AJS.Confluence.SpacePermissions.updateField("groups-to-add-autocomplete", groups);
    },
    updateUsersField: function(users) {
        AJS.Confluence.SpacePermissions.updateField("users-to-add-autocomplete", users);
    },
    setPermissionsState: function(entityType, entityId, newState) {
        entityId = entityId.replace(/'/g,"\\'");
        AJS.$("table#" + entityType + "PermissionsTable input[type='checkbox'][name$='_" + entityId + "']").each(function () {
            this.checked = newState;
        });
    }
};
AJS.$(document).ready(function () {
    var $selectOptions = AJS.$("#select-options");

    AJS.$(".perms-dropdown-trigger").click(function () {
        var trigger = AJS.$(this);
        $selectOptions
            .data("entity-type", trigger.data("entity-type"))
            .data("entity-id", trigger.data("entity-id"));
    });

    $selectOptions.find("a").click(function (e) {
        var $this = AJS.$(this);
        var checkedState = "";
        if ($this.hasClass("select-all")) {
            checkedState = "checked";
        }
        AJS.Confluence.SpacePermissions.setPermissionsState(
            $selectOptions.data("entity-type"),
            $selectOptions.data("entity-id"),
            checkedState
        );
        e.preventDefault();
    });
});