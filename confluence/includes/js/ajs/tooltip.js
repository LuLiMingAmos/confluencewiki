/**
 *
 */
(function ($) {
    AJS.Tooltip = function (options) {
        var tooltipArrow = $('<div class="ajs-tooltip-arrow"></div>'),
            tooltip = $('<div class="ajs-tooltip">' + options.text + '</div>'),
            tooltipWrapper = $('<div class="ajs-tooltip-wrapper"></div>').appendTo($('body')),
            halfArrowSize = 3,
            setPosition = function () {
                var anchorPosition = options.anchor.offset();

                tooltipWrapper.css({
                    left: anchorPosition.left + options.anchor.width(),
                    // it displays 2px lower than we want for some reason so we subtract 2px
                    top: anchorPosition.top + (options.anchor.height() / 2) - (tooltipWrapper.height() / 2) - 2
                });

                tooltipArrow.css({
                    top: (tooltipWrapper.height() / 2) - halfArrowSize
                });
            };

        tooltipArrow.addClass('ajs-tooltip-arrow-left'); // TODO Take this as an option
        tooltipWrapper.append(tooltipArrow).append(tooltip);

        tooltip.css({
            width: options.width
        });

        options.anchor.bind('mouseover', function () {
            setPosition();
            tooltipWrapper.fadeIn('fast');
        });

        options.anchor.bind('mouseout', function () {
            tooltipWrapper.fadeOut('fast');
        });

        options.anchor.click(function(e) {
            e.preventDefault();
            if (!tooltipWrapper.is(":visible")) {
                setPosition();
                tooltipWrapper.fadeIn('fast');
            } else {
                tooltipWrapper.fadeOut('fast');
            }
        })
    };
})(AJS.$);