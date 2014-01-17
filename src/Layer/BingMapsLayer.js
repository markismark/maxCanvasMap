/**
 *支持微软Bing Maps
 */
max.Layer.BingMapsLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this._imageList = [];
    this.cors=false;
    this.fullExtent = new max.Extent({
        xmin:-20037508.3427892,
        ymin:-20037508.3427892,
        xmax:20037508.3427892,
        ymax:20037508.3427892
    });
    this.originPoint = {
        x:-20037508.3427892,
        y:20037508.3427892
    }
    this.picWidth = 256;
    this.picHeight = 256;
    this.wkid = 102100;
    this.resolutions = [78271.51696402031, 39135.75848201016, 19567.87924100508, 9783.939620502539, 4891.96981025127, 2445.984905125635, 1222.992452562817, 611.4962262814087, 305.7481131407043, 152.8740565703522, 76.43702828517608, 38.21851414258804, 19.10925707129402, 9.554628535647009];
    this.init();
}

max.Layer.BingMapsLayer.prototype = new max.Layer.TileLayer();

max.Layer.BingMapsLayer.prototype._updateImageList = function (rule) {
    this._imageList = [];
    var z=rule.z;
    for (var i = rule.lmin; i <= rule.lmax; ++i) {
        for (var j = rule.dmin; j <= rule.dmax; ++j) {
            //var url = this.serviceUrl + "x=" + i + "&y=" + j + "&z=" + rule.z;
            //10进制转化为2进制，前面补充0
            _f=function(n,m){
                var t= n.toString(2)+"";
                for(; t.length<m;){
                    t="0"+t;
                }
                return t;
            }
            var _if=_f(i,z);
            var _jf=_f(j,z);
            var r="";
            for(var k=0;k!=z;++k){
                r+=_jf[k]+_if[k];
            }
            r=parseInt(r,2).toString(4);
			r=_f(r,z);
            var url=this.serviceUrl+"r"+r+"?g=103&mkt=zh-cn&n=z";

            var xmin = i * this.picWidth * rule.resolution + this.originPoint.x;
            var ymax = this.originPoint.y-j * this.picHeight * rule.resolution;
            for (var k in this._imageList) {
                var _image = this._imageList[k];
                if (_image.url === url) {
                    break;
                }
            }
            var image = new max.Layer._TitleImage(url, this, i, j, rule.z, xmin, ymax);
            this._imageList.push(image);
        }
    }
    return this._imageList;
}