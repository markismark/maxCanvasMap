max.tools.DrawTool=function(map){
    this.map=map;
    this._isActivate=false;
    this.drawType="POINT";//LINE POLYGON
    this._layer=new max.Layer.GraphicsLayer();
    this._graphic=null;
    this._geometry=null;
    this._init();
}
max.tools.DrawTool.prototype={
    activate:function(){
        if(!this._isActivate){
            this._initEvn();
            max.event.addHandler(this.map._canvas,"click",this._clickHandler);
            max.event.addHandler(this.map._canvas,"dblclick",this._dbclickHandler);
            max.event.addHandler(this.map._canvas,"mousemove",this._mouseMoveHandler);
            this._isActivate=true;
            this.map._canvas.style.cursor="crosshair";
            map.addLayer(this._layer);
            this._pub.triggerDirectToSub(this._sub,"drawstart","begin draw");
        }
    },
    deactivate:function(){
        var that=this;
        if(this._isActivate){
            max.event.removeHandler(this.map._canvas,"click",this._clickHandler);
            max.event.removeHandler(this.map._canvas,"dblclick",that._dbclickHandler);
            max.event.removeHandler(this.map._canvas,"mousemove",this._mouseMoveHandler);
            this._isActivate=false;
            this.map._canvas.style.cursor="default";
            map.removeLayer(this._layer);
        }
    },
    _init:function(){
        this._sub=new max.event.Subscriber();
        this._pub=new max.event.Publisher();
        var that=this;
        this._clickHandler=function(event){
            if(that.drawType==="POINT"){
                var pos=max.util.windowToMapClient(that.map._canvas,event.clientX,event.clientY);
                var pos1=max.util.mapClientToWebMercator(that.map,pos.x,pos.y);
                var geometry=new max.Geometry.Point(pos1.x,pos1.y,{wkid:102100});
                event.geometry=geometry;
                //that.deactivate();
                that._pub.triggerDirectToSub(that._sub,"drawend",event);
                geometry=null;
            }else{
                var pos=max.util.windowToMapClient(that.map._canvas,event.clientX,event.clientY);
                var pos1=max.util.mapClientToWebMercator(that.map,pos.x,pos.y);
                that._geometry.addPoint(pos1.x,pos1.y,0,that._geometry.paths[0].length-1);
            }
        }
        this._mouseMoveHandler=function(event){
            if(that.drawType==="POINT"){
                return false;
            }else{
                var pos=max.util.windowToMapClient(that.map._canvas,event.clientX,event.clientY);
                var pos1=max.util.mapClientToWebMercator(that.map,pos.x,pos.y);
                if(that._geometry.paths[0].length===0){
                    that._geometry.addPoint(pos1.x,pos1.y,0,0);
                }else{
                    that._geometry.updatePoint(pos1.x,pos1.y,0,that._geometry.paths[0].length-1);
                }

            }
        }
        this._dbclickHandler=function(event){
            if(that.drawType==="POINT"){
                return false;
            }else{
                that._geometry.removePoint(0,that._geometry.paths[0].length-1);
                that._geometry.removePoint(0,that._geometry.paths[0].length-1);
                that._layer.removeAllGraphics();
                event.geometry=that._geometry;
                that._pub.triggerDirectToSub(that._sub,"drawend",event);
                that._initEvn.call(that);
            }
        }
    },
    setDrawType:function(type){
        if(type===this.drawType){
            return false;
        }else{
            this.drawType=type;
            this._initEvn();
        }

    },
    _initEvn:function(){
        var type=this.drawType;
        this._layer.removeGraphic();
        this._graphic=null;
        this._geometry=null;
        if(type==="POINT"){

        }else if(type==="LINE"){
            this._geometry=new max.Geometry.Line([[]],{wkid:102100});
            this._graphic=new max.Geometry.Graphic(this._geometry);
            this._layer.addGraphic(this._graphic);
        }else if(type==="POLYGON"){
            this._geometry=new max.Geometry.Polygon([[]],{wkid:102100});
            this._graphic=new max.Geometry.Graphic(this._geometry);
            this._layer.addGraphic(this._graphic);
        }
    },
    addEventListener:function(type,handler){
        this._sub.bind(this._pub,type,handler);
    },
    removeEventListener:function(type,handler){
        this._sub.unbind(this._pub,type,handler);
    }
}