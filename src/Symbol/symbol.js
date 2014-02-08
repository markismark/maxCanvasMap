max.Symbol=function(option){
    if(!option){
        return ;
    }
    this.fillStyle=option.fillStyle?option.fillStyle:'rgba(0,0,0,1)';
    this.fillSize=option.fillSize?option.fillSize:8;
    this.lineWidth=option.lineWidth?option.lineWidth:4;
    this.lineStyle=option.lineStyle?option.lineStyle:'rgba(0,0,0,1)';
    this.font='18px Helvetica Neue,Microsoft YaHei';
    this.horAlign=option.horAlign?option.horAlign:'center';
    this.verAlign=option.verAlign?option.verAlign:'middle';
    this.offsetX=option.offsetX?option.offsetX:0;
    this.offsetY=option.offsetY?option.offsetX:0;
    this.textOffsetX=option.textOffsetX?option.textOffsetX:0;
    this.textOffsetY=option.textOffsetY?option.textOffsetY:0;
}

max.Symbol.prototype.setContext=function(context){
    context.fillStyle=this.fillStyle;
    context.fillSize=this.fillSize;
    context.lineWidth=this.lineWidth;
    context.font=this.font;
    switch (this.horAlign){
        case 'left':
            context.textAlign='right';
            break;
        case 'right':
            context.textAlign='left';
            break;
        default :
            context.textAlign=this.horAlign;
            break;
    }
    switch (this.verAlign){
        case 'top':
            context.textBaseline='bottom';
            break;
        case 'bottom':
            context.textBaseline='top';
            break;
        default:
            context.textBaseline=this.verAlign;
    }
}
max.Symbol.SimpleMarkerSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleMarkerSymbol";
    this.style=option.style?option.style:"CIRCLE";//CIRCLE,SQUARE，以后再扩展吧
}
max.Symbol.SimpleMarkerSymbol.prototype=new max.Symbol();

max.Symbol.SimpleLineSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleLineSymbol";
}
max.Symbol.SimpleLineSymbol.prototype=new max.Symbol();

max.Symbol.SimpleFillSymbol=function(option){
    max.Symbol.call(this,option);
    this.SymbolType="SimpleFillSymbol";
}
max.Symbol.SimpleFillSymbol.prototype=new max.Symbol();

max.Symbol.TextSymbol=function(option,text){
    max.Symbol.call(this,option);
    this.text=text;
    this.SymbolType="TextSymbol";
}

max.Symbol.TextSymbol.prototype=new max.Symbol();