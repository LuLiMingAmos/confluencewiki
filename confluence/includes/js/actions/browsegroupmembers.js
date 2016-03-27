AJS.toInit(function ($)
{
    var addMembersSection = $("#add-members-section");
    var listMembersSection = $("#list-members-section");
    var switchButton = $("#switch-button");
    var cancelButton = $("#cancel");
    var errorBox = $(".errorBox");

    var open = function()
    {
        addMembersSection.show();
        listMembersSection.hide();
        errorBox.hide();
        switchButton.hide();
        return false;
    };

    var cancel = function()
    {
        listMembersSection.show();
        addMembersSection.hide();
        switchButton.show();
        $(".error").remove();
        return false;
    };


    switchButton.click(open);
    cancelButton.click(cancel);
    cancel();
});

function setPickerField(entityNames)
{
    AJS.$("#usersToAdd").val(entityNames);
}


