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
}

max.Map.prototype = {
    init:function () {
        this.resolution = (this.extent.xmax - this.extent.xmin) / (this._canvas.width);
        this.originPoint = {
            x:-20037508.3427892,
            y:-20037508.3427892
        }
        this.extent.xmax = this.extent.xmin + this.resolution * this._canvas.width;
        this.extent.ymax = this.extent.ymin + this.resolution * this._canvas.height;
        var that = this;
        this.dragMap();
        this.scrollMap();
        var x = function () {
            that.draw.call(that);
            requestAnimationFrame(x)
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
        this._canvas.onmousedown = function (event) {
            pos = max.util.windowToMapClient(that._canvas, event.clientX, event.clientY);
            draging = true;
            that._canvas.onmousemove = function (event) {
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
            document.onmouseup = function (event) {
                pos = null;
                draging = false;
                document.onmouseup = null;
                that._canvas.onmousemove = null;
            }
        }
    },
    scrollMap:function () {
        var that = this;
        this._canvas.onmousewheel = function (event) {
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

    }
}

max.Layer = function () {

};
max.Layer.prototype={
    ondrag:function(){

    },
    load:function(){

    }
}

max.Layer.TitleLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this.parentMap = null;
    this._imageList = [];
    this.scaleRate = 1;
}
max.Layer.TitleLayer.prototype = {
    init:function () {

    },
    _drawImage:function (context) {

    },
    _calImage:function (map) {
        //计算
        var extent = this.parentMap.extent;
        var lmin = Math.floor((extent.xmin - this.originPoint.x) / this.picWidth / this.resolution);
        var lmax = Math.ceil((extent.xmax - this.originPoint.x) / this.picWidth / this.resolution) - 1;
        var dmin = Math.floor((extent.ymin - this.originPoint.y) / this.picHeight / this.resolution);
        var dmax = Math.ceil((extent.ymax - this.originPoint.y) / this.picHeight / this.resolution) - 1;
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
    },
    updateScale:function (map) {
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
        var dmin = Math.floor((extent.ymin - this.originPoint.y) / this.picHeight / this.resolution);
        var dmax = Math.ceil((extent.ymax - this.originPoint.y) / this.picHeight / this.resolution) - 1;
        this._imageRectangle = {
            lmin:lmin,
            lmax:lmax,
            dmin:dmin,
            dmax:dmax
        }
        this.scaleRate = map.resolution / this.resolution;

    },
    load:function (map) {
        this.updateScale();
        var o = this._calImage(map);
        this._updateImageList(o);
    },
    updateImage:function (image) {

    },

    draw:function () {
        for (var i in this._imageList) {
            var _image = this._imageList[i];
            var context = this.parentMap._context;
            if (_image.isonload === true) {
                context.drawImage(_image.image, 0, 0, this.picWidth, this.picHeight, _image.x, _image.y, this.picWidth / this.scaleRate, this.picHeight / this.scaleRate);
            }
        }
    },
    ondrag:function () {
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
        var o = this._calImage(map);
        this._updateImageList(o);
    }
}


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
        y:-20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.GoogleLayer.prototype = new max.Layer.TitleLayer();

max.Layer.GoogleLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            var url = this.serviceUrl + "x=" + i + "&y=" + j + "&z=" + rule.z;
            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymin = j * this.picHeight * rule.resolution + this.originPoint.y;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymin);
            this._imageList.push(image);
        }
    }
}


max.Extent = function (extent) {
    this.xmin = extent.xmin;
    this.xmax = extent.xmax;
    this.ymin = extent.ymin;
    this.ymax = extent.ymax;
}

max.Layer._TitleImage = function (url, layer, x, y, z, xmin, ymin) {
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
    this.ymin = ymin;
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
        var y = (this.ymin - point.y) / map.resolution;
        this.x = x;
        this.y = y;
    }
}




max.Layer.GrapherLayer=function(){
    this.graphers=[];

}
max.Layer.GrapherLayer.prototype=new max.Layer();
max.Layer.GrapherLayer.prototype.addGraphic=function(grapher){
    for(var i in this.graphers){
       if(this.graphers[i]===grapher){
           return false;
       }
    }
    this.graphers.push(grapher);
};
max.Layer.GrapherLayer.prototype.draw=function(){
    for(var i in this.graphers){
        this.graphers[i].draw(this.parentMap);
    }
}



max.Geometry={};
max.Geometry.Grapher=function(geometry,attribute,symbol){
    this.geometry=geometry;
    this.attribute=attribute;
    this.symbol=symbol;
}
max.Geometry.Grapher.prototype={
    draw:function(map){
        var context=map._context;
        context.save();
        if(this.geometry.getPath(map)){
            context.fill();
        }
        context.restore();
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
    this.wkid=option.wkid?option.wkid:4326;
    this.webMercatorPoint={};
    this._getWebMercatorPoint();
}
max.Geometry.Point.prototype=new max.Geometry.Geometry();
max.Geometry.Point.prototype.getPath=function(map){
    var x=(this.webMercatorPoint.x-map.originPoint.x)/map.resolution;
    var y=(this.webMercatorPoint.y-map.originPoint.y)/map.resolution;
    var context=map._context;
    if(x<0||y<0||x>map._canvas.width||y>map._canvas.height){
        return false;
    }
    context.beginPath();
    context.arc(x,y,8,0,Math.PI*2,true);
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



max.util = {
    windowToMapClient:function (canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x:x + document.body.scrollLeft - bbox.left - (bbox.width - canvas.width) / 2,
            y:y + document.body.scrollTop - bbox.top - (bbox.height - canvas.height) / 2
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
    }
}