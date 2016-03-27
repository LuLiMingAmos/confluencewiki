(function(){
    /**
     * A simple cache manager that supports a
     * LRU cache invalidation strategy.
     *
     * @class cacheManager
     * @namespace AJS.Confluence
     * @constructor
     * @param cacheSize the size of the cache before keys are invalidated
     */
    AJS.Confluence.cacheManager = function (cacheSize) {
        //protect against non-new invocation;
        if(!(this instanceof AJS.Confluence.cacheManager))
            return new AJS.Confluence.cacheManager(cacheSize);

        this.cache = {};
        this.cacheStack = [];
        this.cacheSize = cacheSize || 30;
    };

    /**
     * Return the value stored in the cache for the given key and bump weight of this cacheValue.
     * @method get
     * @param key {String}
     */
    AJS.Confluence.cacheManager.prototype.get = function(key){
        var cacheObject = this.cache[key];
        if (!cacheObject) {
            return;
        }

        var nextWeight = this.cacheStack[this.cacheStack.length-1][0] + 1;

        cacheObject.weight = nextWeight;
        this.cacheStack.push([nextWeight, key]);

        return cacheObject.value;
    };

    /**
     * Put the given key, value in the cache
     * @method put
     * @param key {String}
     * @param value {Object}
     */
    AJS.Confluence.cacheManager.prototype.put = function(key, value){
        var nextWeight = this.cacheStack.length ? (this.cacheStack[this.cacheStack.length-1][0] + 1) : 0;
        this.cache[key] = {
            weight: nextWeight,
            value: value
        };
        this.cacheStack.push([nextWeight, key]);

        //Walk the cache stack removing low weighted cache values
        //Will remove n cacheStack values but a maximum of one cache value
        var current, currentWeight, currentKey;
        while (this.cacheStack.length > this.cacheSize) {
            current = this.cacheStack.shift();
            currentWeight = current[0];
            currentKey = current[1];
            if (currentWeight === this.cache[currentKey].weight) {
                delete this.cache[currentKey];
            }
        }
    };

    /**
     * Clear the cache.
     */
    AJS.Confluence.cacheManager.prototype.clear = function(){
        this.cache = {};
        this.cacheStack = [];
    };
})();