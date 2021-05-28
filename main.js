import {MapControls} from './Assets/Three.js files/OrbitControls.js'

// Global variables for init function
var group,
 gridLines,
 scene,
 camera,
 controls,
 raycaster,
 mouse,
 stats,
 renderer,
 ViewPosition;  

 var listx;                // x- axis list grids
 var listy;                // y- axis list grids
 var listz;                // z- axis list grids
 
 var HiddenGrids = [];
 var HiddenSnapping = []; 

 var points = [];                 // Points array for positions of lines for drawing functions
 
 var DrawingModeActive = false;
 var SelectionModeActive;
 var DESCENDER_ADJUST = 1;        // Constant relating to text boarder box height for lables
 var state = true;                // if false then the geometery will be extruded .. a global variable as it is used in mamy functions / classes

 var view;
 var XYindex;
 var XZindex;
 var YZindex;
 
//_________________________________________________________________//
//                                                                 //
//** Note: this work is for exploration and must be restructured !!//
//_________________________________________________________________//


//#region MaterialClass

const EmaterialType = {
    Concrete: 0,
    Steel: 1
};
Object.freeze(EmaterialType);



class Material {

    //#region private variables
    #_name;
    #_weight;
    #_elasticModulus;
    #_poisson;
    #_thermalExpansion;
    #_materialType;
    #_strength;
    #_assignedToSections;
    #_id;
    #_cpyNo
    static #_materialId=1;
    static #_materialsList=new Map();
    //#endregion

