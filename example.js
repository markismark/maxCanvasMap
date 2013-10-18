var extent=new max.Extent({xmin:-20037508.3427892,
    ymin:-20037508.3427892,
    xmax:20037508.3427892/1000,
    ymax:20037508.3427892/1000}),
    map=new max.Map("canvas",extent);
var layer=new max.Layer.GoogleLayer("http://mt2.google.cn/vt/");
map.addLayer(layer);
map._context.fillStyle='rgba(30,113,240,0.8)';
var point=new max.Geometry.Point(-20037508/2,-20037508/2,{wkid:102100});
var grapher=new max.Geometry.Grapher(point);
var grapherLayer=new max.Layer.GrapherLayer();
grapherLayer.addGraphic(grapher);
map.addLayer(grapherLayer);


setTimeout(function(){
    var oldtime=new Date();
    for(var i=0;i!=10000;++i){
        var x=Math.random()*20037508*2-20037508;
        var y=Math.random()*20037508*2-20037508;
        var p=new max.Geometry.Point(x,y,{wkid:102100});
        var g=new max.Geometry.Grapher(p);
        grapherLayer.addGraphic(g);
    }
    var newtime=new Date();
    console.log(newtime.getTime()-oldtime.getTime());
},10*1000);


