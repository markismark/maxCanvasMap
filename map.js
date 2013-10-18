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

max.Extent = function (extent) {
    this.xmin = extent.xmin;
    this.xmax = extent.xmax;
    this.ymin = extent.ymin;
    this.ymax = extent.ymax;
}
