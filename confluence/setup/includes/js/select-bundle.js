(function ($) {
    var Bundle = Backbone.Model.extend({
        initialize: function() {
            // include cid as an attribute so it becomes available in toJSON()
            this.set("cid", this.cid);
        },

        getProduct: function() {
            return this.get("_platform");
        },

        getPluginKeys: function() {
            var plugins = this.get("_plugins");
            return _.pluck(plugins, "key").join(",");
        }
    });

    var BundleCollection = Backbone.Collection.extend({
        model: Bundle,
        url: "/confluence/setup/getbundles.action",

        setSelectedBundle: function(cid) {
            var selectedBundle = this.get(cid);
            if (selectedBundle) {
                this.selectedBundle = selectedBundle;
                this.trigger("bundleSelected", selectedBundle);
            }
        }
    });

    var BundleCollectionView = Backbone.View.extend({
        events: {
            "click .bundle" : "onBundleClick"
        },
        el: "#bundle-selector",

        initialize: function() {
            this.collection.on("reset", this.renderBundles, this);
            this.collection.on("error", this.renderLoadingError, this);
        },

        renderBundles: function() {
            var template = $("#bundle-selector-template").html();
            var html = _.template(template, {bundles: this.collection.toJSON()});
            this.$el.html(html);

            this.selectFirstBundle();
        },

        renderLoadingError: function() {
            var template = $("#loading-error-template").html();
            $("#bundle-selector .loading").html(_.template(template));
        },

        selectFirstBundle: function() {
            var $first = this.$(".bundle:first");
            this.selectBundle($first);
        },

        onBundleClick: function(e) {
            var $bundle = $(e.currentTarget);
            this.selectBundle($bundle);
        },

        selectBundle: function($bundle) {
            $bundle.siblings().removeClass("active");
            $bundle.addClass("active");

            var cid = $bundle.data("cid");
            this.collection.setSelectedBundle(cid);
        }
    });

    $(function () {
        var collection = new BundleCollection();
        var bundleCollectionView = new BundleCollectionView({collection: collection});

        collection.fetch({
            reset: true
        });

        // set form values on bundle selection
        collection.on("bundleSelected", function (selectedBundle) {
            $("[name=product]").val(selectedBundle.getProduct());
            $("[name=pluginKeys]").val(selectedBundle.getPluginKeys());
        });

        // disable submit button until bundle is selected
        $("#setup-package-button").attr("disabled", "disabled");
        collection.on("bundleSelected", function () {
            $("#setup-package-button").attr("disabled", null);
        });
    });
}(AJS.$));
