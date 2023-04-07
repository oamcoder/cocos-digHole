import { GPCTrianglePolygon } from './IGPCType'

const { ccclass, property, requireComponent } = cc._decorator

interface SpriteVerticesType {
    x: number[];
    y: number[];
    nu: number[];
    nv: number[];
    triangles: number[];
}

@ccclass
@requireComponent(cc.Sprite)
export default class MeshSprite extends cc.Component {

    protected sprite: cc.Sprite
    protected vertices: SpriteVerticesType = {
        x: [],
        y: [],
        nu: [],
        nv: [],
        triangles: []
    }

    protected onLoad() {
        this.sprite = this.getComponent(cc.Sprite)
        this.sprite.node.scaleY = -1
        this.sprite.node.setAnchorPoint(0, 1)
        this.sprite.spriteFrame['vertices'] = this.vertices
    }

    stroke(data: GPCTrianglePolygon[]) {
        // console.log('查看data: ', data)
        for (const key in this.vertices) {
            this.vertices[key].length = 0
        }
        let triangleOffset = 0
        const w = this.node.width
        const h = this.node.height
        const w2 = w / 2
        const h2 = h / 2
        for (const item of data) {
            let num = 0;
            for (let i = 0; i < item.vertices.length - 1; i += 2) {
                const x = item.vertices[i]
                const y = item.vertices[i + 1]
                this.vertices.x.push(x)
                this.vertices.y.push(y)
                this.vertices.nu.push((x + w2) / w)
                this.vertices.nv.push(1 - (y + h2) / h)
                num++;
            }
            for (const index of item.triangles) {
                this.vertices.triangles.push(triangleOffset + index)
            }
            triangleOffset += num;
        }
        // console.log('查看数据', this.vertices)
        this.sprite['setVertsDirty']()
    }
}
