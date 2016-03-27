(function() {
    /**
     * Construct a highlighter for the specified tokens.
     *
     * @constructor
     * @param highlightTokens the tokens to highlight
     * @param highlightTemplate an AJS.template String to use for highlighting. Variable substituted if {highlight}.
     *        e.g. <span class="highlight">{highlight}</span>
     *        Default, if omitted is <strong>{highlight}</strong>
     */
    Confluence.Highlighter = function(highlightTokens, highlightTemplate) {
        var regex, replaceValue;
        if (highlightTokens && highlightTokens.length && highlightTokens[0]) {
            // escape regex chars .*+?|()[]{}\ first
            var tokens = [];
            for (var i = 0, ii = highlightTokens.length; i < ii; i++) {
                var token = highlightTokens[i];
                token && tokens.push(token.replace(/[\.\*\+\?\|\(\)\[\]{}\\]/g, "\\$"));
            }

            regex = new RegExp("(" + tokens.join("|") + ")", "gi");
            replaceValue = AJS.template(highlightTemplate || "<strong>{highlight}</strong>")
                .fill({highlight: "$1"})
                .toString();
        }

        return {
            /**
             * Highlights any matching tokens (passed into the constructor), and returns the new value.
             *
             * @param value an array of values to be highlighted
             * @param dontEscape don't html escape value. Default is to escape
             * @return value, if highlightTokens is null, or empty.
             */
            highlight: function(value, dontEscape) {
                if(!value) return value;

                if(!dontEscape)
                    value = AJS.template.escape(value);

                if(!regex) return value;

                return value.replace(regex, replaceValue);
            },

            /**
             * Same as highlight() but this variant deals safely with unescaped HTML. For example, we can pass in
             * "<script>alert(1)</script>" with highlightTokens = ["alert"] and the result will be an HTML encoded string
             * for everything but the highlight tags, e.g. "&lt;script&gt;<strong>alert</strong>(1)&lt;&#x2F;script&gt;".
             *
             * The highlight escaping behaviour of this method is the same as HtmlHighlighter.java in the searchv3 plugin.
             *
             * @param value the string to be highlighted
             * @return The highlighted string html escaped except for the highlight tags
             *
             */
            safeHighlight: function(value) {
                if(!value) return value;
                
                /*
                 * 1. Surround highlight tokens with placeholder tags
                 * 2. HTML escape result
                 * 3. Replace placeholder tags for start and end highlight with proper html tags
                 */
                if (regex && replaceValue) {
                    var replacementTags = replaceValue.split("$1");
                    var highlightStartTag = replacementTags[0];
                    var highlightEndTag = replacementTags[1];
                    value = value.replace(regex, "@@@hl@@@$1@@@endhl@@@");
                }

                var escapedAndHighlighted = _.escape(value)
                    .replace(/@@@hl@@@/gi, highlightStartTag)
                    .replace(/@@@endhl@@@/gi, highlightEndTag);

                return escapedAndHighlighted;
            }
        };
    };
})();