/**
 * 支持Baidu Layer
 */
max.Layer.BaiduLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.cors = false;
    this.fullExtent = new max.Extent({
        xmin: -20037508.3427892,
        ymin: -20037508.3427892,
        xmax: 20037508.3427892,
        ymax: 20037508.3427892
    });
    this.originPoint = {
        x: 0,
        y: 0
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [ 131072, 65536,32768, 16384, 8192, 4096, 2048, 1024,512,256,128,64,32, 16,8,4, 2,1,0.5];
    this.init();
}

max.Layer.BaiduLayer.prototype = new max.Layer.TileLayer();

max.Layer.BaiduLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            var url = this.serviceUrl + "u=x=" + i + ";y=" + (-j) + ";z=" + rule.z + ";v=018;type=web&fm=44&udt=20131028"
            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y - j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax, this.cors);
            this._imageList.push(image);
        }
    }
}