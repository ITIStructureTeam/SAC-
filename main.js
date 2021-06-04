import {MapControls} from './Assets/Three.js files/OrbitControls.js'
import { DoubleSide } from './Assets/Three.js files/three.module.js';

// Global variables for init function
var
 raycaster,
 mouse,
 stats,
 renderer,
 ViewPosition;  

 
 var HiddenGrids = [];
 var HiddenSnapping = []; 

 var points = [];                 // Points array for positions of lines for drawing functions
 
 var DrawingModeActive = false;
 var SelectionModeActive;
 var state = true;                // if false then the geometery will be extruded .. a global variable as it is used in mamy functions / classes

 var view;
 var XYindex;
 var XZindex;
 var YZindex;
 
//_________________________________________________________________//
//                                                                 //
//** Note: this work is for exploration and must be restructured !!//
//_________________________________________________________________//


// Command main class
class Commands
{
    constructor()
    {
        this.History = [];
        this.redoHistory = [];
    }
    excuteCommand(command)
    {
        this.History.push(command);
        command.excute();
        for (let i = 0; i < this.redoHistory.length; i++)
        {
            this.redoHistory[i].remove();
        }
        if(this.History.length > 20)
        {
            this.History[0].remove();
            this.History.shift();
        }
        this.redoHistory = [];
    }
    undoCommand()
    {
        if(this.History.length > 0)
        {
            this.redoHistory.push(this.History[this.History.length-1]);
            this.History[this.History.length-1].undo();
            this.History.pop();
        }
        if(this.redoHistory.length > 4)
        {
            this.redoHistory[0].remove();
            this.redoHistory.shift();
        }
    }
    redoCommand()
    {
        if(this.redoHistory.length > 0)
        {
            this.History.push(this.redoHistory[this.redoHistory.length-1]);
            this.redoHistory[this.redoHistory.length-1].redo();
            this.redoHistory.pop();
        }
    }
}

// create an instance of command object 
var commands = new Commands()


// Frame Element class
class FrameElement
{
    #section;
    static #num = 1;
    constructor(points, crossSection)
    {
        this.Label = FrameElement.#num;
        this.Section = crossSection ;
        var startPosition = [points[0], points[1], points[2]];
        var endPosition = [points[3], points[4], points[5]];
        this.StartPoint;
        this.EndPoint;
        this.Rotation = 0;
        this.AssociatedPoints = [];
        this.LoadsAssigned = new Map();
        FrameElement.#num++;

        for(let i = 0; i < Point.PointsArray.length; i++)
        {
            if (arrayEquals(startPosition, Point.PointsArray[i].position))
            {
                this.StartPoint = Point.PointsArray[i];
                Point.PointsArray[i].Shared.push(this.Label);
            }
            if (arrayEquals(endPosition, Point.PointsArray[i].position))
            {
                this.EndPoint = Point.PointsArray[i];
                Point.PointsArray[i].Shared.push(this.Label);
            }
        }
        if(this.StartPoint == null)
        {
            this.StartPoint = new Point(startPosition);
            this.StartPoint.excute(this.Label);
        }
        if(this.EndPoint == null)
        {
            this.EndPoint = new Point(endPosition);
            this.EndPoint.excute(this.Label);
        } 
    }

    set Section (value){
        this.#section = value;
        if(! (value.AssignedToFrames.includes(this.Label)) ) this.#section.AssignedToFrames.push(this.Label);
    }
    get Section (){
        return this.#section;
    }

    undo()
    {
        let frameIndex = this.Section.AssignedToFrames.indexOf(this.Label);
        this.Section.AssignedToFrames.splice(frameIndex,1);
        this.StartPoint.undo(this.Label);
        this.EndPoint.undo(this.Label);
        for(let i = 0; i <this.AssociatedPoints.length; i++){
            this.AssociatedPoints[i].undo();
        }
    }

    redo()
    {
        this.Section.AssignedToFrames.push(this.Label);
        this.StartPoint.redo(this.Label);
        this.EndPoint.redo(this.Label);
        this.Section.AssignedToFrames.push(this);
        for(let i = 0; i <this.AssociatedPoints.length; i++){
            this.AssociatedPoints[i].redo();
        }
    }

    remove()
    {
        this.Label = null;
        this.StartPoint.remove();
        this.EndPoint.remove();
        // let frameIndex = this.Sections.AssignedToFrames.indexOf(this);
        // this.Sections.AssignedToFrames.splice(frameIndex,1);
        for(let i = 0; i <this.AssociatedPoints.length; i++){
            this.AssociatedPoints[i].remove();
        }
        this.AssociatedPoints = null;
    } 

    AddPointsAtEqualDistances(number){
        const dX = this.EndPoint.position[0] - this.StartPoint.position[0];
        const dY = this.EndPoint.position[1] - this.StartPoint.position[1];
        const dZ = this.EndPoint.position[2] - this.StartPoint.position[2];
        for(let i = 1; i < number; i++){
            const x = this.StartPoint.position[0] + dX*i/number;
            const y = this.StartPoint.position[1] + dY*i/number;
            const z = this.StartPoint.position[2] + dZ*i/number;
            const point = [x,y,z]
            const obj = new Point(point);
            obj.excute();
            this.AssociatedPoints.push(obj);
        }
    }


    toJSON()
    {
        return{Label:this.Label,
            Section:this.Section,
            StartPoint:this.StartPoint,
            EndPoint:this.EndPoint,
            Rotation:this.Rotation * 180/Math.PI,
            Loads:this.LoadsAssigned
            }
    }
}

class DrawLine
{
    #frame;
    #extrude;
    #line;
    #refLine;
    #label;
    #name;
    static #drawLinesArray = new Array();
    static SelectedLines = [];

    constructor(frame)
    { 
        this.#frame=frame;
        this.#SetLine();
        this.#SetRefLine();
        this.#SetLabel();
        this.#SetName();
        this.#SetExtrude();
        this.ExtrudedColor = this.#extrude.material.color;
        this.LineColor = this.#line.material.color;
        this.Selected = false;

        if(state == true) 
        {
            this.Extrude.visible = false;
            this.line.visible = true;
        }else{
            
            this.Extrude.visible = true;
            this.line.visible = false;
        }

    }

