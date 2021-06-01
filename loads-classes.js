import { DrawLine, FrameElement } from "./main";

const ELoadPatternType={
    Dead:0,
    Live:1,
    Wind:2,
    Other:3
}
const ECoordSys={
    Local:true,
    Global: false
}

const ELoadType= {
    Force: 0,
    Moment: 1
}

const ELoadShape = {
    Point: 0,
    Distributed: 1
}
Object.freeze(ELoadPatternType);
Object.freeze(ECoordSys);
Object.freeze(ELoadType);
Object.freeze(ELoadShape);


class LoadPattern{

    #name;
    #type;
    #selfWtMult
    #inCombos;
    #id;
    #onElements;
    static #loadPatternsList = new Map();
    static #loadPattId = 1;
    constructor(name, type, selfWtMult){

        this.#id = LoadPattern.#loadPattId;
        this.Name = name;
        this.Type = type;
        this.SelfWtMult = selfWtMult;
        this.#inCombos = new Array();
        this.#onElements = new Array();
        LoadPattern.LoadPatternsList.set(this.Name,this);
        LoadPattern.#loadPattId++;
    }

    set Name(value){

        if (typeof value != "string" && !(value instanceof String))
            throw new TypeError("Load Pattern Name must be string");

        
        if(LoadPattern.LoadPatternsList.has(value)){
            let matching = LoadPattern.LoadPatternsList.get(value);
            if(matching.ID != this.ID) throw new Error("There is another load pattern having the same name");
            this.#name = value;
        }
        else{
            this.#name=value;
        }
    }

    set Type(value){
        if (!(Object.keys(ELoadPatternType)[value]))
            throw new TypeError("invalid load pattern type");
        this.#type = value;
    }

    set SelfWtMult(value){
        if(isNaN(value)) throw new TypeError('self weight multiplier must be a number');
        this.#selfWtMult = value
    }

    get Name(){
        return this.#name;
    }

    get Type(){
        return this.#type;
    }

    get SelfWtMult(){
        return this.#selfWtMult;
    }

    get InCombos(){
        return this.#inCombos;
    }

    get OnElements(){
        return this.#onElements
    }

    get ID(){
        return this.#id;
    }

    static get LoadPatternsList(){
        return LoadPattern.#loadPatternsList;
    }

    Delete(){

    }
}

class LoadCombo {

    #name;
    #id;
    #loadPattsInfo;
    #cpyNo;
    static #loadCombosList = new Map();
    static #loadComboId = 1;

    constructor(name, loadPattsInfo){
        this.#id = LoadCombo.#loadComboId;
        this.Name = name;
        this.#cpyNo = 0;
        this.LoadPattsInfo = loadPattsInfo;

        LoadCombo.LoadCombosList.set(this.Name,this);
        LoadCombo.#loadComboId++;
    }

    set Name(value){

        if (typeof value != "string" && !(value instanceof String))
            throw new TypeError("Load Combination Name must be string");

        
        if(LoadCombo.LoadCombosList.has(value)){
            let matching = LoadCombo.LoadCombosList.get(value);
            if(matching.ID != this.ID) throw new Error("There is another load combination having the same name");
            this.#name = value;
        }
        else{
            this.#name=value;
        }
    }

    set LoadPattsInfo(value){
        
        // value = [ { patternName:  , scaleFactor:   }, { patternName:  , scaleFactor:  }, ... ]
        
        if (!(value instanceof Array))
            throw new TypeError("LoadPattsInfo must be in form of array");
        if(value.length == 0)
            throw new Error("a load pattern at least must exist in a load combination");
        this.#CheckPatterns(value);
        this.#CheckScaleFactors(value);
        this.#loadPattsInfo = value;
        this.#PushInPattsInCombos();
    }

    get Name(){
        return this.#name;
    }

    get LoadPattsInfo(){
        return this.#loadPattsInfo;
    }

    get ID(){
        return this.#id;
    }

    static get LoadCombosList(){
        return LoadCombo.#loadCombosList;
    }

