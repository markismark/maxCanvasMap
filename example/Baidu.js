var extent = new max.Extent({
        xmin: 10762435.858420863,
        ymin: 3415567.428002159,
        xmax: 17135450.014862295,
        ymax: 6351564.966545691
    }),
    map = new max.Map("canvas", extent);
var layer = new max.Layer.BaiduLayer("http://shangetu2.map.bdimg.com/it/");
map.addLayer(layer);



