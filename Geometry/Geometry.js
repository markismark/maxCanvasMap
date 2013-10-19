
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