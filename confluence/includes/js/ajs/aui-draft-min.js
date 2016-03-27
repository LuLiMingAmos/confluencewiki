(function(e){if(typeof AJS.defaultIfUndefined!=="function"){AJS.defaultIfUndefined=function(m,j){var g=null;var l=window;if(typeof j!="undefined"){if(typeof j.defaultValue==="object"){g=j.defaultValue}if(typeof j.rootObject!="undefined"){if(typeof j.rootObject==="object"&&j.rootObject){l=j.rootObject}else{return g}}}if(typeof m!=="string"){return g}var h=m.split(".");for(var k=0;k<h.length;k++){if(!Object.prototype.hasOwnProperty.call(l,h[k])){return g}l=l[h[k]]}return l}}var b=(function(){var g=false;return function(i){var h="debug-switch-enabled";var j=!!window.localStorage;if(typeof i!="boolean"){if(j){return localStorage[h]=="true"}else{return g}}if(j){localStorage.setItem(h,i)}else{g=i}}}());AJS.debug=function(){if(!b()){return}var g=Array.prototype.slice.call(arguments);g.splice(0,0,"DEBUG: "+new Date().toLocaleTimeString());AJS.log.apply(AJS,g)};AJS.debugEnabled=function(g){if(typeof g!="boolean"){return b()}b(g);AJS.log("STICKY FLAG DEBUG ENABLED: "+g)};AJS.logError=function(i,g){var h=[];if(e.browser.webkit){h.push(g)}else{for(prop in g){h.push(prop+": "+g[prop])}}AJS.log(i+h.join(", "))};AJS.toInit=function(g){e(function(){try{g.apply(this,arguments)}catch(h){AJS.logError("Failed to run init function: ",h);AJS.log("Failed toInit function is: "+g)}});return this};if(AJS.Meta.getBoolean("log-rendered")){var f=AJS.log,d=e('<div id="ajs-log" class="log"><h3>AJS Log</h3>\n</div>'),c=e("head"),a;d.toggleClass("hidden",!AJS.Meta.getBoolean("log-visible"));AJS.log=function(h){var i=(typeof(h)==="undefined")?"undefined":h;if(a){if(d.next().length!=0){a.append(d)}}else{var g=document.createElement("script");g.type="text/x-log";g.text=i;c.append(g)}d.append(e("<p></p>").text("\n"+i));f.apply(AJS,arguments)};AJS.toInit(function(){a=e("body");a.append(d)})}AJS.Data=AJS.Data||AJS.Meta;AJS.getJSONWrap=function(i){var h=Confluence.getContextPath();var g=i.url;if(g.indexOf(h)!=0&&g.indexOf("http")!=0){g=h+g}i.loadingElement&&AJS.setVisible(i.loadingElement,true);var j=i.messageHandler;j.clearMessages();e.ajax({type:"GET",url:g,dataType:"json",data:i.data,error:function(){i.loadingElement&&AJS.setVisible(i.loadingElement,false);j.displayMessages(i.errorMessage||AJS.I18n.getText("unknown.server.error"));i.errorCallback&&i.errorCallback()},success:function(k){i.loadingElement&&AJS.setVisible(i.loadingElement,false);if(j.handleResponseErrors(k)){i.errorCallback&&i.errorCallback();return}i.successCallback&&i.successCallback(k)}})};AJS.Validate=e.extend((function(){var h,g;return{email:function(i){if(!h){h=/^((([a-z]|\d|[!#\$%&amp;&#39;\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&amp;&#39;\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i}return h.test(i)},url:function(i){if(!g){g=/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i}return g.test(i)}}}()),AJS.Validate)})(AJS.$);