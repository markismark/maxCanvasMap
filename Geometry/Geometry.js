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
    return false;
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