    static #InitiateMaterialList = (function(){
        new Material("Concrete",25,4400,0.2,5e-9,EmaterialType.Concrete,[30]);
        new Material("Steel",78.5,2100,0.3,5e-9,EmaterialType.Steel,[240,360]);
    })();

    constructor(
        name="mat", weight=25, elasticModulus=4400 , poisson=0.2 , thermalExpansion=5e-9 , materialType=0 , strength=[25] ){
        this.#_id = Material.#_materialId;
        this.Name = name;
        this.Weight = weight;
        this.ElasticModulus = elasticModulus;
        this.Poisson = poisson;
        this.ThermalExpansion = thermalExpansion;
        this.MaterialType = materialType;
        this.Strength = strength;
        this.#_assignedToSections = new Array();
        this.#_cpyNo = 0 ;
        Material.#_materialsList.set(String(this.#_id), this);
        Material.#_materialId++;
    }

    //#region Setters and Getters
    set Name(value) {
        if (typeof value != "string" && !(value instanceof String))
            throw new TypeError("Section Name must be string");

            let matching;
            for (const material of Material.#_materialsList.values()) {
                if(material.Name == value){
                    matching = material;
                    break;
                }
            }

            if(!matching) 
                this.#_name=value;
            else{
                if(matching.#_id != this.#_id)
                    throw new Error("There is another material having the same name");
                this.#_name=value;
            }
    }

    get Name() {
        return this.#_name;
    }

    set Weight(value) {
        if (isNaN(value))
            throw new TypeError("material Weight must be Number");
        if (value <= 0)
            throw new Error("Material Weight must be Positive number");

        this.#_weight = value;
    }
    get Weight() {
        return this.#_weight;
    }

    set ElasticModulus(value) {
        if (isNaN(value))
            throw new TypeError("Elastic Modulus must be Number");
        if (value <= 0)
            throw new Error("Material Elastic Modulus must be Positive number");
        this.#_elasticModulus = value;
    }
    get ElasticModulus() {
        return this.#_elasticModulus;
    }

    set Poisson(value) {
        if (isNaN(value))
            throw new TypeError("Poisson`s ratio must be Number");
        if (value <= 0 || value>1)
            throw new Error("Material Poissin ratio must be betwee 0 and 1");

        this.#_poisson = value;
    }
    get Poisson() {
        return this.#_poisson;
    }

    set ThermalExpansion(value) {
        if (isNaN(value))
            throw new TypeError("Thermal Expansion must be Number");
        this.#_thermalExpansion = value;
    }
    get ThermalExpansion() {
        return this.#_thermalExpansion;
    }

    set MaterialType(value) {
        if (!(Object.keys(EmaterialType)[value]))
            throw new TypeError("Material Type must be one of those in Material Type Enum");

        this.#_materialType = value;
    }
    get MaterialType() {
        return this.#_materialType;
    }

    set Strength(value) {
        if (!(value instanceof Array))
            throw new TypeError("material strength must be input as array");

        if(this.MaterialType == EmaterialType.Concrete)
        {
            if(isNaN(value[0]) || value[0] <=0)
                throw new Error("material strengths must be positive numbers");
        }
        if (this.MaterialType == EmaterialType.Steel){
            if(value.slice(0,2).some(val => isNaN(val) || val <= 0))
                throw new Error("material strengths must be positive numbers");
        } 

        this.#_strength = value;
    }

    get Strength() {
        return this.#_strength;
    }

    static get MaterialsList() {
        return Material.#_materialsList;
    }

    get AssignedToSections() {
        return this.#_assignedToSections;
    }

    get ID(){
        return this.#_id;
    }
    //#endregion


    Delete() {
        if (this.#_assignedToSections.length != 0)
            throw new Error("this material is assigned to section(s)");
        Material.#_materialsList.delete(String(this.#_id));
    }

    Clone() {
        this.#_cpyNo++;
        return new Material(this.Name +" - " +this.#_cpyNo, this.Weight, this.ElasticModulus, this.Poisson, this.ThermalExpansion, this.MaterialType, this.Strength);
    }

}
//#endregion

//#region Section Class
const ESectionShape = {
    Rectangular: 0,
    Circular: 1,
    ISec: 2,
    TSec: 3,
    Tapered:4
}

Object.freeze(ESectionShape);


class Section {

    #name;
    #cpyNo;
    #id;
    #material;
    #secType;
    #dimensions;
    #propModifiers;
    #assignedToFrames
    static #sectionId=1;
    static #secList = new Map();

    static #DefaultSections = (function(){
        new Section('Fsec1',Material.MaterialsList.get('1'),ESectionShape.Rectangular,[0.5,0.5],[0.7,0.5,0.01,1,1,1,1,1] );
        new Section('Fsec2',Material.MaterialsList.get('2'),ESectionShape.ISec,[0.360,0.170,0.0127,0.008,0.170,0.0127]);
    })();

    constructor(name, material, secType, dimensions, modifiers=[1,1,1,1,1,1,1,1]) {
        this.#id=Section.#sectionId;
        this.Name=name;
        this.#cpyNo=0;
        this.Material=material;
        this.SecType=secType;
        this.Dimensions=dimensions;
        this.PropModifiers=modifiers;
        this.#material.AssignedToSections.push(this);
        this.#assignedToFrames= []
        Section.#secList.set(String(this.#id), this);
        Section.#sectionId++;
    }

    set Name(value) {
        if (typeof value != "string" && !(value instanceof String))
            throw new TypeError("Section Name must be string");

        let matching;
        for (const section of Section.SectionList.values()) {
            if(section.Name == value){
                matching = section;
                break;
                }
            }

        if(!matching) 
            this.#name=value;
        else{
            if(matching.ID != this.ID)
                throw new Error("There is another section having the same name");
            this.#name=value;
        }

    }

    set Material(value) {
        if (!(value instanceof Material))
            throw new TypeError("Material isnot of correct type");
        this.#material = value;
    }

    set SecType(value) {
        if (!(Object.keys(ESectionShape)[value]))
            throw new TypeError("Section Type must be one of those in Section Shape Enum");
        this.#secType = value;
    }

    set Dimensions(value) {

        if (!(value instanceof Array))
            throw new TypeError("Section Dimensions must be in form of array");

        this.#ValidateDimenions(this.SecType,value);

        this.#dimensions=value;
    }

    set PropModifiers(value){

        if (!(value instanceof Array))
            throw new TypeError("Section Modifiers must be in form of array");
        if(value.length<8)
            throw new Error("Section Modifiers must be in form of array containing eight numbers");

        if (value.slice(0,8).some(modifier => isNaN(modifier) || modifier < 0 || modifier>1))
            throw new TypeError("Section Modifiers must be between zero and one");

        this.#propModifiers=value;

    }

    get Name(){
        return this.#name;
    }

    get Material(){
        return this.#material;
    }

    get SecType() {
        return this.#secType;
    }

    get Dimensions(){
        return this.#dimensions;
    }

    get PropModifiers(){
        return this.#propModifiers;
    }

    get ID(){
        return String(this.#id);
    }

    get AssignedToFrames(){
        return this.#assignedToFrames;
    }

    static get SectionList(){
        return Section.#secList;
    }

    Clone(){
        this.#cpyNo++;
        return new Section(this.Name+" - "+this.#cpyNo,this.Material,this.SecType,this.Dimensions,this.PropModifiers);
    }

    Delete(){
        if(this.AssignedToFrames.length) throw new Error('this section is assigned to frame/s');
        else{
            let secIndex = this.Material.AssignedToSections.indexOf(this);
            this.Material.AssignedToSections.splice(secIndex,secIndex);
            Section.#secList.delete(this.ID);
        }
        
    }

    #ValidateDimenions(sectionType, dimArray) {

        if (sectionType == ESectionShape.Rectangular )
        {
            if(dimArray.length < 2 || dimArray.slice(0,2).some(val=> isNaN(val) || val<=0))
                throw new Error("Rectangular Sections must be instantiated with 2 dimensions");
    
        }
    
        if (sectionType == ESectionShape.Circular)
        {
            if(dimArray.length < 1 || dimArray.slice(0,1).some(val=> isNaN(val) || val<=0))
                throw new Error("Circular Sections must be instantiated with 1 dimension");
        }
            
    
        if (sectionType == ESectionShape.ISec) {
    
            
            if(dimArray.length < 6 || dimArray.slice(0,6).some(val=> isNaN(val) || val<=0))
                throw new Error("I Sections must be instantiated with 6 dimensions");
    
            if (dimArray[0] <= dimArray[2] + dimArray[5] || dimArray[1] <= dimArray[3] || dimArray[4] < dimArray[3])
                throw new Error("Input dimensions are not valid to instantiate I-Section");
    
        }
    
        if (sectionType == ESectionShape.TSec) {
    
            if(dimArray.length < 4 || dimArray.slice(0,4).some(val=> isNaN(val) || val<=0))
                throw new Error("T Sections must be instantiated with 4 dimensions");
            if (dimArray[0] <= dimArray[2] || dimArray[1] <= dimArray[3])
                throw new Error("Input dimensions are not valid to instantiate T-Section");
    
        }
    
    }
    

}
//#endregion


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
    static #num = 1;
    constructor(points, crossSection)
    {
        this.Label = FrameElement.#num;
        this.Section = crossSection ;
        this.Section.AssignedToFrames.push(this);
        var startPosition = [points[0], points[1], points[2]];
        var endPosition = [points[3], points[4], points[5]];
        this.StartPoint;
        this.EndPoint;
        this.AssociatedPoints = [];
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

    undo()
    {
        this.StartPoint.undo(this.Label);
        this.EndPoint.undo(this.Label);
        //FrameElement.#num--;
        for(let i = 0; i <this.AssociatedPoints.length; i++){
            this.AssociatedPoints[i].undo(this.Label);
        }
    }

    redo()
    {
        this.StartPoint.redo(this.Label);
        this.EndPoint.redo(this.Label);
        for(let i = 0; i <this.AssociatedPoints.length; i++){
            //group.add(this.AssociatedPoints[i]);
            this.AssociatedPoints[i].redo(this.Label);
        }
    }

    remove()
    {
        this.Label = null;
        this.StartPoint.remove();
        this.EndPoint.remove();
        let frameIndex = this.Sections.AssignedToFrames.indexOf(this);
        this.Sections.AssignedToFrames.splice(frameIndex,frameIndex);
        this.Section = null;
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
            // let obj = BoxSnap(0.3,0.3,0.3);
            // obj.position.x = x;
            // obj.position.y = y;
            // obj.position.z = z;
            // group.add(obj);
            this.AssociatedPoints.push(obj);
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
        this.ExtrudedColor = this.Extrude.material.color;
        this.LineColor = this.line.material.color;
        this.Selected = false;

        if(state == true) 
        {
            this.Extrude.visible = false;
            this.line.visible = true;
        }else{
            
            this.Extrude.visible = true;
            this.line.visible = false;
        }
        //UsedSections();

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
            //side: THREE.DoubleSide,
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

        /*if(points[1] - points[4] != 0 && points[2]-points[5] == 0 && points[0]-points[3] == 0){
            this.#extrude.material.color.setHex(0xa200ab);
            this.#extrude.rotation.z = (Math.PI/2);
        }*/
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
        //this.position = new THREE.Vector3(point.x, point.y, poiny.z);
        this.position = [point[0], point[1], point[2]];

        var dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.position, 3 ) );
        var dotMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
        this.dot = new THREE.Points( dotGeometry, dotMaterial );

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
        group.add(this.obj);
    }
    undo(frame)
    {
        if(frame != null){
            this.Shared.splice(Point.PointsArray.indexOf(frame),1);
            
            if(this.Shared.length == 0)
            {
                scene.remove(this.dot); 
                scene.remove( this.crosshair );
                const index = Point.PointsArray.indexOf(this); 
                Point.PointsArray.splice(index, 1);
                group.remove(this.obj);
            }
        }
    }
    redo(frame=null)
    {
        if(this.Shared.length == 0)
        {
            scene.add( this.dot );
            scene.add( this.crosshair );
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
        }
    }
    Highlight()
    {
        if(this.Selected == true)
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
        group.remove(this.obj);
    }
    Show()
    {
        scene.add(this.dot)
        scene.add(this.crosshair)
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

// Add stats to visualize performance
// stats = new Stats();
// stats.setMode(0);
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = '20px';
// stats.domElement.style.top = '20px';
// document.body.appendChild(stats.domElement);


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


//#region Global Directions Arrows
var arrows = new THREE.Group();
scene.add( arrows );
const dirX = new THREE.Vector3( 1, 0, 0 );
const dirY = new THREE.Vector3( 0, 1, 0 );
const dirZ = new THREE.Vector3( 0, 0, 1 );
//normalize the direction vector (convert to vector of length 1)
dirX.normalize();
const origin = new THREE.Vector3( -3, -3, 0 );
const length = 2.3;
const hexX = 0xa6050d;
const hexY = 0x0675c9;
const hexZ = 0x05a660;
const headLength = 0.5;
const headWidth = 0.12;
var arrowHelperX = new THREE.ArrowHelper( dirX, origin, length, hexX, headLength, headWidth );
var arrowHelperY = new THREE.ArrowHelper( dirY, origin, length, hexY, headLength, headWidth );
var arrowHelperZ = new THREE.ArrowHelper( dirZ, origin, length, hexZ, headLength, headWidth );
arrows.add( arrowHelperX );
arrows.add( arrowHelperY );
arrows.add( arrowHelperZ );

var txSpriteX = makeTextSprite( "X", -0.25, -3,  0, { fontsize: 210, fontface: "Georgia", textColor: { r:204, g:1, b:1, a:1.0 },
  vAlign:"center", hAlign:"center" } );
 scene.add( txSpriteX );  
 var txSpriteY = makeTextSprite( "Y", -3, -0.25,  0, { fontsize: 210, fontface: "Georgia", textColor: { r:6, g:117, b:201, a:1.0 },
  vAlign:"center", hAlign:"center" } );
 scene.add( txSpriteY );  
 var txSpriteZ = makeTextSprite( "Z", -3, -3,  2.8, { fontsize: 210, fontface: "Georgia", textColor: { r:5, g:166, b:96, a:1.0 },
  vAlign:"center", hAlign:"center" } );
 scene.add( txSpriteZ );  
//#endregion

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

// material function 
function GetMaterial(type, color)
{
    var material;
    var materialOptions;
    materialOptions = {
        color: color
    };
    switch(type)
    {
        case 'basic':
            material = new THREE.MeshBasicMaterial(materialOptions);
            break;
        case 'lambert':
            material = new THREE.MeshLambertMaterial(materialOptions);
            break;
        case 'phong':
            material =new THREE.MeshPhongMaterial(materialOptions);
            break;
        case 'standard':
            material = new THREE.MeshStandardMaterial(materialOptions);
            break;
        default:
            material = new THREE.MeshBasicMaterial(materialOptions);
            break;
    }
    return material;
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
                    commands.excuteCommand(new DrawLine(new FrameElement(points,GetSelectedSection(),state)));
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
    DisplayDrawFrameHelper();
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














// for texts

function makeTextSprite( message, x, y, z, parameters ) 
{ 
    if ( parameters === undefined ) parameters = {}; 
     
    var fontface = parameters.hasOwnProperty("fontface") ?  
        parameters["fontface"] : "Arial"; 
     
    var fontsize = parameters.hasOwnProperty("fontsize") ?  
        parameters["fontsize"] : 28; 
     
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?  
        parameters["borderThickness"] : undefined; //4; 
     
    var borderColor = parameters.hasOwnProperty("borderColor") ? 
        parameters["borderColor"] : undefined; //{ r:0, g:0, b:0, a:0.0 }; 
     
    var fillColor = parameters.hasOwnProperty("fillColor") ? 
        parameters["fillColor"] : undefined; 
 
    var textColor = parameters.hasOwnProperty("textColor") ? 
        parameters["textColor"] : { r:25, g:25, b:25, a:1.0 }; 
 
    var radius = parameters.hasOwnProperty("radius") ? 
                parameters["radius"] : undefined; // 6; 
 
    var vAlign = parameters.hasOwnProperty("vAlign") ? 
                        parameters["vAlign"] : "center"; 
 
    var hAlign = parameters.hasOwnProperty("hAlign") ? 
                        parameters["hAlign"] : "center"; 
 
    var canvas = document.createElement('canvas'); 
    var context = canvas.getContext('2d'); 
     
    // set a large-enough fixed-size canvas  
    canvas.width = 1800; 
    canvas.height = 900; 
     
    context.font = fontsize + "px " + fontface; 
    context.textBaseline = "alphabetic"; 
    context.textAlign = "left"; 
     
    // get size data (height depends only on font size) 
    var metrics = context.measureText( message ); 
    var textWidth = metrics.width; 
     
    /* 
    // need to ensure that our canvas is always large enough 
    // to support the borders and justification, if any 
    // Note that this will fail for vertical text (e.g. Japanese)
    // The other problem with this approach is that the size of the canvas 
    // varies with the length of the text, so 72-point text is different 
    // sizes for different text strings.  There are ways around this 
    // by dynamically adjust the sprite scale etc. but not in this demo...
    var larger = textWidth > fontsize ? textWidth : fontsize;
    canvas.width = larger * 4; 
    canvas.height = larger * 2; 
    // need to re-fetch and refresh the context after resizing the canvas 
    context = canvas.getContext('2d'); 
    context.font = fontsize + "px " + fontface; 
    context.textBaseline = "alphabetic"; 
    context.textAlign = "left"; 
     metrics = context.measureText( message ); 
    textWidth = metrics.width; 
 
     console.log("canvas: " + canvas.width + ", " + canvas.height + ", texW: " + textWidth);
    */ 
     
    // find the center of the canvas and the half of the font width and height 
    // we do it this way because the sprite's position is the CENTER of the sprite 
    var cx = canvas.width / 2; 
    var cy = canvas.height / 2; 
    var tx = textWidth/ 2.0; 
    var ty = fontsize / 2.0; 
 
    // then adjust for the justification 
    if ( vAlign == "bottom") 
        ty = 0; 
    else if (vAlign == "top") 
        ty = fontsize; 
     
    if (hAlign == "left") 
        tx = textWidth; 
    else if (hAlign == "right") 
        tx = 0; 
     
    // the DESCENDER_ADJUST is extra height factor for text below baseline: g,j,p,q. since we don't know the true bbox 
    roundRect(context, cx - tx , cy + ty + 0.28 * fontsize,  
            textWidth, fontsize * DESCENDER_ADJUST, radius, borderThickness, borderColor, fillColor); 
     
    // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas 
    context.fillStyle = getCanvasColor(textColor); 
 
    context.fillText( message, cx - tx, cy + ty); 
  
    // draw some visual references - debug only 
    //drawCrossHairs( context, cx, cy );     
    // outlineCanvas(context, canvas); 
    //addSphere(x,y,z); 
    
    // canvas contents will be used for a texture 
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true; 
 
    var spriteMaterial = new THREE.SpriteMaterial( { map: texture } ); 
    var sprite = new THREE.Sprite( spriteMaterial ); 
     
    // we MUST set the scale to 2:1.  The canvas is already at a 2:1 scale, 
    // but the sprite itself is square: 1.0 by 1.0 
    // Note also that the size of the scale factors controls the actual size of the text-label 
    sprite.scale.set(4,2,1); 
     
    // set the sprite's position.  Note that this position is in the CENTER of the sprite 
    sprite.position.set(x, y, z); 
     
    return sprite;     
} 

function roundRect(ctx, x, y, w, h, r, borderThickness, borderColor, fillColor)  
{ 
    // no point in drawing it if it isn't going to be rendered 
    if (fillColor == undefined && borderColor == undefined)  
        return; 
 
    x -= borderThickness + r; 
    y += borderThickness + r; 
    w += borderThickness * 2 + r * 2; 
    h += borderThickness * 2 + r * 2; 
     
    ctx.beginPath(); 
    ctx.moveTo(x+r, y); 
    ctx.lineTo(x+w-r, y); 
    ctx.quadraticCurveTo(x+w, y, x+w, y-r); 
    ctx.lineTo(x+w, y-h+r); 
    ctx.quadraticCurveTo(x+w, y-h, x+w-r, y-h); 
    ctx.lineTo(x+r, y-h); 
    ctx.quadraticCurveTo(x, y-h, x, y-h+r); 
    ctx.lineTo(x, y-r); 
    ctx.quadraticCurveTo(x, y, x+r, y); 
    ctx.closePath(); 
     
    ctx.lineWidth = borderThickness; 
 
    // background color 
    // border color 
 
    // if the fill color is defined, then fill it 
    if (fillColor != undefined) { 
        ctx.fillStyle = getCanvasColor(fillColor); 
        ctx.fill(); 
    } 
     
    if (borderThickness > 0 && borderColor != undefined) { 
        ctx.strokeStyle = getCanvasColor(borderColor); 
        ctx.stroke(); 
    } 
} 

function getCanvasColor ( color ) { 
    return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")"; 
} 























// for grids



const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');
const overLay= document.getElementById('overlay');

openModalButtons.forEach(button =>{
    button.addEventListener('click',() => {
        const modal = document.querySelector(button.dataset.modalTarget);
        openModal(modal);
    })
})

overLay.addEventListener('click',() => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal =>{
        closeModal(modal);
    })
})

