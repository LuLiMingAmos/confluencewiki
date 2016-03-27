(function($){

    /**
     * A generic input component that accepts key-presses and filters DOM elements in a container
     * based on the input string.
     *
     * @see the Macro Browser for usage
     *
     * @param options object containing:
     *      - items - (required) jQuery selector for items to be filtered
     *      - formId - (optional) the id attribute to add to the filter form
     *      - inputId - (optional) the id attribute to add to the <input> field of the filter form
     *      - matcher - (optional) function to filter a single item on input text
     *      - searcher - (optional) function to filter all DOM elements on input text
     *      - postSearch - (optional) action to take once the elements have been filtered
     *      - placeholderText - (optional) text to show in the input field when no value is entered
     *      - submitCallback - (optional) called when the user presses enter in the field with items still visible
     *
     * @return {*} the jQuery-wrapped search input form
     */
    Confluence.DomFilterField = function (options) {

        var defaults = {

            /**
             * The jQuery selector for items to be filtered. You really want to add an override for these.
             *
             * The reason that we use a selector is that the DomFilterField may be initialised before the items exist
             * (e.g. they may be populated by an async call). Use the refreshItems method of the returned object to
             * reload the items from the DOM.
             */
            items: null,

            /**
             * Matches jQuery-wrapped DOM items to the search text, returning true if the item is a match, else false.
             * By default, search filter checks the entire text of the container elements and hides those not containing
             * the search text.
             *
             * @param $item the item to match against
             * @param searchText the text to match on
             * @return boolean true if the item matches the searchText, false otherwise
             */
            matcher: function ($item, searchText) {
                // A simple implementation searching for exact text, case-insensitive.
                var itemText = $item.text().toLowerCase();
                return itemText.indexOf(searchText) > -1;
            },

            /**
             * Hides or shows $items based on the search text.
             *
             * @param $items the items to filter
             * @param val the text to search for
             */
            searcher: function ($items, val) {

                if (val !== '') {
                    // Default impl is case-insensitive.
                    val = val.toLowerCase();

                    $items.each(function () {
                        var $item = $(this);
                        var matches = options.matcher($item, val);
                        $item.toggleClass('hidden', !matches);
                    });
                } else {
                    // No filter.
                    $items.removeClass('hidden');
                }
            },

            /**
             * Called after the DOM elements have been filtered. A good place to select the first one, if that's how
             * your UI rolls.
             *
             * @param $visibleItems
             */
            postSearch: function ($visibleItems) {
                // do nothing
            },

            /**
             * Text to display in the search box when blank.
             */
            placeholderText: AJS.I18n.getText("search.name"),

            /**
             * Override this to do something useful when the user presses Enter after they type. A nice behaviour
             * might be to reproduce a single- or double-click on the first item.
             *
             * @param $visibleItems the filtered items
             * @param searchText the input text at time of submission
             */
            submitCallback: function ($visibleItems, searchText) {
                AJS.debug("Confluence.DomFilterField submitted with " + $visibleItems.length + " item(s) for search text >" + searchText + "<");
            }
        };
        options = $.extend(defaults, options);

        // Cached copy of the jQuery selector so we don't re-run it on every keypress. The danger is that the items may
        // change between searched, so call refreshItems on the returned object when necessary.
        var $items;

        function refreshItems() {
            $items = $(options.items);
        }
        refreshItems();

        function getValue() {
            // Returns the field value, ignoring any placeholder in... place.
            return $.trim(searchInput.filter(':not(.blank-search)').val());
        }

        function hasValue() {
            return getValue() !== '';
        }

        function getVisibleItems() {
            return $items.filter(':visible');
        }

        var searchForm = $(Confluence.Templates.DomFilterField.form());
        var searchInput = searchForm.find('input');

        function doFilter() {
            options.searcher($items, getValue());
            options.postSearch(getVisibleItems());
        }

        searchInput.keyup(function (e) {
                doFilter();
                return AJS.stopEvent(e);
            })
            .keyup(function (e) {
                // My key event! You can't have!
                return AJS.stopEvent(e);
            })
            .focus(function(e) {
                if (searchInput.hasClass("blank-search")) {
                    searchInput.removeClass("blank-search").val("");
                }
                e.target.select();
            })
            .blur(function (e) {
                if (!hasValue()) {
                    searchInput.addClass("blank-search").val(options.placeholderText);
                }
            })
            .blur();

        if (options.formId) {
            searchForm.attr("id", options.formId);
        }
        if (options.inputId) {
            searchInput.attr("id", options.inputId);
        }

        searchForm.submit(function(e) {
            AJS.stopEvent(e);
            var $visibleItems = getVisibleItems();
            if ($visibleItems.length) {
                options.submitCallback($visibleItems, getValue());
            }
            return false;
        });

        return {
            /**
             * For stickin' in the DOM!
             */
            form: searchForm,

            /**
             * Returns the search form and filtered items to their original state.
             */
            reset: function () {
                if (hasValue()) {
                    searchInput.val('').blur();
                    options.searcher($items, '');
                }
            },

            /**
             * Refresh the items from the DOM after the DOM changes.
             */
            refreshItems: refreshItems,

            /**
             * Force the filter
             */
            filter: doFilter,

            /**
             * Focus the search field.
             */
            focus: function () {
                searchInput.focus();
            },

            focusAndSearch: function (searchText) {
                searchText = $.trim(searchText);
                searchInput.val(searchText).keyup();
                searchText && searchInput.removeClass("blank-search");    // needs removing so focus won't delete the text
                searchInput.focus();
            }
        };
    };
}(AJS.$));