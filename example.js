var extent=new max.Extent({xmin:-20037508.3427892,
    ymin:-20037508.3427892,
    xmax:20037508.3427892/1000,
    ymax:20037508.3427892/1000}),
    map=new max.Map("canvas",extent);
var layer=new max.Layer.GoogleLayer("http://mt2.google.cn/vt/");
map.addLayer(layer);


var filter=function(imageDate){

}