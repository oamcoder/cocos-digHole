import * as polygonClipping from "polygon-clipping";
import {TrianglePolygon} from './IGPCType'

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestDraw extends cc.Component {

    private graphics: cc.Graphics

    protected onLoad() {
        this.graphics = this.node.getComponent(cc.Graphics)
    }

    clean() {
        this.graphics.clear(true)
    }

    drawPolygons(polygons: polygonClipping.Ring[]) {
        this.graphics.clear(true)
        for (let i = 0; i < polygons.length; i++) {
            const polygon = polygons[i]
            for (let j = 0; j < polygon.length; j++) {
                const point = polygon[j]
                if (j == 0) this.graphics.moveTo(point[0], point[1])
                else {
                    this.graphics.lineTo(point[0], point[1])
                    if (j == polygon.length - 1)
                        this.graphics.close()
                }
            }
        }
        this.graphics.stroke()
    }

    drawTriangles(polygons: TrianglePolygon[]) {
        this.graphics.clear(true)
        for (let polygon of polygons) {
            let i = 0
            polygon.triangles.forEach(index => {
                const x = polygon.vertices[index * 2]
                const y = polygon.vertices[index * 2 + 1]
                if (i == 0) this.graphics.moveTo(x, y)
                else this.graphics.lineTo(x, y)
                i++
                if (i >= 3) {
                    i = 0
                    this.graphics.close()
                }
            })
        }
        this.graphics.stroke()
    }
}
