max.Layer = function () {
    this._sub=new max.event.Subscriber();
    this._eventList=[];
};
max.Layer.prototype={
    ondrag:function(){

    },
    load:function(){

    },
    addEventListener:function(type,handler){
        var that=this;
        this._sub.bind(this.parentMap._pub,type,function(event){
            that._eventList.push({
                event:event,
                handler:handler
            });
        });
    },
    removeEventListner:function(type,handler){
        this._sub.unbind(this.parentMap._sub,type,handler);
    }
}
