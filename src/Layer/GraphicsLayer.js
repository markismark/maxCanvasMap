max.Layer.GraphicsLayer=function(){
    max.Layer.call(this);
    this.graphics=[];
    this._cacheCanvas=null;
    this._cacheContext=null;
    this._cacheData=null;
}
max.Layer.GraphicsLayer.prototype=new max.Layer();
max.Layer.GraphicsLayer.prototype.addGraphic=function(graphic){
    for(var i in this.graphics){
        if(this.graphics[i]===graphic){
            return false;
        }
    }
    graphic.parentLayer=this;
    this.graphics.push(graphic);
};
max.Layer.GraphicsLayer.prototype.removeGraphic=function(graphic){
   for(var i in this.graphics){
       if(this.graphics[i]===graphic){
           this.graphics.splice(i,1);
           return true;
       }
   }
    return false;
};
max.Layer.GraphicsLayer.prototype.removeAllGraphics=function(){
    this.graphics=[];
}
max.Layer.GraphicsLayer.prototype.draw=function(){
    this.parentMap._context.drawImage(this._cacheCanvas,0,0);
    var that=this;
    setTimeout(function(){
        that._cacheContext.clearRect(0,0,that._cacheCanvas.width,that._cacheCanvas.height);
        for(var i in that.graphics){
            that.graphics[i].draw(that.parentMap,that._cacheContext);
        }
        that._eventList=[];
    },1);
}

max.Layer.GraphicsLayer.prototype._mousePointInLayer=function(x,y){
    var l=this.graphics.length;
    for(var i=l-1;i!=-1;--i){
        if(this.graphics[i]._mousePointInGraphic(x,y)){
            return this.graphics[i];
        }
    }
    return null;
}
max.Layer.GraphicsLayer.prototype._addToMap=function(){
    this._cacheCanvas=document.createElement('canvas');

    this._cacheCanvas.width=this.parentMap._canvas.width;
    this._cacheCanvas.height=this.parentMap._canvas.height;
    document.body.appendChild(this._cacheCanvas);
    this._cacheCanvas.style.display="none";
    this._cacheContext=this._cacheCanvas.getContext('2d');
}