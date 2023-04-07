const { ccclass, property } = cc._decorator;

@ccclass
export default class PhysicsBound extends cc.Component {

    protected world: b2.World
    protected chainShapePool: cc.PhysicsChainCollider[] = []
    protected rigidBody: cc.RigidBody

    createPolygonRigidbody(polygons: gpc.Vertex[][]) {
        //TODO:使用box2d物理，考虑四叉树
        const existShape = this.getComponents(cc.PhysicsChainCollider)
        let i = 0
        for (; i < polygons.length; i++) {
            const polygon = polygons[i]
            let shape = existShape[i]
            if (!shape)
                shape = this.addComponent(cc.PhysicsChainCollider)
            shape.enabled = true
            shape.loop = true
            shape.points.length = 0
            for (let i = 0; i < polygon.length; i++) {
                const p = polygon[i]
                if (!shape.points[i])
                    shape.points[i] = cc.v2()
                cc.Vec2.set(shape.points[i], p.x, p.y)
            }
            //@ts-ignore
            //傻逼cocos声明文件都写错了
            shape.apply()
        }
        for (let j = i; j < existShape.length; j++) {
            if (existShape[j])
                existShape[j].enabled = false
        }
    }

    protected onLoad(): void {
        const phyMgr = cc.director.getPhysicsManager()
        phyMgr.enabled = true
        // phyMgr.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        //@ts-ignore
        this.world = phyMgr._world
        this.rigidBody = this.getComponent(cc.RigidBody)
    }
}
