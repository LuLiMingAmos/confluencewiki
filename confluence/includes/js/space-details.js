AJS.Confluence.SpaceDetails = {
    setUsersToAddTextField: function(entityNames) {
        var element = document.forms.convertspace.usersToAdd;
        if (entityNames != ""){
            if (element.value == "")
                element.value = entityNames;
            else
                element.value = element.value + ", " + entityNames;
        }
    }
};

AJS.$(function ($) {
    $('.spacetools-nav-secondary').on('click', '.menu-item a', function(){
        var $menuItem = $(this).parent(),
            webItemKey = $menuItem.attr('data-web-item-key'),
            webSectionKey = $menuItem.attr('data-web-section-key'),
            cookiePath = AJS.contextPath() || '/';
        $.cookie('confluence.last-web-item-clicked', webSectionKey + '/' + webItemKey, {path: cookiePath});
    });

    $('.spacetools-nav').on('click', 'li a', function(){
        var $menuItem = $(this).parent(),
            webSectionKey = $menuItem.attr('data-web-section-key'),
            webItemKey = $menuItem.attr('data-first-web-item-key'),
            cookiePath = AJS.contextPath() || '/';
        $.cookie('confluence.last-web-item-clicked', webSectionKey + '/' + webItemKey, {path: cookiePath});
    });

    function updateWatch($button, type, action, newCss, newText) {
        $.ajax({
            url: AJS.contextPath() + "/spaces/" + action + "?" + $.param({
                contentType:type,
                key:AJS.Meta.get('space-key'),
                atl_token: AJS.Meta.get('atl-token')
            }),
            success: function (xhr) {
                $button.attr('class', newCss);
                $button.html($("<span></span>").text(newText));
            }
        });
    }
    $('.content-navigation.pages-collector').on('click', 'a.watch', function(e){
        e.preventDefault();
        updateWatch($(this), '', 'addspacenotification.action', 'stop-watching', AJS.I18n.getText('remove.space.notification'));
        AJS.trigger("analytics", {name: "watch-space"});
    });
    $('.content-navigation.pages-collector').on('click', 'a.stop-watching', function(e){
        e.preventDefault();
        updateWatch($(this), '', 'removespacenotification.action', 'watch', AJS.I18n.getText('add.space.notification'));
        AJS.trigger("analytics", {name: "unwatch-space"});
    });
    $('.content-navigation.view-blogposts').on('click', 'a.watch', function(e){
        e.preventDefault();
        updateWatch($(this), 'blogpost', 'addspacenotification.action', 'stop-watching', AJS.I18n.getText('space.watches.blogs.stop'));
        AJS.trigger("analytics", {name: "watch-blogs"});
    });
    $('.content-navigation.view-blogposts').on('click', 'a.stop-watching', function(e){
        e.preventDefault();
        updateWatch($(this), 'blogpost', 'removespacenotification.action', 'watch', AJS.I18n.getText('space.watches.blogs.start'));
        AJS.trigger("analytics", {name: "unwatch-blogs"});
    });
});