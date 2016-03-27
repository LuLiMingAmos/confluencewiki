/**
 * Displays default text in the input field when its value is empty.
 * If the browser supports placeholder input attributes (HTML5), then
 * we skip this component.
 *
 * Usage:
 * <pre>
 * &lt;input placeholder="Some default text"&gt;
 * </pre>
 *
 * Events thrown: reset.placeholder
 * 
 * @class placeholder
 * @namespace AJS.Confluence.Binder
 */
AJS.Confluence.Binder.placeholder = function(scope) {
    scope = scope || document.body;
    var $ = AJS.$;
    var ignoredClasses = ["autocomplete-multiuser", "select2-input"];
    // browser supports placeholder, no need to do anything
    var temp = document.createElement('input');
    if('placeholder' in temp)
        return;

    // support old attributes default-text, cause it was introduced in 3.3.
    $("textarea[placeholder][data-placeholder-bound!=\"true\"]," +
      "input[placeholder][data-placeholder-bound!=\"true\"]," +
      "input.default-text[data-placeholder-bound!=\"true\"]", scope).each(function() {
        var $this = $(this).attr("data-placeholder-bound", "true");

        // HACK: Ignore fields that don't actually need the placeholder behaviour
        for (var i = 0, numIgnoredClasses = ignoredClasses.length; i < numIgnoredClasses; ++i) {
            if ($this.hasClass(ignoredClasses[i]))
                return;
        }

        // Since we insert the placeholder as value for browsers that do not support the tag we need to remove it
        // before submitting or or it will be treated as the value for that field
        $this.bind("reset.placeholder",function(e,data){
           var form = data.element.closest("form");
           form.bind('submit',function() {
               if(data.element.hasClass("placeholded")){
                   data.element.val('');
               }
           });
        });


        var applyDefaultText = function() {
                if($.trim($this.val()).length)
                    return;
                var defaultText = $this.attr("placeholder") || $this.attr("data-default-text");
                $this.val(defaultText)
                     .addClass("placeholded")
                     .trigger("reset.placeholder",{"element": $this, "defaultText": defaultText });
                $this.trigger("reset.default-text");
            },
            clearDefaultText = function() {
                if (!$this.hasClass("placeholded"))
                    return;
                $this.val("");
                $this.removeClass("placeholded");
            };

        applyDefaultText();
        $this.blur(applyDefaultText).focus(clearDefaultText)
            // Needed because IE does not fire a focus event when clicking on this field from a Select2 field.
            // It also doesn't fire a blur event when moving focus from this field to a Select2 field, but that's not
            // easily fixable :(
            .mousedown(clearDefaultText);
    });
};



// for backwards compatibility
Confluence.Binder.inputDefaultText = Confluence.Binder.placeholder;