    #CheckPatterns(laodpattsInfos){
        let pattsNames = []
        for (const laodpattInfo of laodpattsInfos) {
            let pattName = laodpattInfo.patternName;
            if(! LoadPattern.LoadPatternsList.has(pattName) ) 
                throw new Error ('invalid Load Pattern Name');
            if(pattsNames.includes(pattName))
                throw new Error('load pattern can not be repeated in the same load combination');
            pattsNames.push(pattName);
        }
    }

    #CheckScaleFactors(laodpattsInfos){
        for (const laodpattInfo of laodpattsInfos) {
            let scale = laodpattInfo.scaleFactor;
            if(isNaN(scale)) throw TypeError('scale factors must be numbers');
        }
    }

    #PushInPattsInCombos(loadPattsInfo){
        for (const loadPattInfo of loadPattsInfo) {
            let pattName = loadPattInfo.patternName;
            let patt = LoadPattern.LoadPatternsList.get(pattName);
            if(! (patt.InCombos.includes(this.Name)) ) patt.InCombos.push(this.Name);
        }
    }

    Delete(){
        LoadCombo.LoadCombosList.delete(this.Name);
        for (const loadPattInfo of this.LoadPattsInfo) {
            let pattName = loadPattInfo.patternName;
            let pattern = LoadPattern.LoadPatternsList.get(pattName);
            let comboIndex = pattern.InCombos.indexOf(this.Name);
            pattern.InCombos.splice(comboIndex, comboIndex);
        }
    }

    Clone(){
        this.#cpyNo++;
        return new LoadCombo(`${this.Name}- ${this.#cpyNo}`,this.LoadPattsInfo);
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
        this.Dir = dir;                 // 1 or 2 or 3
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
        if (!(Object.keys(ECoordSys)[value])) throw new TypeError('Coordinate Systems accepts only true for loacal or false for global');
        this.#coordSys = value;
    }
    set Dir(value){
        if(value !== 1 || value !==2 || value !== 3) throw new TypeError('direction accepts only 1 or 2 or 3');
        this.#dir = value
    }
    set Type(value){
        if (!(Object.keys(ELoadType)[value])) throw new TypeError('laod type accepts only 0 for force or 1 for moment');
        this.#type = value;
    }
    set Shape(value){
        if (!(Object.keys(ELoadShape)[value])) throw new TypeError('load shape accepts only 0 for point or 1 for distributed');
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


//#region // Loads visualization
function ArrowOnLine(length, x,y,z, startPoint, endPoint,  direction, rz, scale = 1, local = false)
{
    startPoint = new THREE.Vector3(startPoint[0], startPoint[1], startPoint[2]);
    endPoint = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);

    const axis = new THREE.Vector3().subVectors(startPoint, endPoint).normalize(); // 1-local direction
 
    let x_axis = crossProduct([axis.x, axis.y, axis.z], [0,0,1]);   //3-local direction
    if(arrayEquals(x_axis,[0,0,0]))
    {
        x_axis = [0,1,0]
    }
    const y_axis = crossProduct([axis.x, axis.y, axis.z], x_axis);
    const X_axis = new THREE.Vector3(x_axis[0], x_axis[1], x_axis[2]);
    const Y_axis = new THREE.Vector3(y_axis[0], y_axis[1], y_axis[2]);  //2- local direction

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
        l = l*-1;
        if(direction == 2)  // Global z- direction
        {
            vertices_h1.push(0, 0, 0);
            vertices_h1.push(0, 0.04*l, 0.15*l);
            geometry_h1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h1, 3 ) );
            vertices_h2.push(0, 0, 0);
            vertices_h2.push(0, -0.04*l, 0.15*l );
            geometry_h2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h2, 3 ) );
            vertices.push(0, 0, 0);
            vertices.push(0, 0, l);
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        }
        else if(direction == 3)  // Global y- direction
        {
            vertices_h1.push(0, 0, 0);
            vertices_h1.push(0.04*l, 0.15*l, 0);
            geometry_h1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h1, 3 ) );
            vertices_h2.push(0, 0, 0);
            vertices_h2.push(-0.04*l, 0.15*l, 0 );
            geometry_h2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h2, 3 ) );
            vertices.push(0, 0, 0);
            vertices.push(0, l, 0);
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        }
        else if(direction ==1)   // Global x- direction
        {
            vertices_h1.push(0, 0, 0);
            vertices_h1.push(0.15*l, 0.04*l, 0);
            geometry_h1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h1, 3 ) );
            vertices_h2.push(0, 0, 0);
            vertices_h2.push(0.15*l, -0.04*l, 0 );
            geometry_h2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices_h2, 3 ) );
            vertices.push(0, 0, 0);
            vertices.push(l, 0, 0);
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        }
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

    if(local){
        switch(direction)
        {
            case 1:
            case 3:
                arrow_h1.rotateOnAxis(Y_axis, 0.15);
                arrow_h2.rotateOnAxis(Y_axis, -0.15);      
            break;
            case 2:
                arrow_h1.rotateOnAxis(X_axis, 0.15);
                arrow_h2.rotateOnAxis(X_axis, -0.15);
            break;
        }
    }
    
    arrow.add(arrow_h1);
    arrow.add(arrow_h2);

    arrow.position.x = x;
    arrow.position.y = y;
    arrow.position.z = z;
    arrow.rotateOnAxis(axis, rz);
    //scene.add(arrow);
    return [arrow,vertices];
}

