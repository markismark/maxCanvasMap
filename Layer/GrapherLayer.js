max.Layer.GrapherLayer=function(){
    max.Layer.call(this);
    this.graphers=[];

}
max.Layer.GrapherLayer.prototype=new max.Layer();
max.Layer.GrapherLayer.prototype.addGraphic=function(grapher){
    for(var i in this.graphers){
        if(this.graphers[i]===grapher){
            return false;
        }
    }
    grapher.parentLayer=this;
    this.graphers.push(grapher);
};
max.Layer.GrapherLayer.prototype.removeGraphic=function(grapher){
   //todo
};
max.Layer.GrapherLayer.prototype.draw=function(){
    var l=this.graphers.length;
    for(var i=l-1;i>-1;--i){
        this.graphers[i].draw(this.parentMap);
    }
    this._eventList=[];
}
