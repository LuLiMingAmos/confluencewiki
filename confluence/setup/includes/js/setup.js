(function ($) {
    if (!$) return;

    $.fn.ready(function() {
        $(document).bind("long-running-task-complete", function () {
            $("#wait-spinner").hide();
        });

        $(document).bind("long-running-task-failed", function () {
            $("#wait-spinner").hide();
            $("#task-elapsed-time-label").hide();
            $("#taskElapsedTime").hide();
        });

        var mySQLWarningMessage = $('#db-choice-warning');
        var mySQLErrorMessage = $('#mysql-db-choice-error');

        $('select[name=dbChoiceSelect]').change(function() {
            if ($(this).val() === 'mysql') {
                mySQLErrorMessage.hide();
                mySQLWarningMessage.show();
            } else {
                mySQLWarningMessage.hide();
                mySQLErrorMessage.hide();
                $('.aui-message.error').hide();
            }
        });

        //Disable the submit button(s) on the form after form is submitted
        $(document).on('submit',function() {
            var $form = $(this);
            setTimeout(function() {
                $form.find('input:submit').prop('disabled', 'true');
            }, 0);
        });

        if ($('#mysql-db-choice-error').length) { //implies *not* zero
            $('select[name=dbChoiceSelect]').val("mysql");
        }

    });
})(AJS && AJS.$);
