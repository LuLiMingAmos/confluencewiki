(function ($) {
    /**
     * A utility function for IE and Firefox specifically that will select all text in the supplied textbox control.
     *
     * Webkit has a more sensible behaviour on focus so doesn't need this.
     */
    var selectAll = function($textbox) {
        var textElem = $textbox[0];
        if (textElem.setSelectionRange) {
            var length = $textbox.val().length;
            textElem.setSelectionRange(0, length);
        } else if (textElem.createTextRange) {
            var range = textElem.createTextRange();
            range.execCommand("SelectAll");
            range.select();
        }
    };

    Confluence.SignUpForm = function () {
        var $username, $email,

        usernameIsCustom = function () {
            return $username.data('custom');
        },

        extractUsernameFromEmail = function () {
            var emailVal = $email.val(),

                // The regex here should comply with the validation rules in UserFormValidator.
                // It ignores "anonymous" user, but this is quite unlikely to be a real address.
                usernameMatches = emailVal.match(/[^@]+/);

            return (usernameMatches ? usernameMatches[0].replace(/[\\,+<>'"\s]/g, "").toLowerCase() : '');
        },

        updateUsername = function () {
            if (usernameIsCustom()) return;

            var usernameVal = extractUsernameFromEmail();
            $username.val(usernameVal);
        },

        updateUsernameSelection = function() {
            selectAll($username);
        },

        setCustomUsername = function () {
            var currentUsername = $username.val();
            if (currentUsername && currentUsername !== extractUsernameFromEmail()) {
                $username.data('custom', currentUsername);
            } else {
                $username.removeData('custom');
            }
        };

        return {
            load: function () {
                $username = $('#username');
                $email = $('#email');
                setCustomUsername();
                return this;
            },

            bindEvents: function () {
                $email.bind('keyup paste blur', updateUsername);
                $username.bind('blur', setCustomUsername);
                $username.bind('focus', updateUsernameSelection);

                $('form[name="signupform"]').bind('reset', function() {
                    $username.removeData('custom');
                });

                return this;
            }
        };
    };

    AJS.toInit(function () {
        Confluence.SignUpForm().load().bindEvents();
    });

})(AJS.$);