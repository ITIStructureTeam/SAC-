
const ELoadPatternType={
    Dead:0,
    Live:1,
    Wind:2,
    Other:3
}
Object.freeze(ELoadPatternType);

class LoadPattern{

    #name;
    #type;
    #selfWtMult
    #inCombos;
    #id;
    static #loadPatternsList = new Map();
    static #loadPattId = 1;
    constructor(name, type, selfWtMult){

        this.#id = LoadPattern.#loadPattId;
        this.Name = name;
        this.Type = type;
        this.SelfWtMult = selfWtMult;
        this.#inCombos = new Array();
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
Object.freeze(ECoordSys);
Object.freeze(ELoadType);
Object.freeze(ELoadShape);

class LoadAssignInfo{

    #coordSys;
    #dir;
    #type
    #shape;
    #distance;
    #magnitude
    constructor(coordSys , dir, type, shape, distance, magnitude){
        this.CoordSys = coordSys;       // for local (0)  for global (1)
        this.Dir = dir;                 // 1 or 2 or 3
        this.Type = type;               // for force (0)   for moment (1)
        this.Shape = shape;             // for point(0)   for distr  (1)
        this.Distance = distance;       // one value for point  |  array of two values for distributed
        this.Magnitude = magnitude;     // one value for point  |  array of two values for distributed
    }
    
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