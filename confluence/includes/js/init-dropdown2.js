/**
 * Binds all the header implementations of Dropdown2. Including global nav and user profile.
 */
JIRA.Dropdowns.bindHeaderDropdown2 = function () {
    AJS.$(".aui-dropdown2-trigger").each(function() {
        var $ddtrigger = AJS.$(this);
        var $dd = AJS.$("#" + $ddtrigger.attr("aria-owns"));
        var $ajaxkey = $dd.data("aui-dropdown2-ajax-key");

        if ($ajaxkey) {
            $dd.bind("aui-dropdown2-show", function() {
                $dd.empty();
                $dd.addClass("aui-dropdown2-loading");
                JIRA.SmartAjax.makeRequest({url: contextPath + "/rest/api/1.0/menus/" + $ajaxkey ,dataType: "json",cache: false,success: function(data) {
                    $dd.removeClass("aui-dropdown2-loading");
                    $dd.html(JIRA.FRAGMENTS.dropdown2Fragment(data));
                    $dd.find("a:not(.disabled)").filter(":first").addClass("active")
                }})
            });
        }
    });
};

AJS.$(function(){
    JIRA.Dropdowns.bindHeaderDropdown2();
});

JIRA.FRAGMENTS.dropdown2Fragment = function (response) {
    var container = AJS.$("<div />");
    AJS.$(response.sections).each(function()
    {
        var section = AJS.$('<div class="aui-dropdown2-section" />');
        var list = AJS.$("<ul class='aui-list-truncate' />");
        var listItem;
        var listItemLink;

        if (this.id)
        {
            list.attr("id", this.id);
        }
        if (this.style)
        {
            list.addClass(this.style);
        }
        if (this.items  && this.items.length != 0)
        {
            if (this.label)
            {
                section.append(AJS.$("<strong/>").text(this.label));
            }
            AJS.$(this.items).each(function()
            {
                listItem = AJS.$("<li />");
                if (this.id)
                {
                    listItem.attr("id", this.id);
                }
                if (this.style)
                {
                    listItem.addClass(this.style);
                }
                listItemLink = AJS.$("<a />").attr("href", this.url);
                if (this.id)
                {
                    listItemLink.attr("id", this.id + "_lnk");
                }
                if (this.title)
                {
                    listItemLink.attr("title", this.title);
                }
                if (this.iconUrl)
                {
                    listItemLink.addClass("aui-icon-container").css("background-image", "url('" + this.iconUrl + "')");
                }
                if (this.label)
                {
                    listItemLink.text(this.label);
                }
                listItem.append(listItemLink);
                list.append(listItem);

            });
            section.append(list);
            container.append(section);
        }
    });
    return container.children();
};

