window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000/60);
        };
})();

var max = {};
max.Map = function (id, extent) {
    this._canvas = document.getElementById(id);
    this._context = this._canvas.getContext('2d');
    this._layers = [];
    this.extent = extent;
    this.width = canvas.width;
    this.height = canvas.height;
    this.resolutions = [156543.0339280406, 78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
    this.wkid = 102100;
    this._pub=new max.event.Publisher();
    this._sub=new max.event.Subscriber();
}

max.Map.prototype = {
    init:function () {
        this.resolution = (this.extent.xmax - this.extent.xmin) / (this._canvas.width);
        this.originPoint = {
            x:this.extent.xmin,
            y:this.extent.ymax
        }
        this.extent.xmax = this.extent.xmin + this.resolution * this._canvas.width;
        this.extent.ymin = this.extent.ymax - this.resolution * this._canvas.height;
        var that = this;
        this.dragMap();
        this.scrollMap();
        this._addAllEvent();
        //this._mousechange();
        var x = function () {
            that.draw.call(that);
            requestAnimFrame(x)
        }
        x();
    },
    addLayer:function (layer) {
        for (var i in this._layers) {
            if (this._layers[i] === layer) {
                return false;
            }
        }
        this._layers.push(layer);
        layer.parentMap = this;
        this.load(layer);
    },
    getLayers:function () {
        return this._layers;
    },
    load:function (layer) {
        layer.load(this);
    },
    update:function () {

    },
    mapClientToMap:function (point) {
        var x = point.x * this.resolution + this.originPoint.x;
        var y = this.originPoint.y-point.y * this.resolution ;
        return {
            x:x,
            y:y
        }
    },
    draw:function () {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        for (var i in this._layers) {
            var layer = this._layers[i];
            layer.draw();
        }

    },
    dragMap:function () {
        var pos = null;
        var that = this;
        var draging = false;
        var onmousedown=function(event){
            pos = max.util.windowToMapClient(that._canvas, event.clientX, event.clientY);
            draging = true;
            var onmousemove = function (event) {
                if (draging) {
                    var pos1 = max.util.windowToMapClient(that._canvas, event.clientX, event.clientY);
                    var x = pos1.x - pos.x;
                    var y = pos1.y - pos.y;
                    pos = pos1;
                    that.originPoint.x -= x * that.resolution;
                    that.originPoint.y += y * that.resolution;
                    that.extent = {
                        xmin:that.originPoint.x,
                        ymin:that.originPoint.y - that._canvas.height * that.resolution,
                        xmax:that.originPoint.x + that._canvas.width * that.resolution,
                        ymax:that.originPoint.y
                    }
                    for (var i in that._layers) {
                        var layer = that._layers[i];
                        layer.ondrag();
                    }
                }
            }
            var onmouseup = function (event) {
                pos = null;
                draging = false;
                max.event.removeHandler(that._canvas,"mousemove",onmousemove);
                max.event.removeHandler(document,"mouseup",onmouseup);
            }
            max.event.addHandler(that._canvas,"mousemove",onmousemove);
            max.event.addHandler(document,"mouseup",onmouseup);
        }
        max.event.addHandler(this._canvas,"mousedown",onmousedown);

    },
    scrollMap:function () {
        var that = this;
        var onmousewheel = function (event) {
            var pos = max.util.windowToMapClient(that._canvas, event.clientX, event.clientY);
            var point = that.mapClientToMap(pos);
            if (event.wheelDelta > 0) {
                for (var i in that.resolutions) {
                    if (that.resolutions[i] < that.resolution) {
                        if (that.resolutions[i] === that.resolution) {
                            return false;
                        }
                        var oldresolution = that.resolution;
                        that.resolution = that.resolutions[i];
                        var rate = oldresolution / that.resolution;
                        //计算左上角 坐标
                        var newOriginPointX = that.originPoint.x + (point.x - that.originPoint.x) / rate;
                        var newOriginPointY = that.originPoint.y + (point.y - that.originPoint.y) / rate;
                        break;
                    }
                }
            } else {
                for (var i in that.resolutions) {
                    if (that.resolutions[i] <= that.resolution) {
                        var oldresolution = that.resolution;
                        if (i == 0) {
                            that.resolution = that.resolutions[0];
                        } else {
                            that.resolution = that.resolutions[i - 1];
                        }
                        if (that.resolutions[i] === that.resolution) {
                            return false;
                        }
                        var rate = that.resolution / oldresolution;
                        //计算左上角 坐标
                        var newOriginPointX = that.originPoint.x + (that.originPoint.x - point.x) * (rate - 1);
                        var newOriginPointY = that.originPoint.y + (that.originPoint.y - point.y) * (rate - 1);
                        break;
                    }
                }
            }
            that.originPoint.x = newOriginPointX;
            that.originPoint.y = newOriginPointY;
            //计算extent 范围
            that.extent = {
                xmin:newOriginPointX,
                ymin:newOriginPointY-that._canvas.height * that.resolution,
                xmax:newOriginPointX + that._canvas.width * that.resolution,
                ymax:newOriginPointY
            }
            for (var i in that._layers) {
                that._layers[i].load();
            }

            //that.draw();
        }
        if(typeof this._canvas.onmousewheel !=="undefined"){
            max.event.addHandler(this._canvas,"mousewheel",onmousewheel);
        }else{
            max.event.addHandler(this._canvas,"wheel",onmousewheel);
        }
    },
    addEventListener:function(type,handler){
        this._sub.bind(this._pub,type,handler);
    },
    removeEventListener:function(type,handler){
        this._sub.unbind(this._pub,type,handler);
    },
    _addAllEvent:function(){
        var that=this;
        var targetGrapher=null;
        var targetLayer=null;
        //给事件添加map空间信息
        var addEventAttribute=function(event){
            var pos=max.util.windowToMapClient(that._canvas,event.clientX,event.clientY);
            event.clientPosition=pos;
            event.mapPosition={
                x:that.originPoint.x-that.resolution*pos.x,
                y:that.originPoint.y-that.resolution*pos.y
            }
            return event;
        }
        var addEvent=function(type){
            max.event.addHandler(that._canvas,type,function(event){
                if(targetLayer===null){
                    return false;
                }
                event=addEventAttribute(event);
                event.grapher=targetGrapher;
                that._pub.triggerDirectToSub(targetLayer._sub,"on"+type,event);
            });
        }
        addEvent("click");
        addEvent("mouseup");
        addEvent("mousedown");
        addEvent("dbclick");
        addEvent("keydown");
        addEvent("keypress");
        addEvent("keyup");

        max.event.addHandler(this._canvas,"mousemove",function(event){
            var newGragpher=null;//这一刻event变化是新的，target是旧的
            var newLayer=null;
            var pos=max.util.windowToMapClient(that._canvas,event.clientX,event.clientY);
            var l=that._layers.length;
            var b=false;
            for(var i=l-1;i!=-1;--i){
                var layer=that._layers[i];
                var g=layer._mousePointInLayer(pos.x,pos.y);
                if(g!==null){
                    newGragpher=g;
                    newLayer= g.parentLayer;
                    b=true;
                    break;
                }
            }
            if(!b){
                if(targetGrapher!==null){
                    event=addEventAttribute(event);
                    event.grapher=targetGrapher;
                    that._pub.triggerDirectToSub(targetLayer._sub,"onmouseout",event);
                }
                targetGrapher=null;
                targetLayer=null;
            }else{
                if(targetGrapher===null){
                    event=addEventAttribute(event);
                    event.grapher=newGragpher;
                    that._pub.triggerDirectToSub(newLayer._sub,"onmouseover",event);
                } else if(newGragpher===targetGrapher){
                    event=addEventAttribute(event);
                    event.grapher=targetGrapher;
                    that._pub.triggerDirectToSub(targetLayer._sub,"onmousemove",event);
                }else{
                    event=addEventAttribute(event);
                    event.grapher=targetGrapher;
                    that._pub.triggerDirectToSub(targetLayer._sub,"onmouseout",event);

                    event.grapher=newGragpher;
                    that._pub.triggerDirectToSub(newLayer._sub,"onmouseover",event);
                }
                targetGrapher=newGragpher;
                targetLayer=newLayer;
            }

        })
        max.event.addHandler(this._canvas,"mouseout",function(evebt){
            if(targetGrapher!==null){
                event=addEventAttribute(event);
                event.grapher=targetGrapher;
                that._pub.triggerDirectToSub(targetLayer._sub,"onmouseout",event);
                targetGrapher=null;
                targetLayer=null;
            }

        })
    }
}

max.Extent = function (extent) {
    this.xmin = extent.xmin;
    this.xmax = extent.xmax;
    this.ymin = extent.ymin;
    this.ymax = extent.ymax;
}

max.Geometry={};
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
    },
    triggerDirectToSub:function(sub,type,event){
        for(var i in this.items) {
            var _item = this.items[i];
            if(_item.type == type) {
                for(var j in _item.list) {
                    var _sitem = _item.list[j];
                    if(_sitem.sub!==sub){
                        continue;
                    }
                    if( typeof _sitem.callback == "function") {
                        _sitem.callback(event);
                    }
                }
            }
        }
    }
}

