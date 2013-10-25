var map, layer,graphicsLayer;

window.onload = function() {
    if(window.navigator.userAgent.indexOf("Chrome")<0){
        alert('暂时只支持chrome，Firefox正在努力修改中');
    }
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
    document.getElementById('filter').onchange=function(event){
        changeBlur(document.getElementById('filter').value)
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
	var graphics = new max.Geometry.Graphics(point);
	graphics.attribute.id = 1;

	var point2 = new max.Geometry.Point(10438988, 4557548, {
		wkid : 102100
	});
	var graphics2 = new max.Geometry.Graphics(point2, {
		id : 2
	});

	graphicsLayer = new max.Layer.GraphicsLayer();
	graphicsLayer.addGraphic(graphics);
	graphicsLayer.addGraphic(graphics2);
	map.addLayer(graphicsLayer);

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
	var lineGraphics = new max.Geometry.Graphics(line,{id:3});
	graphicsLayer.addGraphic(lineGraphics);

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
	var polygonGraphics = new max.Geometry.Graphics(polygon,{id:4});
	graphicsLayer.addGraphic(polygonGraphics);


	graphicsLayer.addEventListener("onclick", function(event) {
		mconsole("发生了onclick事件：对象为"+"第"+event.graphics.attribute.id+"要素");
	})
	graphicsLayer.addEventListener("onmouseout", function(event) {
		mconsole("发生了onmouseout事件：对象为"+"第"+event.graphics.attribute.id+"要素");
		if(event.graphics.geometry.geometryType !== "LINE") {
			event.graphics.symbol.fillStyle = "rgba(30,113,240,0.8)";
			event.graphics.symbol.fillSize = "8";
		} else {
			event.graphics.symbol.lineStyle = "rgba(30,113,240,0.8";
			event.graphics.symbol.lineWidth = 4;
		}
	})
	graphicsLayer.addEventListener("onmouseover", function(event) {
		mconsole("发生了onmouseover事件：对象为"+"第"+event.graphics.attribute.id+"要素");
		if(event.graphics.geometry.geometryType !== "LINE") {
			event.graphics.symbol.fillStyle = "rgba(255,12,12,0.6)";
			event.graphics.symbol.fillSize = "12";
		} else {
			event.graphics.symbol.lineStyle = "rgba(255,12,12,0.6)";
			event.graphics.symbol.lineWidth = 8;
			console.log(event.graphics);
		}

	})
	graphicsLayer.addEventListener("onmousemove", function(event) {
		mconsole("发生了onmousemove事件：对象为"+"第"+event.graphics.attribute.id+"要素");
	})
}

var addPointInMap=function(num){
    var oldtime=new Date();
    for(var i=0;i!=num;++i){
        var x=Math.random()*20037508*2-20037508;
        var y=Math.random()*20037508*2-20037508;
        var p=new max.Geometry.Point(x,y,{wkid:102100});
        var g=new max.Geometry.Graphics(p);
        g.attribute.id=i+5;
        graphicsLayer.addGraphic(g);
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
            mconsole("切换到谷歌底图");
            break;
        case "OpenStreet":
            layer=new max.Layer.OpenStreetLayer("http://otile3.mqcdn.com/tiles/1.0.0/osm/");
            mconsole("切换到OpenStreet底图");
            break;
        case "bingmaps":
            layer=new max.Layer.BingMapsLayer("http://t3.tiles.ditu.live.com/tiles/");
            mconsole("切换到微软Bing Maps底图");
            break;
        case "amap":
            layer=new max.Layer.AMapLayer("http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8");
            mconsole("切换到高德底图");
            break;
        case "ago":
            layer=new max.Layer.AGSTileLayer("http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/");
            mconsole("切换到ArcGIS Online底图");
            break;
    }
    if(layer.cors!==true){
        document.getElementById('filter').value="";
    }
    map.addLayer(layer,0);
}

var changeBlur=function(v){
    if(layer.cors!==true){
        document.getElementById('filter').value="";
        map.filter=null;
        alert('跨域问题，该底图不能使用滤镜');
    }
    switch(v){
        case "":
            map.filter=null;
            mconsole("禁用滤镜效果");
            break;
        case "colorInvert":
            map.filter=max.Filter.colorInvertProcess;
            mconsole("使用反色滤镜");
            break;
        case "gray":
            map.filter=max.Filter.grayProcess;
            mconsole("使用灰色滤镜");
            break;
        case "blur":
            map.filter=max.Filter.blurProcess;
            mconsole("使用模糊滤镜");
            break;
    }
}

var clearConsole=function(){
    document.getElementById('console').innerHTML="";
    mconsole("清除控制台完毕");
}
var clearFeature=function(){
    graphicsLayer.graphicses=[];
}