max.Geometry.Graphic = function (geometry, attribute, symbol) {
    this.geometry = geometry;
    this.attribute = attribute || {};

    if (typeof symbol === "undefined") {
        if (geometry.geometryType === "POINT") {
            this.symbol = new max.Symbol.SimpleMarkerSymbol({fillStyle:'rgba(30,113,240,0.8)', fillSize:8});
        }else if(geometry.geometryType === "LINE"){
            this.symbol = new max.Symbol.SimpleLineSymbol({lineStyle:'rgba(30,113,240,0.8)', lineWidth:4});
        }else if(geometry.geometryType==="POLYGON"){
            this.symbol = new max.Symbol.SimpleFillSymbol({fillStyle:'rgba(30,113,240,0.8)'});
        }
    }else{
        this.symbol = max.util.clone(symbol);
    }
    this.parentLayer = null;
}
max.Geometry.Graphic.prototype = {
    draw:function (map) {
        this.geometry.draw(map,this.symbol);
    },
    _mousePointInGraphic:function (x, y) {
        var map = this.parentLayer.parentMap;
        if (this.geometry.getPath(map,this.symbol)) {
            if(this.geometry.geometryType!=="LINE"){
                return this.parentLayer.parentMap._context.isPointInPath(x, y);
            }else{
                this.parentLayer.parentMap._context.save();
                this.parentLayer.parentMap._context.lineWidth=this.symbol.lineWidth;
                this.parentLayer.parentMap._context.lineCap="round";
                this.parentLayer.parentMap._context.lineJoin="round";
                var b=this.parentLayer.parentMap._context.isPointInStroke(x, y);
                this.parentLayer.parentMap._context.restore();
                return b;
            }

        } else {
            return false;
        }
    }
}