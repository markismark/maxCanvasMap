max.Layer.GrapherLayer=function(){
    this.graphers=[];

}
max.Layer.GrapherLayer.prototype=new max.Layer();
max.Layer.GrapherLayer.prototype.addGraphic=function(grapher){
    for(var i in this.graphers){
        if(this.graphers[i]===grapher){
            return false;
        }
    }
    this.graphers.push(grapher);
};
max.Layer.GrapherLayer.prototype.draw=function(){
    for(var i in this.graphers){
        this.graphers[i].draw(this.parentMap);
    }
}
