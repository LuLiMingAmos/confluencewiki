(function($){
    /**
     * A extension of the cacheManager (cache-manager.js) that supports
     * localstorage as a persistence mechanism.
     *
     * @class localstorageCacheManager
     * @namespace AJS.Confluence
     * @constructor
     * @param storageKey the localstorage key to store data against.
     * @param cacheSize size of the cache.
     */
    AJS.Confluence.localStorageCacheManager = function (storageKey, cacheSize) {
        this.cache = {};
        this.cacheStack = [];
        this.cacheSize = cacheSize || 30;

        //If localStorage doesn't exist or if no storageKey is provided this object behaves as a cacheManager.
        if (!window['localStorage'] || (typeof storageKey !== "string" && storageKey.length > 0)) {
            return;
        }

        var localStoreKey = "Confluence." + storageKey,
            localCacheKey = localStoreKey + ".cache",
            localCacheStackKey = localStoreKey + ".cacheStack";

        var cache = localStorage.getItem(localCacheKey);
        var cacheStack = localStorage.getItem(localCacheStackKey);
        var self = this;

        //Must check both of these together. A browser could GC one before the other.
        if (cache && cacheStack) {
            try {
                //On misuse of the API, localstorage keys can get polluted this checks for that and resets values.
                this.cache = JSON.parse(cache);
                this.cacheStack = JSON.parse(cacheStack);
            } catch (e) {
                this.cache = {};
                this.cacheStack = {};
            }
        }

        $(window).unload(function(){
            localStorage[localCacheKey] = JSON.stringify(self.cache);
            localStorage[localCacheStackKey] = JSON.stringify(self.cacheStack);
        })
    };

    AJS.Confluence.localStorageCacheManager.prototype = new AJS.Confluence.cacheManager();
})(AJS.$);