const {ccclass, property} = cc._decorator

@ccclass
export default class TestDraw extends cc.Component {

    private graphics: cc.Graphics

    protected onLoad() {
        this.graphics = this.node.getComponent(cc.Graphics)
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
}
