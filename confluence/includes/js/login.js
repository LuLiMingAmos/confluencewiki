/* login */
AJS.toInit(function($){

    var reloadCaptcha = function() {
        var captchaId = +Math.random();
        AJS.$('input[name="captchaId"]').val(captchaId);
        var img = $(".captcha-image");
        img.attr("src", AJS.contextPath() + "/jcaptcha?id=" + captchaId);
    };

    $("#captcha-container .reload").click(function(e){
        reloadCaptcha();
        $("#captcha-response").focus();
        return AJS.stopEvent(e);
    });

    function showSignup() {
        var $signupSection = $('.signup-section');

        if ($signupSection.length !== 0) {
            $('.login-section').hide();
            $signupSection.show();
        }
    }

    function showLogin() {
        $('.login-section').show();
        $('.signup-section').hide();
    }

    if(document.URL.indexOf("login.action") > -1 || document.URL.indexOf("logout.action") > -1) {
        showLogin();
    }

    if(document.URL.indexOf('signup.action') > -1) {
        showSignup();
    }

    $('#signupMessage').delegate('click', 'a', function(e) {
        e.preventDefault();
        showSignup();
    });

    $('#loginMessage').delegate('click', 'a', function(e) {
        e.preventDefault();
        showLogin();
    });

    var errorTemplate =
        '<div id="os_{field}_error" class="error" style="display:none"><span class="error">{message}</span></div>';

    var $usernameErrorMessage = $(AJS.template(errorTemplate).fill({ field:"username", message:AJS.I18n.getText("login.username.required") }).toString());
    var $passwordErrorMessage = $(AJS.template(errorTemplate).fill({ field:"password", message:AJS.I18n.getText("login.password.required") }).toString());

    var $username = $("#os_username");
    var $password = $("#os_password");

    var validate = function() {
        var inputIsValid = true;

        if($username.val().length < 1) {
            inputIsValid = false;
            $username.after($usernameErrorMessage.show());
        } else {
            $usernameErrorMessage.hide();
        }

        if($password.val().length < 1) {
            inputIsValid = false;
            $password.after($passwordErrorMessage.show());
        } else {
            $passwordErrorMessage.hide();
        }

        return inputIsValid;
    };

   var $loginButton = $("#loginButton");
   var $loginForm = $loginButton.closest('form');
   $loginForm.submit(function(e) {
       $loginButton.attr("enabled","false");
       var formIsValid = validate();
       if (!formIsValid) {
           $loginButton.attr("enabled","true");
       }
       formIsValid || e.preventDefault();
   });
});