max.Layer = function () {
    this._sub = new max.event.Subscriber();
    this._eventList = [];
};
max.Layer.prototype = {
    ondrag:function () {

    },
    load:function () {

    },
    addEventListener:function (type, handler) {
        var that = this;
        this._sub.bind(this.parentMap._pub, type, function (event) {
            handler(event);
        });
    },
    removeEventListner:function (type, handler) {
        this._sub.unbind(this.parentMap._sub, type, handler);
    },
    _mousePointInLayer:function () {
        return null;
    }
}
/**
 * 切片服务基类
 */
max.Layer.TileLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this.parentMap = null;
    this._imageList = [];
    this.scaleRate = 1;
}
max.Layer.TileLayer.prototype=new max.Layer();
max.Layer.TileLayer.prototype.init=function(){

}
max.Layer.TileLayer.prototype._calImage=function(map){
    var extent = this.parentMap.extent;
    var lmin = Math.floor((extent.xmin - this.originPoint.x) / this.picWidth / this.resolution);
    var lmax = Math.ceil((extent.xmax - this.originPoint.x) / this.picWidth / this.resolution) - 1;
    var dmax = Math.floor(( this.originPoint.y-extent.ymin) / this.picHeight / this.resolution);
    var dmin = Math.ceil(( this.originPoint.y-extent.ymax) / this.picHeight / this.resolution) - 1;
    lmin = lmin < this._imageRectangle.lmin ? this._imageRectangle.lmin : lmin;
    lmax = lmax > this._imageRectangle.lmax ? this._imageRectangle.lmax : lmax;
    dmin = dmin < this._imageRectangle.dmin ? this._imageRectangle.dmin : dmin;
    dmax = dmax > this._imageRectangle.dmax ? this._imageRectangle.dmax : dmax;
    return {
        lmin:lmin,
        lmax:lmax,
        dmin:dmin,
        dmax:dmax,
        z:this.z,
        resolution:this.resolution
    }
}
max.Layer.TileLayer.prototype.updateScale=function(map){
    var map = this.parentMap;
    var extent = this.fullExtent;
    var z = 0;
    var resolution = 0;
    for (var i in this.resolutions) {
        if (map.resolution >= this.resolutions[i]) {
            z = i - 0 + 1;
            resolution = this.resolutions[i];
            break;
        }
    }
    this.resolution = resolution;
    this.z = z;
    var lmin = Math.floor((extent.xmin - this.originPoint.x) / this.picWidth / this.resolution);
    var lmax = Math.ceil((extent.xmax - this.originPoint.x) / this.picWidth / this.resolution) - 1;
    var dmax = Math.floor(( this.originPoint.y-extent.ymin) / this.picHeight / this.resolution);
    var dmin = Math.ceil(( this.originPoint.y-extent.ymax) / this.picHeight / this.resolution) - 1;
    this._imageRectangle = {
        lmin:lmin,
        lmax:lmax,
        dmin:dmin,
        dmax:dmax
    }
    this.scaleRate = map.resolution / this.resolution;
}
max.Layer.TileLayer.prototype.load=function(){
    this.updateScale();
    var o = this._calImage(this.parentMap);
    this._updateImageList(o);
}
max.Layer.TileLayer.prototype.draw=function(){
    for (var i in this._imageList) {
        var _image = this._imageList[i];
        var context = this.parentMap._context;
        if (_image.isonload === true) {
            context.drawImage(_image.image, 0, 0, this.picWidth, this.picHeight, _image.x, _image.y, this.picWidth / this.scaleRate, this.picHeight / this.scaleRate);
        }
    }
}
max.Layer.TileLayer.prototype.ondrag=function(){
    //todo 屏幕闪烁 待解决
    for (var i = this._imageList.length - 1; i != -1; --i) {
        var image = this._imageList[i];
        image.update();
        if (image.pz !== this.z) {
            this._imageList.splice(i, 1);
            delete image;
            image = null;
            break;
        }
        if (image.x < 0 - image.layer.picWidth * (image.layer.scaleRate)) {
            this._imageList.splice(i, 1);
            delete image;
            image = null;
            break;
        }
        if (image.y < 0 - image.layer.picHeight * (image.layer.scaleRate)) {
            this._imageList.splice(i, 1);
            delete image;
            image = null;
            break;
        }
        if (image.x > image.layer.parentMap._canvas.width * (image.layer.scaleRate)) {
            this._imageList.splice(i, 1);
            delete image;
            image = null;
            break;
        }
        if (image.y > image.layer.parentMap._canvas.height * (image.layer.scaleRate)) {
            this._imageList.splice(i, 1);
            delete image;
            image = null;
            break;
        }

    }
    var o = this._calImage(this.parentMap);
    this._updateImageList(o);
}


