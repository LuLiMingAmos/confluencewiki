jQuery(function(a){a(document).on("click","#manage-watchers-menu-item, .cw-manage-watchers",function(h){h.preventDefault();var c="manage-watchers-dialog";var i=new AJS.ConfluenceDialog({width:865,height:530,id:c,onCancel:function(){i.hide().remove()}});i.addHeader(AJS.I18n.getText("manage.watchers.dialog.title"));i.addPanel("default",Confluence.Templates.ManageWatchers.dialogContent({pageId:AJS.Meta.get("page-id"),xsrfToken:AJS.Meta.get("atl-token")}));i.addCancel(AJS.I18n.getText("close.name"),function(){i.hide().remove();return false});i.show();var d=a("#"+c);d.find(".dialog-title").prepend(Confluence.Templates.ManageWatchers.helpLink());d.find("input:visible, button:visible").each(function(e){a(this).attr("tabindex",e+1)});AJS.Confluence.Binder.placeholder();d.bind("remove-list-item.manage-watchers",function(p,o){var m=o.item,n=o.list,q=o.username;m.addClass("removing");AJS.safe.ajax({dataType:"json",type:"POST",url:AJS.params.contextPath+"/json/removewatch.action",data:{pageId:AJS.params.pageId,username:q},error:function(){console.error(AJS.I18n.getText("manage.watchers.unable.to.remove.error"));m.removeClass("removing")},success:function(){m.slideUp().remove();d.trigger("list-updated.manage-watchers",{list:n})}})});d.bind("list-updated.manage-watchers",function(p,o){var n=o.list;var m=a("li.watch-user",n).length>0;if(!m){n.find(".no-users").removeClass("hidden");return}n.find(".no-users").addClass("hidden");Confluence.Binder.userHover();n.find(".confluence-userlink").each(function(){a(this).click(function(q){q.preventDefault()})})});d.bind("list-data-retrieved.manage-watchers",function(p,o){var n=o.list,m=o.watchers;n.find(".watch-user").remove();if(m&&m.length){a.each(m,function(){var r=this.name;var q={username:r,fullName:this.fullName,url:AJS.params.contextPath+"/display/~"+this.name,iconUrl:AJS.params.contextPath+this.profilePictureDownloadPath};var e=a(Confluence.Templates.ManageWatchers.userItem(q));n.append(e);e.find(".remove-watch").click(function(){d.trigger("remove-list-item.manage-watchers",{username:r,item:e,list:n})})})}n.find(".loading").hide();d.trigger("list-updated.manage-watchers",{list:n})});var f=d.find(".page-watchers .user-list");var k=d.find(".space-watchers .user-list");AJS.safe.ajax({url:AJS.params.contextPath+"/json/listwatchers.action",dataType:"json",data:{pageId:AJS.params.pageId},error:function(){console.error("Failed to retrieve watchers.")},success:function(e){d.trigger("list-data-retrieved.manage-watchers",{list:f,watchers:e.pageWatchers});d.trigger("list-data-retrieved.manage-watchers",{list:k,watchers:e.spaceWatchers})}});var l=d.find("form");var j=l.find("#add-watcher-user");var b=l.find("#add-watcher-username");var g=(function(){var e=l.find("> .status");return{clear:function(){e.addClass("hidden").removeClass("loading error").text("")},loading:function(m){e.addClass("loading").removeClass("hidden error").html(m)},error:function(m){e.addClass("error").removeClass("hidden loading").html(m)}}})();l.ajaxForm({beforeSerialize:function(){if(b.val()==""){b.val(j.val())}},beforeSubmit:function(){j.blur().prop("disabled",true);f.addClass("updating");g.loading(AJS.I18n.getText("manage.watchers.status.adding.watcher"))},dataType:"json",error:function(m,e){console.error("Failed to add watcher: "+e)},success:function(e){b.val("");j.prop("disabled",false).val("").focus();f.removeClass("updating");if(e.actionErrors&&e.actionErrors.length){g.error(e.actionErrors[0]);return}d.trigger("list-data-retrieved.manage-watchers",{list:f,watchers:e.pageWatchers});g.clear()}});j.bind("selected.autocomplete-user-or-group",function(n,m){l.submit()});j.focus()})});