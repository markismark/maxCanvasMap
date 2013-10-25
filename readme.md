maxCanvasMap
=================================== 
使用Html5技术加载地图，目前可加载Google,Bing Maps，Open Street,ArcGIS Online等主流地图服务。对于那些没有找到相应的切图原点，就不好意思了，但是如果你知道的话，希望能得到你的反馈，我的邮箱maxinvc@126.com，当然动态扩展图层也是十分容易的。
##事件
目前已经实现关于鼠标，键盘所有的事件。未来添加onload，onadd等事件。
##下一步工作
丰富symbol类，以及infowindow。
##滤镜
可以添加滤镜效果，只不过有的滤镜运行一次世间较长，浏览器就卡住不到了。另外涉及到跨域问题，瓦片服务器一定要支持跨域，目前我看见的也只有Google和OpenStreet支持。
##使用代码
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
##测试
动态加载1000个点，仅需要79毫秒，加载3000个点，需要500毫秒，10000个点，需要6秒。但是所有的点一旦加载上了，拖动没有任何的卡感。
##开源协议
采用GPL协议，希望你使用的时候，也同样开源。
##关于作者
地理信息系统专业，非常热爱GIS以及互联网技术。

微博 [WEBGIS](http://weibo.com/maxinnb) ，欢迎关注我，等这个写的差不多的时候，写相关的博客

博客地址 [HPhone](http://www.cnblogs.com/HPhone/) 