max.Layer._TitleImage = function (url, layer, x, y, z, xmin, ymax) {
    this.image = new Image();
    var that = this;
    this.image.onload = function () {
        that.imageOnLoad(that);
    };
    this.image.src = url;
    this.layer = layer;
    this.px = x;
    this.py = y;
    this.pz = z;
    //左上角 最小经度
    this.xmin = xmin;
    //切片左上角 最小维度
    this.ymax = ymax;
    this.isonload = false;

}
max.Layer._TitleImage.prototype = {
    imageOnLoad:function (that) {
        that.isonload = true;
        that.update.call(that);
    },
    update:function () {
        var map = this.layer.parentMap;
        var point = map.originPoint;
        var x = (this.xmin - point.x) / map.resolution;
        var y = ( point.y-this.ymax) / map.resolution;
        this.x = x;
        this.y = y;
    }
}
/**
 * 支持Google Layer
 */
max.Layer.GoogleLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.fullExtent = new max.Extent({
        xmin:-20037508.3427892,
        ymin:-20037508.3427892,
        xmax:20037508.3427892,
        ymax:20037508.3427892
    });
    this.originPoint = {
        x:-20037508.3427892,
        y:20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.GoogleLayer.prototype = new max.Layer.TileLayer();

max.Layer.GoogleLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            var url = this.serviceUrl + "x=" + i + "&y=" + j + "&z=" + rule.z;
            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y - j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax);
            this._imageList.push(image);
        }
    }
}
/**
 *支持微软Bing Maps
 */
