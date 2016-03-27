Confluence.QuickNav = (function($) {
    var dropDownPostProcess = [];
    var makeParams;

    return {
        addDropDownPostProcess: function(dp) {
            if(typeof dp !== "undefined") {
                dropDownPostProcess.push(dp);
            } else {
                AJS.log("WARN: Attempted to add a dropdown post-process function that was undefined.");
            }
        },
        setMakeParams: function(mp) {
            makeParams = mp;
        },
        init : function(quickSearchInputField, dropDownPlacement) {
            quickSearchInputField.quicksearch("/rest/quicknav/1/search", null, {
                dropdownPlacement : dropDownPlacement,
                dropdownPostprocess : function(dd) {
                    $.each(dropDownPostProcess, function(index, postProcessFunction) {
                        postProcessFunction && postProcessFunction(dd);
                    });
                },
                makeParams: function(value) {
                    // if the makeParams function was set use that one instead of the default
                    if (makeParams)
                        return makeParams(value);
                    else
                        return { query : value };
                },
                ajsDropDownOptions: {
                    className: "quick-search-dropdown"
                }
            });
        }
    }
})(AJS.$);

AJS.toInit(function() {
    /**
     * Opens the search result in a new tab when you press ctrl+enter.
     */
    var enableSearchInNewTab = function() {
        AJS.$("#quick-search").on("keydown", function (e) {
            var quickSearchDropdownSelected = AJS.dropDown.current && AJS.dropDown.current.getFocusIndex() != -1;
            var ctrlEnterPressed = e.which === 13 && (e.metaKey || e.ctrlKey);
            if (ctrlEnterPressed && !quickSearchDropdownSelected) {
                var $this = AJS.$(this);
                $this.attr("target", "_blank");
                $this.submit();
                $this.attr("target", "");
            }
        });
    };

    var setupAnalytics = function() {
        // Capture the type of the result that is being clicked on
        AJS.$("#quick-search").on("click", "div.quick-search-dropdown li", function (e) {
            var li = AJS.$(this);
            var eventTarget = AJS.$(e.target);
            var notSecondAOrRealClick = !(eventTarget.is("a") && (eventTarget.parent().children("a")).index(eventTarget) === 1) || (e.originalEvent !== undefined);
            if (notSecondAOrRealClick) {
                var resultType = li.children("a:first").attr("class");
                var resultIndex = li.index("div.quick-search-dropdown li");
                var payload = {name: "quicknav-click-" + resultType, data: {index: resultIndex}};
                AJS.trigger("analytics", payload);
            }
        });

        // Capture when people use the quicknav field to navigate to the search page
        AJS.$("#quick-search").on("submit", function () {
            var numberOfQuickNavResults = AJS.$("div.quick-search-dropdown li").length;
            var payload = {name: "quicknav-hit-enter", data: {results: numberOfQuickNavResults}};
            AJS.trigger("analytics", payload);
        });
    };

    /**
     * Binds two events to the form for showing/hiding a loading spinner when there is ajax activity in the quick search
     * drop downs. Trigger "quick-search-loading-start" from a dropdown to show the spinner, and "quick-search-loading-stop"
     * to hide the spinner.
     */
    var bindLoadingSpinner = function() {
        var $input = AJS.$("#quick-search-query");
        AJS.$("#quick-search").on({
            "quick-search-loading-start" : function() {
                $input.addClass("loading");
            },
            "quick-search-loading-stop" : function() {
                $input.removeClass("loading");
            }
        });
    };

    /**
     * Append the drop down to the form element with the class quick-nav-drop-down
     */
    var quickNavPlacement = function (input) {
        return function (dropDown) {
            input.closest("form").find(".quick-nav-drop-down").append(dropDown);
        };
    };

    /**
     * Add the space name to the dropdown field.
     * @param dd
     */
    var addSpaceName = function(dd) {
        AJS.$("a", dd).each(function () {
            var $a = AJS.$(this);
            var $span = $a.find("span");
            // get the hidden space name property from the span
            var spaceName = AJS.dropDown.getAdditionalPropertyValue($span, "spaceName");
            if (spaceName && !$a.is(".content-type-spacedesc")) {
                // clone the original link for now. This could potentially link to the space?
                $a.after($a.clone().attr("class", "space-name").html(spaceName));
                // add another class so we can restyle to make room for the space name
                $a.parent().addClass("with-space-name");
            }

        });
    };

    var quickSearchQuery = AJS.$("#quick-search-query"),
        spaceBlogSearchQuery = AJS.$("#space-blog-quick-search-query"),
        confluenceSpaceKey = AJS.$("#confluence-space-key");

    var placementFunction = quickNavPlacement(quickSearchQuery);

    // Choose and Setup the QuickNav
    var quickNav = AJS.defaultIfUndefined("Atlassian.SearchableApps.QuickNav", { defaultValue: Confluence.QuickNav });
    quickNav.init(quickSearchQuery, placementFunction);
    quickNav.addDropDownPostProcess(addSpaceName);

    if (spaceBlogSearchQuery.length && confluenceSpaceKey.length) {
        spaceBlogSearchQuery.quicksearch("/rest/quicknav/1/search?type=blogpost&spaceKey=" +
                AJS("i").html(confluenceSpaceKey.attr("content")).text(), null, {
            dropdownPlacement : quickNavPlacement(spaceBlogSearchQuery)
        });
    }

    setupAnalytics();
    bindLoadingSpinner();
    enableSearchInNewTab();
});
