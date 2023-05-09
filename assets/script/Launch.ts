import {Pane} from 'tweakpane';
import {DrawMesh} from "./Def";
import PhysicsBound from "./PhysicsBound";
import PolygonUtil from "./PolygonUtil";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass
export default class Launch extends cc.Component {

    @property
    protected showTweakPane: boolean = true

    protected polygonUtil: PolygonUtil
    protected physicsBound: PhysicsBound

    protected onLoad() {
        this.polygonUtil = this.node.getComponentInChildren(PolygonUtil)
        this.physicsBound = this.node.getComponentInChildren(PhysicsBound)
        this.createTweakPane()
    }

    protected update(dt: number) {
        const temp = new Array<cc.Node>()
        for (const body of this.node.getComponentsInChildren(cc.RigidBody)) {
            if (body.type == cc.RigidBodyType.Dynamic)
                temp.push(body.node)
        }
        if (temp.length != 0)
            this.physicsBound.createPolygonRigidBody(this.polygonUtil.boundPolygons, temp)
    }

    protected createTweakPane() {
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
            this.polygonUtil.drawTag = DrawMesh[evt.value]
        })
        /**physicsDraw------------------------------------------------------------------------*/
        params = {
            physicsDraw: false
        }
        input = pane.addInput(params, 'physicsDraw')
        input.on('change', (evt) => {
            cc.director.getPhysicsManager().debugDrawFlags = evt.value ? 7 : 0
        })

        const body = document.getElementsByClassName('tp-dfwv')[0]
        //@ts-ignore
        body.style.top = '60px'
    }
}