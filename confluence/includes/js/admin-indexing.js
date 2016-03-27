AJS.toInit(function ($) {

    var searchIndexProgress = $("#search-index-task-progress-container"),
            reindexTaskInProgress = $("#reindex-task-in-progress").length > 0,
            buildSearchIndexButton = $("#build-search-index-button"),
            searchIndexExists = $("#search-index-exists").length > 0,
            searchIndexElapsedTime = $("#search-index-elapsed-time"),
            searchIndexElapsedTimeContainer = $("#search-index-elapsed-time-container"),
            searchIndexErrorStatus = $("#search-index-error-status"),
            searchIndexSuccessStatus = $("#search-index-success-status"),
            searchIndexInProgressStatus = $("#search-index-inprogress-status"),
            $indexingStatus = $(".indexing-status");

    buildSearchIndexButton.click(function () {

        AJS.safe.ajax({
            url: Confluence.getContextPath() + "/admin/reindex.action",
            type: "POST",
            dataType: "json",
            data: {}, // must declare this to use AJS.safe.ajax
            success: function (data) {
                searchIndexProgress.progressBar(0);
                searchIndexElapsedTimeContainer.hide();
                monitorProgress();
            }
        });

        return false;
    });

    if (!searchIndexExists || searchIndexElapsedTime.html() == '') {
        searchIndexElapsedTimeContainer.hide();
    }

    searchIndexProgress.progressBar(0);

    if (reindexTaskInProgress) {
        monitorProgress();
    }

    function monitorProgress() {
        buildSearchIndexButton.prop("disabled", true);

        var searchInterval = setInterval(function () {
            $.getJSON(contextPath + '/json/reindextaskprogress.action', function (data) {
                searchIndexProgress.progressBar(data.percentageComplete);

                $indexingStatus.text(data.count + " / " + data.total);

                searchIndexElapsedTimeContainer.show();
                searchIndexElapsedTime.html(data.compactElapsedTime);

                if (data.percentageComplete == 100) {
                    buildSearchIndexButton.prop("disabled", false);

                    searchIndexSuccessStatus.show();
                    searchIndexErrorStatus.hide();
                    searchIndexInProgressStatus.hide();

                    clearInterval(searchInterval);
                }
            });
        }, 1000);
    }

    if (searchIndexExists && !reindexTaskInProgress) {
        searchIndexProgress.progressBar(100);
    }

    if (reindexTaskInProgress) {
        searchIndexInProgressStatus.show();
        searchIndexErrorStatus.hide();
        searchIndexSuccessStatus.hide();
    } else if (searchIndexExists) {
        searchIndexSuccessStatus.show();
        searchIndexErrorStatus.hide();
        searchIndexInProgressStatus.hide();
    } else {
        searchIndexErrorStatus.show();
        searchIndexSuccessStatus.hide();
        searchIndexInProgressStatus.hide();
    }

});