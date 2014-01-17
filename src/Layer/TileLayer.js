/**
 * 切片服务基类
 */
max.Layer.TileLayer = function (serviceUrl) {
    this.serviceUrl = serviceUrl;
    this.parentMap = null;
    this._imageList = [];
    this.scaleRate = 1;
    this.cors=false;//是否支持跨域
    this._dlm=new max._imgDownloadManager();
}
max.Layer.TileLayer.prototype=new max.Layer();
max.Layer.TileLayer.prototype.init=function(){

}
max.Layer.TileLayer.prototype._calImage=function(map){
    var extent = this.parentMap.extent;
    var lmin = Math.floor((extent.xmin - this.originPoint.x) / this.picWidth / this.resolution);
    var lmax = Math.ceil((extent.xmax - this.originPoint.x) / this.picWidth / this.resolution) - 1;
    var dmax = Math.floor(( this.originPoint.y-extent.ymin) / this.picHeight / this.resolution);
    var dmin = Math.ceil(( this.originPoint.y-extent.ymax) / this.picHeight / this.resolution) - 1;
    lmin = lmin < this._imageRectangle.lmin ? this._imageRectangle.lmin : lmin;
    lmax = lmax > this._imageRectangle.lmax ? this._imageRectangle.lmax : lmax;
    dmin = dmin < this._imageRectangle.dmin ? this._imageRectangle.dmin : dmin;
    dmax = dmax > this._imageRectangle.dmax ? this._imageRectangle.dmax : dmax;
    return {
        lmin:lmin,
        lmax:lmax,
        dmin:dmin,
        dmax:dmax,
        z:this.z,
        resolution:this.resolution
    }
}
max.Layer.TileLayer.prototype.updateScale=function(map){
    var map = this.parentMap;
    var extent = this.fullExtent;
    var z = 0;
    var resolution = 0;
    for (var i in this.resolutions) {
        if (map.resolution >= this.resolutions[i]) {
            z = i - 0 + 1;
            resolution = this.resolutions[i];
            break;
        }
    }
    this.resolution = resolution;
    this.z = z;
    var lmin = Math.floor((Math.max(extent.xmin,this.fullExtent.xmin) - this.originPoint.x) / this.picWidth / this.resolution);
    var lmax = Math.ceil((Math.min(extent.xmax,this.fullExtent.xmax) - this.originPoint.x) / this.picWidth / this.resolution) - 1;
    var dmax = Math.ceil(( this.originPoint.y-Math.max(extent.ymin,this.fullExtent.ymin)) / this.picHeight / this.resolution)-1;
    var dmin = Math.floor(( this.originPoint.y-Math.min(extent.ymax,this.fullExtent.ymax)) / this.picHeight / this.resolution) ;
    this._imageRectangle = {
        lmin:lmin,
        lmax:lmax,
        dmin:dmin,
        dmax:dmax
    }
    this.scaleRate = map.resolution / this.resolution;
}
max.Layer.TileLayer.prototype.load=function(){
    this.updateScale();
    if(this.parentMap){
        var o = this._calImage(this.parentMap);
    }else{
        return false;
    }
    var list=this._updateImageList(o);
    this._dlm.refrshImg(list);
}
max.Layer.TileLayer.prototype.draw=function(){
    if(this.parentMap){
        for (var i in this._imageList) {
            var _image = this._imageList[i];
            var context = this.parentMap._context;
            if (_image.isonload === true) {
                context.drawImage(_image.image, 0, 0, this.picWidth, this.picHeight, _image.x, _image.y, this.picWidth / this.scaleRate, this.picHeight / this.scaleRate);
            }
        }
    }

}
max.Layer.TileLayer.prototype.ondrag=function(){
    //todo 屏幕闪烁 待解决
    if(this.parentMap){
        for (var i = this._imageList.length - 1; i != -1; --i) {
            var image = this._imageList[i];
            image.update();
            if (image.pz !== this.z) {
                this._imageList.splice(i, 1);
                delete image;
                image = null;
                break;
            }
            if (image.x < 0 - image.layer.picWidth * (image.layer.scaleRate)) {
                this._imageList.splice(i, 1);
                delete image;
                image = null;
                break;
            }
            if (image.y < 0 - image.layer.picHeight * (image.layer.scaleRate)) {
                this._imageList.splice(i, 1);
                delete image;
                image = null;
                break;
            }
            if (image.x > image.layer.parentMap._canvas.width * (image.layer.scaleRate)) {
                this._imageList.splice(i, 1);
                delete image;
                image = null;
                break;
            }
            if (image.y > image.layer.parentMap._canvas.height * (image.layer.scaleRate)) {
                this._imageList.splice(i, 1);
                delete image;
                image = null;
                break;
            }

        }
        var o = this._calImage(this.parentMap);
        var list=this._updateImageList(o);
        this._dlm.refrshImg(list);
    }

}


max.Layer._TitleImage = function (url, layer, x, y, z, xmin, ymax,cors) {
    this.image = new Image();
    if(cors===true){
        this.image.crossOrigin="Anonymous";
    }
    var that = this;
//    this.image.onload = function (event) {
//        that.imageOnLoad(that);
//    };
    this.src=url;
    //this.image.src = url;
    this.layer = layer;
    this.px = x;
    this.py = y;
    this.pz = z;
    //左上角 最小经度
    this.xmin = xmin;
    //切片左上角 最小维度
    this.ymax = ymax;
    this.isonload = false;

}
max.Layer._TitleImage.prototype = {
    imageOnLoad:function () {
        this.isonload = true;
        this.update.call(this);
    },
    update:function () {
        if(this.layer.parentMap){
            var map = this.layer.parentMap;
            var point = map.originPoint;
            var x = (this.xmin - point.x) / map.resolution;
            var y = ( point.y-this.ymax) / map.resolution;
            this.x = x;
            this.y = y;
        }
    }
}