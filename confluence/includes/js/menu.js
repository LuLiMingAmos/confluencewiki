// ==================
// = Drop-down menu =
// ==================
AJS.menuShowCount = 0;

(function() {
    var $ = jQuery;
    var shownDropDown = null;
    var hideDropDown = function (e) {
        if (typeof AJS.dropDownTimer != "undefined" && AJS.dropDownHider) {
            clearTimeout(AJS.dropDownTimer);
            delete AJS.dropDownTimer;
            AJS.dropDownHider();
            AJS.dropDownHider = null;
        }
    };

    /**
     * Check the entire document for any open drop downs.
     */
    var isAnyMenuBarOpen = function () {
        return $(".ajs-menu-bar.menu-bar-open").length > 0;
    };

    /**
     * Close any drop downs for the menu bar that the supplied item is in
     * @param an item in the menu that all drop downs have to be closed for
     */
    var closeMenuDropDowns = function (item) {
        $(item).closest(".ajs-menu-bar").find(".ajs-drop-down").each(function(index) {
            this.hide();
        });
    };

    /**
     * @param an item in the menu we want to check
     * @return true if the menu bar is opened
     */
    var isMenuBarOpen = function (item) {
        return $(item).closest(".ajs-menu-bar").hasClass("menu-bar-open");
    };

    /**
     * Add a class to the indicated menu bar that indicates it is open
     * @param an item in the menu to be marked
     */
    var markMenuBarOpen = function (item) {
        $(item).closest(".ajs-menu-bar").addClass("menu-bar-open");
    };

    var markMenuBarClosed = function (item) {
        $(item).closest(".ajs-menu-bar").removeClass("menu-bar-open");
    };

    $.fn.ajsMenu = function (options) {
        options = options || {};

        $(".ajs-button", this).each(function () {
            $(this).mouseover(function() {
                var item = this;
                var menuBarOpened = isMenuBarOpen(item);
                closeMenuDropDowns(item);

                // if the menu bar was opened then any closed drop downs should open again
                // when the mouse returns over them.
                if (menuBarOpened) {
                    // set up a document handler to remove the open status (that we are about to add) when we click
                    // out side of the menu bar
                    var $document = $(document);

                    var myMenuClickOut = function() {
                        markMenuBarClosed(item);
                        return false;
                    };

                    $document.unbind("click.menu");
                    setTimeout(function () {$document.one("click.menu", myMenuClickOut);}, 1);
                    markMenuBarOpen(item);
                }
            });
        });

        $(".ajs-menu-item", this).each(function() {
            $(this).ajsMenuItem(options);
        });
    };

    $.fn.ajsMenuItem = function (options) {
        options = options || {};
        var it = this, $it = $(this),
            dd = $(".ajs-drop-down", it);
        if (!dd.length) return;

        dd = dd[0];
        dd.hidden = true;
        dd.focused = -1;
        dd.hide = function () {
            if (!this.hidden) {
                $it.toggleClass("opened");
                // remove the menu-bar-open class if there are no open items on this menu now
                var $parentNode = $(it.parentNode);
                if ($parentNode.find(".opened").length == 0) {
                    markMenuBarClosed(it);
                }
                var as = $("a", this);
                $(this).toggleClass("assistive");
                this.hidden = true;
                $(document).unbind("click", this.fhide).unbind("keydown", this.fmovefocus).unbind("keypress", this.blocker);
                if (this.focused + 1) {
                    $(as[this.focused]).removeClass("active");
                }
                this.focused = -1;
            }
        };
        dd.show = function () {
            if (typeof this.hidden == "undefined" || this.hidden) {
                var dd = this, $dd = $(this);
                $dd.toggleClass("assistive");
                $it.toggleClass("opened");
                markMenuBarOpen(it);
                this.hidden = false;
                this.timer = setTimeout(function () {$(document).click(dd.fhide);}, 1);
                $(document).keydown(dd.fmovefocus).keypress(dd.blocker);
                var as = $("a", dd);
                as.each(function (i) {
                    var grandpa = this.parentNode.parentNode;
                    $(this).hover(function (e) {
                        if (grandpa.focused + 1) {
                            $(as[grandpa.focused].parentNode).removeClass("active");
                        }
                        $(this.parentNode).addClass("active");
                        grandpa.focused = i;
                    }, function (e) {
                        if (grandpa.focused + 1) {
                            $(as[grandpa.focused].parentNode).removeClass("active");
                        }
                        grandpa.focused = -1;
                    });
                });
                var topOfViewablePage = (window.pageYOffset || document.documentElement.scrollTop);
                var bottomOfViewablePage = topOfViewablePage + $(window).height();
                $dd.removeClass("above");
                if (!options.isFixedPosition) {
                    if ($dd.offset().top + $dd.height() > bottomOfViewablePage) {
                        $dd.addClass("above");
                        if ($dd.offset().top < topOfViewablePage) {
                            $dd.removeClass("above");
                        }
                    }
                }
            }
        };

        /**
         * @return true if the menu "bar" this drop down belongs to is opened already.
         */
        dd.isMenuBarOpened = function() {
            return isMenuBarOpen(dd);
        };

        /**
         * Close any other drop downs in the same menu as this dd
         */
        dd.closeOthers = function() {
            closeMenuDropDowns(dd);
        };

        dd.fmovefocus = function (e) {dd.movefocus(e);};
        dd.fhide = function (e) {
            dd.hide(e);

            // If this was called as the result of selecting an item in the menu then propagate the event.
            // otherwise it was called because a menu was clicked out of.
            return AJS.$(e.target).closest(".ajs-drop-down").length > 0;
        };

        dd.blocker = function (e) {
            var c = e.which;
            if (c == 40 || c == 38) {
                return false;
            }
        };
        dd.movefocus = function (e) {
            var c = e.which,
                a = this.getElementsByTagName("a"),
                previousFocused = this.focused,
                isTab = (c == 9),
                outOfList;

            do {
                switch (c) {
                    case 40:
                    case 9: {
                        if (e.shiftKey)
                            this.focused--;
                        else
                            this.focused++;
                        break;
                    }
                    case 38: {
                        this.focused--;
                        break;
                    }
                    case 27: {
                        this.hide();
                        return false;
                    }
                    default: {
                        return true;
                    }
                }
                outOfList = (this.focused < 0 || this.focused > a.length - 1);
            } while(!outOfList && $(a[this.focused].parentNode).hasClass("assistive"));
            if (isTab && outOfList) {
                // If tab, and end of list, hide the list, and let the browser handle it
                if (previousFocused != -1)
                    $(a[previousFocused].parentNode).removeClass("active");
                this.focused = -1;
                this.hide();
                return false;
            }
            else if (!isTab) {
                // If up/down arrows, cycle the list and stop the browser default
                if (this.focused < 0)
                    this.focused = a.length - 1;
                else if (this.focused > a.length - 1)
                    this.focused = 0;
            }
            if (previousFocused >= 0)
                $(a[previousFocused].parentNode).removeClass("active");
            a[this.focused].focus();
            $(a[this.focused].parentNode).addClass("active");
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        // we need to call show here to calculate the offset below
        dd.show();
        clearTimeout(dd.timer);
        var $dd = $(dd),
            offset = $dd.offset();
        dd.hide();

        var a = $(".trigger", it);
        if (a.length) {
            var killHideTimerAndShow = function() {
                clearTimeout(AJS.dropDownTimer);
                delete AJS.dropDownTimer;
                AJS.dropDownHider();
                AJS.dropDownHider = null;
                dd.show();
            };

            var showMenu = function (millis) {
                var changingMenu = typeof AJS.dropDownTimer != "undefined";
                shownDropDown = dd;
                if (changingMenu) {
                    killHideTimerAndShow();
                }
                else {
                    AJS.dropDownShower = function () {dd.show(); delete AJS.dropDownShowerTimer;};
                    AJS.dropDownShowerTimer = setTimeout(AJS.dropDownShower, millis);
                }
            };
            var hideMenu = function (millis) {
                var passingThrough = typeof AJS.dropDownShowerTimer != "undefined";
                if (passingThrough) {
                    clearTimeout(AJS.dropDownShowerTimer);
                    delete AJS.dropDownShowerTimer;
                }
                if (typeof AJS.dropDownTimer != "undefined") {
                    clearTimeout(AJS.dropDownTimer);
                    delete AJS.dropDownHider;
                }
                AJS.dropDownHider = function () {dd.hide(); delete AJS.dropDownTimer;};
                AJS.dropDownTimer = setTimeout(AJS.dropDownHider, millis);
            };

            $it.mouseover(function () {
                // if the menu bar is already opened then hovering over other items
                // in the menu will activate them.
                if (dd.isMenuBarOpened()) {
                    if (dd.hidden) {
                        // close any other menus within this bar
                        closeMenuDropDowns(dd);

                        // open this menu
                        dd.show();
                    }
                } else {
                    // this menu bar is not already opened so add hover effect to any items hovered over
                    $it.addClass("hover");
                }
            });

            $it.mouseout(function () {
                if (!dd.isMenuBarOpened()) {
                    $it.removeClass("hover");
                }
            });

            a.click(function () {
                if (dd.hidden) {
                    a.parent("li").removeClass("hover");
                    // if there are not any other open menus then we can cancel the event
                    // (otherwise allow it to propagate to close any open menu)
                    var propagateEvent = isAnyMenuBarOpen();
                    dd.show();
                    return propagateEvent;
                }
                else {
                    dd.hide();
                    a.parent("li").addClass("hover");
                    return false;
                }
            });
        }
    };
})();

AJS.toInit(function ($) {

    $("#view-user-history-link").click(function (e) {
        window.open(this.href, (this.id + "-popupwindow").replace(/-/g, "_"), "width=600, height=400, scrollbars, resizable");
        e.preventDefault();
        return false;
    });

    /* TODO: Extract this logic out into a common js file */
    var showError = function (errorMessage) {
        // Avoid duplicate errors
        if ($('#action-messages').html().indexOf(errorMessage) === -1)
        {
            AJS.messages.error("#action-messages", {
                body: errorMessage
            });
        }
    };

    var handleResponse = function(data, menuItem, callback) {
        if(data.actionErrors) {
            for (var i = 0; i < data.actionErrors.length; i++) {
                showError(data.actionErrors);
            }
        } else if (data.errorMessage) {
            showError(data.errorMessage);
        } else {
            callback();
        }
        menuItem.removeClass("waiting");
    };

    var parseJsonOr = function(jqXHR, alternative) {
        try {
            return AJS.$.parseJSON(jqXHR.responseText);
        }
        catch(e) {
            console.error("Error while parsing \"" + jqXHR.responseText + "\": " + e);
            return alternative;
        }
    };

    $("#page-favourite").click(function (e) {
        var menuItem = $(this),
            menuItemText = menuItem.find("span");

        if (menuItem.hasClass("waiting")) {
            // already waiting
            return AJS.stopEvent(e);
        }
        menuItem.addClass("waiting");
        var url = Confluence.getContextPath() + "/json/addfavourite.action";
        if (menuItem.hasClass("selected")) {
            url = Confluence.getContextPath() + "/json/removefavourite.action";
        }

        AJS.safe.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            data: {
                "entityId": AJS.params.pageId
            },
            success: function(data) {
                handleResponse(data, menuItem, function() {
                    menuItem.toggleClass("selected");
                    menuItem.toggleClass("ie-page-favourite-selected");
                    if (menuItem.hasClass("selected")) {
                        menuItemText.text(AJS.I18n.getText("pagemenu.unfavourite"));
                    } else {
                        menuItemText.text(AJS.I18n.getText("pagemenu.favourite"));
                    }
                });
            },
            error: function(jqXHR) {
                handleResponse(parseJsonOr(jqXHR, {}), menuItem, function() {
                    showError("Server error while updating favourite")
                });
            }
        });
        return AJS.stopEvent(e);
    });

    var toolsMenu = $("#action-menu-link"), addMenu = $("#add-menu-link");

    if(toolsMenu.length) {
        toolsMenu.next().addClass("most-right-menu-item");
    }
    else if(addMenu.length) {
        addMenu.next().addClass("most-right-menu-item");
    }

    /*
    AUI Dropdown2 always sets the menu position via the
    `left` CSS property. Because some items in the tools
    menu are wider than the standard min-width, it grows
    to the right instead of the left, making it misalign
    with its trigger button.

    By swapping the `left` with the `right` on trigger,
    it will grow to the left (desired) as opposed to the
    right (undesired).

    This is supposed to be given "for free" with the
    `data-container` attribute, but I couldn't get it to
    work. I've left the attribute in in case it does work
    one day. :)
     */
    $("#action-menu").on({
        "aui-dropdown2-show": function () {
            $(this)
                .css({
                    right: function () {
                        return $(window).width() - toolsMenu.offset().left - toolsMenu.outerWidth(true) - 1;
                    },
                    left: "auto"
                });
        }
    });

    $(".ajs-menu-bar").ajsMenu({isFixedPosition: true});

});

/**
 * Dropdown Hackery. In IE6 if a link is wider than its dropdown, all the subsequent dropdowns break.
 * So we always make dropdowns wider than their link - done across browsers for consistency.
 * CRITICAL: CSS must reset the width of the hidden divs for IE6. Annoyingly it doesn't work if you do it with JS.
 * Currently the hidden dropdowns are excessively larger than their actual display size (about 1100px).
 * TODO: this would be much better if we could get real widths from the hidden dropdowns.
 */
AJS.$(function ($) {
    $("#header-menu-bar .ajs-menu-item").each(function () {
        var link = $(this), dropDown = $(".ajs-drop-down",this), linkWidth = link.width();
        if (linkWidth > dropDown.width()) {
            dropDown.width(linkWidth.valueOf() + 50);
            AJS.log("Dropdown width override occurred");
        }
    });
});
