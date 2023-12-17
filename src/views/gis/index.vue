<template>
  <div style="padding:2px">
    <div id="mapView" style="height: 850px;"></div>
  </div>

</template>

<script>

import * as esriLoader from 'esri-loader'
import { loadModules } from 'esri-loader'
import request from '@/utils/request'
import global from '@/Globl'

export default {
  name: 'Gis01',
  components: {},
  data() {
    return {
      mapView: null,
      points: [], // 保存添加的点坐标
      pointPoss: [], // 保存添加的点坐标
      lines: [],  // 保存添加的线图形
      gisDatas :[],
      eachSize:600,
      currInterval: null,
      basemap: 'topo' // 初始底图
    }
  },
  mounted() {
    this.initMap()
    this.queryList()
    // this.gisDatas = [[{"lng":"-123.1207","lat":"49.2827"},{"lng":"47.2594","lat":"8.3763"}]]
    // [123.1207, 49.2827]
    // this.loopChart()
    // setInterval(this.doPointLine, 2000);
  },
  methods: {
    queryList() {
      request({
        url: '/getGis',
        method: 'get'
      }).then(response => {
        // console.log(response)
        this.gisDatas = response.res.gis
        // console.log(JSON.stringify(this.gisDatas))
        // let locations = this.gisDatas.shift();
        // this.drawLocation(locations)
        this.loopChart()
        this.websocket()
      }).catch(error => {

      })
    },
    loopChart() {
      if(this.currInterval){
        clearInterval(this.currInterval)
      }
      this.currInterval = setInterval(() => {
        if(this.gisDatas.length>0){
          let locations = this.gisDatas.shift();
          this.drawLocation(locations)
        }

      }, 2000); // 2000毫秒 = 2秒

    },
    drawLocation(locations){
      loadModules([ 'esri/Graphic', 'esri/geometry/Point',"esri/geometry/Polyline","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol"])
        .then(([ Graphic, Point,Polyline,SimpleMarkerSymbol,SimpleLineSymbol]) => {

            if (this.lines.length > 0) {
              const redMarkerSymbol = new SimpleMarkerSymbol({
                color: [0, 0, 255], // 蓝色
                // size: 8,
              });

              const redLineSymbol = new SimpleLineSymbol({
                color: [0, 0, 255], // 蓝色
                // width: 0.05,
              });

              // 遍历已有点的图形并设置样式为黄色
              this.mapView.graphics.forEach((graphic) => {
                if (graphic.geometry.type === "point") {
                  graphic.symbol = redMarkerSymbol;
                } else if (graphic.geometry.type === "polyline") {
                  graphic.symbol = redLineSymbol;
                }
              });
            }

          let fromLocation = locations[0]
          let toLocation = locations[1]
          const fromPoint = new Point({
            longitude: fromLocation.lng, // 经度
            latitude: fromLocation.lat // 纬度
          });
          const toPoint = new Point({
            longitude: toLocation.lng, // 经度
            latitude: toLocation.lat // 纬度
          });
          // 创建点的符号
          const markerSymbol = {
            type: "simple-marker",
            style: "circle",
            color: [255, 0, 0],
            size: 10,
            outline: {
              color: [255, 0, 0],
              width: 1,
            },
          };
          // 创建图形并将点1添加到图形中
          const fromPointGraphic = new Graphic({
            geometry: fromPoint,
            symbol: markerSymbol,
          });
          const toPointGraphic = new Graphic({
            geometry: toPoint,
            symbol: markerSymbol,
          });

          this.points.push(fromPointGraphic)
          this.points.push(toPointGraphic)


          this.mapView.graphics.add(fromPointGraphic);
          this.mapView.graphics.add(toPointGraphic);

          // 创建折线
          const line = new Polyline({
            paths: [
              [fromLocation.lng, fromLocation.lat],
              [toLocation.lng, toLocation.lat]
            ]
          })

          // 创建线的符号
          const lineSymbol = {
              type: "simple-line",
              color: [255, 0, 0],
              width: 0.05,
            };

            // 创建图形并将折线添加到图形中
            const lineGraphic = new Graphic({
              geometry: line,
              symbol: lineSymbol,
            });

            // 在地图上添加图形
            this.mapView.graphics.add(lineGraphic);
            this.lines.push(lineGraphic)
            // 删除最先的一个点和对应的线
            if (this.lines.length > 10) {
              this.mapView.graphics.remove(this.points.shift());
              this.mapView.graphics.remove(this.points.shift());
              this.mapView.graphics.remove(this.lines.shift());
            }
          // 使用动画效果将地图焦点定位到新点
          // console.log(toLocation.lng,toLocation.lat)
          this.mapView.goTo({
            target: toPoint,
            // center: [fromLocation.lng,fromLocation.lat],
            // zoom: 9,
            animate: {
              duration: 1000,
              easing: "in-out-expo",
            },
          });
        })
    },
    initMap() {
      loadModules(['esri/Map', 'esri/views/SceneView', 'esri/widgets/Compass',
        'esri/widgets/Fullscreen', 'esri/widgets/Home','esri/widgets/BasemapGallery','esri/widgets/Expand','esri/Graphic', 'esri/geometry/Point'])
        .then(([Map, MapView, Compass, Fullscreen, Home,BasemapGallery,Expand,Graphic, Point]) => {
          let map = new Map({
            basemap: 'streets' //satellite,hybrid,streets-relief-vector,streets
          })

          this.mapView = new MapView({
            container: 'mapView',
            map: map,
            center: [47.3667,8.5500], // 温哥华的经纬度47.3667 8.5500
            zoom: 7  // 初始缩放级别
          })

          // 添加指南针（Compass）
          // let compass = new Compass({
          //   view: this.mapView
          // })
          // this.mapView.ui.add(compass, 'top-left')

          // 添加全屏按钮（Fullscreen）
          let fullscreen = new Fullscreen({
            view: this.mapView
          })
          this.mapView.ui.add(fullscreen, 'top-left')

          // 添加Home按钮
          let homeButton = new Home({
            view: this.mapView
          })
          this.mapView.ui.add(homeButton, 'top-left')

          const basemapGallery = new BasemapGallery({
            view: this.mapView,
            autoOpen: false // 设置默认不展开
          });

          // 创建Expand小部件
          const expand = new Expand({
            view: this.mapView,
            content: basemapGallery,
            expanded: false // 设置默认不展开
          });

          // 添加Expand小部件到地图视图的UI
          this.mapView.ui.add(expand, 'top-left');

          // const fromPoint = new Point({
          //   longitude: 47.3667, // 经度
          //   latitude: 8.5500 // 纬度
          // });
          //
          // // 创建点的符号
          // const markerSymbol = {
          //   type: "simple-marker",
          //   style: "circle",
          //   color: [255, 0, 0],
          //   size: 10,
          //   outline: {
          //     color: [255, 0, 0],
          //     width: 1,
          //   },
          // };
          // // 创建图形并将点1添加到图形中
          // const fromPointGraphic = new Graphic({
          //   geometry: fromPoint,
          //   symbol: markerSymbol,
          // });
          //
          // this.mapView.graphics.add(fromPointGraphic);

        })
    },
    websocket() {
      let ws = new WebSocket(global.WS_APP_BASE_API)
      ws.onopen = () => {
      }
      ws.onmessage = evt => {
        // console.log('数据已接收...')
        let resJson = JSON.parse(evt.data)
        for (let key1 in resJson) {
          if ("gis" == key1) {
            this.gisDatas = resJson[key1]
            console.log(JSON.stringify(this.gisDatas))
            this.loopChart()
          }
        }
      }
      ws.onclose = function() {
        // 关闭 websocket
        console.log('连接已关闭...')
      }
      // 路由跳转时结束websocket链接
      this.$router.afterEach(function() {
        ws.close()
      })
    },
    doPointLine() {
      loadModules([ 'esri/Graphic', 'esri/geometry/Point',"esri/geometry/Polyline"])
        .then(([ Graphic, Point,Polyline]) => {

          // 生成新点的坐标，位于温哥华附近
          const pointPos = {
            longitude: -123.1216 + (Math.random() - 0.5) * 0.1, // 随机经度
            latitude: 49.2827 + (Math.random() - 0.5) * 0.1,   // 随机纬度
          };

          this.pointPoss.push(pointPos)

          // 创建坐标点
          const point = new Point({
            longitude: pointPos.longitude, // 经度
            latitude: pointPos.latitude, // 纬度
          });
          // 创建点的符号
          const markerSymbol = {
            type: "simple-marker",
            style: "circle",
            color: [255, 0, 0],
            size: 10,
            outline: {
              color: [0, 0, 0],
              width: 1,
            },
          };
          // 创建图形并将点1添加到图形中
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
          });

          this.mapView.graphics.add(pointGraphic);

          // 添加新点到数组
          this.points.push(pointGraphic);
          // console.log(this.points.length)

          let len = this.pointPoss.length
          // 创建折线
          if (len >= 2) {
            const line = new Polyline({
              // paths: this.pointPoss.map(point => [point.longitude, point.latitude]),
              paths: [
                [this.pointPoss[len-2].longitude, this.pointPoss[len-2].latitude],
                [this.pointPoss[len-1].longitude, this.pointPoss[len-1].latitude],
              ],
            });

            // 创建线的符号
            const lineSymbol = {
              type: "simple-line",
              color: [0, 0, 255],
              width: 2,
            };

            // 创建图形并将折线添加到图形中
            const lineGraphic = new Graphic({
              geometry: line,
              symbol: lineSymbol,
            });

            // 在地图上添加图形
            this.mapView.graphics.add(lineGraphic);
            this.lines.push(lineGraphic);

            // 删除最先的一个点和对应的线
            if (this.pointPoss.length > 5) {
              this.pointPoss.shift()
              this.mapView.graphics.remove(this.points.shift());
              this.mapView.graphics.remove(this.lines.shift());
            }
          }


          // 使用动画效果将地图焦点定位到新点
          this.mapView.goTo({
            target: point,
            zoom: 12,
            animate: {
              duration: 1000,
              easing: "in-out-expo",
            },
          });
        })
    },
    doLine() {
      loadModules([ 'esri/Graphic', 'esri/geometry/Point',"esri/geometry/Polyline","esri/geometry/geometryEngine"])
        .then(([ Graphic, Point,Polyline,geometryEngine]) => {

          // 创建坐标点1
          const point1 = new Point({
            longitude: -118, // 经度
            latitude: 34, // 纬度
          });

          // 创建坐标点2
          const point2 = new Point({
            longitude: -119, // 经度
            latitude: 35, // 纬度
          });

          // 创建点的符号
          const markerSymbol = {
            type: "simple-marker",
            style: "circle",
            color: [255, 0, 0],
            size: 10,
            outline: {
              color: [0, 0, 0],
              width: 1,
            },
          };

          // 创建图形并将点1添加到图形中
          const graphic1 = new Graphic({
            geometry: point1,
            symbol: markerSymbol,
          });

          // 创建图形并将点2添加到图形中
          const graphic2 = new Graphic({
            geometry: point2,
            symbol: markerSymbol,
          });

          // 创建折线
          const line = new Polyline({
            paths: [
              [point1.longitude, point1.latitude],
              [point2.longitude, point2.latitude],
            ],
          });

          // 创建线的符号
          const lineSymbol = {
            type: "simple-line",
            color: [0, 0, 255],
            width: 2,
          };

          // 创建图形并将折线添加到图形中
          const lineGraphic = new Graphic({
            geometry: line,
            symbol: lineSymbol,
          });

          // 在地图上添加图形
          this.mapView.graphics.addMany([graphic1, graphic2, lineGraphic]);

          // 计算线的长度
          const length = geometryEngine.geodesicLength(line, "meters");
          console.log(length)

          // 计算缩放级别
          const zoomLevel = Math.max(2, Math.round(Math.log2(591657550.5 / length)));

          // 计算中心点
          const centerPoint = [(point1.longitude + point2.longitude) / 2, (point1.latitude + point2.latitude) / 2];
          console.log(centerPoint)

          // 使用动画效果将地图焦点定位到线的当前位置
          this.mapView.goTo({
            center: centerPoint ,// 新的中心点坐标
            zoom: zoomLevel -3 ,
            animate: true,
          });
        })
    },
    doPoint() {
      loadModules([ 'esri/Graphic', 'esri/geometry/Point'])
        .then(([ Graphic, Point]) => {

          // 创建坐标点
          const point = new Point({
            longitude: -118, // 经度
            latitude: 34, // 纬度
          });

          // 创建点的符号
          const markerSymbol = {
            type: "simple-marker",
            style: "circle", // 您可以选择不同的样式
            color: [255, 0, 0], // RGB颜色，这里是红色
            size: 10, // 大小
            outline: {
              color: [0, 0, 0], // 轮廓颜色
              width: 1, // 轮廓宽度
            },
          };

          // 创建图形并将点添加到图形中
          const graphic = new Graphic({
            geometry: point,
            symbol: markerSymbol, // 使用自定义点符号
          });

          // 在地图上添加图形
          this.mapView.graphics.add(graphic);

          // 使用动画效果将地图焦点定位到新点
          this.mapView.goTo({
            target: point,
            zoom: 13, // 可以调整缩放级别
            animate: {
              duration: 5000, // 动画持续时间（毫秒）
              easing: "in-out-cubic", // 缓动函数 "linear": 线性动画，匀速移动。"in-quad": 二次缓入，初始慢，后来加速。
              // "out-quad": 二次缓出，初始快，后来减速。"in-out-quad": 二次缓入缓出，初始和结束时慢，中间快。
              // "in-cubic": 三次缓入，初始慢，后来加速。"out-cubic": 三次缓出，初始快，后来减速。"in-out-cubic": 三次缓入缓出，初始和结束时慢，中间快。
            },
          });
        })
    },
  },
  beforeDestroy() {
    clearInterval(this.currInterval)
  },
}
</script>

<style scoped>
#mapView {
  position: relative;
  height: 850px;
}

.esri-compass {
  top: 10px; /* 调整按钮的垂直位置 */
  right: 10px; /* 调整按钮的水平位置 */
}

.esri-zoom {
  top: 10px; /* 调整按钮的垂直位置 */
  right: 70px; /* 调整按钮的水平位置 */
}

.esri-fullscreen {
  top: 10px; /* 调整按钮的垂直位置 */
  right: 130px; /* 调整按钮的水平位置 */
}
</style>
