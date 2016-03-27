jQuery.fn.renderBreadcrumbs=function(k){var g=jQuery,e=this,j=[],h=0,m=k.length-1,a=k[h],c=a.url.indexOf("~")>=0?"personalspacedesc":"spacedesc",l,b=e.closest(".breadcrumbs-container").width(),f=function(){return e.width()<b},d;j.push(Confluence.Templates.MovePage.breadcrumbItem({text:a.title,title:a.title,className:(h==m?"last":"")}));while(h++<m){l=k[h];j.push(Confluence.Templates.MovePage.breadcrumbItem({text:l.title,title:l.title,className:(h==m?"last":"")}))}this.html(j.join(""));d=g("li a span",this);d.each(function(i){if(i!=0&&i!=m){g(this).shortenUntil(f)}});g(d.get(0)).shortenUntil(f);g(d.get(m)).shortenUntil(f);return this};AJS.toInit(function(d){var b=d("#confluence-context-path").attr("content");function a(e){for(var f=1;f<e.length;f++){if(e[f].title==AJS.Meta.get("page-title")){return false}}return true}if(!AJS.MoveDialog){AJS.MoveDialog={}}var c={};AJS.MoveDialog.getBreadcrumbs=function(f,h,e){var g=f.userName?f.userName:(f.pageId?(f.pageId+":"+f.fileName):(f.spaceKey+":"+f.title+":"+f.postingDay+":"+f.fileName));if(g in c){h(c[g],"success");return}d.ajax({type:"GET",dataType:"json",data:f,url:b+"/pages/breadcrumb.action",error:e||function(){},success:function(j,k){if(!j||!j.breadcrumbs){e(j,k);return}var i=d.makeArray(j.breadcrumbs);while(i[0]&&j.type!="userinfo"&&/peopledirectory\.action$/.test(i[0].url)){i.shift()}if(j.type=="page"&&i[1]&&/pages\.action/.test(i[1].url)){i.splice(1,1)}i.type=j.type;c[g]=i;h(i,k)}})};AJS.MoveDialog.Breadcrumbs=function(h,f){var e=0;function g(l,k,j){h.renderBreadcrumbs(k);var i=l!=AJS.Meta.get("space-key")||a(k);if(i){j.clearErrors();d(j.moveButton).prop("disabled",false)}else{j.error(AJS.I18n.getText("move.page.dialog.invalid.location"));d("li:last-child",h).addClass("warning")}}return{update:function(j,i){h.html(Confluence.Templates.MovePage.breadcrumbLoading());var k=e+=1;var l=function(){if(k!=e){AJS.debug("Breadcrumb response for ",j," is stale, ignoring.");return true}return false};(f||AJS.MoveDialog.getBreadcrumbs)(j,function(m,n){if(l()){return}if(n!="success"||!m){h.html(Confluence.Templates.MovePage.breadcrumbError());return}g(j.spaceKey,m,i)},function(m){if(l()){return}h.html(Confluence.Templates.MovePage.breadcrumbError());if(m.status==404){i.error(AJS.I18n.getText("move.page.dialog.location.not.found"))}})}}};AJS.Breadcrumbs={};AJS.Breadcrumbs.getBreadcrumbs=function(f,h,e){if(!f.id){throw new Error("id is a required parameter in 'options'")}if(!f.type){throw new Error("type is a required parameter in 'options'")}var g=f.id+":"+f.type;if(g in c){h(c[g],"success");return}d.ajax({type:"GET",dataType:"json",data:f,url:Confluence.getContextPath()+AJS.REST.getBaseUrl()+"breadcrumb",error:e||function(){},success:function(j,k){if(!j||!j.breadcrumbs){e(j,k);return}var i=d.makeArray(j.breadcrumbs);while(i[0]&&j.type!="userinfo"&&/peopledirectory.action$/.test(i[0].url)){i.shift()}i.type=j.type;c[g]=i;h(i,k)}})}});