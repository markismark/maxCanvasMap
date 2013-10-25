max.Filter = {
    /*
     * 反色
     */
    colorInvertProcess:function (idata) {

        var binaryData = idata.data;
        var l = binaryData.length;
        for (var i = 0; i < l; i += 4) {
            var r = binaryData[i];
            var g = binaryData[i + 1];
            var b = binaryData[i + 2];

            binaryData[i] = 255 - r;
            binaryData[i + 1] = 255 - g;
            binaryData[i + 2] = 255 - b;
        }
        return idata;
    },
    /**
     *    灰色
     * @param idata
     */
    grayProcess:function (idata) {
        var binaryData = idata.data;
        var l = binaryData.length;
        for (var i = 0; i < l; i += 4) {
            var r = binaryData[i];
            var g = binaryData[i + 1];
            var b = binaryData[i + 2];

            binaryData[i] = (r * 0.272) + (g * 0.534) + (b * 0.131);
            binaryData[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            binaryData[i + 2] = (r * 0.393) + (g * 0.769) + (b * 0.189);
        }
        return idata;
    },
    /**
     * deep clone image data of canvas
     *
     * @param context
     * @param src
     * @returns idata
     */
    copyImageData:function (context, src) {
        var dst = context.createImageData(src.width, src.height);
        dst.data.set(src.data);
        return dst;
    },
    /**
     * convolution - keneral size 5*5 - blur effect filter(模糊效果)
     */
    blurProcess:function (idata) {
        // console.log("Canvas Filter - blur process");
        // var tempCanvasData = this.copyImageData(context, canvasData);
        var data = idata.data;
        //var data2=[];
        var sumred = 0.0, sumgreen = 0.0, sumblue = 0.0;
        for (var x = 0; x < idata.width; x++) {
            for (var y = 0; y < idata.height; y++) {

                // Index of the pixel in the array
                var idx = (x + y * idata.width) * 4;
                for (var subCol = -2; subCol <= 2; subCol++) {
                    var colOff = subCol + x;
                    if (colOff < 0 || colOff >= idata.width) {
                        colOff = 0;
                    }
                    for (var subRow = -2; subRow <= 2; subRow++) {
                        var rowOff = subRow + y;
                        if (rowOff < 0 || rowOff >= idata.height) {
                            rowOff = 0;
                        }
                        var idx2 = (colOff + rowOff * idata.width) * 4;
                        var r = data[idx2 + 0];
                        var g = data[idx2 + 1];
                        var b = data[idx2 + 2];
                        sumred += r;
                        sumgreen += g;
                        sumblue += b;
                    }
                }

                // calculate new RGB value
                var nr = (sumred / 25.0);
                var ng = (sumgreen / 25.0);
                var nb = (sumblue / 25.0);

                // clear previous for next pixel point
                sumred = 0.0;
                sumgreen = 0.0;
                sumblue = 0.0;

                // assign new pixel value
                data[idx + 0] = nr;
                // Red channel
                data[idx + 1] = ng;
                // Green channel
                data[idx + 2] = nb;
                // Blue channel
                data[idx + 3] = 255;
                // Alpha channel
            }
        }
        return idata;
    },
    /**
     * after pixel value - before pixel value + 128
     * 浮雕效果
     */
    reliefProcess:function (idata) {

        for (var x = 1; x < idata.width - 1; x++) {
            for (var y = 1; y < idata.height - 1; y++) {

                // Index of the pixel in the array
                var idx = (x + y * idata.width) * 4;
                var bidx = ((x - 1) + y * idata.width) * 4;
                var aidx = ((x + 1) + y * idata.width) * 4;

                // calculate new RGB value
                var nr = idata.data[aidx + 0] - idata.data[bidx + 0] + 128;
                var ng = idata.data[aidx + 1] - idata.data[bidx + 1] + 128;
                var nb = idata.data[aidx + 2] - idata.data[bidx + 2] + 128;
                nr = (nr < 0) ? 0 : ((nr > 255) ? 255 : nr);
                ng = (ng < 0) ? 0 : ((ng > 255) ? 255 : ng);
                nb = (nb < 0) ? 0 : ((nb > 255) ? 255 : nb);

                // assign new pixel value
                idata.data[idx + 0] = nr;
                // Red channel
                idata.data[idx + 1] = ng;
                // Green channel
                idata.data[idx + 2] = nb;
                // Blue channel
                idata.data[idx + 3] = 255;
                // Alpha channel
            }
        }
        return idata;
    },
    /**
     *  before pixel value - after pixel value + 128
     *  雕刻效果
     *
     * @param canvasData
     */
    diaokeProcess:function (idata) {
        for (var x = 1; x < idata.width - 1; x++) {
            for (var y = 1; y < idata.height - 1; y++) {

                // Index of the pixel in the array
                var idx = (x + y * idata.width) * 4;
                var bidx = ((x - 1) + y * idata.width) * 4;
                var aidx = ((x + 1) + y * idata.width) * 4;

                // calculate new RGB value
                var nr = idata.data[bidx + 0] - idata.data[aidx + 0] + 128;
                var ng = idata.data[bidx + 1] - idata.data[aidx + 1] + 128;
                var nb = idata.data[bidx + 2] - idata.data[aidx + 2] + 128;
                nr = (nr < 0) ? 0 : ((nr > 255) ? 255 : nr);
                ng = (ng < 0) ? 0 : ((ng > 255) ? 255 : ng);
                nb = (nb < 0) ? 0 : ((nb > 255) ? 255 : nb);

                // assign new pixel value
                idata.data[idx + 0] = nr;
                // Red channel
                idata.data[idx + 1] = ng;
                // Green channel
                idata.data[idx + 2] = nb;
                // Blue channel
                idata.data[idx + 3] = 255;
                // Alpha channel
            }
        }
        return idata;
    },
    /**
     * mirror reflect
     *
     * @param context
     * @param canvasData
     */
    mirrorProcess:function (idata) {
        var data = [];
        for (var i in idata.data) {
            data[i] = idata.data[i];
        }
        for (var x = 0; x < idata.width; x++)// column
        {
            for (var y = 0; y < idata.height; y++)// row
            {

                // Index of the pixel in the array
                var idx = (x + y * idata.width) * 4;
                var midx = (((idata.width - 1) - x) + y * idata.width) * 4;

                // assign new pixel value
                idata.data[midx + 0] = data[idx + 0];
                // Red channel
                idata.data[midx + 1] = data[idx + 1];
                // Green channel
                idata.data[midx + 2] = data[idx + 2];
                // Blue channel
                idata.data[midx + 3] = 255;
                // Alpha channel
            }
        }
        return idata;
    }
}