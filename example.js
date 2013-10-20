var extent=new max.Extent({xmin:8338988.713709,
    ymin:-6557548.55548714,
    xmax:14209352.486010524,
    ymax:-1665578.7452358697}),
    map=new max.Map("canvas",extent);
var layer=new max.Layer.GoogleLayer("http://mt2.google.cn/vt/");
map.addLayer(layer);
map._context.fillStyle='rgba(30,113,240,0.8)';


var point=new max.Geometry.Point(10338988,-3557548,{wkid:102100});
var grapher=new max.Geometry.Grapher(point);
grapher.attribute.name="first point";

var point2=new max.Geometry.Point(10438988,-4557548,{wkid:102100});
var grapher2=new max.Geometry.Grapher(point2);
grapher2.attribute.name="second point";

var grapherLayer=new max.Layer.GrapherLayer();
grapherLayer.addGraphic(grapher);
grapherLayer.addGraphic(grapher2);
map.addLayer(grapherLayer);


//setTimeout(function(){
//    var oldtime=new Date();
//    for(var i=0;i!=10000;++i){
//        var x=Math.random()*20037508*2-20037508;
//        var y=Math.random()*20037508*2-20037508;
//        var p=new max.Geometry.Point(x,y,{wkid:102100});
//        var g=new max.Geometry.Grapher(p);
//        grapherLayer.addGraphic(g);
//    }
//    var newtime=new Date();
//    console.log(newtime.getTime()-oldtime.getTime());
//},10*1000);

grapherLayer.addEventListener("onclick",function(event){
    console.log(event.grapher.attribute.name);
})