max.Layer.BingMapsLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.fullExtent = new max.Extent({
        xmin:-20037508.3427892,
        ymin:-20037508.3427892,
        xmax:20037508.3427892,
        ymax:20037508.3427892
    });
    this.originPoint = {
        x:-20037508.3427892,
        y:20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.BingMapsLayer.prototype = new max.Layer.TileLayer();

max.Layer.BingMapsLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    var z=rule.z;
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            //var url = this.serviceUrl + "x=" + i + "&y=" + j + "&z=" + rule.z;
            //10进制转化为2进制，前面补充0
            _f=function(n,m){
                var t= n.toString(2)+"";
                for(; t.length<m;){
                    t="0"+t;
                }
                return t;
            }
            var _if=_f(i,z);
            var _jf=_f(j,z);
            var r="";
            for(var k=0;k!=z;++k){
                r+=_jf[k]+_if[k];
            }
            r=parseInt(r,2).toString(4);
            var url=this.serviceUrl+"r"+r+"?g=103&mkt=zh-cn&n=z";

            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y-j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax);
            this._imageList.push(image);
        }
    }
}
/**
 * 支持高德地图
 */
max.Layer.AMapLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.fullExtent = new max.Extent({
        xmin:-20037508.3427892,
        ymin:-20037508.3427892,
        xmax:20037508.3427892,
        ymax:20037508.3427892
    });
    this.originPoint = {
        x:-20037508.3427892,
        y:20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.AMapLayer.prototype = new max.Layer.TileLayer();

max.Layer.AMapLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            var url = this.serviceUrl + "&x=" + i + "&y=" + j + "&z=" + rule.z;
            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y - j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax);
            this._imageList.push(image);
        }
    }
}
/**
 * 支持ArcGIS Online地图
 */