closeModalButtons.forEach(button =>{
    button.addEventListener('click',() => {
        const modal = button.closest('.modal');
        closeModal(modal);
    })
})

function openModal(modal){
    if(modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(modal){
    if(modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}
var nx = 1;
document.getElementById("AddRowX").onclick=function(){AddRowX()};
document.getElementById("GridIDX").onkeydown=function(e){if(e.key == "Enter")AddRowX()};
document.getElementById("GridDimX").onkeydown=function(e){if(e.key == "Enter")AddRowX()};
function AddRowX() {
    nx +=1;
    var table = document.getElementById("grids_tableX");
    var row = table.insertRow(table.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = nx ;
    cell1.width = 40;
    cell2.innerHTML = `<input type = "text" id = "GridID" tabindex="1" size="16"/>`;
    cell3.innerHTML = `<input type = "number" id = "GridDim" tabindex="2" width="18"/> m`;
    cell2.onkeydown = function(e){if(e.key == "Enter")AddRowX()};
    cell3.onkeydown = function(e){if(e.key == "Enter")AddRowX()};
}
var ny = 1
document.getElementById("AddRowY").onclick=function(){AddRowY()};
document.getElementById("GridIDY").onkeydown=function(e){if(e.key == "Enter")AddRowY()};
document.getElementById("GridDimY").onkeydown=function(e){if(e.key == "Enter")AddRowY()};
function AddRowY() {
    ny +=1;
    var table = document.getElementById("grids_tableY");
    var row = table.insertRow(table.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = ny ;
    cell1.width = 40;
    cell2.innerHTML = `<input type = "text" id = "GridID" tabindex="1" size="16"/>`;
    cell3.innerHTML = `<input type = "number" id = "GridDim" tabindex="2" width="18"/> m`;
    cell2.onkeydown = function(e){if(e.key == "Enter")AddRowY()};
    cell3.onkeydown = function(e){if(e.key == "Enter")AddRowY()};
    cell2.focus();
}
var nz = 1
document.getElementById("AddRowZ").onclick=function(){AddRowZ()};
document.getElementById("GridIDZ").onkeydown=function(e){if(e.key == "Enter")AddRowZ()};
document.getElementById("GridDimZ").onkeydown=function(e){if(e.key == "Enter")AddRowZ()};
function AddRowZ() {
    nz +=1;
    var table = document.getElementById("grids_tableZ");
    var row = table.insertRow(table.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = nz ;
    cell1.width = 40;
    cell2.innerHTML = `<input type = "text" id = "GridID" tabindex="1" size="16"/>`;
    cell3.innerHTML = `<input type = "number" id = "GridDim" tabindex="2" width="18"/> m`;
    cell2.onkeydown = function(e){if(e.key == "Enter")AddRowZ()};
    cell3.onkeydown = function(e){if(e.key == "Enter")AddRowZ()};
    cell2.focus();
}


document.getElementById('SubmitGrids').onclick = function(){SubmitGrids()};
function SubmitGrids(){
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
    const tableX = document.getElementById("grids_tableX");
    listx = []
    let x = 0;
    for(let i = 1; i < tableX.rows.length; i++){
        let temp = parseFloat(tableX.rows[i].cells[2].children[0].value);
        if(temp > 0 && !isNaN(temp)){
            listx[x] = temp;
            x += 1;
        }
        else if(tableX.rows.length >2){
            tableX.deleteRow(i);
            i--;
        }
    }
    const tableY = document.getElementById("grids_tableY");
    listy = []
    let y = 0;
    for(let i = 1; i < tableY.rows.length; i++){
        let temp = parseFloat(tableY.rows[i].cells[2].children[0].value);
        if(temp > 0 && !isNaN(temp)){
            listy[y] = temp;
            y += 1;
        }
        else if(tableY.rows.length >2){
            tableY.deleteRow(i);
            i--;
        }
    }
    
    const tableZ = document.getElementById("grids_tableZ");
    listz = []
    let z = 0;
    for(let i = 1; i < tableZ.rows.length; i++){
        let temp = parseFloat(tableZ.rows[i].cells[2].children[0].value);
        if(temp > 0 && !isNaN(temp)){
            listz[z] = temp;
            z += 1;
        }
        else if(tableZ.rows.length >2){
            tableZ.deleteRow(i);
            i--;
        }
    }

    if(listx.length > 0 && listy.length > 0 && listz.length >0)
    {
        // Update the selection options
        GridSelections(); 

        group = GridPoints(listx,listy,listz,listx.length,listy.length,listz.length);
        gridLines = GridLine(listx,listy,listz,listx.length,listy.length,listz.length);
        scene.add(group);
        gridLines.forEach(element => {
            scene.add(element);
        });
    
        // Close the window
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal =>{
            closeModal(modal);
        });
    }
    else{
        document.getElementById("Comment").innerHTML = "Dimentions cannot be empty";
    }
    
}

document.getElementById('GridsCancel').onclick = function(){GridsCancel()};
function GridsCancel()
{
const modals = document.querySelectorAll('.modal.active');
modals.forEach(modal =>{
    closeModal(modal);
})}

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


function BoxSnap(width, height, depth, materialType = 'basic',color = 'green', X = 0, Y = 0, Z = 0)
{
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var material = GetMaterial(materialType,color);
    material.transparent = true;
    material.opacity = 0;    
    material.alphaTest = 0.1;
    material.wireframe = true;
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x=X;
    mesh.position.y=Y;
    mesh.position.z=Z;

    return mesh;
}

function GridPoints(spacingX, spacingY, spacingZ, lengthX,lengthY,lengthZ)
{
    const group = new THREE.Group();

    var pos_x = 0;
    var pos_y = 0;
    var pos_z = 0;
    for(let i = 0; i <= lengthX; i++)
    {
        for(let j = 0; j <= lengthY; j++)
        {
            for(let k = 0; k <= lengthZ; k++)
            {
                
                let obj = BoxSnap(0.3,0.3,0.3);

                obj.position.x = pos_x;
                obj.position.y = pos_y;
                obj.position.z = pos_z;
                pos_z += spacingZ[k];
                group.add(obj);
            }
            pos_z = 0;
            pos_y += spacingY[j];
        }
        pos_y = 0;
        pos_x += spacingX[i];
    }
    return group;
}
//line function
function GridLine(spacingX, spacingY, spacingZ, lengthX, lengthY, lengthZ)
{
    const distanceX = listx.reduce((a, b) => a + b, 0);
    const distanceY = listy.reduce((a, b) => a + b, 0);
    const distanceZ = listz.reduce((a, b) => a + b, 0);
    const group = [];
    var material = new THREE.LineBasicMaterial({color:'rgb(190,190,190)', alphaTest:0.7, transparent:true, opacity:0.7});
    var points;
    var geometry;
    var line;
    var pos_x = 0;
    var pos_y = 0;
    var pos_z = 0;
    for(let i = 0; i <= lengthX; i++)
    {
        for(let j = 0; j <= lengthY; j++)
        {
            points = [];
            points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) );    
            points.push( new THREE.Vector3( pos_x, pos_y, distanceZ ) );   
            pos_y += spacingY[j];
            geometry = new THREE.BufferGeometry().setFromPoints( points );
            line = new THREE.Line( geometry, material );
            group.push(line);
        }
        pos_y = 0;
        pos_x += spacingX[i];
    }


    pos_x = 0;
    pos_y = 0;
    pos_z = 0;
    for(let i = 0; i <= lengthX; i++)
    {
        for(let j = 0; j <= lengthZ; j++)
        {
            points = [];
            points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) );
            points.push( new THREE.Vector3( pos_x, distanceY, pos_z ) );
            pos_z += spacingZ[j];
            geometry = new THREE.BufferGeometry().setFromPoints( points );
            line = new THREE.Line( geometry, material );
            group.push(line);
        }
        pos_z = 0;
        pos_x += spacingX[i];
    }

    pos_x = 0;
    pos_y = 0;
    pos_z = 0;
    for(let i = 0; i <= lengthY; i++)
    {
        for(let j = 0; j <= lengthZ; j++)
        {
            points = [];
            points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) );
            points.push( new THREE.Vector3( distanceX, pos_y, pos_z ) );
            pos_z += spacingZ[j];
            geometry = new THREE.BufferGeometry().setFromPoints( points );
            line = new THREE.Line( geometry, material );
            group.push(line);
        }
        pos_z = 0;
        pos_y += spacingY[i];
    }
    return group;
}




