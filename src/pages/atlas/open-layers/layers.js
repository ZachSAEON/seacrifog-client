import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer.js'
import { Tile as TileLayer } from 'ol/layer.js'
import TileWMS from 'ol/source/TileWMS'

export const ahocevarBaseMap = new TileLayer({
  source: new TileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    params: {
      LAYERS: 'ne:NE1_HR_LC_SR_W_DR',
      TILED: true
    }
  })
})

export const clusterLayer = source =>
  new VectorLayer({
    source,
    style: function(feature) {
      var size = feature.get('features').length
      return new Style({
        image: new CircleStyle({
          radius:
            size > 300
              ? 50
              : size > 250
              ? 45
              : size > 200
              ? 40
              : size > 100
              ? 30
              : size > 50
              ? 25
              : size > 20
              ? 20
              : 15,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: 'rgba(51, 153, 204, 0.5)'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      })
    }
  })