max.Layer.AGSTileLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.fullExtent = new max.Extent({
        xmin:-20037508.3427892,
        ymin:-20037508.3427892,
        xmax:20037508.3427892,
        ymax:20037508.3427892
    });
    this.originPoint = {
        x:-20037508.3427892,
        y:20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [1591657527.591555,78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.AGSTileLayer.prototype = new max.Layer.TileLayer();

max.Layer.AGSTileLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            if(this.serviceUrl[this.serviceUrl.length-1]!=="/"){
                this.serviceUrl+="/";
            }
            var url = this.serviceUrl+"tile/"+(rule.z-1)+"/"+j+"/"+i;
            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y-j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax);
            this._imageList.push(image);
        }
    }
}
/**
 * 支持Open Street地图
 */
max.Layer.OpenStreetLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.fullExtent = new max.Extent({
        xmin:-20037508.3427892,
        ymin:-20037508.3427892,
        xmax:20037508.3427892,
        ymax:20037508.3427892
    });
    this.originPoint = {
        x:-20037508.3427892,
        y:20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.OpenStreetLayer.prototype = new max.Layer.TileLayer();

max.Layer.OpenStreetLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            var url = this.serviceUrl+"/"+rule.z+"/"+i+"/"+j+".jpg";
            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y-j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax);
            this._imageList.push(image);
        }
    }
}
max.Layer.GrapherLayer=function(){
    max.Layer.call(this);
    this.graphers=[];

}
max.Layer.GrapherLayer.prototype=new max.Layer();
max.Layer.GrapherLayer.prototype.addGraphic=function(grapher){
    for(var i in this.graphers){
        if(this.graphers[i]===grapher){
            return false;
        }
    }
    grapher.parentLayer=this;
    this.graphers.push(grapher);
};
max.Layer.GrapherLayer.prototype.removeGraphic=function(grapher){
    for(var i in this.graphers){
        if(this.graphers[i]===grapher){
            this.graphers.splice(i,1);
            return true;
        }
    }
    return false;
};
max.Layer.GrapherLayer.prototype.draw=function(){
    for(var i in this.graphers){
        this.graphers[i].draw(this.parentMap);
    }
    this._eventList=[];
}

max.Layer.GrapherLayer.prototype._mousePointInLayer=function(x,y){
    var l=this.graphers.length;
    for(var i=l-1;i!=-1;--i){
        if(this.graphers[i]._mousePointInGrapher(x,y)){
            return this.graphers[i];
        }
    }
    return null;
}
max.Geometry.Grapher = function (geometry, attribute, symbol) {
    this.geometry = geometry;
    this.attribute = attribute || {};

    if (typeof symbol === "undefined") {
        if (geometry.geometryType === "POINT") {
            this.symbol = new max.Symbol.SimpleMarkerSymbol({fillStyle:'rgba(30,113,240,0.8)', fillSize:8});
        }else if(geometry.geometryType === "LINE"){
            this.symbol = new max.Symbol.SimpleLineSymbol({lineStyle:'rgba(30,113,240,0.8)', lineWidth:1});
        }else if(geometry.geometryType==="POLYGON"){
            this.symbol = new max.Symbol.SimpleFillSymbol({fillStyle:'rgba(30,113,240,0.8)'});
        }
    }else{
        this.symbol = max.util.clone(symbol);
    }
    this.parentLayer = null;
}
max.Geometry.Grapher.prototype = {
    draw:function (map) {
        this.geometry.draw(map,this.symbol);
    },
    _mousePointInGrapher:function (x, y) {
        var map = this.parentLayer.parentMap;
        if (this.geometry.getPath(map,this.symbol)) {
            if(this.geometry.geometryType!=="LINE"){
                return this.parentLayer.parentMap._context.isPointInPath(x, y);
            }else{
                return this.parentLayer.parentMap._context.isPointInStroke(x, y);
            }

        } else {
            return false;
        }
    }
}
max.Geometry.Geometry=function(){

}
max.Geometry.Geometry.prototype={

}


