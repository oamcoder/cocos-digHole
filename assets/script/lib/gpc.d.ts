declare namespace gpc {
    type Vertex = {
        x: number;
        y: number;
    };
    type ExternalVertex = Vertex | [number, number];
    function vert_eql(a: Vertex, b: Vertex): boolean;
    class VertexNode {
        x: number;
        y: number;
        next: VertexNode | null;
        constructor(x: number, y: number, next?: VertexNode | null);
    }
    enum BundleState {
        UNBUNDLED = 0,
        BUNDLE_HEAD = 1,
        BUNDLE_TAIL = 2
    }
    const EPSILON = 2.220446049250313e-16;
    const LEFT = 0;
    const RIGHT = 1;
    const CLIP = 0;
    const SUBJ = 1;
    const isContributing: unique symbol;
    const setContributing: unique symbol;
    enum OperationType {
        DIF = 0,
        INT = 1,
        XOR = 2,
        ADD = 3
    }
    function EQ(a: number, b: number): boolean;
    function PREV_INDEX(i: number, n: number): number;
    function NEXT_INDEX(i: number, n: number): number;
    enum VertexType {
        NUL = 0,
        EMX = 1,
        ELI = 2,
        TED = 3,
        ERI = 4,
        RED = 5,
        IMM = 6,
        IMN = 7,
        EMN = 8,
        EMM = 9,
        LED = 10,
        ILI = 11,
        BED = 12,
        IRI = 13,
        IMX = 14,
        FUL = 15
    }
    function getVertexType(tr: number, tl: number, br: number, bl: number): VertexType;
    namespace HState {
        const NH = 0;
        const BH = 1;
        const TH = 2;
        const nextState: number[][];
    }
    type SimpleType<T> = new (pointList: Vertex[], isHole: boolean) => T;
    type CompoundType<T, U> = new (polyList: T[]) => U;
    class Rectangle {
        minx: number;
        miny: number;
        maxx: number;
        maxy: number;
        constructor(minx: number, miny: number, maxx: number, maxy: number);
    }
    function polygonArea(points: Vertex[]): number;

    class PolygonNode {
        active: boolean;
        hole: boolean;
        left: VertexNode;
        right: VertexNode;
        next: PolygonNode | null;
        proxy: PolygonNode;
        constructor(next: PolygonNode | null, x: number, y: number);
        addRight(x: number, y: number): void;
        addLeft(x: number, y: number): void;
    }
    class TopPolygonNode<T, U> {
        private Simple;
        private Compound;
        top: PolygonNode | null;
        constructor(Simple: SimpleType<T>, Compound: CompoundType<T, U>);
        addLocalMin(x: number, y: number): PolygonNode;
        mergeLeft(p: PolygonNode, q: PolygonNode): void;
        mergeRight(p: PolygonNode, q: PolygonNode): void;
        private getContours;
        getResult(): T | U;
    }

    class EdgeNode {
        vertex: Vertex;
        bot: Vertex;
        top: Vertex;
        xb: number;
        xt: number;
        dx: number;
        type: 0 | 1;
        bside: {
            clip: 0 | 1;
            subj: 0 | 1;
        };
        bundle: {
            above: number[];
            below: number[];
        };
        bstate: {
            above: BundleState | null;
            below: BundleState | null;
        };
        outp: {
            above: PolygonNode | null;
            below: PolygonNode | null;
        };
        prev: EdgeNode | null;
        next: EdgeNode | null;
        pred: EdgeNode | null;
        succ: EdgeNode | null;
        nextBound: EdgeNode | null;
        constructor(x: number, y: number);
    }

    class AetTree {
        top: EdgeNode | null;
        addEdge(edge: EdgeNode): void;
    }

    interface IPolygon {
        isEmpty: boolean;
        bounds: Rectangle;
        [isContributing](index: number): boolean;
        [setContributing](index: number, value: boolean): void;
        getInnerPolies(): IPolygon[];
        getNumPoints(): number;
        get(index: number): Vertex;
    }
    function OPTIMAL(p: IPolygon, i: number): boolean;

    function clip<T, U>(op: OperationType, subject: IPolygon, clipper: IPolygon, Simple: SimpleType<T>, Compound: CompoundType<T, U>): T | U;

    function rotateBottomLeft(points: Vertex[]): Vertex[];
    function forceWinding(dir: 1 | -1, points: Vertex[]): number;
    function isConvex(points: Vertex[]): boolean;
    function isSimple(points: Vertex[]): boolean;

    enum Position {
        INSIDE = 1,
        OUTSIDE = -1,
        BOUNDARY = 0
    }
    function wn_poly(P: Vertex, V: Vertex[]): Position;

    class EdgeTable {
        private nodeList;
        addNode(x: number, y: number): void;
        getNode(index: number): EdgeNode;
        FWD_MIN(i: number): boolean;
        NOT_FMAX(i: number): boolean;
        REV_MIN(i: number): boolean;
        NOT_RMAX(i: number): boolean;
    }

    class ScanBeamTree {
        y: number;
        less: ScanBeamTree | null;
        more: ScanBeamTree | null;
        constructor(y: number);
    }
    class ScanBeamTreeEntries {
        sbtEntries: number;
        sbTree: ScanBeamTree | null;
        addToSBTree(y: number): void;
        buildSBT(): number[];
    }

    class LmtNode {
        y: number;
        next: LmtNode | null;
        firstBound: EdgeNode | null;
        constructor(y: number, /* Y coordinate at local minimum     */ next?: LmtNode | null);
    }
    class LmtTable {
        top: LmtNode | null;
    }
    function buildLmt(lmtTable: LmtTable, sbte: ScanBeamTreeEntries, p: IPolygon, type: 0 | 1, // poly type SUBJ/CLIP
        op: OperationType): void;

    function contourPass(edgeTable: EdgeTable, lmtTable: LmtTable, vertexCount: number, eIndex: number, type: 0 | 1, op: OperationType, fwd: boolean): number;

    abstract class Polygon implements IPolygon {
        abstract get isEmpty(): boolean;
        abstract get isHole(): boolean;
        abstract get bounds(): Rectangle;
        abstract [isContributing](index: number): boolean;
        abstract [setContributing](index: number, value: boolean): void;
        abstract getInnerPolies(): Polygon[];
        abstract getNumPoints(): number;
        abstract get(index: number): Vertex;
        abstract iterVertices(): IterableIterator<Vertex>;
        abstract getArea(): number;
        abstract contains(p: ExternalVertex): -1 | 0 | 1;
        abstract contains(p: Polygon): -1 | 0 | 1;
        abstract explode(): Polygon[];
        abstract equals(obj: Polygon): boolean;
        abstract toVertices(): {
            bounds: Vertex[][];
            holes: Vertex[][];
        };
        abstract getHull(): Polygon;
        toJSON(): {
            bounds: Vertex[][];
            holes: Vertex[][];
        };
        private static n_ary;
        static intersection(...p: Polygon[]): Polygon;
        intersection(...p: Polygon[]): Polygon;
        static union(...p: Polygon[]): Polygon;
        union(...p: Polygon[]): Polygon;
        static xor(...p: Polygon[]): Polygon;
        xor(...p: Polygon[]): Polygon;
        static difference(first: Polygon, ...p: Polygon[]): Polygon;
        difference(...p: Polygon[]): Polygon;
        static fromPoints(points: ExternalVertex[]): Polygon;
        static holeFromPoints(points: ExternalVertex[]): Polygon;
        static fromVertices({ bounds, holes }: {
            bounds: ExternalVertex[][];
            holes: ExternalVertex[][];
        }): Polygon;
    }

    function polygonHull(points: Vertex[]): Vertex[];
    function convexHull(points: Vertex[]): Vertex[];

    class StNode {
        edge: EdgeNode;
        xb: number;
        xt: number;
        dx: number;
        prev: StNode | null;
        constructor(edge: EdgeNode, prev: StNode | null);
    }
    class ItNode {
        ie: [EdgeNode, EdgeNode];
        point: Vertex;
        next: ItNode | null;
        constructor(edge0: EdgeNode, edge1: EdgeNode, x: number, y: number, next: ItNode | null);
    }
    class ItNodeTable {
        top: ItNode | null;
        buildIntersectionTable(aet: AetTree, dy: number): void;
    }
    function addSTEdge(st: StNode | null, it: ItNodeTable, edge: EdgeNode, dy: number): StNode;

    export { AetTree, BundleState, CLIP, CompoundType, EPSILON, EQ, EdgeNode, EdgeTable, ExternalVertex, HState, IPolygon, ItNodeTable, LEFT, LmtNode, LmtTable, NEXT_INDEX, OPTIMAL, OperationType, PREV_INDEX, Polygon, PolygonNode, Position, RIGHT, Rectangle, SUBJ, ScanBeamTreeEntries, SimpleType, StNode, TopPolygonNode, Vertex, VertexNode, VertexType, addSTEdge, buildLmt, clip, contourPass, convexHull, forceWinding, getVertexType, isContributing, isConvex, isSimple, polygonArea, polygonHull, rotateBottomLeft, setContributing, vert_eql, wn_poly };
}
