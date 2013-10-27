max.Layer.GraphicsLayer=function(){
    max.Layer.call(this);
    this.graphics=[];

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
    for(var i in this.graphics){
        this.graphics[i].draw(this.parentMap);
    }
    this._eventList=[];
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