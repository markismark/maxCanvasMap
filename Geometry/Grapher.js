max.Geometry.Grapher = function (geometry, attribute, symbol) {
    this.geometry = geometry;
    this.attribute = attribute || {};

    if (typeof symbol === "undefined") {
        if (geometry.geometryType === "POINT") {
            this.symbol = new max.Symbol.SimpleMarkerSymbol({fillStyle:'rgba(30,113,240,0.8)', fillSize:8});
        }else if(geometry.geometryType === "LINE"){
            this.symbol = new max.Symbol.SimpleLineSymbol({lineStyle:'rgba(30,113,240,0.8)', lineWidth:4});
        }else if(geometry.geometry==="POLYGON"){
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
            return this.parentLayer.parentMap._context.isPointInPath(x, y);
        } else {
            return false;
        }
    }
}