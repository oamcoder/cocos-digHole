import {Pane} from 'tweakpane';
import {DrawMesh} from "./IGPCType";
import GPCPolygon from "./GPCPolygon";
import PhysicsBound from "./PhysicsBound";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass
export default class Launch extends cc.Component {

    @property
    protected showTweakPane: boolean = true

    @property
    protected physicsFrameInterval: number = 2

    protected gpcPolygon: GPCPolygon
    protected physicsBound: PhysicsBound
    protected curTimeDelta: number = 0

    protected onLoad() {
        this.gpcPolygon = this.node.getComponentInChildren(GPCPolygon)
        this.physicsBound = this.node.getComponentInChildren(PhysicsBound)
        this.createTweakPane()
    }

    protected update(dt: number) {
        if (this.curTimeDelta >= this.physicsFrameInterval / 60) {
            this.curTimeDelta = 0
            const temp = new Array<cc.Node>()
            for (const body of this.node.getComponentsInChildren(cc.RigidBody)) {
                if (body.type == cc.RigidBodyType.Dynamic)
                    temp.push(body.node)
            }
            if (temp.length == 0)
                this.physicsBound.cleanFixtures()
            else
                this.physicsBound.createPolygonRigidBody(this.gpcPolygon.boundPolygons, temp)
        }
        this.curTimeDelta += dt
    }

    createTweakPane() {
        if (!this.showTweakPane)
            return
        const pane = new Pane()
        /**mesh-------------------------------------------------------------------------------*/
        let params: any = {
            mesh: ''
        }
        let input = pane.addInput(params, 'mesh', {
            options: {
                none: DrawMesh.None,
                bounds: DrawMesh.Bounds,
                triangles: DrawMesh.Triangles,
            },
        });
        input.on('change', (evt) => {
            this.gpcPolygon.drawTag = DrawMesh[evt.value]
        })
        /**physicsDraw------------------------------------------------------------------------*/
        params = {
            physicsDraw: false
        }
        input = pane.addInput(params, 'physicsDraw')
        input.on('change', (evt) => {
            cc.director.getPhysicsManager().debugDrawFlags = evt.value ? 7 : 0
        })

        const bodys = document.getElementsByClassName('tp-dfwv')[0]
        //@ts-ignore
        bodys.style.top = '60px'
    }
}