AJS.toInit(function ($) {

    var commentsStorage = Confluence.storageManager("comments");    
    
    var confirmRemovalHandler = function() {
        if (confirm(AJS.I18n.getText("remove.comment.confirmation.message"))) {
            this.href = this.href + '&confirm=yes';
            return true;
        }
        return false;
    };
    
    // TODO this should be merged with Confluence.CommentsManager from the quick-comments plugin.
    // It will be done once Quick Comments is finished. Having CommentsManager in a plugin helps dev speed. 
    Confluence.Comments = {
        
        /**
         * Bind a function to the remove option for the identified comment.
         * 
         * TODO remove is actually a pluggable web-item. We actually need a more flexible/pluggable
         * mechanism for doing this. For instance, Likes would need dynamic binding list this as
         * well.
         * 
         * @param commentId 
         */
        bindRemoveConfirmation: function(commentId) {
            $('#comment-' + commentId + ' .comment-action-remove a').click(confirmRemovalHandler);
        }
    };
    
    
    if (!$("#comments-section").length) {
        return;
    }

    if (AJS.isIE6) {
        $(".logo.anonymous").each(function () {
            var div = document.createElement("div");
            div.className = "replacement";
            AJS.applyPngFilter(div, this.src);
            $(this).replaceWith(div);
        });
        $(".comment-actions .comment-permalink a").each(function () {
            $(this).addClass("filtered");
            var path_light = $(this).css("background-image").replace(/^url\(\"?|\"?\)$/g, ""); // remove url(...) surrounding actual URL
            var path_dark = path_light.replace("light", "dark");
            AJS.applyPngFilter(this, path_light);
            this.style.cursor = "pointer";
            this.style.background = "none";
            $(this).hover(function () {
                AJS.applyPngFilter(this, path_dark);
            }, function () {
                AJS.applyPngFilter(this, path_light);
            });
        });
    }

    /*
     * Alternate colours of comments. Doing this with threaded comments in the backend
     * is painful.
     */
    $('#comments-section .comment:odd').addClass('odd');

    /*
     * Remove comment pop-up confirmation.
     */
    $('.comment-action-remove a').click(confirmRemovalHandler);

    // Text editor bindings
    var textEditor = $("#addcomment.comment-text"),
        textarea = $("#comments-text-editor textarea");
    textarea.focus(function() {
        textEditor.addClass("active");
    }).blur(function() { //html5 supported browsers
        if(!$.trim(textarea.val()).length) {
            textEditor.removeClass("active");
        }
    }).bind("reset.default-text", function() { //non html5 supported browsers
        textEditor.removeClass("active");
    });

    // prevent empty comments
    $("form[name='textcommentform']").submit(function() {
        var content = textarea.val();
        if (!$.trim(content)) {
            alert(AJS.I18n.getText("content.empty"));
            return false;
        }
        return true;
    });
    $("#add-comment-rte").click(function() {
        if (!textarea.hasClass("placeholded")) {
            commentsStorage.setItem("text-comment", $.trim(textarea.val()));
        }
    });
    if ($("#addcomment #rte").length) {
        AJS.bind("init.rte", function(e, data) {
            var content = commentsStorage.getItem("text-comment");
            if (content) {
                data.editor.setContent(content);
                commentsStorage.setItem("text-comment", "");
            }
        });
    }
});
