AJS.toInit(function(a){function c(){var e=this;var d='[name="'+e.name+'"]';a('.wiki-content,form[name="filltemplateform"]').find("input"+d+",textarea"+d+",select"+d).not(e).each(function(f,g){a(g).val(a(e).val())})}a(".wiki-content").find("input,textarea,select").change(c);var b=a('form[name="filltemplateform"]');a('.wiki-content .page-template-field[name^="variableValues."]').each(function(){if(b.find('.page-template-field[name="'+this.name+'"]').length==0){a(this).clone().hide().appendTo(b);c.call(this)}});a(".wiki-content input.page-template-field").keyup(function(d){c.call(this);if(d.which==13){b.submit()}});a(".wiki-content textarea.page-template-field").change(c);setTimeout(function(){a(".wiki-content form").unbind().submit(function(d){d.preventDefault();d.stopPropagation();d.stopImmediatePropagation();return false})},100);a(".view-template .aui-button").attr("aria-disabled","true")});