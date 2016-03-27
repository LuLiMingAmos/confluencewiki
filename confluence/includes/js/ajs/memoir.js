// See https://bitbucket.org/jhinch/memoir.js

(function(window, undefined) {
    var nativeSupport = Boolean(typeof history !== 'undefined' && history.pushState && history.replaceState &&
            !(
                // These Regexes have been copied from history.js
                    (/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) || /* disable for versions of iOS before version 4.3 (8F190) */
                            (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
                    )),
            memoir = function() {
                return memoir.nativeSupport();
            };

    memoir.nativeSupport = function() {
        return nativeSupport;
    };

    var eventListeners = {
        'memoir.popstate' : [],
        'memoir.changestate' : []
    };

    function trigger(eventName, event) {
        for (var i = 0, listeners = eventListeners[eventName], l = listeners.length; i < l; i++) {
            listeners[i](event);
        }
    }

    var nativeMemoir = {
        pushState : function(state, title, url) {
            history.pushState(state, title || '', url || '');
            trigger('memoir.changestate', { state : state });
        },
        replaceState : function(state, title, url) {
            history.replaceState(state, title || '', url || '');
            trigger('memoir.changestate', { state : state });
        },
        bind : function(eventName, callback) {
            if (eventName in eventListeners) {
                eventListeners[eventName].push(callback);
            }
        },
        state : function() {
            return history.state;
        },
        initialState : function(state) {
            return history.replaceState(state, '', '');
        }
    };
    var fallbackMemoir = {
        pushState : function(state, title, url) {
            if (url && location.href !== url) {
                location.href = url;
            }
        },
        replaceState : function(state, title, url) {
            if (url && location.href !== url) {
                location.href = url;
            }
        },
        bind : function(eventName, callback) {},
        initialState : function(state) {},
        state : function() {
            return null;
        }
    };

    function extend(object, other) {
        for (var key in other) {
            if (other.hasOwnProperty(key)) {
                object[key] = other[key];
            }
        }
    }

    extend(memoir, nativeSupport ? nativeMemoir : fallbackMemoir);

    var originalOnpopstate = window.onpopstate,
            popped = ('state' in history),
            initialUrl = location.href;

    window.onpopstate = function(event) {
        // Always call original onpopstate
        if (originalOnpopstate) {
            originalOnpopstate.call(this, event);
        }
        // Ignore inital popstate that some browsers fire on page load
        var initialPop = !popped && location.href == initialUrl;
        popped = true;
        if (!initialPop) {
            trigger('memoir.popstate', event);
            trigger('memoir.changestate', event);
        }
    };

    if (typeof define !== 'undefined') {
        define('memoir', [], function() { return memoir; });
    } else {
        var originalMemoir = window.memoir;
        memoir.noConflict = originalMemoir ?
                function() { window.memoir = originalMemoir; return memoir } :
                function() { delete window.memoir; return memoir };
        window.memoir = memoir;
    }

})(window);
