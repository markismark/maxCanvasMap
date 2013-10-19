
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