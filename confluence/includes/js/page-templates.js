/**
 * Used by createpage-entervariables.vm to update Template Variable form fields embedded in the rendered wiki content.
 */
AJS.toInit(function($) {

    function syncTemplateField() {
        // The same template variable may appear multiple times in the template. Keep the values synchronized.
        var that = this;
        var nameSelector = '[name="' + that.name + '"]';
        $('.wiki-content,form[name="filltemplateform"]').find('input'+nameSelector+',textarea'+nameSelector+',select'+nameSelector).not(that).each(function (index, field) {
            $(field).val($(that).val());
        });
    }

    $('.wiki-content').find('input,textarea,select').change(syncTemplateField);

    var fillTemplateForm = $('form[name="filltemplateform"]');
    // clone the fields into the fill template form so that they are synced for submit
    $('.wiki-content .page-template-field[name^="variableValues."]').each(function(){
        // only add it once
        if (fillTemplateForm.find('.page-template-field[name="'+this.name+'"]').length == 0) {
            $(this).clone().hide().appendTo(fillTemplateForm);
            // trigger a change event on the field so any existing state gets synced (eg back-button)
            syncTemplateField.call(this);
        }
    });

    $('.wiki-content input.page-template-field').keyup(function(e) {
        syncTemplateField.call(this);

        // User should still be able to submit the "create-from-template" form with enter key.
        if (e.which == 13) { //Enter
            fillTemplateForm.submit();
        }
    });

    // handle textarea
    $('.wiki-content textarea.page-template-field').change(syncTemplateField);

    // Kill all form-submission inside the wiki-content - give other form-JS time to do bindings, in case this logic
    // runs *before* the bindings are added.
    setTimeout(function() {
        $('.wiki-content form').unbind().submit(function(e) {
            // Really try to kill the event...
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });
    }, 100);

    // Disabling any button that may be rendered as part of the template content
    $('.view-template .aui-button').attr('aria-disabled', 'true');
});
