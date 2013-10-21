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
    this._context = canvas.getContext('2d');
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
            y:this.extent.ymin
        }
        this.extent.xmax = this.extent.xmin + this.resolution * this._canvas.width;
        this.extent.ymax = this.extent.ymin + this.resolution * this._canvas.height;
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
        layer.load(map);
    },
    update:function () {

    },
    mapClientToMap:function (point) {
        var x = point.x * this.resolution + this.originPoint.x;
        var y = point.y * this.resolution + this.originPoint.y;
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
                    that.originPoint.y -= y * that.resolution;
                    that.extent = {
                        xmin:that.originPoint.x,
                        ymin:that.originPoint.y,
                        xmax:that.originPoint.x + that._canvas.width * that.resolution,
                        ymax:that.originPoint.y + that._canvas.height * that.resolution
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
                ymin:newOriginPointY,
                xmax:newOriginPointX + that._canvas.width * that.resolution,
                ymax:newOriginPointY + that._canvas.height * that.resolution
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
                x:that.originPoint.x+that.resolution*pos.x,
                y:that.originPoint.y+that.resolution*pos.y
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
        //addEvent("mouseover");
        addEvent("mouseup");
        addEvent("mousedown");
        //addEvent("mousemove");
        //addEvent("mouseout");
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
    },
    _mousechange:function(){
        //这里计算鼠标改变时，记录在哪一个grpher上面，作为事件mouseout mouseover前提
        var that=this;
        var newGrapher=null;
        var newLayer=null;
        max.event.addHandler(this._canvas,"mousemove",function(event){
            var pos=max.util.windowToMapClient(that._canvas,event.clientX,event.clientY);
            var l=that._layers.length;
            for(var i=l-1;i!=-1;--i){
                var layer=that._layers[i];
                var g=layer._mousePointInLayer(pos.x,pos.y);
                if(g!==null){
                    newGrapher=g;
                    newLayer= g.parentLayer;
                    break;
                }
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