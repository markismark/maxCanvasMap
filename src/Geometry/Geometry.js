max.Geometry.Geometry=function(){

}
max.Geometry.Geometry.prototype={
    _getWebMercatorPaths:function(){
        if(this.wkid==102100){
            this.webMercatorPaths=max.util.clone(this.paths);
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
    },
    addPoint:function(x,y,pathIndex,pointIndex){
        if(this.geometryType==="POINT"){
            return false;
        }
        var l=this.paths.length;
        if(l==0){
            this.addPath();
        }
        if(typeof pathIndex!=="number"||pathIndex<0||pathIndex>=l){
            pathIndex=Math.max(0,l-1);
        }
        var pl=this.paths[pathIndex].length;
        if(typeof  pointIndex!=="number"||pointIndex<0||pointIndex>=pl){
            pointIndex=pl;
        }
        var p={x:x,y:y}
        this.paths[pathIndex].splice(pointIndex,0,p);
        if(this.wkid==102100){
            this.webMercatorPaths[pathIndex].splice(pointIndex,0,p);
        }else if(this.wkid==4326){
            this.webMercatorPaths[pathIndex].splice(pointIndex,0,max.util.lonLat2WebMercator(p));
        }
    },
    removePoint:function(pathIndex,pointIndex){
        if(this.geometryType==="POINT"){
            return false;
        }else{
            var l=this.paths.length;
            if(typeof pathIndex!=="number"||pathIndex<0||pathIndex>=l){
                return false;
            }
            var pl=this.paths[pathIndex].length;
            if(typeof  pointIndex!=="number"||pointIndex<0||pointIndex>=pl){
                return false;
            }
            this.paths[pathIndex].splice(pointIndex,1);
            this.webMercatorPaths[pathIndex].splice(pointIndex,1);
        }
    },
    addPath:function(points){
        if(this.geometryType==="POINT"){
            return false;
        }
        var l=this.paths.length;
        this.paths.push([]);
        this.webMercatorPaths.push([]);
        if(Object.prototype.toString.call(points)!=="[object Array]"){
            return false;
        }
        for(var i in points){
            this.paths[l].push(points[i]);
            if(this.wkid==102100){
                this.webMercatorPaths.push(points[i]);
            }else if(this.wkid==4326){
                this.webMercatorPaths.push(max.util.lonLat2WebMercator(points[i]));;
            }
        }
    },
    updatePoint:function(x,y,pathIndex,pointIndex){
        if(this.geometryType==="POINT"){
            this.x=x;
            this.y=y;
            this._getWebMercatorPoint();
        }else{
            var l=this.paths.length;
            if(typeof pathIndex!=="number"||pathIndex<0||pathIndex>=l){
                return false;
            }
            var pl=this.paths[pathIndex].length;
            if(typeof  pointIndex!=="number"||pointIndex<0||pointIndex>=pl){
                return false;
            }
            this.paths[pathIndex][pointIndex]={x:x,y:y};
            if(this.wkid==102100){
                this.webMercatorPaths[pathIndex][pointIndex]={x:x,y:y};
            }else if(this.wkid==4326){
                var p=max.util.lonLat2WebMercator({x:x,y:y});
                this.webMercatorPaths[pathIndex][pointIndex]=p;
            }
        }
    }
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
        context.stroke();
        context.fill();
    }else{

    }
    context.restore();
}
