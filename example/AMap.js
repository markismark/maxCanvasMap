var extent=new max.Extent({xmin:8338988.713709,
        ymin:-6557548.55548714,
        xmax:14209352.486010524,
        ymax:-1665578.7452358697}),
    map=new max.Map("canvas",extent);
var layer=new max.Layer.AMapLayer("http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8");
map.addLayer(layer);



