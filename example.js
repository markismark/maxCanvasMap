var extent = new max.Extent({xmin:8338988.713709,
        ymin:1665578.7452358697,
        xmax:14209352.486010524,
        ymax:6557548.55548714}),
    map = new max.Map("canvas", extent);
var layer = new max.Layer.GoogleLayer("http://mt2.google.cn/vt/");
map.addLayer(layer);


var point = new max.Geometry.Point(115, 35, {wkid:4326});
var grapher = new max.Geometry.Grapher(point);
grapher.attribute.id = 1;
;

var point2 = new max.Geometry.Point(10438988, 4557548, {wkid:102100});
var grapher2 = new max.Geometry.Grapher(point2, {id:2});

var grapherLayer = new max.Layer.GrapherLayer();
grapherLayer.addGraphic(grapher);
grapherLayer.addGraphic(grapher2);
map.addLayer(grapherLayer);


var line = new max.Geometry.Line([
    [
        {x:117.5, y:38.6},
        {x:118, y:36},
        {x:119, y:37}
    ],
    [
        {x:129.5, y:39.6},
        {x:106, y:37},
        {x:111, y:36.4}
    ]
]);
var lineGrapher = new max.Geometry.Grapher(line);
grapherLayer.addGraphic(lineGrapher);


//var grapherLayer2=new max.Layer.GrapherLayer();
//map.addLayer(grapherLayer2);

//setTimeout(function(){
//    var oldtime=new Date();
//    for(var i=0;i!=1000;++i){
//        var x=Math.random()*20037508*2-20037508;
//        var y=Math.random()*20037508*2-20037508;
//        var p=new max.Geometry.Point(x,y,{wkid:102100});
//        var g=new max.Geometry.Grapher(p);
//        g.attribute.id=i+3;
//        grapherLayer.addGraphic(g);
//    }
//    var newtime=new Date();
//    console.log(newtime.getTime()-oldtime.getTime());
//},3*1000);


grapherLayer.addEventListener("onclick", function (event) {
    console.log("click:" + event.grapher.attribute.id);
})
grapherLayer.addEventListener("onmouseout", function (event) {
    console.log("mouseout:" + event.grapher.attribute.id);
    event.grapher.symbol.fillStyle = "rgba(30,113,240,0.8)";
    event.grapher.symbol.fillSize = "8";
})
grapherLayer.addEventListener("onmouseover", function (event) {
    event.grapher.symbol.fillStyle = "rgba(12,12,12,0.8)";
    event.grapher.symbol.fillSize = "12";
})
grapherLayer.addEventListener("onmousemove", function (event) {
    console.log("mousemove:" + event.grapher.attribute.id);
})


//
//grapherLayer2.addEventListener("onclick",function(event){
//    console.log("click:"+event.grapher.attribute.id);
//})
//grapherLayer2.addEventListener("onmouseout",function(event){
//    console.log("mouseout:"+event.grapher.attribute.id);
//})
//grapherLayer2.addEventListener("onmouseover",function(event){
//    console.log("mouseover:"+event.grapher.attribute.id);
//})
//grapherLayer2.addEventListener("onmousemove",function(event){
//    console.log("mousemove:"+event.grapher.attribute.id);
//})

