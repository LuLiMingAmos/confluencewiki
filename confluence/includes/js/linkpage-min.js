AJS.toInit(function(c){if(!c("link[rel=canonical]").length){return}var b=null;var a=function(){b=new AJS.Dialog(600,210,"link-page-popup").addHeader(AJS.I18n.getText("dialog.linktothispage.heading")).addPanel(AJS.I18n.getText("dialog.linktothispage.heading"),"<form id='link-page-popup-form' class='aui'><fieldset></fieldset></form>").addCancel(AJS.I18n.getText("close.name"),function(f){b.hide();return false});if(Confluence.KeyboardShortcuts&&Confluence.KeyboardShortcuts.enabled){b.addHelpText(AJS.I18n.getText("keyboard.shortcuts.dialog.tip","k"))}var d=[{label:AJS.I18n.getText("insert.link.popup.destination"),id:"link",value:c("link[rel=canonical]").attr("href")},{label:AJS.I18n.getText("tiny.link"),id:"tiny-link",value:c("link[rel=shortlink]").attr("href")}];c.each(d,function(){c("#link-page-popup-form fieldset").append(AJS.format("<div class='field-group'><label for=''link-popup-field-{0}''>{1}:</label><input id=''link-popup-field-{0}'' readonly=''readonly'' value='''' class=''text'' type=''text''></div>",this.id,this.label)).find("input:last").val(this.value)});var e=c("#link-page-popup-form fieldset input.text");e.focus(function(){c(this).select()});e.mouseup(function(f){f.preventDefault()})};c("#link-to-page-link").click(function(d){if(!b){a()}var f=c(this).parents(".ajs-drop-down")[0];f&&f.hide();b.show();c("#link-page-popup-form #link-popup-field-tiny-link").select();return AJS.stopEvent(d)})});