max.Geometry.Point=function(x,y,option){
    this.geometryType="POINT";
    this.x=x;
    this.y=y;
    if(typeof option !=="undefined"){
        this.wkid=option.wkid?option.wkid:4326;
    }else{
        this.wkid=4326;
    }
    this.webMercatorPoint={};
    this._getWebMercatorPoint();
}
max.Geometry.Point.prototype=new max.Geometry.Geometry();
max.Geometry.Point.prototype.draw=function(map,symbol){
    var p=max.util.webMercatorToMapClient(map,this.webMercatorPoint.x,this.webMercatorPoint.y);
    var x= p.x;
    var y= p.y;
    var context=map._context;
    if(x<0||y<0||x>map._canvas.width||y>map._canvas.height){
        return false;
    }
    context.save();
    if(symbol.SymbolType=="SimpleMarkerSymbol"){
        context.beginPath();
        context.fillStyle=symbol.fillStyle;
        if(symbol.style=="CIRCLE"){
            context.arc(x,y,symbol.fillSize,0,Math.PI*2,true);
        }
        context.fill();
    }else{

    }
    context.restore();


}
max.Geometry.Point.prototype.getPath=function(map,symbol){
    var x=(this.webMercatorPoint.x-map.originPoint.x)/map.resolution;
    var y=(map.originPoint.y-this.webMercatorPoint.y)/map.resolution;
    var context=map._context;
    if(x<0||y<0||x>map._canvas.width||y>map._canvas.height){
        return false;
    }
    context.beginPath();
    if(symbol.SymbolType=="SimpleMarkerSymbol"){
        if(symbol.style=="CIRCLE"){
            context.arc(x,y,symbol.fillSize,0,Math.PI*2,true);
        }
    }else{

    }
    return true;

}
max.Geometry.Point.prototype._getWebMercatorPoint=function(){
    if(this.wkid==102100){
        this.webMercatorPoint.x=this.x;
        this.webMercatorPoint.y=this.y;
    }else if(this.wkid==4326){
        this.webMercatorPoint=max.util.lonLat2WebMercator(this);
    }
}


max.Geometry.Line=function(paths,option){
    this.geometryType="LINE";
    this.paths=paths;
    if(typeof option !=="undefined"){
        this.wkid=option.wkid?option.wkid:4326;
    }else{
        this.wkid=4326;
    }
    this.webMercatorPoint={};
    this._getWebMercatorPaths();
}
max.Geometry.Line.prototype=new max.Geometry.Geometry();
max.Geometry.Line.prototype._getWebMercatorPaths=function(){
    if(this.wkid==102100){
        this.webMercatorPaths=this.paths;
    }else if(this.wkid==4326){
        var paths=[];
        for(var i in this.paths){
            var _path=this.paths[i];
            var path=[];
            for(var j in _path){
                path.push(max.util.lonLat2WebMercator(_path[j]));
            }
            paths.push(path);
        }
        this.webMercatorPaths=paths;
    }
}
max.Geometry.Line.prototype.getPath=function(map,symbol){
    var context=map._context;
    if(symbol.SymbolType=="SimpleLineSymbol"){
        context.beginPath();
        for(var i in this.webMercatorPaths){
            var path= this.webMercatorPaths[i];
            if(path.length>0){
                var p=max.util.webMercatorToMapClient(map,path[0].x,path[0].y);
                context.moveTo(p.x, p.y);
                var l=path.length;
                for(var j=1;j!=l;++j){
                    var p2=max.util.webMercatorToMapClient(map,path[j].x,path[j].y);
                    context.lineTo(p2.x,p2.y);
                }
            }
        }

    }else{

    }
    return true;
}
max.Geometry.Line.prototype.draw=function(map,symbol){
    var context=map._context;
    context.save();
    context.lineWidth=symbol.lineWidth;
    context.strokeStyle=symbol.lineStyle;
    context.lineCap="round";
    context.lineJoin="round";
    if(symbol.SymbolType=="SimpleLineSymbol"){
        context.beginPath();
        for(var i in this.webMercatorPaths){
            var path= this.webMercatorPaths[i];
            if(path.length>0){
                var p=max.util.webMercatorToMapClient(map,path[0].x,path[0].y);
                context.moveTo(p.x, p.y);
                var l=path.length;
                for(var j=1;j!=l;++j){
                    var p2=max.util.webMercatorToMapClient(map,path[j].x,path[j].y);
                    context.lineTo(p2.x,p2.y);
                }
            }
        }
        context.stroke();
    }else{

    }
    context.restore();
}


