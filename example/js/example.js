var map, layer,grapherLayer;

window.onload = function() {
	init();
}
var init = function() {
	initPosition();
	initMap();
    document.getElementById('pointNum').onchange=function(event){
        setTimeout(function(){
        	addPointInMap(document.getElementById('pointNum').value-0);
        },10);
    }
    document.getElementById('basemaps').onchange=function(event){
        changeBaseMap(document.getElementById('basemaps').value);
    }
}
var initPosition = function() {
	var h = window.document.body.clientHeight;
	var w = window.document.body.clientWidth;
	var canvas = document.getElementById('canvas');
	canvas.setAttribute("height", h - 82);
	canvas.setAttribute("width", w - 4);
}
var initMap = function() {
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
	var grapher = new max.Geometry.Grapher(point);
	grapher.attribute.id = 1;

	var point2 = new max.Geometry.Point(10438988, 4557548, {
		wkid : 102100
	});
	var grapher2 = new max.Geometry.Grapher(point2, {
		id : 2
	});

	grapherLayer = new max.Layer.GrapherLayer();
	grapherLayer.addGraphic(grapher);
	grapherLayer.addGraphic(grapher2);
	map.addLayer(grapherLayer);

	var line = new max.Geometry.Line([[{
		x : 117.5,
		y : 38.6
	}, {
		x : 118,
		y : 36
	}, {
		x : 119,
		y : 37
	}], [{
		x : 129.5,
		y : 39.6
	}, {
		x : 106,
		y : 37
	}, {
		x : 111,
		y : 36.4
	}]]);
	var lineGrapher = new max.Geometry.Grapher(line,{id:3});
	grapherLayer.addGraphic(lineGrapher);

	var polygon = new max.Geometry.Polygon([[{
		x : 116,
		y : 40.87
	}, {
		x : 118.8,
		y : 42.05
	}, {
		x : 119.7,
		y : 45.78
	}, {
		x : 118,
		y : 48.55
	}]])
	var polygonGrapher = new max.Geometry.Grapher(polygon,{id:4});
	grapherLayer.addGraphic(polygonGrapher);


	grapherLayer.addEventListener("onclick", function(event) {
		mconsole("发生了onclick事件：对象为"+"第"+event.grapher.attribute.id+"要素");
	})
	grapherLayer.addEventListener("onmouseout", function(event) {
		mconsole("发生了onmouseout事件：对象为"+"第"+event.grapher.attribute.id+"要素");
		if(event.grapher.geometry.geometryType !== "LINE") {
			event.grapher.symbol.fillStyle = "rgba(30,113,240,0.8)";
			event.grapher.symbol.fillSize = "8";
		} else {
			event.grapher.symbol.lineStyle = "rgba(30,113,240,0.8";
			event.grapher.symbol.lineWidth = 4;
		}
	})
	grapherLayer.addEventListener("onmouseover", function(event) {
		mconsole("发生了onmouseover事件：对象为"+"第"+event.grapher.attribute.id+"要素");
		if(event.grapher.geometry.geometryType !== "LINE") {
			event.grapher.symbol.fillStyle = "rgba(255,12,12,0.6)";
			event.grapher.symbol.fillSize = "12";
		} else {
			event.grapher.symbol.lineStyle = "rgba(255,12,12,0.6)";
			event.grapher.symbol.lineWidth = 8;
			console.log(event.grapher);
		}

	})
	grapherLayer.addEventListener("onmousemove", function(event) {
		mconsole("发生了onmousemove事件：对象为"+"第"+event.grapher.attribute.id+"要素");
	})
}

var addPointInMap=function(num){
    var oldtime=new Date();
    for(var i=0;i!=num;++i){
        var x=Math.random()*20037508*2-20037508;
        var y=Math.random()*20037508*2-20037508;
        var p=new max.Geometry.Point(x,y,{wkid:102100});
        var g=new max.Geometry.Grapher(p);
        g.attribute.id=i+5;
        grapherLayer.addGraphic(g);
    }
    var newtime=new Date();
    //console.log(newtime.getTime()-oldtime.getTime());
    mconsole("随机添加"+num+"点要素"+",消耗："+(newtime.getTime()-oldtime.getTime())+"ms");
}

var mconsole=function(content){
    var wrapper=document.getElementById('console');
    var div=document.createElement('div');
    div.innerHTML=content;
    wrapper.appendChild(div);
}

var changeBaseMap=function(v){
	map.removeLayer(layer);
    layer=null;
    switch(v){
        case "Google":
            layer=new max.Layer.GoogleLayer("http://mt2.google.cn/vt/");
            break;
        case "OpenStreet":
            layer=new max.Layer.OpenStreetLayer("http://otile3.mqcdn.com/tiles/1.0.0/osm/");
            break;
        case "bingmaps":
            layer=new max.Layer.BingMapsLayer("http://t3.tiles.ditu.live.com/tiles/");
            break;
        case "amap":
            layer=new max.Layer.AMapLayer("http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8");
            break;
        case "ago":
            layer=new max.Layer.AGSTileLayer("http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/");
            break;
    }
    map.addLayer(layer,0);
}