//   var from = new THREE.Vector3( 2, 2, 2 );
// var to = new THREE.Vector3( 0, 0, 0 );
// var direction = to.clone().sub(from);
// var length22 = direction.length();
// var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xff0000 );
// scene.add( arrowHelper );

// const map = new THREE.TextureLoader().load( 'sprite.png' );
// const material = new THREE.SpriteMaterial( { map: map } );

// const sprite = new THREE.Sprite( material );
// scene.add( sprite );   
 
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
            XYView(XYindex);
            break;
        }
    }
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
    camera.position.z = Math.max(distanceX, distanceY)*1.2 + ViewPosition;
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
            XZView(XZindex);
            break;
        }
    }
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
            YZView(YZindex);
            break;
        }
    }    
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











function crossProduct(A,B) {
    const vector = [
       A[1] * B[2] - A[2] * B[1],
       A[2] * B[0] - A[0] * B[2], 
       A[0] * B[1] - A[1] * B[0]
    ];
    return vector;
  }

  function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }










  // Functions to draw loads and reactions
  //#region // Loads visualization
function ArrowOnLine(length, x,y,z, startPoint, endPoint,  direction, rz, scale = 1, local = false)
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

    const material = new THREE.LineBasicMaterial({color:'rgb(0,0,0)'});
 
    const l = length *scale;
    var geometry = new THREE.BufferGeometry();
    var geometry_h1 = new THREE.BufferGeometry();
    var geometry_h2 = new THREE.BufferGeometry();
    var vertices =[];  
    var vertices_h1 =[];  
    var vertices_h2 =[];  

    if(local == false)
    {
        vertices.push(0, 0.04*l, 0.15*l);
        vertices.push(0, 0, 0);
        vertices.push(0, -0.04*l, 0.15*l );
        vertices.push(0, 0, 0);
        vertices.push(0, 0, l);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    else
    {
        if(direction == 2)
        {
            vertices.push(0, 0, 0);
            vertices.push(l*Y_axis.x, l*Y_axis.y, l*Y_axis.z);
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            vertices_h1.push(0,0,0);
            vertices_h1.push(0.2*l* Y_axis.x, 0.2*l*Y_axis.y, 0.2*l*Y_axis.z);
            geometry_h1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h1, 3 ) );
            vertices_h2.push(0,0,0);
            vertices_h2.push(0.2*l*Y_axis.x, 0.2*l*Y_axis.y, 0.2*l*Y_axis.z);
            geometry_h2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h2, 3 ) );
        }
        else if(direction == 3){
            vertices.push(0, 0, 0);
            vertices.push(l*X_axis.x, l*X_axis.y, l*X_axis.z);
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            vertices_h1.push(0,0,0);
            vertices_h1.push(0.2*l*X_axis.x, 0.2*l*X_axis.y, 0.2*l*X_axis.z);
            geometry_h1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h1, 3 ) );
            vertices_h2.push(0,0,0);
            vertices_h2.push(0.2*l*X_axis.x, 0.2*l*X_axis.y, 0.2*l*X_axis.z);
            geometry_h2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h2, 3 ) );
        }
        else if(direction ==1){
            vertices.push(0, 0, 0);
            vertices.push(l*axis.x, l*axis.y, l*axis.z);
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            vertices_h1.push(0,0,0);
            vertices_h1.push(0.2*l*axis.x, 0.2*l*axis.y, 0.2*l*axis.z);
            geometry_h1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h1, 3 ) );
            vertices_h2.push(0,0,0);
            vertices_h2.push(0.2*l*axis.x, 0.2*l*axis.y, 0.2*l*axis.z);
            geometry_h2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h2, 3 ) );
        }
        
    }
    var arrow = new THREE.Line( geometry, material );
    var arrow_h1 = new THREE.Line( geometry_h1, material );
    var arrow_h2 = new THREE.Line( geometry_h2, material );

    switch(direction)
    {
        case 1:
        case 3:
            arrow_h1.rotateOnAxis(Y_axis, 0.15);
            arrow_h2.rotateOnAxis(Y_axis, -0.15);
            arrow.add(arrow_h1);
            arrow.add(arrow_h2);
            break;
        case 2:
            arrow_h1.rotateOnAxis(X_axis, 0.15);
            arrow_h2.rotateOnAxis(X_axis, -0.15);
            arrow.add(arrow_h1);
            arrow.add(arrow_h2);
            break;
    }

    arrow.position.x = x;
    arrow.position.y = y;
    arrow.position.z = z;
    arrow.rotateOnAxis(axis, rz)
    scene.add(arrow);
    return vertices;
}


