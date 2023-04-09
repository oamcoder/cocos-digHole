import ccclass = cc._decorator.ccclass
import property = cc._decorator.property

@ccclass
export default class PhysicsObject extends cc.Component {

    protected body: cc.RigidBody

    protected onLoad() {
        this.body = this.getComponent(cc.RigidBody)
    }

    get linearSpeed() {
        return this.body.linearVelocity.mag()
    }


    get radius() {
        return 1.3 * Math.max(this.node.height, this.node.width)
    }

    get x() {
        return this.node.x - this.node.width / 2
    }

    get y() {
        return this.node.y - this.node.height / 2
    }

    get width() {
        return this.node.width
    }

    get height() {
        return this.node.height
    }
}