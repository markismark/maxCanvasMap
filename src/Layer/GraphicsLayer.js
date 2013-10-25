max.Layer.GraphicsLayer=function(){
    max.Layer.call(this);
    this.graphicses=[];

}
max.Layer.GraphicsLayer.prototype=new max.Layer();
max.Layer.GraphicsLayer.prototype.addGraphic=function(graphics){
    for(var i in this.graphicses){
        if(this.graphicses[i]===graphics){
            return false;
        }
    }
    graphics.parentLayer=this;
    this.graphicses.push(graphics);
};
max.Layer.GraphicsLayer.prototype.removeGraphic=function(graphics){
   for(var i in this.graphicses){
       if(this.graphicses[i]===graphics){
           this.graphicses.splice(i,1);
           return true;
       }
   }
    return false;
};
max.Layer.GraphicsLayer.prototype.draw=function(){
    for(var i in this.graphicses){
        this.graphicses[i].draw(this.parentMap);
    }
    this._eventList=[];
}

max.Layer.GraphicsLayer.prototype._mousePointInLayer=function(x,y){
    var l=this.graphicses.length;
    for(var i=l-1;i!=-1;--i){
        if(this.graphicses[i]._mousePointInGraphics(x,y)){
            return this.graphicses[i];
        }
    }
    return null;
}