function DistributedLoadIndication(length1 ,startPoint, endPoint, direction, rz, scale = 1, length2 = length1, local = false)
{
    const StartPoint = new THREE.Vector3( startPoint[0], startPoint[1], startPoint[2]);
    const EndPoint = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);

    const load = new THREE.Group();
    const distance = new THREE.Vector3().subVectors(StartPoint, EndPoint).length();
    const axis = new THREE.Vector3().subVectors(StartPoint, EndPoint).normalize();
    const number = Math.round(distance/0.4)
    const dX = (EndPoint.x - StartPoint.x );
    const dY = (EndPoint.y - StartPoint.y );
    const dZ = (EndPoint.z - StartPoint.z );

    const material = new THREE.LineBasicMaterial({color:'rgb(0,0,0)'});
    
    const geometry = new THREE.BufferGeometry();
    var vertices =[];  
    vertices.push(StartPoint.x, StartPoint.y, StartPoint.z);
    const dload= length2-length1;

    for (let i = 0; i <= number ; i++)
    {
        const x = StartPoint.x + (dX*i/number); 
        const y = StartPoint.y + (dY*i/number);
        const z = StartPoint.z + (dZ*i/number);
        const L = length1 + (dload*i/number);
        const arrow = ArrowOnLine(L, x, y, z, startPoint, endPoint,direction, rz, 1, local);
        if(i == 0)
        {
            vertices.push(arrow[3]+ StartPoint.x, arrow[4]+ StartPoint.y, arrow[5]+ StartPoint.z);
        }
        if(i == number)
        {
            vertices.push(arrow[3]+ EndPoint.x, arrow[4] +EndPoint.y, arrow[5]+EndPoint.z);
        }
        if(i == Math.round(number/2)){
            var textPosition = [arrow[3]+ x, arrow[4]+ y, arrow[5]+ z- 0.4*length1];
            if(direction == 3)
            {
                textPosition = [arrow[3]+ x- 0.3*length1, arrow[4]+ y- 0.3*length1, arrow[5]+ z];
            }
            else{textPosition = [arrow[3]+ x, arrow[4]+ y, arrow[5]+ z- 0.4*length1];}
            let loadText = '';
            if(dload == 0)
            {
                loadText = length1;
            }
            else{
                loadText = length1 + "-" + length2;
            }
            const txt = makeTextSprite( loadText, textPosition[0], textPosition[1], textPosition[2],{fontsize: 140, fontface: "Georgia", textColor:{r:0,g:0,b:0,a:1},
                vAlign:"center", hAlign:"center"});
                load.add(txt);
        }
        //load.add(arrow);
    }

    vertices.push(EndPoint.x, EndPoint.y, EndPoint.z);
    vertices.push(StartPoint.x, StartPoint.y, StartPoint.z);
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    const container = new THREE.Line( geometry, material );
    container.rotateOnAxis(axis, rz)
    load.add(container)
    scene.add(load)
}
//#endregion

//#region // Results visualization
function ResultLines(length, x,y,z, startPoint, endPoint,  direction, rz, scale = 1, local = false)
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

    if(local == false)
    {
        vertices.push(0, 0, 0);
        vertices.push(0, 0, l);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    else
    {
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
    }
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
console.log(max)
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














///*functions to handle draw frame div*////
function DisplayDrawFrameHelper() {
    let frameHelper = document.querySelector('#frameProp');
    if(frameHelper.style.display=="none"){
        LoadSections();
        frameHelper.style.display="block"
    }
}
function LoadSections(){
    var select = document.querySelector('#frameProp select');
    for (const [key,value] of Section.SectionList) {
        var option = document.createElement("option");
        console.log(value.Name)
        option.setAttribute("value",key);
        option.innerHTML=value.Name;
        select.appendChild(option)
    }
}
function GetActiveSection(){
    var selectedSection = document.querySelector('#frameProp select');
    //var sectionId = selectedSection.selectedOptions[0].value;
    //return Section.SectionList.get(sectionId);
    return Section.SectionList.get('1');
}