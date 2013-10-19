/**
 * Class define a Subscriber,
 * @constructor
 */
max.event={
    addHandler:function(element,type,handler){
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        }else if(element.attachEvent){
            element.attachEvent("on"+type,handler);
        }else{

        }
    },
    removeHandler:function(element,type,handler){
        if(element.removeEventListener){
            element.removeEventListener(type,handler,false);
        }else if(element.detachEvent){
            element.detachEvent("on"+type,handler);
        }else{
            element["on"+type]=null;
        }
    }
};

max.event.Subscriber = function() {
    this.items = [];
}
max.event.Subscriber.prototype = {
    /**
     *subscibe a type event
     * @param {max.event.Publisher} pub
     * @param {string} type event type,can custom
     * @param {function} callback when event occurs,callback will be call
     * @return {boolean} bind result
     */
    bind : function(pub, type, callback) {
        if( typeof (type) != "string") {
            return false;
        }
        pub._add(this, type, callback);
        return true;
    },
    /**
     *subscibe a type event
     * @param {max.event.Publisher} pub
     * @param {string} opt_type event type,can custom
     * @param {function} opt_callback when event occurs,callback will be call
     */
    unbind : function(pub, opt_type, opt_callback) {
        pub._remove(this, opt_type, opt_callback);
    }
}

/**
 * Class define a SubTypeItem,
 * @constructor
 * @param {string} type event type
 */
max.event.SubTypeItem = function(type) {
    if( typeof (type) != "undefiend") {
        this.type = type;
        this.list = [];
    }else{
        return false;
    }
}
/**
 * Class define a SubItem,
 * @constructor
 * @param {max.event.Subscriber} sub
 * @param {function}
    */
max.event.SubItem = function(sub, callback) {
    this.sub = sub;
    this.callback = callback;
}
/**
 * Class define a Publisher
 * @constructor
 */
max.event.Publisher = function() {
    this.items = [];
}
max.event.Publisher.prototype = {
    /**
     *subscibe a type event
     * @param {max.event.Subscriber} sub
     * @param {string} type event type,can custom
     * @param {function} callback when event occurs,callback will be call
     * @private
     */
    _add : function(sub, type, callback) {
        if( typeof (type) != "string") {
            return false;
        }
        var item = null;
        for(var i in this.items) {
            if(this.items[i].type == type) {
                item = this.items[i];
            }
        }
        if(item == null) {
            item = new max.event.SubTypeItem(type);
            this.items.push(item);
        }
        var pubitem = new max.event.SubItem(sub, callback);
        item.list.push(pubitem);
    },
    /**
     *remove subscibe
     * @param {max.event.Subscriber} sub
     * @param {string} opt_type event type,can custom
     * @param {function} opt_callback when event occurs,callback will be call
     * @private
     */
    _remove : function(sub, opt_type, opt_callback) {
        var _tP = false;
        var _cP = false;
        if( typeof opt_type == "undefined") {
            _tP = true;
        }
        if( typeof opt_callback == "undefined") {
            _cP = true;
        }
        for(var i = this.items.length - 1; i != -1; --i) {
            var _list = this.items[i].list;
            var _type = this.items[i].type;
            for(var j = _list.length - 1; j != -1; --j) {
                var _sitem = _list[j];
                if(sub == _sitem.sub) {
                    if(_tP || opt_type == _type) {
                        if(_tP || _cP || _sitem.callback == opt_callback) {
                            _list[j].callback();
                            _list.splice(j, 1);
                        }
                    }
                }
            }
            if(_list.length == 0) {
                this.items.splice(i, 1);
            }
        }

    },
    /**
     *remove subscibe
     * @param {string} type event type,can custom
     * @param {*} event the event details
     * @private
     */
    trigger : function(type, event) {
        for(var i in this.items) {
            var _item = this.items[i];
            if(_item.type == type) {
                for(var j in _item.list) {
                    var _sitem = _item.list[j];
                    if( typeof _sitem.callback == "function") {
                        _sitem.callback(event);
                    }
                }
            }
        }
    }
}

