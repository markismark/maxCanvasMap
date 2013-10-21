
max.Geometry.Grapher=function(geometry,attribute,symbol){
    this.geometry=geometry;
    this.attribute=attribute||{};
    this.symbol=symbol;
    this.parentLayer=null;
}
max.Geometry.Grapher.prototype={
    draw:function(map){
        var context=map._context;
        context.save();
        if(this.geometry.getPath(map)){
//            if(this.parentLayer!==null&&this.parentLayer._eventList.length!==0){
//                for(var i=0;i!==this.parentLayer._eventList.length;++i){
//                    var _event=this.parentLayer._eventList[i];
//                    var b=this.parentLayer.parentMap._context.isPointInPath(_event.event.clientPosition.x,_event.event.clientPosition.y);
//                    if(b===true){
//                        _event.event.grapher=this;
//                        this.parentLayer._eventList.splice(i,1);
//                        --i;
//                        _event.handler(_event.event);
//                    }
//                }
//            }
            context.fill();
        }
        context.restore();
    },
    _mousePointInGrapher:function(x,y){
        var map=this.parentLayer.parentMap;
        if(this.geometry.getPath(map)){
            return this.parentLayer.parentMap._context.isPointInPath(x,y);
        }else{
            return false;
        }
    }
}