max.Geometry.Polygon=function(paths,option){
    this.geometryType="POLYGON";
    this.paths=paths;
    if(typeof option !=="undefined"){
        this.wkid=option.wkid?option.wkid:4326;
    }else{
        this.wkid=4326;
    }
    this.webMercatorPoint={};
    this._getWebMercatorPaths();
}
max.Geometry.Polygon.prototype=new max.Geometry.Geometry();
max.Geometry.Polygon.prototype._getWebMercatorPaths=function(option){
    if(this.wkid==102100){
        this.webMercatorPaths=this.paths;
    }else if(this.wkid==4326){
        var paths=[];
        for(var i in this.paths){
            var _path=this.paths[i];
            var path=[];
            for(var j in _path){
                path.push(max.util.lonLat2WebMercator(_path[j]));
            }
            paths.push(path);
        }
        this.webMercatorPaths=paths;
    }
}
max.Geometry.Polygon.prototype.getPath=function(map,symbol){
    var context=map._context;
    if(symbol.SymbolType=="SimpleFillSymbol"){
        context.beginPath();
        for(var i in this.webMercatorPaths){
            var path= this.webMercatorPaths[i];
            if(path.length>0){
                var p=max.util.webMercatorToMapClient(map,path[0].x,path[0].y);
                context.moveTo(p.x, p.y);
                var l=path.length;
                for(var j=1;j!=l;++j){
                    var p2=max.util.webMercatorToMapClient(map,path[j].x,path[j].y);
                    context.lineTo(p2.x,p2.y);
                }
                context.closePath();
            }
        }

    }else{

    }
    return true;
}
max.Geometry.Polygon.prototype.draw=function(map,symbol){
    var context=map._context;
    context.save();
    context.fillStyle=symbol.fillStyle;
    if(symbol.SymbolType=="SimpleFillSymbol"){
        context.beginPath();
        for(var i in this.webMercatorPaths){
            var path= this.webMercatorPaths[i];
            if(path.length>0){
                var p=max.util.webMercatorToMapClient(map,path[0].x,path[0].y);
                context.moveTo(p.x, p.y);
                var l=path.length;
                for(var j=1;j!=l;++j){
                    var p2=max.util.webMercatorToMapClient(map,path[j].x,path[j].y);
                    context.lineTo(p2.x,p2.y);
                }
                context.closePath();
            }
        }
        context.fill();
    }else{

    }
    context.restore();
}
max.Symbol=function(option){
    this.fillStyle=option.fillStyle?option.fillStyle:'rgba(0,0,0,1)';
    this.fillSize=option.fillSize?option.fillSize:8;
    this.lineWidth=option.lineWidth?option.lineWidth:4;
    this.lineStyle=option.lineStyle?option.lineStyle:'rgba(0,0,0,1)';
}

max.Symbol.SimpleMarkerSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleMarkerSymbol";
    this.style=option.style?option.style:"CIRCLE";//CIRCLE,SQUARE，以后再扩展吧
}

max.Symbol.SimpleLineSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleLineSymbol";
}

max.Symbol.SimpleFillSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleFillSymbol";
}
max.util = {
    windowToMapClient:function (canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x:x - bbox.left - (bbox.width - canvas.width) / 2,
            y:y - bbox.top - (bbox.height - canvas.height) / 2
        };
    },
    lonLat2WebMercator:function (lonLat) {
        if ((Math.abs(lonLat.x) > 180 || Math.abs(lonLat.y) > 90))
            return;

        var num = lonLat.x * 0.017453292519943295;
        var x = 6378137.0 * num;
        var a = lonLat.y * 0.017453292519943295;
        var y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
        return {x:x,
            y:y};
    },
    webMercatorTOLonLat:function(mercator){
        if ((Math.abs(mercator.x) > 20037508.3427892) || (Math.abs(mercator.y) > 20037508.3427892))
            return;

        var x = mercator.x;
        var y = mercator.y;
        var num3 = x / 6378137.0;
        var num4 = num3 * 57.295779513082323;
        var num5 = Math.floor(((num4 + 180.0) / 360.0));
        var num6 = num4 - (num5 * 360.0);
        var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
        x = num6;
        y = num7 * 57.295779513082323;
        return {x:x,y:y};
    },
    webMercatorToMapClient:function(map,x,y){
        var x1=(x-map.originPoint.x)/map.resolution;
        var y1=(map.originPoint.y-y)/map.resolution;
        return {
            x:x1,
            y:y1
        }
    },
    clone:function(obj){
        if( typeof (obj) != 'object' || obj==null)
        {return obj;}
        var re = {};
        if(obj.constructor == Array)
            re = [];

        for(var i in obj) {
            re[i] = max.util.clone(obj[i]);
        }
        return re;
    }
}