function PointLoadIndication(length, relDist, startPoint, endPoint,  direction, rz, scale = 1, local = false){

    //to calculate relative coordinates from relative distance
    const absolDisCoord = GetAbsoluteCoord(relDist ,startPoint, endPoint);
    const retResult = ArrowOnLine(length,absolDisCoord[0],absolDisCoord[1],absolDisCoord[2],startPoint.toArray(),endPoint.toArray(),direction,rz,scale,local);

    const load = new THREE.Group();
    load.add(retResult[0]);

    // load text
    var textPosition = [retResult[1][3]+ x, retResult[1][4]+ y, retResult[1][5]+ z- 0.4*length1];
    if(direction == 3){
        textPosition = [retResult[1][3]+ x- 0.3*length1, retResult[1][4]+ y- 0.3*length1, retResult[1][5]+ z];
    }
    else{
        textPosition = [retResult[1][3]+ x, retResult[1][4]+ y, retResult[1][5]+ z- 0.4*length1];
    }
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

    return load;
} 

function DistributedLoadIndication(length1 ,startPoint, endPoint, direction, rz = 0, scale = 1, length2 = length1, local = false)
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
        const L = (length1 + (dload*i/number));
        const arrow = ArrowOnLine(L, x, y, z, startPoint, endPoint,direction, rz, scale, local);
        load.add(arrow[0]);
        if(i == 0)
        {
            vertices.push(arrow[1][3]+ StartPoint.x, arrow[1][4]+ StartPoint.y, arrow[1][5]+ StartPoint.z);
        }
        if(i == number)
        {
            vertices.push(arrow[1][3]+ EndPoint.x, arrow[1][4] +EndPoint.y, arrow[1][5]+EndPoint.z);
        }
        if(i == Math.round(number/2)){
            var textPosition = [arrow[1][3]+ x, arrow[1][4]+ y, arrow[1][5]+ z- 0.4*length1];
            if(direction == 3){
                textPosition = [arrow[1][3]+ x- 0.3*length1, arrow[1][4]+ y- 0.3*length1, arrow[1][5]+ z];
            }
            else{
                textPosition = [arrow[1][3]+ x, arrow[1][4]+ y, arrow[1][5]+ z- 0.4*length1];
            }
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
    //scene.add(load);
    return load;
}

function GetAbsoluteCoord(relDist ,startPoint, endPoint){
    startPoint = new THREE.Vector3(startPoint[0], startPoint[1], startPoint[2]);
    endPoint = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);
    const frameLength = new THREE.Vector3().subVectors(startPoint, endPoint).length();
    const axis = new THREE.Vector3().subVectors(startPoint, endPoint).normalize(); // 1-local direction
    const relDisCoord = axis.multiplyScalar(frameLength*relDist);
    return new Three.Vector3().addVectors(relDisCoord,startPoint).toArray();
}

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
//#endregion
