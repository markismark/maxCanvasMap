/**
 * Created by maxin03 on 14-2-7.
 */
var map, layer,graphicsLayer;
function initMap(){
    var extent = new max.Extent({
        xmin : 10762435.858420863,
        ymin : 3415567.428002159,
        xmax : 17135450.014862295,
        ymax : 6351564.966545691
    });
    map = new max.Map("canvas", extent);
    layer = new max.Layer.GoogleLayer("http://mt2.google.cn/vt/");
    map.addLayer(layer);
    var point = new max.Geometry.Point(115, 35, {
        wkid : 4326
    });
    var graphic = new max.Geometry.Graphic(point);
    graphic.attribute.id = 1;
    graphic.symbol=new max.Symbol.SimpleMarkerSymbol({
        style:"TRIANGLE",
        fillSize:40,
        fillStyle:'rgba(30,113,240,0.8)',
        lineWidth:15
    });
    var point2 = new max.Geometry.Point(10438988, 4557548, {
        wkid : 102100
    });
    var graphic2 = new max.Geometry.Graphic(point2, {
        id : 2
    });
    graphicsLayer = new max.Layer.GraphicsLayer();
    graphicsLayer.addGraphic(graphic);
    graphicsLayer.addGraphic(graphic2);
    map.addLayer(graphicsLayer);
}
initMap();