    #SetLine(){
        let geometry = new THREE.LineGeometry();
        geometry.setPositions([...this.Frame.StartPoint.position, ...this.Frame.EndPoint.position]);
        let lineMaterial = new THREE.LineMaterial({color:'rgb(10,10,200)', linewidth:3 });
        lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
        this.#line = new THREE.Line2(geometry, lineMaterial);
    }

    #SetRefLine(){

        this.#refLine = new THREE.Line(new THREE.BufferGeometry()
        .setFromPoints([new THREE.Vector3(...this.Frame.StartPoint.position), new THREE.Vector3(...this.Frame.EndPoint.position)])
        ,new THREE.LineBasicMaterial({color:'rgb(0,10,200)', alphaTest:0, opacity: 0.1}));

        this.#refLine.DrawLine =  this;
        
    }

    #SetLabel(){

        let SpritePosition = [(this.Frame.EndPoint.position[0]-this.Frame.StartPoint.position[0])/3, (this.Frame.EndPoint.position[1]-this.Frame.StartPoint.position[1])/3, (this.Frame.EndPoint.position[2]-this.Frame.StartPoint.position[2])/3];
        this.#label = makeTextSprite
        ( 
        this.Frame.Label, SpritePosition[0]+this.Frame.StartPoint.position[0]+0.2, SpritePosition[1]+this.Frame.StartPoint.position[1], SpritePosition[2]+this.Frame.StartPoint.position[2]+0.45,
        {fontsize: 180, fontface: "Georgia", textColor:{r:160, g:160, b:160, a:1.0},
        vAlign:"center", hAlign:"center", fillColor:{r:255, g:255, b:255, a:1.0},
        borderColor: {r:0, g:0, b:0, a:1.0}, borderThickness: 1, radius:30}
        );
    }

    #SetName(){
        let SpritePosition = [(this.Frame.EndPoint.position[0]-this.Frame.StartPoint.position[0])/3, (this.Frame.EndPoint.position[1]-this.Frame.StartPoint.position[1])/3, (this.Frame.EndPoint.position[2]-this.Frame.StartPoint.position[2])/3];
        this.#name = makeTextSprite
        ( 
        this.Frame.Section.Name, SpritePosition[0]+this.Frame.StartPoint.position[0]+0.2, SpritePosition[1]+this.Frame.StartPoint.position[1], SpritePosition[2]+this.Frame.StartPoint.position[2]-0.2,
        {fontsize: 120, fontface: "Georgia", textColor:{r:160, g:160, b:160, a:1.0},
        vAlign:"center", hAlign:"center", fillColor:{r:255, g:255, b:255, a:1.0},
        borderColor: {r:0, g:0, b:0, a:1.0}, borderThickness: 1, radius:30}
        );
    }

    #SetExtrude(){

        let shape = this.#GetThreeShape();
        let points = [new THREE.Vector3(...this.Frame.StartPoint.position), new THREE.Vector3(...this.Frame.EndPoint.position)];
        let geometry;
        const material =  new THREE.MeshStandardMaterial({
            metalness:0.5,
            transparent:true,
            opacity:0.8,
            color:'rgb(0,0,185)',
            roughness:0.5
        });       
        const length = new THREE.Vector3().subVectors(points[1],points[0]).length();       

        if(shape!=null){
            shape.position = points[0];
            const extrudeSettings = {
                steps: 2,
                depth: length,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 1,
                bevelOffset: 0,
            };
    
            geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        }else{
            geometry = new THREE.BufferGeometry();
            // 12 positions with 3 coordinates
            const vertices  = [
    //Lower Flange
    // front
    { pos: [-b/2, -h/2, l], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
    { pos: [ b/2, -h/2, l], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
    { pos: [-b/2, tf-h/2, l], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
    { pos: [ b/2, tf-h/2, l], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
    // right
    { pos: [ b/2, -h/2,  l], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
    { pos: [ b1/2, -h1/2, 0], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
    { pos: [ b/2, tf-h/2,  l], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
    { pos: [ b1/2, tf1-h1/2, 0], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
    // back
    { pos: [ b1/2, -h1/2, 0], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
    { pos: [-b1/2, -h1/2, 0], norm: [ 0,  0, -1], uv: [1, 0], }, // 9
    { pos: [ b1/2, tf1-h1/2, 0], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
    { pos: [-b1/2, tf1-h1/2, 0], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
    // left
    { pos: [-b1/2, -h1/2, 0], norm: [-1,  0,  0], uv: [0, 0], }, // 12
    { pos: [-b/2, -h/2, l], norm: [-1,  0,  0], uv: [1, 0], }, // 13
    { pos: [-b1/2, tf1-h1/2, 0], norm: [-1,  0,  0], uv: [0, 1], }, // 14
    { pos: [-b/2, tf-h/2, l], norm: [-1,  0,  0], uv: [1, 1], }, // 15
    // top
    { pos: [ b1/2, tf1-h1/2, 0], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
    { pos: [-b1/2, tf1-h1/2, 0], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
    { pos: [ b/2, tf-h/2, l], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
    { pos: [-b/2, tf-h/2,  l], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
    // bottom
    { pos: [ b/2, -h/2, l], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
    { pos: [-b/2, -h/2, l], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
    { pos: [ b1/2, -h1/2, 0], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
    { pos: [-b1/2, -h1/2, 0], norm: [ 0, -1,  0], uv: [1, 1], }, // 23

    //Web
    // front
    { pos: [-tw/2, tf-h/2, l], norm: [ 0,  0,  1], uv: [0, 0], }, // 24
    { pos: [ tw/2, tf-h/2, l], norm: [ 0,  0,  1], uv: [1, 0], }, // 25
    { pos: [-tw/2, -tf+h/2, l], norm: [ 0,  0,  1], uv: [0, 1], }, // 26
    { pos: [ tw/2, -tf+h/2, l], norm: [ 0,  0,  1], uv: [1, 1], }, // 27
    // right
    { pos: [ tw/2, tf-h/2,  l], norm: [ 1,  0,  0], uv: [0, 0], }, // 28
    { pos: [ tw1/2, tf1-h1/2, 0], norm: [ 1,  0,  0], uv: [1, 0], }, // 29
    { pos: [ tw/2, -tf+h/2,  l], norm: [ 1,  0,  0], uv: [0, 1], }, // 30
    { pos: [ tw1/2, -tf1+h1/2, 0], norm: [ 1,  0,  0], uv: [1, 1], }, // 31
    // back
    { pos: [ tw1/2, tf1-h1/2, 0], norm: [ 0,  0, -1], uv: [0, 0], }, // 32
    { pos: [-tw1/2, tf1-h1/2, 0], norm: [ 0,  0, -1], uv: [1, 0], }, // 33
    { pos: [ tw1/2, -tf1+h1/2, 0], norm: [ 0,  0, -1], uv: [0, 1], }, // 34
    { pos: [-tw1/2, -tf1+h1/2, 0], norm: [ 0,  0, -1], uv: [1, 1], }, // 35
    // left
    { pos: [-tw1/2, tf1-h1/2, 0], norm: [-1,  0,  0], uv: [0, 0], }, // 36
    { pos: [-tw/2, tf-h/2, l], norm: [-1,  0,  0], uv: [1, 0], }, // 37
    { pos: [-tw1/2, -tf1+h1/2, 0], norm: [-1,  0,  0], uv: [0, 1], }, // 38
    { pos: [-tw/2, -tf+h/2, l], norm: [-1,  0,  0], uv: [1, 1], }, // 39
    // top
    { pos: [ tw1/2, -tf1+h1/2, 0], norm: [ 0,  1,  0], uv: [0, 0], }, // 40
    { pos: [-tw1/2, -tf1+h1/2, 0], norm: [ 0,  1,  0], uv: [1, 0], }, // 41
    { pos: [ tw/2, -tf+h/2, l], norm: [ 0,  1,  0], uv: [0, 1], }, // 42
    { pos: [-tw/2, -tf+h/2,  l], norm: [ 0,  1,  0], uv: [1, 1], }, // 43
    // bottom
    { pos: [ tw/2, tf-h/2, l], norm: [ 0, -1,  0], uv: [0, 0], }, // 44
    { pos: [-tw/2, tf-h/2, l], norm: [ 0, -1,  0], uv: [1, 0], }, // 45
    { pos: [ tw1/2, tf1-h1/2, 0], norm: [ 0, -1,  0], uv: [0, 1], }, // 46
    { pos: [-tw1/2, tf1-h1/2, 0], norm: [ 0, -1,  0], uv: [1, 1], }, // 47

    //Upper Flange
    // front
    { pos: [-b/2, h/2-tf, l], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
    { pos: [ b/2, h/2-tf, l], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
    { pos: [-b/2, h/2, l], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
    { pos: [ b/2, h/2, l], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
    // right
    { pos: [ b/2, -tf+h/2,  l], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
    { pos: [ b1/2, -tf1+h1/2, 0], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
    { pos: [ b/2, h/2,  l], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
    { pos: [ b1/2, h1/2, 0], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
    // back
    { pos: [ b1/2, -tf1+h1/2, 0], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
    { pos: [-b1/2, -tf1+h1/2, 0], norm: [ 0,  0, -1], uv: [1, 0], }, // 9
    { pos: [ b1/2, h1/2, 0], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
    { pos: [-b1/2, h1/2, 0], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
    // left
    { pos: [-b1/2, -tf1+h1/2, 0], norm: [-1,  0,  0], uv: [0, 0], }, // 12
    { pos: [-b/2, -tf+h/2, l], norm: [-1,  0,  0], uv: [1, 0], }, // 13
    { pos: [-b1/2, h1/2, 0], norm: [-1,  0,  0], uv: [0, 1], }, // 14
    { pos: [-b/2, h/2, l], norm: [-1,  0,  0], uv: [1, 1], }, // 15
    // top
    { pos: [ b1/2, h1/2, 0], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
    { pos: [-b1/2, h1/2, 0], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
    { pos: [ b/2, h/2, l], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
    { pos: [-b/2, h/2,  l], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
    // bottom
    { pos: [ b/2, h/2-tf, l], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
    { pos: [-b/2, h/2-tf, l], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
    { pos: [ b1/2, h1/2-tf1, 0], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
    { pos: [-b1/2, h1/2-tf1, 0], norm: [ 0, -1,  0], uv: [1, 1], }, // 23
            ];
            var indices = new Uint32Array([
      // Lower Flange
         0,  1,  2,   2,  1,  3,  // front
         4,  5,  6,   6,  5,  7,  // right
         8,  9, 10,  10,  9, 11,  // back
        12, 13, 14,  14, 13, 15,  // left
        16, 17, 18,  18, 17, 19,  // top
        20, 21, 22,  22, 21, 23,  // bottom
     // Web
        24, 25, 26,  26, 25, 27,  // front
        28, 29, 30,  30, 29, 31,  // right
        32, 33, 34,  34, 33, 35,  // back
        36, 37, 38,  38, 37, 39,  // left
        40, 41, 42,  42, 41, 43,  // top
        44, 45, 46,  46, 45, 47,  // bottom
    // Upper Flange
        48, 49, 50,  50, 49, 51,  // front
        52, 53, 54,  54, 53, 55,  // right
        56, 57, 58,  58, 57, 59,  // back
        60, 61, 62,  62, 61, 63,  // left
        64, 65, 66,  66, 65, 67,  // top
        68, 69, 70,  70, 69, 71,  // bottom
            ]);           
            const positions = [];
            const normals = [];
            const uvs = [];
            for (const vertex of vertices) {
              positions.push(...vertex.pos);
              normals.push(...vertex.norm);
              uvs.push(...vertex.uv);
            }
        
            geometry.setIndex( new THREE.BufferAttribute(indices,1) );
        
            //geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );
            const positionNumComponents = 3;
            const normalNumComponents = 3;
            const uvNumComponents = 2;
            geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
            );
            geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
            );
            geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
            );
            
        }
       
        this.#extrude = new THREE.Mesh( geometry, material);
        this.#extrude.position.set(points[0].x,points[0].y,points[0].z);
        this.#extrude.lookAt(points[1])
        this.#extrude.rotation.z = this.#frame.Rotation;

        // if(points[1] - points[4] != 0 && points[2]-points[5] == 0 && points[0]-points[3] == 0){
        //     this.#extrude.material.color.setHex(0xa200ab);
        //     this.#extrude.rotation.z = (Math.PI/2);
        // }

    }

    #GetThreeShape(){

        let threeShape = new THREE.Shape();
        let dimensions = this.Frame.Section.Dimensions;
        switch (this.Frame.Section.SecType) {
            case ESectionShape.Rectangular:
                threeShape.moveTo(-dimensions[0]/2,-dimensions[1]/2);
                threeShape.lineTo(dimensions[0]/2,-dimensions[1]/2);
                threeShape.lineTo(dimensions[0]/2,dimensions[1]/2);
                threeShape.lineTo(-dimensions[0]/2,dimensions[1]/2);
                threeShape.lineTo(-dimensions[0]/2,-dimensions[1]/2);
                break;
            
            case ESectionShape.Circular:
                let theta = 0;
                let segments = 32
                let step = 2*Math.PI/segments;
                threeShape.moveTo(dimensions[0]*Math.cos(theta), dimensions[0]*Math.sin(theta));
                for (let i = 1; i <= segments; i++) {
                    theta+=step;
                    threeShape.lineTo(dimensions[0]*Math.cos(theta), dimensions[0]*Math.sin(theta));   
                }
                break;
           
            case ESectionShape.ISec:
                threeShape.moveTo(-dimensions[4]/2, -dimensions[0]/2);
                threeShape.lineTo(dimensions[4]/2 , -dimensions[0]/2);
                threeShape.lineTo(dimensions[4]/2, -(dimensions[0]/2-dimensions[5]));
                threeShape.lineTo(dimensions[3]/2, -(dimensions[0]/2-dimensions[5]));
                threeShape.lineTo(dimensions[3]/2, (dimensions[0]/2-dimensions[2]));
                threeShape.lineTo(dimensions[1]/2, (dimensions[0]/2-dimensions[2]));
                threeShape.lineTo(dimensions[1]/2 , dimensions[0]/2);
                threeShape.lineTo(-dimensions[1]/2, dimensions[0]/2);
                threeShape.lineTo(-dimensions[1]/2, (dimensions[0]/2-dimensions[2]));
                threeShape.lineTo(-dimensions[3]/2, (dimensions[0]/2-dimensions[2]));
                threeShape.lineTo(-dimensions[3]/2, -(dimensions[0]/2-dimensions[5]));
                threeShape.lineTo(-dimensions[4]/2, -(dimensions[0]/2-dimensions[5]));
                threeShape.lineTo(-dimensions[4]/2, -dimensions[0]/2);
                break;
            
            case ESectionShape.TSec:
                let ycg = ( (dimensions[1]*dimensions[2]*(dimensions[0] - dimensions[2]/2) ) + (dimensions[3]*Math.sqrt(dimensions[0]-dimensions[2])/2) )
                /(dimensions[1]*dimensions[2]+dimensions[3]*(dimensions[0]-dimensions[2]));
               threeShape.moveTo(-dimensions[3]/2,-ycg);
               threeShape.lineTo(dimensions[3]/2,-ycg);
               threeShape.lineTo(dimensions[3]/2,dimensions[0]-dimensions[2]-ycg);
               threeShape.lineTo(dimensions[1]/2,dimensions[0]-dimensions[2]-ycg);
               threeShape.lineTo(dimensions[1]/2,dimensions[0]-ycg);
               threeShape.lineTo(-dimensions[1]/2,dimensions[0]-ycg);
               threeShape.lineTo(-dimensions[1]/2,dimensions[0]-dimensions[2]-ycg);
               threeShape.lineTo(-dimensions[3]/2,dimensions[0]-dimensions[2]-ycg);
               threeShape.lineTo(-dimensions[3]/2,-ycg);
                break;
        
            case ESectionShape.Tapered:
                threeShape=null;
                break;
        }
        return threeShape;
    }

    get Frame(){
        return this.#frame;
    }

    get line(){
        return this.#line;
    }

    get refline(){
        return this.#refLine;
    }

    get label(){
        return this.#label;
    }

    get name(){
        return this.#name;
    }

    get Extrude(){
        return this.#extrude;
    }

    static get DrawLinesArray(){
        return DrawLine.#drawLinesArray;
    }

    static DisplayLabels(){   
        DrawLine.DrawLinesArray.forEach(drawLine=> drawLine.label.visible = true);
    }
    
    static HideLabels(){
        DrawLine.DrawLinesArray.forEach(drawLine=> drawLine.label.visible = false);
    }

    static DisplaySectionNames(){
        DrawLine.DrawLinesArray.forEach(drawLine=> drawLine.name.visible = true);
    }

    static HideSectionNames(){
        DrawLine.DrawLinesArray.forEach(drawLine=> drawLine.name.visible = false);
    }

    static StandardView(){
        DrawLine.DrawLinesArray.forEach(drawLine => drawLine.Extrude.visible=false);
        DrawLine.DrawLinesArray.forEach(drawLine => drawLine.line.visible=true);
    }

    static ExtrudeView(){

        DrawLine.DrawLinesArray.forEach(drawLine => drawLine.Extrude.visible=true);
        DrawLine.DrawLinesArray.forEach(drawLine => drawLine.line.visible=false);
    }

    static GetDrawnFrames(){
        let drawnFrames = [];
        DrawLine.DrawLinesArray.forEach(drawn=> drawnFrames.push(drawn.Frame));
        return drawnFrames;
    }

    static GetSelectedFrames(){
        let selectedFrames = [];
        DrawLine.SelectedLines.forEach(selLine=>selectedFrames.push(selLine.Frame));
        return selectedFrames;
    }

    ReExtrude(){
        scene.remove(this.#extrude);
        this.#SetExtrude();
        scene.add(this.#extrude);
        if(state == true) 
        {
            this.#extrude.visible = false;
            this.line.visible = true;
        }else{
            
            this.#extrude.visible = true;
            this.line.visible = false;
        }
        this.updateColors();
    }

    ReSetSecName(){
        scene.remove(this.name)
        let SpritePosition = [(this.Frame.EndPoint.position[0]-this.Frame.StartPoint.position[0])/3, (this.Frame.EndPoint.position[1]-this.Frame.StartPoint.position[1])/3, (this.Frame.EndPoint.position[2]-this.Frame.StartPoint.position[2])/3];
        this.#name = makeTextSprite
        ( 
        this.Frame.Section.Name, SpritePosition[0]+this.Frame.StartPoint.position[0]+0.2, SpritePosition[1]+this.Frame.StartPoint.position[1], SpritePosition[2]+this.Frame.StartPoint.position[2]-0.2,
        {fontsize: 120, fontface: "Georgia", textColor:{r:160, g:160, b:160, a:1.0},
        vAlign:"center", hAlign:"center", fillColor:{r:255, g:255, b:255, a:1.0},
        borderColor: {r:0, g:0, b:0, a:1.0}, borderThickness: 1, radius:30}
        );
    }

    excute()
    { 
        DrawLine.#drawLinesArray.push(this);
        scene.add(this.refline);
        scene.add(this.line);
        scene.add(this.Extrude);
        scene.add(this.label); 
        scene.add(this.name);
        Labels(); 
    }

    undo() 
    {
        DrawLine.DrawLinesArray.splice(DrawLine.DrawLinesArray.indexOf(this),1);
        scene.remove(this.refline);
        scene.remove(this.line);
        scene.remove(this.Extrude);
        scene.remove(this.label);
        scene.remove(this.name);  
        this.Frame.undo();     
    }

    redo()
    {
        DrawLine.DrawLinesArray.push(this);
        scene.add(this.refline);
        scene.add(this.line);
        scene.add(this.Extrude);
        scene.add( this.label ); 
        scene.add(this.name);    
        this.Frame.redo();
        this.InView();
        if(state == false) Extrude();
        else Standard();
        Labels(); 
    }

    remove()
    {
        //DrawLine.DrawLinesArray.splice(DrawLine.DrawLinesArray.indexOf(this),1);  //DrawLine.DrawLinesArray.indexOf(this));
        this.refline.material.dispose();
        this.refline.geometry.dispose();
        this.line.material.dispose();
        this.line.geometry.dispose();
        this.Extrude.material.dispose();
        this.Extrude.geometry.dispose();
        this.label.material.dispose();
        this.name.material.dispose();
        this.Frame.remove();
    }

    updateColors()
    {
        if(this.Selected == true)
        { 
            this.line.material.color =    {r:1,g:0.4,b:0};
            this.Extrude.material.color = {r:1,g:0.3,b:0};
            this.Extrude.material.metalness = 0;
        }
        else{
            this.line.material.color = this.LineColor;
            this.Extrude.material.metalness = 0.5;
            this.Extrude.material.color = this.ExtrudedColor;
        }
        
    }

    Hide()
    {
         scene.remove(this.line);
         scene.remove(this.Extrude);
         scene.remove(this.refline);
         scene.remove(this.label);
         scene.remove(this.name);
    }
    Show()
    {
        scene.add(this.line);
        scene.add(this.Extrude);
        scene.add(this.refline);
        scene.add(this.label);
        scene.add(this.name);
    }
    InView()
    {
        if(view == "XY")
        {
            if(this.Frame.StartPoint.position[2] != ViewPosition || this.Frame.EndPoint.position[2] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "XZ")
        {
            if(this.Frame.StartPoint.position[1] != ViewPosition || this.Frame.EndPoint.position[1] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "YZ")
        {
            if(this.Frame.StartPoint.position[0] != ViewPosition || this.Frame.EndPoint.position[0] != ViewPosition)
            {
                this.Hide();
            }
        }
        else{
            this.Show();
        }
    }
}

// Do not undo except from frame element
class Point
{
    static PointsArray = [];
    static SelectedPoints = [];
    static #Pointnum = 1;

    constructor(point)
    {
        this.Shared = [];
        this.Label = Point.#Pointnum;
        Point.#Pointnum += 1;
        this.Selected = false;
      
        this.position = [point[0], point[1], point[2]];
        
        this.Restraint = [false, false, false, false, false, false];

        this.dot = DrawPoint(this.position);

        this.SupportIndication = DrawPoint(this.position,1);

        // crosshair
        var material = new THREE.LineBasicMaterial({ color: 'rgb(0,50,100)', alphaTest: 0.95, transparent : true, opacity: 0});
        // crosshair size
        var x = 0.3, y = 0.3;
        var geometry = new THREE.BufferGeometry();
        var vertices =[];  
        vertices.push(x, y, 0);
        vertices.push(-x, -y, 0);
        vertices.push(0, 0, 0);
        vertices.push(x, -y, 0); 
        vertices.push(-x, y, 0);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        this.crosshair = new THREE.Line( geometry, material );
        this.crosshair.position.x = this.position[0];
        this.crosshair.position.y = this.position[1];
        this.crosshair.position.z = this.position[2];

        Point.PointsArray.push(this);

        this.obj = BoxSnap(0.3, 0.3, 0.3);
        this.obj.position.x = this.position[0];
        this.obj.position.y = this.position[1];
        this.obj.position.z = this.position[2];
    }
    excute(frame=null)
    {
        if(frame !=null){  this.Shared.push(frame); }
        scene.add( this.dot );
        scene.add( this.crosshair );
        scene.add( this.SupportIndication );
        group.add(this.obj);
    }
    undo(frame=null)
    {
        if(frame != null){
            this.Shared.splice(Point.PointsArray.indexOf(frame),1);
        }
        if(this.Shared.length == 0)
        {
            scene.remove(this.dot); 
            scene.remove( this.crosshair );
            scene.remove( this.SupportIndication );
            const index = Point.PointsArray.indexOf(this); 
            Point.PointsArray.splice(index, 1);
            group.remove(this.obj);
        }
    }
    redo(frame=null)
    {
        if(this.Shared.length == 0)
        {
            scene.add( this.dot );
            scene.add( this.crosshair );
            scene.add( this.SupportIndication );
            Point.PointsArray.push(this);
            group.add(this.obj);
        }
        if(frame != null){this.Shared.push(frame);}
        this.InView();
    }

    remove()
    {
        if(this.Shared.length == 0)
        {
            this.position = null;
            this.Label = null;
            this.dot.material.dispose();
            this.dot.geometry.dispose();
            this.crosshair.material.dispose();
            this.crosshair.geometry.dispose();
            this.obj.material.dispose();
            this.obj.geometry.dispose();
            this.SupportIndication.material.dispose();
            this.SupportIndication.geometry.dispose();
        }
    }
    Highlight()
    {
        if(this.Selected == true && this.Shared.length > 0)
        { 
            this.crosshair.material.opacity = 1;
        }
        else{
            this.crosshair.material.opacity = 0;
        }   
        
    }

    Hide()
    {
        scene.remove(this.dot);
        scene.remove(this.crosshair);
        scene.remove( this.SupportIndication );
        group.remove(this.obj);
    }
    Show()
    {
        scene.add(this.dot);
        scene.add(this.crosshair);
        scene.add( this.SupportIndication );
        group.add(this.obj);
    }

    InView()
    {
        if(view == "XY")
        {
            if(this.position[2] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "XZ")
        {
            if(this.position[1] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "YZ")
        {
            if(this.position[0] != ViewPosition)
            {
                this.Hide();
            }
        }
        else{
            this.Show();
        }
    }

    ViewIndication()
    {
        scene.remove(this.SupportIndication)

        if(arrayEquals(this.Restraint, [true, true, true, false, false, false]))
        {
            this.SupportIndication = DrawHinge(this.position);
        }
        else if(arrayEquals(this.Restraint, [true, true, true, true, true, true]))
        {
            this.SupportIndication = DrawFix(this.position);
        }
        else if(arrayEquals(this.Restraint, [true, false, false, false, false, false]))
        {
            this.SupportIndication = DrawRoller(this.position);
        }
        else{
            this.SupportIndication = DrawPoint(this.position, 1);
        }
        this.InView();
    }

    toJSON()
    {
        return{label:this.Label, position:this.position, Restraints:this.Restraint}
    }
}


class AppliedLoadInfo{

    //#frame;
    //#patternName
    #coordSys;
    #dir;
    #type
    #shape;
    #distance;
    #magnitude;

    //constructor(pattern, frame, coordSys , dir, type, shape, distance, magnitude)
    constructor(coordSys , dir, type, shape, distance, magnitude){
        //this.Frame = frame;             // FrameElement Object
        //this.PatternName = pattern      // pattern Name
        this.CoordSys = coordSys;       // for local (true)  for global (false)
        this.Dir = dir;                 // 1(x) or 2(z) or 3(y)
        this.Type = type;               // for force (0)   for moment (1)
        this.Shape = shape;             // for point(0)   for distr  (1)
        this.Distance = distance;       // one number for point  |  array of two numbers for distributed    (RELATIVE DISTANCE)
        this.Magnitude = magnitude;     // one number for point  |  array of two numbers for distributed
    }
    
    /* set Frame (frame){

        this.#frame = frame
        if(frame.LoadsAssigned.has(this.PatternName)){
            let appliedLoads = frame.LoadsAssigned.get(this.PatternName);
            let similarLoads = appliedLoads.filter(load => (load.Shape == this.AppliedLoad.Shape && load.Type == this.AppliedLoad.Type) );
            if(!similarLoads.length) appliedLoads.push(this.AppliedLoad);
            else{
                if(similarLoads[0].Shape == ELoadShape.Distributed){
                    let index = appliedLoads.indexOf(similarLoads[0]);
                    appliedLoads[index] = this.AppliedLoad;
                }
                else{
                    let atSameDis = similarLoads.filter(simLoad => simLoad.Distance == this.AppliedLoad.Distance);
                    if(! atSameDis.length) appliedLoads.push(this.AppliedLoad);
                    else {
                        let index = appliedLoads.indexOf(atSameDis[0]);
                        appliedLoads[index] = this.AppliedLoad;
                    }
                }
            }
        }else{
            frame.LoadsAssigned.set(this.PatternName,[this.AppliedLoad]);
        }

    }

    set PatternName(name){
        if(! LoadPattern.LoadPatternsList.has(name)) throw new TypeError('invalid load pattern');
        this.#patternName = name;
        let pattern = LoadPattern.LoadPatternsList.get(name);
        if(! pattern.OnElements.includes(this.Frame.Label)) pattern.OnElements.push(this.Frame.Label);
    } */

    set CoordSys(value){
        if (!(Object.values(ECoordSys).includes(value))) throw new TypeError('Coordinate Systems accepts only true for loacal or false for global');
        this.#coordSys = value;
    }
    set Dir(value){
        if(value !== 1 && value !==2 && value !== 3) throw new TypeError('direction accepts only 1 or 2 or 3');
        this.#dir = value
    }
    set Type(value){
        if (!(Object.values(ELoadType).includes(value))) throw new TypeError('laod type accepts only 0 for force or 1 for moment');
        this.#type = value;
    }
    set Shape(value){
        if (!(Object.values(ELoadShape).includes(value))) throw new TypeError('load shape accepts only 0 for point or 1 for distributed');
        this.#shape = value;
    }
    set Distance(value){
        if(this.Shape == ELoadShape.Point){
            if(isNaN(value)) throw new TypeError('distance must be a number');
        }
        if(this.Shape == ELoadShape.Distributed){
            if( (! (value instanceof Array)) || value.length < 2 || value.slice(0,2).some(val=> isNaN(val)) )
            throw new TypeError ('Distance for distributed load must be in a form of array containing two numbers');
        }
        this.#distance = value;
    }

    set Magnitude(value){
        if(this.Shape == ELoadShape.Point){
            if(isNaN(value)) throw new TypeError('Magnitude must be a number');
        }
        if(this.Shape == ELoadShape.Distributed){
            if( (! (value instanceof Array)) || value.length < 2 || value.slice(0,2).some(val=> isNaN(val)) )
            throw new TypeError ('Magnitude for distributed load must be in a form of array containing two numbers one for each distance');
        }
        this.#magnitude = value;
    }

   /*  get Frame(){
        return this.#frame;
    }
    get PatternName(){
        return this.#patternName
    } */
    
    get CoordSys(){
        return this.#coordSys;
    }
    get Dir(){
        return this.#dir;
    }
    get Type(){
        return this.#type;
    }
    get Shape(){
        return this.#shape;
    }
    get Distance(){
        return this.#distance;
    }
    get Magnitude(){
        return this.#magnitude;
    }

}


class AssignFrameLoad{

    constructor(lines, pattern, appliedLoadInfo){

        this.Lines = [...lines];                //array of DrawLine objects                 
        this.PrevLoads = [];                    //array containing previous LoadsAssigned for each frame
        this.Lines.forEach(line => this.PrevLoads.push(line.Frame.LoadsAssigned));
        this.Pattern = pattern;                 //pattern name
        this.PrevPatternOnElements = LoadPattern.LoadPatternsList.get(this.Pattern).OnElements
        this.AppliedLoad = appliedLoadInfo;     //instance of AppliedLoadInfo Class
    }

    excute(){
        this.#PushInFrameLoadsAssigned();
        this.#PushInPatternOnElements();
        //draw...        
        for (const line of this.Lines) {
            const load = this.DrawLoad(this.AppliedLoad.Shape,line);
            line.load = load;
            scene.add(load);
        }
        console.log(DrawLine.DrawLinesArray)
    }

    undo(){
        for (let i = 0; i < this.Frames.length; i++) {
            this.Frames[i].LoadsAssigned = this.PrevLoads[i];
        }
        LoadPattern.LoadPatternsList.get(this.Pattern).OnElements = this.PrevPatternOnElements;
    }

    redo(){
        excute();
    }

    #PushInFrameLoadsAssigned(){

        for (const line of this.Lines) {
            if(line.Frame.LoadsAssigned.has(this.Pattern)){
                let appliedLoads = line.Frame.LoadsAssigned.get(this.Pattern);
                let similarLoads = appliedLoads.filter(load => (load.Shape == this.AppliedLoad.Shape && load.Type == this.AppliedLoad.Type) );
                if(!similarLoads.length) appliedLoads.push(this.AppliedLoad);
                else{
                    if(similarLoads[0].Shape == ELoadShape.Distributed){
                        let index = appliedLoads.indexOf(similarLoads[0]);
                        appliedLoads[index] = this.AppliedLoad;
                    }
                    else{
                        let atSameDis = similarLoads.filter(simLoad => simLoad.Distance == this.AppliedLoad.Distance);
                        if(! atSameDis.length) appliedLoads.push(this.AppliedLoad);
                        else {
                            let index = appliedLoads.indexOf(atSameDis[0]);
                            appliedLoads[index] = this.AppliedLoad;
                        }
                    }
                }
            }else{
                line.Frame.LoadsAssigned.set(this.Pattern,[this.AppliedLoad]);
            }
        }
    }

    #PushInPatternOnElements(){
        let pattern = LoadPattern.LoadPatternsList.get(this.Pattern);
        for (const line of this.Lines) {
            if(!pattern.OnElements.includes(line.Frame.Label)) pattern.OnElements.push(line.Frame.Label);
        }
    }

    DrawLoad(shape, line){
        const scale = 1.25 / GetMaxLoad(this.Pattern);
        const startPoint = line.Frame.StartPoint.position;
        const endPoint = line.Frame.EndPoint.position;
        const magnitudes = this.AppliedLoad.Magnitude;
        const dir = this.AppliedLoad.Dir;
        const coordSys = this.AppliedLoad.CoordSys;       
        const relDist = this.AppliedLoad.Distance;
        let load;
        switch(shape){
            case ELoadShape.Distributed:
                
                const loadPos1 = GetAbsoluteCoord(relDist[0] ,startPoint, endPoint);
                const loadPos2 = GetAbsoluteCoord(relDist[1] ,startPoint, endPoint);
                console.log(loadPos1, loadPos2)
                load=DistributedLoadIndication(magnitudes[0] ,loadPos1, loadPos2, dir, 0, scale, magnitudes[1], coordSys);

                break;
            case ELoadShape.Point:
                load=PointLoadIndication (magnitudes, relDist, startPoint, endPoint,  dir, 0, scale , coordSys);
                break;
        }
        return load;
    }
}



class Delete
{
    constructor(selected)
    {
        this.DeletedList = [];
        for(let i = 0; i <selected.length; i++){
            this.DeletedList.push(selected[i]);
        }
    }
    excute()
    {
        for(let i = 0; i<this.DeletedList.length ; i++)
        {
            this.DeletedList[i].undo();
        }
        
    }
    undo()
    {
        for(let i = 0; i<this.DeletedList.length ; i++)
        {
            this.DeletedList[i].redo();
        }
    }
    redo()
    {
        for(let i = 0; i<this.DeletedList.length ; i++)
        {
            this.DeletedList[i].undo();
        }
    }

    remove()
    {
        for(let i = 0; i<this.DeletedList.length ; i++)
        {
            this.DeletedList[i].remove();
        }
    }
}


class AssignFrameSection{
    constructor(section){
        this.selectedFrames = DrawLine.GetSelectedFrames();
        this.selectedLines = [...DrawLine.SelectedLines];
        this.prevSections = [];
        this.newSection = section;
        this.selectedFrames.forEach(frame=>this.prevSections.push(frame.Section));
    }

    excute(){
        this.selectedFrames.forEach(frame => frame.Section = this.newSection);
        this.selectedLines.forEach(drawLine=>drawLine.ReExtrude());
    }
    undo(){
        for (let i = 0; i < this.selectedFrames.length; i++) {
            this.selectedFrames[i].Section = this.prevSections[i] ;          
        }
        this.selectedLines.forEach(drawLine=>drawLine.ReExtrude());
    }
    redo(){
        this.excute();
    } 
    remove(){
        this.selectedFrames = null
        this.selectedLines = null
        this.prevSections = null
        this.newSection = null
    }  
}


class Copy
{
    constructor(Delta)
    {
        this.Delta = Delta;
        this.CopiedList = [];
        this.Copies = [];
        for(let i = 0; i <DrawLine.SelectedLines.length; i++){
            this.CopiedList.push(DrawLine.SelectedLines[i]);
        }
    }
    excute()
    {
        Unselect();
        for(let i = 0; i<this.CopiedList.length ; i++)
        {
            let points = [];
            points.push(this.CopiedList[i].Frame.StartPoint.position[0] + this.Delta[0])
            points.push(this.CopiedList[i].Frame.StartPoint.position[1] + this.Delta[1])
            points.push(this.CopiedList[i].Frame.StartPoint.position[2] + this.Delta[2])
            points.push(this.CopiedList[i].Frame.EndPoint.position[0] + this.Delta[0])
            points.push(this.CopiedList[i].Frame.EndPoint.position[1] + this.Delta[1])
            points.push(this.CopiedList[i].Frame.EndPoint.position[2] + this.Delta[2])
    
            let Copy = new DrawLine(new FrameElement(points, this.CopiedList[i].Frame.Section));
            let number = this.CopiedList[i].Frame.AssociatedPoints.length +1;
            Copy.Frame.AddPointsAtEqualDistances(number);
            this.Copies.push(Copy); 
            Copy.excute();
        }
        this.CopiedList = [];
    }
    undo()
    {
        for(let i = 0; i<this.Copies.length ; i++)
        {
            this.Copies[i].undo();
        }
    }
    redo()
    {
        for(let i = 0; i<this.Copies.length ; i++)
        {
            this.Copies[i].redo();
        }
    }

    remove()
    {
        for(let i = 0; i<this.Copies.length ; i++)
        {
            this.Copies[i].remove();
        }
    }
    
}

class Move
{
    constructor(Delta)
    {
        this.Delta = Delta;
        this.TempList = [];
        this.Moved = [];
        for(let i = 0; i <DrawLine.SelectedLines.length; i++){
            this.TempList.push(DrawLine.SelectedLines[i]);
        }
    }
    excute()
    {
        Unselect();
        for(let i = 0; i<this.TempList.length ; i++)
        {
            let points = [];
            points.push(this.TempList[i].Frame.StartPoint.position[0] + this.Delta[0])
            points.push(this.TempList[i].Frame.StartPoint.position[1] + this.Delta[1])
            points.push(this.TempList[i].Frame.StartPoint.position[2] + this.Delta[2])
            points.push(this.TempList[i].Frame.EndPoint.position[0] + this.Delta[0])
            points.push(this.TempList[i].Frame.EndPoint.position[1] + this.Delta[1])
            points.push(this.TempList[i].Frame.EndPoint.position[2] + this.Delta[2])
    
            let move = new DrawLine(new FrameElement(points, this.TempList[i].Frame.Section));
            let number = this.TempList[i].Frame.AssociatedPoints.length +1;
            move.Frame.AddPointsAtEqualDistances(number);
            this.Moved.push(move); 
            move.excute();
            this.TempList[i].undo();
        }
    }
    undo()
    {
        for(let i = 0; i<this.Moved.length ; i++)
        {
            this.Moved[i].undo();
            this.TempList[i].redo();
        }
    }
    redo()
    {
        for(let i = 0; i<this.Moved.length ; i++)
        {
            this.Moved[i].redo();
            this.TempList[i].undo();
        }
    }

    remove()
    {
        for(let i = 0; i<this.Moved.length ; i++)
        {
            this.Moved[i].remove();
        }
    }
    
}

class AssignRestraints
{
    constructor(restraint)
    {
        this.SelectedPoints = [];
        for(let i = 0; i < Point.SelectedPoints.length; i++)
        {
            this.SelectedPoints.push(Point.SelectedPoints[i]);
        }
        this.TempRestraints = [];   
        this.Restraint = [...restraint];
    }

    excute()
    {
        Unselect();
        for(let i = 0; i < this.SelectedPoints.length; i++)
        {
            this.TempRestraints[i] = this.SelectedPoints[i].Restraint;
            this.SelectedPoints[i].Restraint = [...this.Restraint];
            this.SelectedPoints[i].ViewIndication();
        }
    }

    undo()
    {
        for(let i = 0; i < this.SelectedPoints.length; i++)
        {
            this.SelectedPoints[i].Restraint = this.TempRestraints[i];
            this.SelectedPoints[i].ViewIndication()
        }
    }

    redo()
    {
        this.excute();
    }

    remove()
    {
        this.SelectedPoints = null;
        this.TempRestraints = null;
        this.Restraint = null;
    }
}

class RotateFrame
{
    constructor(degree)
    {
        this.rad = degree * Math.PI / 180;
        this.SelectedFrames = [];
        this.TempRotations = []; 
        for(let i = 0; i < DrawLine.SelectedLines.length; i++)
        {
            this.SelectedFrames.push(DrawLine.SelectedLines[i]);
            this.TempRotations.push(DrawLine.SelectedLines[i].Frame.Rotation)
        }
    }
    excute()
    {
        for(let i = 0; i < this.SelectedFrames.length; i++)
        {
            this.SelectedFrames[i].Frame.Rotation = this.rad;
            secUpdated = true;
        }
    }
    undo()
    {
        for(let i = 0; i < this.SelectedFrames.length; i++)
        {
            this.SelectedFrames[i].Frame.Rotation = this.TempRotations[i];
            secUpdated = true;
        }
    }
    redo()
    {
        for(let i = 0; i < this.SelectedFrames.length; i++)
        {
            this.SelectedFrames[i].Frame.Rotation = this.rad;
            secUpdated = true;
        }
    }
    remove()
    {
        this.SelectedFrames=[];
        this.TempRotations=[]; 
    }
}


init();

function init()
{
 // Create scene
 scene = new THREE.Scene();
 
// Add camera
camera = new THREE.PerspectiveCamera
(
    // fild view
    45,
    // Aspect ratio
    window.innerWidth/window.innerHeight,
    // near clip
    1,
    // far clip
    1000
);
camera.up = new THREE.Vector3( 0, 0, 1 );
camera.position.z = 40;
camera.position.y = 25;
camera.position.x = 40;

camera.lookAt(8,0,16);
THREE.Object3D.DefaultUp.set(0, 0, 1);

// create light
var light = GetLight(1.5);
light.position.x = 0;
light.position.z = 100;
light.position.y = 100;
var BackLight = GetLight(1.5);

BackLight.position.x = 0;
BackLight.position.z = 100;
BackLight.position.y = -100;

// Mouse
mouse = new THREE.Vector2();
raycaster = new THREE.Raycaster();

// add to scene
scene.add(light);
scene.add(BackLight);
scene.add(new THREE.AmbientLight(0xAAAAAA));

// Initiate selection mode to true
SelectionModeActive = true;

// Renderer
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio*1.3);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor('rgb(250,250,250)');

controls = new MapControls(camera, renderer.domElement);

document.getElementById('webgl').appendChild(renderer.domElement);
update(renderer, scene, camera, controls);

return scene;

}

// Camera aspect in Case of window resize
window.addEventListener('resize',()=>{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

// Light function
function GetLight(intensity)
{
    var light = new THREE.PointLight(
        'rgb(255,255,255)', intensity
    );
    return light;
}


GetGlobalArrows();
function resetPoints()
{
    if(group != null){
        for(let i = 0; i < group.children.length; i++)
        {
            if(group.children[i].material)
            {
                group.children[i].material.alphaTest = 0.1;
                group.children[i].material.opacity = 0;
            }
        }
    }   
}

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function hover() 
{
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
    if(group != null)
    {
        const intersects = raycaster.intersectObjects(group.children);
        for ( let i = 0; i < intersects.length; i ++) {
            intersects[i].object.material.transparent = true;
            intersects[i].object.material.opacity= 1; 
            var Scale = intersects[i].distance/18;
            intersects[i].object.scale.set(Scale, Scale, 1); 
            intersects[i].object.lookAt(camera.position);
            
        }
    }	
}

document.addEventListener('keydown',  function ( event ) {
    if(event.key == 'q')
    {
        alert(DrawLine.DrawLinesArray.length)
    }
})
document.addEventListener('keydown',  function ( event ) {
    if(event.key == 'p')
    {
        alert.log(DrawLine.GetDrawnFrames()[0].Section)
    }
})
document.addEventListener('keydown',  function ( event ) {
    if(event.key == 'w')
    {
        alert(Point.SelectedPoints.length)
    }
})

function ClickToDrawLine(event)  
{
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

    if(group != null)
    {
	    // calculate objects intersecting the picking ray
	    const intersects = raycaster.intersectObjects(group.children);

        var pos_x, pos_y, pos_z;

        if(event.button === 0)
        {
	        if(intersects.length > 0) {
                if(points.length <6)
                {
                    pos_x = intersects[0].object.position.x;
                    pos_y = intersects[0].object.position.y;
                    pos_z = intersects[0].object.position.z;
                    //points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) );
                    points.push(pos_x );
                    points.push(pos_y );
                    points.push(pos_z );
                }
                if(points.length == 6 && points[0] == points[3] && points[1] == points[4] && points[2] == points[5]  )
                {
                    points = []
                }
                else if(points.length == 6)
                {
                    commands.excuteCommand(new DrawLine(new FrameElement(points,GetSelectedSection())));
                    points = [];
                }
            }
	    }
    }
}

//#region Keys
document.addEventListener('keydown', function(event){
	if(event.key === "Escape"){
		points = [];
        DrawingModeActive = false;
        SelectionModeActive = true;
        Unselect();
	}
    if(event.key === "Enter"){
		points = [];
	}
    if(event.key === "z" && event.ctrlKey){
		Undo();
	}
    if(event.key === "y" && event.ctrlKey){
		Redo();
	}
    if( event.key === "Z" && event.shiftKey && event.ctrlKey){
		Redo();
	}
    if(event.shiftKey || event.ctrlKey){
        SelectionModeActive = false;
    }
    if(event.key === "Delete"){
        DeleteButton();
    }
});

document.addEventListener("keyup", function(){
    if(DrawingModeActive == false)
    {
        SelectionModeActive = true;
    }  
});
//#endregion

document.getElementById("Undo").onclick=function(){Undo()};
function Undo()
{
    commands.undoCommand();
    Unselect();
}

document.getElementById("Redo").onclick=function(){Redo()};
function Redo()
{
    commands.redoCommand();
    Unselect();
}

document.getElementById("Delete").onclick=function(){DeleteButton()};
function DeleteButton()
{
    commands.excuteCommand(new Delete(DrawLine.SelectedLines));
}


document.getElementById("Copy").onclick=function(){CopyButton()};
function CopyButton()
{
    const delta = [5,5,5]
    commands.excuteCommand(new Copy(delta));
}

document.getElementById("Move").onclick=function(){MoveButton()};
function MoveButton()
{
    const delta = [5,5,5]
    commands.excuteCommand(new Move(delta));
}


document.getElementById("Extrude").onclick=function(){Extrude()};
function Extrude()
{   
    state = false;
    DrawLine.ExtrudeView();
    document.getElementById("Labels").checked = false;                     
    document.getElementById("Sections").checked = false;
    Labels();
}

document.getElementById("Standard").onclick=function(){Standard()};
function Standard(){   
    state = true; 
    DrawLine.StandardView();
}


document.getElementById("Labels").onclick=function(){Labels()};
document.getElementById("Sections").onclick=function(){Labels()};
function Labels()
{   
    var checkBox_labels = document.getElementById("Labels");
    var checkBox_sections = document.getElementById("Sections");
    if(checkBox_labels.checked == true)
    {
        Standard();
        DrawLine.DisplayLabels();
    }
    else{
        DrawLine.HideLabels();
    }
    if(checkBox_sections.checked == true)
    {
        Standard();
        DrawLine.DisplaySectionNames();
    }
    else
    {
      DrawLine.HideSectionNames();
    } 
}

document.getElementById("Draw").onclick=function(){DrawingMode()};
function DrawingMode()
{
    DrawingModeActive = true;
    SelectionModeActive = false;
    Unselect();
}

document.addEventListener('dblclick',()=>{
    Unselect();
});












const selection = new THREE.SelectionBox( camera, scene );
const helper = new THREE.SelectionHelper( selection, renderer, 'selectBox' );

document.addEventListener( 'mousedown', function ( event ) {
        if(event.button === 1 || event.button === 2)
        {
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden");
        }
        else{
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "visible");
        }
});
        
document.addEventListener( 'mousedown', function ( event ) {

            if(event.button === 0 && SelectionModeActive == true)
            {  
            selection.startPoint.set(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1,
                0.5 );
            }
} );

document.addEventListener( 'mousemove', function ( event ) {
            if(event.button === 0 && SelectionModeActive == true)
            {
            if (helper.isDown) {
                selection.endPoint.set(
                    ( event.clientX / window.innerWidth ) * 2 - 1,
                    - ( event.clientY / window.innerHeight ) * 2 + 1,
                    0.5 );
                }
            }
   } );

document.addEventListener( 'mouseup', function ( event ) {
    if(event.button === 0 && SelectionModeActive == true)
    {
    selection.endPoint.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5 );
    
    const allSelected = selection.select();
    const selectedDots = allSelected.filter(obj=>obj.isPoints);
    const filterselected = allSelected.filter(obj=>obj.isLine && obj.material.opacity == 0.1);

    let selectedLines = [];
    filterselected.forEach((c) => {
        if (!selectedLines.includes(c)) {
            selectedLines.push(c);
        }});

    for ( let i = 0; i < selectedLines.length; i ++ ) {
            if(selectedLines[i].DrawLine.Selected == false){
               selectedLines[i].DrawLine.Selected = true;
               selectedLines[i].DrawLine.updateColors();
               DrawLine.SelectedLines.push(selectedLines[i].DrawLine);
            }
        }

    for(let i = 0; i < selectedDots.length; i++){
        for(let j = 0; j < Point.PointsArray.length; j++)
        {
            if(Point.PointsArray[j].Selected == false && selectedDots[i].uuid == Point.PointsArray[j].dot.uuid)
            {
                Point.PointsArray[j].Selected = true;
                Point.PointsArray[j].Highlight();
                Point.SelectedPoints.push(Point.PointsArray[j]); 
            }
        }
    }
    }
} );


function ClickToSelectElement(event){
    
    raycaster.setFromCamera(mouse,camera);
    raycaster.params.Line.threshold = 0.1;
    raycaster.params.Points.threshold = 0.2;
    var intersects =  raycaster.intersectObjects(scene.children);
    const filteredDots = intersects.filter(obj=>obj.object.isPoints);
    const filterselected = intersects.filter(obj=>obj.object.hasOwnProperty('DrawLine'));
    
    if(event.button === 0) 
    {
        if(filteredDots.length == 0){
            for(let i =0; i < filterselected.length; i++)
            {           
                if(filterselected[i].object.DrawLine.Selected == false){
                
                    filterselected[i].object.DrawLine.Selected = true;
                    filterselected[i].object.DrawLine.updateColors();
                    DrawLine.SelectedLines.push(filterselected[i].object.DrawLine);
                }
                else{
                    filterselected[i].object.DrawLine.Selected = false;
                    filterselected[i].object.DrawLine.updateColors();
                    DrawLine.SelectedLines.pop(filterselected[i].object.DrawLine);
                }
            }    
        }
        else{
            for(let i = 0; i < filteredDots.length; i++){
                for(let j = 0; j < Point.PointsArray.length; j++)
                {
                    if(filteredDots[i].object.uuid == Point.PointsArray[j].dot.uuid){
                        if(Point.PointsArray[j].Selected == false)
                        {
                            Point.PointsArray[j].Selected = true;
                            Point.PointsArray[j].Highlight();
                            Point.SelectedPoints.push(Point.PointsArray[j]); 
                        }
                        else{
                            Point.PointsArray[j].Selected = false;
                            Point.PointsArray[j].Highlight();
                            Point.SelectedPoints.pop(Point.PointsArray[j]); 
                        }
                    }
                }
            }
        }
    }
}


function Unselect()
{
    while(DrawLine.SelectedLines.length > 0)
    {
       DrawLine.SelectedLines[0].Selected = false;
       DrawLine.SelectedLines[0].updateColors();
       DrawLine.SelectedLines.shift();
    }
    while(Point.SelectedPoints.length > 0)
    {
        Point.SelectedPoints[0].Selected = false;
        Point.SelectedPoints[0].Highlight();
        Point.SelectedPoints.shift();
    }
}




function update(renderer, scene, camera, controls)
{
    
    window.addEventListener( 'mousemove', onMouseMove, false );

    renderer.render(scene, camera);
    controls.update();
    //stats.update();

    for (let i = 0; i < Point.SelectedPoints.length; i++)
    {
        Point.SelectedPoints[i].crosshair.lookAt(camera.position);
    }

    resetPoints();

    if( secAssigned && DrawLine.SelectedLines.length){
        commands.excuteCommand( new AssignFrameSection( assignedSection ) );
        secAssigned = false
    }
    if(secUpdated && !state){
        DrawLine.DrawLinesArray.forEach( drawLine=> drawLine.ReExtrude());
        secUpdated = false
    }
    if(DrawingModeActive == true)
    {
        window.addEventListener( 'click', ClickToDrawLine, false );
        hover();
        SelectionModeActive == false;
    }
    else{
        window.removeEventListener( 'click', ClickToDrawLine, false );
        SelectionModeActive == true;
    }
    
    if(SelectionModeActive == true){    
        window.addEventListener('click',ClickToSelectElement,false);
    } 
    else{
        document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden");
        window.removeEventListener('click',ClickToSelectElement,false);
    }

    requestAnimationFrame(function(){
        update(renderer, scene, camera, controls);
    });
}



// for grids

document.querySelector('#grids-btn').addEventListener("click",function(){
    if(!document.querySelector('.main-window')){
        $('body').append(GetGridsWin());
        LoadGridsData('grids-x',listx,xGridsNames);
        LoadGridsData('grids-y',listy,yGridsNames);
        LoadGridsData('grids-z',listz,zGridsNames);
        document.querySelector(`#grids-x-part .info`).addEventListener("click",function(){AddGrid('grids-x',listx, xGridsNames)});
        document.querySelector(`#grids-y-part .info`).addEventListener("click",function(){AddGrid('grids-y',listy,yGridsNames)});
        document.querySelector(`#grids-z-part .info`).addEventListener("click",function(){AddGrid('grids-z',listz,zGridsNames)});

        document.querySelector('#grids-window').addEventListener("click",function(){

            if(GetActiveGrid('grids-x')){
                let activeGrid = GetActiveGrid('grids-x');
                document.querySelector(`#grids-x-part .default`).addEventListener("click", function(){
                    if(activeGrid) activeGrid.remove();
                });
            }
            if(GetActiveGrid('grids-y')){
                let activeGrid = GetActiveGrid('grids-y');
                document.querySelector(`#grids-y-part .default`).addEventListener("click", function(){
                    if(activeGrid) activeGrid.remove();
                });
            }
            if(GetActiveGrid('grids-z')){
                let activeGrid = GetActiveGrid('grids-z');
                document.querySelector(`#grids-z-part .default`).addEventListener("click", function(){
                    if(activeGrid) activeGrid.remove();
                });
            }
        })
        
        
        document.querySelector('#grids-ok').addEventListener("click", function(){
            ReadGrids('grids-x',listx, xGridsNames);
            ReadGrids('grids-y',listy,yGridsNames);
            ReadGrids('grids-z',listz,zGridsNames);
            if(!listx.length || !listy.length || !listz.length){
                Metro.dialog.create({
                    title: "Invalid Grids Data",
                    content: "<div>You must input at least one spacing as positive number in each direction</div>",
                    closeButton: true
                });
            }else{
                ThreeD();
                if(group != null)
                {
                    scene.remove(group);
                    gridLines.forEach(element => {
                        element.material.dispose()
                        element.geometry.dispose()
                        scene.remove(element);
                    });
                    gridLines = [];
                    for (var i = group.children.length - 1; i >= 0; i--) {
                        group.children[i].material.dispose();
                        group.children[i].geometry.dispose();
                        group.remove(group.children[i]);
                    }
                    removeSelectionGrids();
                }
                
                GridSelections();
                group = GridPoints(listx,listy,listz,listx.length,listy.length,listz.length);
                gridLines = GridLine(listx,listy,listz,listx.length,listy.length,listz.length);
                scene.add(group);
                gridLines.forEach(element => {
                    scene.add(element);
                });
                
                document.querySelector('#grids-window').parentElement.parentElement.remove();
                gridsUpdated=true;
            }
        });

        document.querySelector('#grids-close').addEventListener("click",function(){
            document.querySelector('#grids-window').parentElement.parentElement.remove();
        });
        
        
    }
});


if(gridLines == null){
    listx = [6,6,6]
    listy = [4,4,4]
    listz = [3,3,3] 
    GridSelections()
    group = GridPoints(listx,listy,listz,listx.length,listy.length,listz.length);
    scene.add(group);
    
    gridLines = GridLine(listx,listy,listz,listx.length,listy.length,listz.length);
    gridLines.forEach(element => {
        scene.add(element);
    });
}


 
function GridSelections()
{
    const xy = document.getElementById("XY");
    var position = 0;
    for (let i = 0; i <= listz.length; i++)
    {
        const option = document.createElement("option");
        option.text = "Z = "+position;
        xy.add(option, xy[i]);
        position += listz[i];
    }
    
    const xz = document.getElementById("XZ");
    position = 0;
    for (let i = 0; i <= listy.length ; i++)
    {
        const option = document.createElement("option");
        option.text = "Y = "+position;
        xz.add(option, xz[i]);
        position += listy[i];
    }
    
    const yz = document.getElementById("YZ");
    position = 0;
    for (let i = 0; i <= listx.length; i++)
    {
        const option = document.createElement("option");
        option.text = "X = "+position;
        yz.add(option, yz[i]);
        position += listx[i];
    }
}

function removeSelectionGrids()
{
    const xy = document.getElementById("XY");
    for (let i = xy.length - 1; i >= 0; i--) {
        xy.remove(i);
    }
    
    const xz = document.getElementById("XZ");
    for (let i = xz.length - 1; i >= 0; i--) {
        xz.remove(i);
    }
    
    const yz = document.getElementById("YZ");
    for (let i = yz.length - 1; i >= 0; i--) {
        yz.remove(i);
    }
}

 






document.getElementById("XYSection").onclick=function(){XYSection()};
function XYSection()
{
    resetScene();
    view = "XY";
    const xy = document.getElementById("XY");
    for (let i =0; i< xy.length; i++) { 
        if (document.querySelector('#XY').options[i].selected == true)
        {
            XYindex = i;
            break;
        }
        else{
            XYindex = 0;
        }
    }
    XYView(XYindex);
}

function XYView(XYindex)
{
    const distanceX = listx.reduce((a, b) => a + b, 0);
    const distanceY = listy.reduce((a, b) => a + b, 0);
    ViewPosition = 0;
    for (let j = 0; j < XYindex; j++){
        ViewPosition += listz[j];
    }
    
    for (let j = group.children.length-1; j >= 0  ; j--) {
        if(group.children[j].position.z != ViewPosition)
        {
            HiddenSnapping.push(group.children[j]);
            group.remove(group.children[j]);
        }
    }
    for(let j = 0; j < gridLines.length; j++)
    {
        if(gridLines[j].geometry.attributes.position.array[2] != ViewPosition || gridLines[j].geometry.attributes.position.array[5] != ViewPosition){
            HiddenGrids.push(gridLines[j]);
            scene.remove(gridLines[j]);
        }
    }
    for (let j = 0; j < DrawLine.DrawLinesArray.length; j++)
    {
        DrawLine.DrawLinesArray[j].InView();
    }
    for (let j = 0; j < Point.PointsArray.length; j++)
    {
        Point.PointsArray[j].InView();
    }
    camera.position.x = distanceX/2;
    camera.position.y = distanceY/2;
    camera.position.z = Math.max(distanceX, distanceY)*1.5 + ViewPosition;
    controls.enableRotate = false;
    controls.target = new THREE.Vector3(camera.position.x, camera.position.y, 0);
    
    //Modefy coordinates arrows
    const origin = new THREE.Vector3( -2, -2, ViewPosition );
    arrowHelperX = new THREE.ArrowHelper( dirX, origin, length, hexX, headLength, headWidth );
    arrowHelperY = new THREE.ArrowHelper( dirY, origin, length, hexY, headLength, headWidth );
    arrows.add(arrowHelperX);
    arrows.add(arrowHelperY);

    txSpriteX = makeTextSprite( "X", 0.6, -2, ViewPosition, { fontsize: 200, fontface: "Georgia", textColor: { r:204, g:1, b:1, a:1.0 }, vAlign:"center", hAlign:"center" } );
    scene.add( txSpriteX );  
    txSpriteY = makeTextSprite( "Y", -2, 0.6, ViewPosition, { fontsize: 200, fontface: "Georgia", textColor: { r:6, g:117, b:201, a:1.0 }, vAlign:"center", hAlign:"center" } );
    scene.add( txSpriteY );  

    document.getElementById("StatusBar").innerHTML = "Z = " + ViewPosition + "m" ; 
}

document.getElementById("XZSection").onclick=function(){XZSection()};
function XZSection()
{
    resetScene();
    view = "XZ";
    const xz = document.getElementById("XZ");
    for (let i =0; i< xz.length; i++) {
        if (document.querySelector('#XZ').options[i].selected == true)
        {
            XZindex = i;
            break;
        }
        else{
            XZindex = 0;
        }
    }
    XZView(XZindex);
}

function XZView(XZindex){
    const distanceX = listx.reduce((a, b) => a + b, 0);
    const distanceZ = listz.reduce((a, b) => a + b, 0);
    ViewPosition = 0;
    for (let j = 0; j < XZindex; j++){
        ViewPosition += listy[j];
    }
    for (let j = group.children.length-1; j >= 0  ; j--) {
        if(group.children[j].position.y != ViewPosition)
        {
            HiddenSnapping.push(group.children[j]);
            group.remove(group.children[j]);
        }
    }

    for(let j = 0; j < gridLines.length; j++)
    {
        if(gridLines[j].geometry.attributes.position.array[1] != ViewPosition || gridLines[j].geometry.attributes.position.array[4] != ViewPosition){
            HiddenGrids.push(gridLines[j]);
            scene.remove(gridLines[j]);
        }
    }
    for (let j = 0; j < DrawLine.DrawLinesArray.length; j++)
    {
        DrawLine.DrawLinesArray[j].InView();
    }
    for (let j = 0; j < Point.PointsArray.length; j++)
    {
        Point.PointsArray[j].InView();
    }
    camera.up.set( 0, 0.5, 0.5 );
    camera.position.x = distanceX/2;
    camera.position.y = Math.max(distanceX,distanceZ)*1.5 + ViewPosition;
    camera.position.z = distanceZ/2;
    controls.enableRotate = false;
    controls.target = new THREE.Vector3(camera.position.x, 0, camera.position.z);

    //Modify coordinates arrows
    const origin = new THREE.Vector3( -2, ViewPosition, -2 );
    arrowHelperX = new THREE.ArrowHelper( dirX, origin, length, hexX, headLength, headWidth );
    arrowHelperZ = new THREE.ArrowHelper( dirZ, origin, length, hexZ, headLength, headWidth );
    arrows.add(arrowHelperX);
    arrows.add(arrowHelperZ);

    txSpriteX = makeTextSprite( "X", 0.6, ViewPosition, -2, { fontsize: 200, fontface: "Georgia", textColor: { r:204, g:1, b:1, a:1.0 }, vAlign:"center", hAlign:"center" } );
    scene.add( txSpriteX ); 
    txSpriteZ = makeTextSprite( "Z", -2, ViewPosition,0.6, { fontsize: 200, fontface: "Georgia", textColor: { r:5, g:166, b:96, a:1.0 }, vAlign:"center", hAlign:"center" } );
    scene.add( txSpriteZ );  

    document.getElementById("StatusBar").innerHTML = "Y = " + ViewPosition + "m" ; 
}

document.getElementById("YZSection").onclick=function(){YZSection()};
function YZSection()
{
    resetScene();
    view = "YZ";
    const yz = document.getElementById("YZ");
    for (let i =0; i< yz.length; i++) {
        if (document.querySelector('#YZ').options[i].selected == true)
        {
            YZindex = i;
            break;
        }
        else{
            YZindex = 0;
        }
    }
    YZView(YZindex);
      
}

function YZView(YZindex){
    const distanceY = listy.reduce((a, b) => a + b, 0);
    const distanceZ = listz.reduce((a, b) => a + b, 0);
    ViewPosition = 0;
    for (let j = 0; j < YZindex; j++){
        ViewPosition += listx[j];
    }
    for (let j = group.children.length-1; j >= 0  ; j--) {
        if(group.children[j].position.x != ViewPosition)
        {
            HiddenSnapping.push(group.children[j]);
            group.remove(group.children[j]);
        }
    }

    for(let j = 0; j < gridLines.length; j++)
    {
        if(gridLines[j].geometry.attributes.position.array[0] != ViewPosition || gridLines[j].geometry.attributes.position.array[3] != ViewPosition){
            HiddenGrids.push(gridLines[j]);
            scene.remove(gridLines[j]);
        }
    }
    for (let j = 0; j < DrawLine.DrawLinesArray.length; j++)
    {
        DrawLine.DrawLinesArray[j].InView();
    }
    for (let j = 0; j < Point.PointsArray.length; j++)
    {
        Point.PointsArray[j].InView();
    }

    camera.position.x = Math.max(distanceY, distanceZ)*1.7 + ViewPosition;
    camera.position.y = distanceY/2 ;
    camera.position.z = distanceZ/2 ;
    camera.up.set( 0.5, 0, 0.5 );
    controls.enableRotate = false;
    controls.target = new THREE.Vector3(0, camera.position.y, camera.position.z);

    // Modify coordinates arrows
    const origin = new THREE.Vector3( ViewPosition, -2, -2 );
    arrowHelperY = new THREE.ArrowHelper( dirY, origin, length, hexY, headLength, headWidth );
    arrowHelperZ = new THREE.ArrowHelper( dirZ, origin, length, hexZ, headLength, headWidth );
    arrows.add(arrowHelperY);
    arrows.add(arrowHelperZ);

    txSpriteY = makeTextSprite( "Y", ViewPosition, 0.6, -2, { fontsize: 200, fontface: "Georgia", textColor: { r:6, g:117, b:201, a:1.0 }, vAlign:"center", hAlign:"center" } );
    scene.add( txSpriteY ); 
    txSpriteZ = makeTextSprite( "Z", ViewPosition, -2, 0.6, { fontsize: 200, fontface: "Georgia", textColor: { r:5, g:166, b:96, a:1.0 }, vAlign:"center", hAlign:"center" } );
    scene.add( txSpriteZ );

    document.getElementById("StatusBar").innerHTML = "X = " + ViewPosition + "m" ; 
}

document.getElementById("ThreeD").onclick=function(){ThreeD()};
function ThreeD()
{
    if(HiddenGrids.length>0){
        resetScene();

        // Reset coordinates arrows
        arrowHelperX = new THREE.ArrowHelper( dirX, origin, length, hexX, headLength, headWidth );
        arrowHelperY = new THREE.ArrowHelper( dirY, origin, length, hexY, headLength, headWidth );
        arrowHelperZ = new THREE.ArrowHelper( dirZ, origin, length, hexZ, headLength, headWidth );
        arrows.add( arrowHelperX );
        arrows.add( arrowHelperY );
        arrows.add( arrowHelperZ );
        
        txSpriteX = makeTextSprite( "X", -0.25, -3, 0, { fontsize: 210, fontface: "Georgia", textColor: { r:204, g:1, b:1, a:1.0 },vAlign:"center", hAlign:"center" } );
         scene.add( txSpriteX );  
        txSpriteY = makeTextSprite( "Y", -3, -0.25, 0, { fontsize: 210, fontface: "Georgia", textColor: { r:6, g:117, b:201, a:1.0 },vAlign:"center", hAlign:"center" } );
         scene.add( txSpriteY );  
        txSpriteZ = makeTextSprite( "Z", -3, -3, 2.8, { fontsize: 210, fontface: "Georgia", textColor: { r:5, g:166, b:96, a:1.0 },vAlign:"center", hAlign:"center" } );
         scene.add( txSpriteZ );  
    }
    camera.position.x = 45;
    camera.position.y = 25;
    camera.position.z = 45;
    controls.enableRotate = true;

    document.getElementById("StatusBar").innerHTML = "3D-View"; 
}

document.getElementById("Next").onclick=function(){Next()};
function Next()
{
    if(view == 'XY'){
        resetScene();
        view = 'XY';
        XYindex += 1;
        if(XYindex > listz.length){XYindex = 0;}
        XYView(XYindex);
    }
    else if(view == 'XZ'){
        resetScene();
        view = 'XZ';
        XZindex += 1;
        if(XZindex > listy.length){XZindex = 0;}
        XZView(XZindex);
    }
    else if(view == 'YZ'){
        resetScene();
        view = 'YZ';
        YZindex += 1;
        if(YZindex > listx.length){YZindex = 0;}
        YZView(YZindex);
    }
}

document.getElementById("Prev").onclick=function(){Previous()};
function Previous()
{
    switch(view)
    {
        case 'XY':
            resetScene();
            view = 'XY';
            XYindex -= 1;
            if(XYindex < 0 ){XYindex = listz.length;}
            XYView(XYindex);
            break;
        case 'XZ':
            resetScene();
            view = 'XZ';
            XZindex -= 1;
            if(XZindex < 0 ){XZindex = listy.length;}
            XZView(XZindex);
            break;
        case 'YZ':
            resetScene();
            view = 'YZ';
            YZindex -= 1;
            if(YZindex < 0){YZindex = listx.length;}
            YZView(YZindex);
            break;
    }  
}

function resetScene()
{
    view = "";
    camera.up.set( 0, 0, 1 );
    controls.enableRotate = true;
    removeArrows();
    // Reset all hidden elements to scene
    while(HiddenSnapping.length>0)
    {
        group.add(HiddenSnapping[0]);
        HiddenSnapping.shift();
    }
    while(HiddenGrids.length>0)
    {
        scene.add(HiddenGrids[0]);
        HiddenGrids.shift();
    }
    for(let i = 0; i < DrawLine.DrawLinesArray.length; i++)
    {
        DrawLine.DrawLinesArray[i].InView();
    }
    for(let i = 0; i < Point.PointsArray.length; i++)
    {
        Point.PointsArray[i].InView();
    }
}

function removeArrows()
{
    arrows.remove( arrowHelperX );
    scene.remove(txSpriteX);
    arrows.remove( arrowHelperY );
    scene.remove(txSpriteY);
    arrows.remove( arrowHelperZ );
    scene.remove(txSpriteZ);
}





















document.getElementById("AddPoints").onclick=function(){AddPointsToFrame()};
function AddPointsToFrame()
{
    var number = prompt("Add points at equal intervals of frame element", "Number of points");
    if(!isNaN(number)){
        const selected = DrawLine.GetSelectedFrames();
        for (let i =0; i<selected.length; i++)
        {
            selected[i].AddPointsAtEqualDistances(number);
        }
    }
}




//#region // Results visualization
function ResultLines(length, x,y,z, startPoint, endPoint,  direction, rz, scale = 1) // , local = false)
{
    startPoint = new THREE.Vector3(startPoint[0], startPoint[1], startPoint[2]);
    endPoint = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);

    const axis = new THREE.Vector3().subVectors(startPoint, endPoint).normalize(); // Z-local direction
 
    let x_axis = crossProduct([axis.x, axis.y, axis.z], [0,0,1]);
    if(arrayEquals(x_axis,[0,0,0]))
    {
        x_axis = [0,1,0]
    }
    const y_axis = crossProduct([axis.x, axis.y, axis.z], x_axis);
    const X_axis = new THREE.Vector3(x_axis[0], x_axis[1], x_axis[2]);
    const Y_axis = new THREE.Vector3(y_axis[0], y_axis[1], y_axis[2]);

    const material = new THREE.LineBasicMaterial();
    if(length > 0)
    {
        material.color = {r:0,g:0,b:180}
    }
    else{
        material.color = {r:180,g:0,b:0}
    }
 
    const l = length *scale;
    var geometry = new THREE.BufferGeometry();
    var vertices =[];  

    // if(local == false)
    // {
    //     if(direction == 1 || direction )
    //     vertices.push(0, 0, 0);
    //     vertices.push(0, 0, l);
    //     geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    // }
    // else
    // {
    if(direction == 2 || direction == 1)
    {
        vertices.push(0, 0, 0);
        vertices.push(l*Y_axis.x, l*Y_axis.y, l*Y_axis.z);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    else if(direction == 3){
        vertices.push(0, 0, 0);
        vertices.push(l*X_axis.x, l*X_axis.y, l*X_axis.z);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    //}
    var line = new THREE.Line( geometry, material );

    line.position.x = x;
    line.position.y = y;
    line.position.z = z;
    line.rotateOnAxis(axis, rz)
    scene.add(line);
    return vertices;
}

// This function assumes results are from points distributed equally along the frame
function ResultsDiagram(results ,startPoint, endPoint, direction, rz, scale = 1, local = false)
{
    const StartPoint = new THREE.Vector3( startPoint[0], startPoint[1], startPoint[2]);
    const EndPoint = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);

    const load = new THREE.Group();
    const distance = new THREE.Vector3().subVectors(StartPoint, EndPoint).length();
 
    const dX = (EndPoint.x - StartPoint.x );
    const dY = (EndPoint.y - StartPoint.y );
    const dZ = (EndPoint.z - StartPoint.z );

    const max = Math.max(...results);
    const min = Math.min(...results);
    const material = new THREE.LineBasicMaterial({color:'rgb(0,0,0)'});
    const number = results.length -1;
    const geometry = new THREE.BufferGeometry();
    var vertices =[];  
    vertices.push(StartPoint.x, StartPoint.y, StartPoint.z);

    for (let i = 0; i <= number ; i++)
    {
        const x = StartPoint.x + (dX*i/number); 
        const y = StartPoint.y + (dY*i/number);
        const z = StartPoint.z + (dZ*i/number);
        
        const line = ResultLines(results[i], x, y, z, startPoint, endPoint,direction, rz, 1, local);
 
        vertices.push(line[3]+ x, line[4]+ y, line[5]+ z);
        let position = 0;
        var color;
        if(results[i]>=0){
            position -= 0.1;
            color = {r:0,g:0,b:180,a:1}
        }
        else{
            position += 0.1;
            color = {r:180,g:0,b:0,a:1}
        }
        if(i == 0 || i == number || results[i] == max || results[i] == min)
        {
            if(direction ==1 || direction ==2 || results[i] == max || results[i] == min)
            {
                const textPosition = [line[3]+ x, line[4]+ y, line[5]+ z+ position];
                const txt = makeTextSprite( results[i], textPosition[0], textPosition[1], textPosition[2],{fontsize: 80, fontface: "Georgia", textColor:color,
                    vAlign:"center", hAlign:"center"});
                    load.add(txt);
            }
            else{
                const textPosition = [line[3]+ x + + position, line[4]+ y + position, line[5]+ z];
                const txt = makeTextSprite( results[i], textPosition[0], textPosition[1], textPosition[2],{fontsize: 80, fontface: "Georgia", textColor:color,
                    vAlign:"center", hAlign:"center"});
                    load.add(txt);
            }
        }
        //load.add(arrow);
    }

    vertices.push(EndPoint.x, EndPoint.y, EndPoint.z);
    
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    const container = new THREE.Line( geometry, material );
    load.add(container)
    scene.add(load)
}
//#endregion

function GetMaxLoad (pattern){
    let frames = DrawLine.GetDrawnFrames();
    let maxLoads = [];
    for (const frame of frames) {
        let loads = frame.LoadsAssigned.get(pattern);
        for(const load of loads){
            if(load.Magnitude instanceof Array){
                let absvals = [];
                load.Magnitude.forEach(value => absvals.push(Math.abs(value)) );
                maxLoads.push(Math.max(...absvals));
            } 
            else maxLoads.push(Math.abs(load.Magnitude));
        }
    }
    return Math.max(...maxLoads);
}







document.getElementById("Run").onclick=function(){Run()};
function Run()
{   
    var OutPut = JSON.stringify(DrawLine.GetDrawnFrames());
    console.log(OutPut)
    // $.ajax({
    //     type: "POST",
    //     url: "http://192.168.1.10:8080/Main.html",                   ///// URL must be specified
    //     contentType: "application/json; charset=utf-8",
    //     dataType: "json",
    //     data: "{Frames: " + OutPut + "}",
    //     cache: false,
    //     success: function (result) {
    
    //     },
    //     error: function (ex) {
    //         WriteToConsole(ex.responseText);
    //     }
    // });


// var fs = require('fs');
// fs.writeFile("OutPut.json", OutPut, function(err) {
//     if (err) {
//         console.log(err);
//     }
// });
}




function DrawHinge(position)
{
    const material = new THREE.LineBasicMaterial({ alphaTest:1, opacity:1 });
    material.color = {r:0, g:0.4, b: 0.25, a:1};
    let geometry = new THREE.BufferGeometry();
    let vertices =[];  
    vertices.push(0 ,0 ,0);
    vertices.push(0.35, 0, -0.35);
    vertices.push(-0.35, 0, -0.35);
    vertices.push(0 ,0 ,0);
    vertices.push(0, 0.35, -0.35);
    vertices.push(0, -0.35, -0.35);
    vertices.push(0 ,0 ,0);
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    let hinge = new THREE.Line( geometry, material );
    hinge.position.x = position[0];
    hinge.position.y = position[1];
    hinge.position.z = position[2];
    return hinge;
}

function DrawFix(position)
{
    const material = new THREE.LineBasicMaterial();
    material.color = {r:0, g:0.4, b: 0.25, a:1};
    let geometry = new THREE.BufferGeometry();
    let vertices =[];  
    vertices.push(0 ,0 ,0);
    vertices.push(0.45, 0, 0);
    vertices.push(0.45, 0, -0.35);
    vertices.push(-0.45, 0, -0.35);
    vertices.push(-0.45, 0, 0);
    vertices.push(0 ,0 ,0);
    vertices.push(0, 0.45, 0);
    vertices.push(0, 0.45, -0.35);
    vertices.push(0, -0.45, -0.35);
    vertices.push(0, -0.45, 0);
    vertices.push(0 ,0 ,0);
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    const fix = new THREE.Line( geometry, material );
    fix.position.x = position[0];
    fix.position.y = position[1];
    fix.position.z = position[2];
    return fix;
}


function DrawRoller(position)
{
    const material = new THREE.LineBasicMaterial();
    material.color = {r:0, g:0.4, b: 0.25, a:1};
    let geometry = new THREE.BufferGeometry();
    let vertices =[];  
    vertices.push(0 ,0 ,0);
    vertices.push(0.35, 0, -0.35);
    vertices.push(-0.35, 0, -0.35);
    vertices.push(0 ,0 ,0);
    vertices.push(0, 0.35, -0.35);
    vertices.push(0, -0.35, -0.35);
    vertices.push(0 ,0 ,0);
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    let roller = new THREE.Line( geometry, material );

    const curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        0.12, 0.12,           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );

    const points = curve.getPoints( 15 );
    const circleGeometry = new THREE.BufferGeometry().setFromPoints( points );

    let rollersCordinates = [[0,0,-0.35*1.35,22/14,0],[0,0,-0.35*1.35,0,22/14]];
    for(let i = 0; i < 2; i++)
    {
        const circle = new THREE.Line( circleGeometry, material );
        circle.position.x = rollersCordinates[i][0];
        circle.position.y = rollersCordinates[i][1];
        circle.position.z = rollersCordinates[i][2];
        circle.rotation.x = rollersCordinates[i][3];
        circle.rotation.y = rollersCordinates[i][4];
        roller.add(circle);
    }
    let vertex = []
    vertex.push(0.2, 0, -0.35*1.7);
    vertex.push(-0.2, 0, -0.35*1.7);
    vertex.push(0 ,0 ,-0.35*1.7);
    vertex.push(0, 0.2, -0.35*1.7);
    vertex.push(0, -0.2, -0.35*1.7);

    let BottomGeometry = new THREE.BufferGeometry();
    BottomGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertex, 3 ) );
    let Lines = new THREE.Line( BottomGeometry, material )
    roller.add(Lines);

    roller.position.x = position[0];
    roller.position.y = position[1];
    roller.position.z = position[2];
    return roller;
}

function DrawPoint(position, alphaTest=0)
{
    let dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
    let dotMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false, alphaTest:alphaTest, transparent: true, opacity: 0.8 } );
    let dot = new THREE.Points( dotGeometry, dotMaterial );
    return dot;
}



document.getElementById("Hinge").onclick=function(){Hinge()};
function Hinge()
{
    if(Point.SelectedPoints.length > 0)
    {
        const restraints = [true, true, true, false, false, false];
        commands.excuteCommand(new AssignRestraints(restraints));
    }
}

document.getElementById("Fix").onclick=function(){Fix()};
function Fix() 
{
    if(Point.SelectedPoints.length > 0)
    {
        const restraints = [true, true, true, true, true, true];
        commands.excuteCommand(new AssignRestraints(restraints));
    }
}

document.getElementById("Roller").onclick=function(){Roller()};
function Roller()
{
    if(Point.SelectedPoints.length > 0)
    {
        const restraints = [true, false, false, false, false, false];
        commands.excuteCommand(new AssignRestraints(restraints));
    }
}

document.getElementById("Free").onclick=function(){Free()};
function Free()
{
    if(Point.SelectedPoints.length > 0)
    {
        const restraints = [false, false, false, false, false, false];
        commands.excuteCommand(new AssignRestraints(restraints));
    }
}

document.getElementById("Rotate").onclick=function(){Rotate()};
function Rotate()
{
    const rotation = 45;
    commands.excuteCommand(new RotateFrame(rotation));
}