/*
    The contents of this file are mostly copied from setup-license.js in JIRA. JIRA already implemented the same flow and
    their code has been in production for a year at the time of writing.
*/

// 30 second timeout on all requests by default. Lasso/Hamlet APIs can be very slow.
AJS.$.ajaxSetup({timeout: 30000});

(function ($) {
    $(function () { isDevMode() && $("h1").append("<small style='display: block'> dev mode active: running against lasso/hamlet staging servers. feel free to create accounts and generate keys with fake data</small>"); });

    function getMeta(key) {
        function asBooleanOrString (value) {
            var lc = value ? value.toLowerCase() : "";

            if (lc == "true")  return true;
            if (lc == "false") return false;

            return value;
        }

        var metaEl = $("meta[name='ajs-" + key + "']");
        var value = metaEl.attr("content");
        return asBooleanOrString(value);
    }

    var browserSupportsCORS = _.once(function() {
        return "withCredentials" in new XMLHttpRequest();
    });
    
    function isDevMode() {
        return getMeta("dev-mode");
    }

    function getLassoURL() {
        return isDevMode() ? "https://id.stg.iam.atlassian.com/" : "https://id.atlassian.com/";
    }

    function getHamletUrl() {
        return isDevMode() ? "https://hamlet.stg.intsys.atlassian.com/" : "https://hamlet.atlassian.com/";
    }

    // The following functions are for URL encoding for JSONP requests.
    // See https://extranet.atlassian.com/display/IT/JSONP+mapping+for+public+REST+APIs for more details.
    var encode_utf8 = function (s) {
        return unescape(encodeURIComponent(s));
    };

    var encodeRequestBody = function(obj) {
        var charmap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
        var str = encode_utf8(JSON.stringify(obj)) + "  ";
        var result = [];
        for (var i = 0; i+2 < str.length; i += 3) {
            var threech = 0;
            for (var j = 0; j < 3; ++j) {
                threech = (threech << 8) + str.charCodeAt(i+j);
            }

            // threech is 24bits long, encode this as 4 chars, each with 6 bits
            for (var j = 3; j >= 0; --j) {
                var chpart = (threech >> (6*j)) & 0x3f;
                result.push(charmap.charAt(chpart));
            }
        }
        return result.join('');
    };

    var serializeObject = function(obj) {
        var o = {};
        var a = obj.serializeArray();
        AJS.$.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    function loginMacUser(formValues) {
        var loginUserValues = _.pick(formValues, "username", "password");

        if (browserSupportsCORS()) {
            return AJS.$.ajax({
                url: getLassoURL() + "id/rest/login",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                data: JSON.stringify(loginUserValues)
            });
        } else {
            return AJS.$.ajax({
                url: getLassoURL() + "id/rest/login",
                type: "POST",
                contentType: "application/json",
                dataType: "jsonp",
                jsonp: "jsonp",
                data: {
                    method: "POST",
                    "h-Content-Type": "application/json",
                    body: encodeRequestBody(loginUserValues)
                }
            }).pipe(function (jqXHR, textStatus) {
                    var jsonResponse = {};
                    jsonResponse.status = jqXHR[0].status || jqXHR.status;
                    jsonResponse.message = jqXHR[0].message || jqXHR.message;
                    jsonResponse.responseText = JSON.stringify(jqXHR[1]) || "";
                    if (jsonResponse.status != 200) {
                        return (jQuery.Deferred().rejectWith(jqXHR, [jsonResponse, textStatus]));
                    } else {
                        jsonResponse.username = jqXHR[1].username;
                        jsonResponse.xsrfToken = jqXHR[1].xsrfToken;
                        return (jQuery.Deferred().resolveWith(jqXHR, [jsonResponse, textStatus]));
                    }
                });
        }
    }

    function createMacUser(formValues) {
        if (_.has(formValues, "subscribeNewsletter")) {
            formValues.subscribeNewsletter = "true";
        }

        if (browserSupportsCORS()) {
            return AJS.$.ajax({
                url: getLassoURL() + "profile/rest/signUp",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                data: JSON.stringify(formValues)
            });
        } else {
            return AJS.$.ajax({
                url: getLassoURL() + "profile/rest/signUp",
                type: "GET",
                contentType: "application/json",
                dataType: "jsonp",
                jsonp: "jsonp",
                data: {
                    method: "POST",
                    "h-Content-Type": "application/json",
                    body: encodeRequestBody(formValues)
                }
            }).pipe(function(jqXHR, textStatus) {
                    var jsonResponse = {};
                    jsonResponse.status = jqXHR[0].status || jqXHR.status;
                    jsonResponse.message = jqXHR[0].message || jqXHR.message;
                    jsonResponse.responseText = JSON.stringify(jqXHR[1]) || "";
                    if (jsonResponse.status != 200) {
                        return (jQuery.Deferred().rejectWith(jqXHR, [jsonResponse, textStatus]));
                    } else {
                        jsonResponse.username = jqXHR[1].username;
                        jsonResponse.xsrfToken = jqXHR[1].xsrfToken;
                        return (jQuery.Deferred().resolveWith(jqXHR, [jsonResponse, textStatus]));
                    }
                });
        }
    }


    function errorLoggingInMacUser(jqXHR, textStatus) {
        if (jqXHR.status === 403) {
            var errors = JSON.parse(jqXHR.responseText);
            if (!_.isUndefined(errors)) {
                showFormError(AJS.I18n.getText("setup.evallicense.loginmac.error.signin"), errors.error);
            } else {
                showFormError(AJS.I18n.getText("setup.evallicense.error.unknown.title"), AJS.I18n.getText("setup.evallicense.error.unknown.desc"));
            }
        } else {
            generalErrorLogging(jqXHR, textStatus);
        }
    }

    function errorCreatingMacUser(jqXHR, textStatus) {
        if (jqXHR.status === 400) {
            var errors = JSON.parse(jqXHR.responseText);
            var fieldErrors = errors.fieldErrors;
            if (fieldErrors && !$.isEmptyObject(fieldErrors)) {
                _.each(fieldErrors, function(error, field) {
                    showFieldError(field, error);
                });
            } else {
                // unknown error
                showFormError(AJS.I18n.getText("setup.evallicense.error.unknown.title"), AJS.I18n.getText("setup.evallicense.error.unknown.desc"));
                if (errors.unknownError) {
                    showFormError(null, errors.unknownError);
                }
            }
        } else {
            generalErrorLogging(jqXHR, textStatus);
        }
    }

    function generalErrorLogging(jqXHR, textStatus) {
        if (jqXHR.status === 500) {
            showFormError(AJS.I18n.getText("setup.evallicense.error.internalserver.title"), AJS.I18n.getText("setup.evallicense.error.internalserver.desc"));
        } else if (jqXHR.status === 404) {
            showFormError(AJS.I18n.getText("setup.evallicense.error.notfound.title"), AJS.I18n.getText("setup.evallicense.error.notfound.desc"));
        } else if (jqXHR.status === 0) {
            showFormError(AJS.I18n.getText("setup.evallicense.error.noconnection.title"), AJS.I18n.getText("setup.evallicense.error.noconnection.desc"));
        } else if (textStatus == "timeout") {
            showFormError(AJS.I18n.getText("setup.evallicense.error.timeout.title"), AJS.I18n.getText("setup.evallicense.error.timeout.desc"));
        } else {
            showFormError(AJS.I18n.getText("setup.evallicense.error.unknown.title"), AJS.I18n.getText("setup.evallicense.error.unknown.desc"));
        }
    }

    function showFieldError(field, message) {
        $("<div>").attr({
            id: field + "-error",
            "class": "error"
        }).text(message).insertAfter($("#" + field));
    }

    function showFormError(title, body) {
        var $currentForm = getCurrentForm();
        AJS.messages.error($currentForm.find(".form-error"), {
            title: title,
            body: body,
            closeable: false
        });
    }

    function disableRadioButtons() {
        AJS.$('input:[name="license-selector"]').attr('disabled', "disabled");
    }

    function enableRadioButtons() {
        AJS.$('input:[name="license-selector"]').removeAttr('disabled');
    }


    function clearErrorsOnForm() {
        AJS.$(".error").remove();
    }

    function getCurrentForm() {
        return $(".license-form:visible").first();
    }

    function formSubmitCleanup() {
        $(":submit").removeAttr("disabled");
        $(".loading-spinner").remove();
        enableRadioButtons();
    }

    function generateEvaluationLicense(xsrfToken) {
        var data = {
            productKey: "confluence",
            serverId: getMeta('server-id')
        };

        if (browserSupportsCORS()) {
            return AJS.$.ajax({
                url: getHamletUrl() + "1.0/public/license/createEvaluation",
                type: "POST",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("ATL-XSRF-Token", xsrfToken);
                },
                xhrFields: {
                    withCredentials: true
                },
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(data)
            });
        } else {
            return AJS.$.ajax({
                url: getHamletUrl() + "1.0/public/license/createEvaluation",
                type: "GET",
                contentType: "application/json",
                dataType: "jsonp",
                jsonp: "jsonp",
                data: {
                    method: "POST",
                    "h-Content-Type": "application/json",
                    "h-ATL-XSRF-Token": xsrfToken,
                    body: encodeRequestBody(data)
                }
            }).pipe(function(jqXHR, textStatus) {
                    var jsonResponse = {};
                    jsonResponse.status = jqXHR[0].status || jqXHR.status;
                    jsonResponse.message = jqXHR[0].message || jqXHR.message;
                    jsonResponse.responseText = JSON.stringify(jqXHR[1]) || "";
                    if (jsonResponse.status != 200) {
                        return (jQuery.Deferred().rejectWith(jqXHR, [jsonResponse, textStatus]));
                    } else {
                        jsonResponse.licenseKey = jqXHR[1].licenseKey;
                        jsonResponse.id = jqXHR[1].id;
                        return (jQuery.Deferred().resolveWith(jqXHR, [jsonResponse, textStatus]));
                    }
                });
        }
    }

    function submitLicenseKey(key) {
        $("#licenseString").val(key);
        $("#importLicenseForm").submit();
    }

    function showSpinner(message, $form) {
        var template = $("#loading-spinner-template").html();
        var html = _.template(template, { message: message });

        $form.find(":submit").after(html);
    }

    $(function () {
        // display form according to radiobutton selection
        $("input[name=license-selector]").change(function () {
            var form = $(this).val();
            $(".license-form").hide();
            $("#" + form).show();
        });


        $("#newAccountForm").submit(function (e) {
            e.preventDefault();

            clearErrorsOnForm();
            disableRadioButtons();
            showSpinner(AJS.I18n.getText("setup.evallicense.newaccount.loading"), $(this));
            var formValues = serializeObject(AJS.$(e.target));
            var mainDfd = createMacUser(formValues);
            mainDfd.fail(errorCreatingMacUser, formSubmitCleanup);

            mainDfd.done(function (jqXhr) {
                var genEvalLicenseDfd = generateEvaluationLicense(jqXhr.xsrfToken);
                genEvalLicenseDfd.fail(generalErrorLogging, formSubmitCleanup);
                genEvalLicenseDfd.done(function (jqXhr) {
                    var licenseKey = jqXhr.licenseKey;
                    submitLicenseKey(licenseKey);
                });
            });
        });

        $("#loginMacForm").submit(function (e) {
            e.preventDefault();

            clearErrorsOnForm();
            disableRadioButtons();
            showSpinner(AJS.I18n.getText("setup.evallicense.loginmac.loading"), $(this));
            var formValues = serializeObject(AJS.$(e.target));
            var mainDfd = loginMacUser(formValues);
            mainDfd.fail(errorLoggingInMacUser, formSubmitCleanup);

            mainDfd.done(function (jqXhr) {
                var genEvalLicenseDfd = generateEvaluationLicense(jqXhr.xsrfToken);
                genEvalLicenseDfd.fail(generalErrorLogging, formSubmitCleanup);
                genEvalLicenseDfd.done(function (jqXhr) {
                    var licenseKey = jqXhr.licenseKey;
                    submitLicenseKey(licenseKey);
                });
            });
        });

        $("#importLicenseForm").submit(function () {
            clearErrorsOnForm();
            disableRadioButtons();
            showSpinner(AJS.I18n.getText("setup.evallicense.importlicense.loading"), $(this));
        });
    });

}(AJS.$));
