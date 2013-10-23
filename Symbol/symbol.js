max.Symbol=function(option){
    this.fillStyle=option.fillStyle?option.fillStyle:'rgba(0,0,0,1)';
    this.fillSize=option.fillSize?option.fillSize:8;
    this.lineWidth=option.lineWidth?option.lineWidth:4;
    this.lineStyle=option.lineStyle?option.lineStyle:'rgba(0,0,0,1)';
}

max.Symbol.SimpleMarkerSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleMarkerSymbol";
    this.style=option.style?option.style:"CIRCLE";//CIRCLE,SQUARE，以后再扩展吧
}

max.Symbol.SimpleLineSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleLineSymbol";
}

max.Symbol.SimpleFillSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleFillSymbol";
}