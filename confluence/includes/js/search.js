AJS.toInit(function ($) {

    // CONF-13119 - not all themes will make use of the supporting-site-search-form so only do this is necessary
    var transferQueryStringValue = function() { /* do nothing */ };
    var supportingSiteSearchForm = $('#supporting-site-search-form');
    
    if (supportingSiteSearchForm.length) {
        supportingSiteSearchForm.append($('#query-string')).append('&nbsp;').append($('#search-query-submit-button'));
        $('#site-search-form').prepend('<input type="hidden" id="hidden-query-string" name="queryString">');        
        transferQueryStringValue = function() {
            $("#hidden-query-string").val($("#query-string").val());
        };        
    }

    $("#supporting-site-search-form").submit(function (e) {
        transferQueryStringValue();
        $("#site-search-form").submit();

		e.preventDefault();
		return false; 
	});

	// set timeout on ajax json requests to 15s
	$.ajaxSetup({timeout: 15000});

    var userSearchField = $("#search-filter-by-contributor-autocomplete"),
        lastAutocompleteFullName = userSearchField.val();

    userSearchField.bind("selected.autocomplete-user-or-group", function(e, data){
        lastAutocompleteFullName = userSearchField.val();
    });

	$("#site-search-form").submit(function(e) {
        transferQueryStringValue();
		// decide on whether the last selection made in the autocomplete list has since been over-typed
		// and if it has use the content of the field instead of the hidden field populated by the last selection.
		if (lastAutocompleteFullName != userSearchField.val()) {
			$("#search-filter-by-contributor-hidden").val("");
		}
	});

    $("#secondary-search").submit(function (e) {
        $("#query-string").val($("#secondary-search input[type=text]").val());

        $("#supporting-site-search-form").submit();

		return AJS.stopEvent(e);
    });

    var analyticsBaseDate = {
        query: $("#query-string").val() || "",
        uuid: $(".search-results").attr("data-search-id")
    };

    var startIndex = +(location.search.match(/(?:\?|&)startIndex=(\d+)/) || [])[1] || 0;
    $(".search-results > li").each(function (i) {
        var positionedData = _.extend({
                position: i + 1 + startIndex
            }, analyticsBaseDate);

        $(".search-result-title > a", this).click(function () {
            AJS.trigger("analyticsEvent", {
                name: "search-result.v2.click",
                data: positionedData
            });

            AJS.trigger("analyticsEvent", {
                name: "search-result.v2.position." + (i + 1) + ".click"
            });
        });

        $(".result > a", this).click(function () {
            var className = $(this).attr('class');
            var href = $(this).attr('href');
            AJS.trigger("analyticsEvent", {
                name: "search-result.v2.result.click",
                data: _.extend({
                    className: className,
                    href: href
                }, positionedData)
            });
        });

        $(".search-result-metadata a", this).click(function () {
            var className = $(this).attr('class');
            var href = $(this).attr('href');
            AJS.trigger("analyticsEvent", {
                name: "search-result.v2.metadata.click",
                data: _.extend({
                    className: className,
                    href: href
                }, positionedData)
            });
        });
    });
});

