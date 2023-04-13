import {GPCTrianglePolygon} from './IGPCType'

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

    drawPolygons(polygons: gpc.Vertex[][]) {
        this.graphics.clear(true)
        polygons.forEach(polygon => {
            polygon.forEach((p, index) => {
                if (index == 0) this.graphics.moveTo(p.x, p.y)
                else {
                    this.graphics.lineTo(p.x, p.y)
                    if (index == polygon.length - 1)
                        this.graphics.close()
                }
            })
        })
        this.graphics.stroke()
    }

    drawTriangles(polygons: GPCTrianglePolygon[]) {
        this.graphics.clear(true)
        polygons.forEach(polygon => {
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
        })
        this.graphics.stroke()
    }
}
