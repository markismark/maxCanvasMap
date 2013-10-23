
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
max.Geometry.Point.prototype.draw=function(map,symbol){
    var x=(this.webMercatorPoint.x-map.originPoint.x)/map.resolution;
    var y=(map.originPoint.y-this.webMercatorPoint.y)/map.resolution;
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
        context.beginPath();
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
    //this.geometryType=
}