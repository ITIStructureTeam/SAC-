class Results
{
    static ResultsList = [];
    static Pattern;
    static ResultsMode = false;

    constructor(pattern, frameLabel, startPoint, endPoint, stations, Mx, My, Tz, N, Vx, Vy, rz)
    {
        this.PatternID = pattern;
        this.FrameID = frameLabel;
        this.StartPoint = startPoint;
        this.EndPoint = endPoint;
        this.Stations = stations;
        this.MomentX = Mx;
        this.MomentY = My;
        this.Torsion = Tz;
        this.Normal = N;
        this.ShearX = Vx;
        this.ShearY = Vy;
        this.Rotation = rz * Math.PI/180;

        this.Draw;
        Results.ResultsList.push(this);
    }

    Draw_Mx(pattern)
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
        let PatternResults = Results.ResultsList.filter(res => res.PatternID == pattern);
        let MaxMxArray = [];
        for(let i = 0; i < PatternResults.length; i++)
        { 
            let absvals = [];
            PatternResults[i].MomentX.forEach(value => absvals.push(Math.abs(value)) );
            let MaxLocalMx = Math.max(...absvals);
            MaxMxArray.push(MaxLocalMx);
        }
        let MaxMx = Math.max(...MaxMxArray)
        if(Math.round(MaxMx) == 0){ MaxMx = 1}

        let results =    this.MomentX;
        let stations =   this.Stations;
        let startPoint = this.StartPoint;
        let endPoint =   this.EndPoint;
        let rz =         this.Rotation;
        let scale = 1.25/MaxMx;
        let result = ResultsDiagram(results , stations, startPoint, endPoint, 2, rz, scale, "Moment");
    
        this.Draw = result;
        Results.Pattern = pattern
        this.InView();
    }

    Draw_My(pattern)
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
        let PatternResults = Results.ResultsList.filter(res => res.PatternID == pattern);
        let MaxMyArray = [];
        for(let i = 0; i < PatternResults.length; i++)
        { 
            let absvals = [];
            PatternResults[i].MomentY.forEach(value => absvals.push(Math.abs(value)) );
            let MaxLocalMy = Math.max(...absvals);
            MaxMyArray.push(MaxLocalMy);
        }
        let MaxMy = Math.max(...MaxMyArray)
        if(Math.round(MaxMy == 0)){ MaxMy = 1}

        let results =    this.MomentY;
        let stations =   this.Stations;
        let startPoint = this.StartPoint;
        let endPoint =   this.EndPoint;
        let rz =         this.Rotation;
        let scale = 1.25/MaxMy;
        let result = ResultsDiagram(results , stations, startPoint, endPoint, 3, rz, scale, "Moment");
        
        this.Draw = result;
        Results.Pattern = pattern
        this.InView();
    }

    Draw_Tz(pattern)
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
        let PatternResults = Results.ResultsList.filter(res => res.PatternID == pattern);
        let MaxMTArray = [];
        for(let i = 0; i < PatternResults.length; i++)
        { 
            let absvals = [];
            PatternResults[i].Torsion.forEach(value => absvals.push(Math.abs(value)) );
            let MaxLocalMT = Math.max(...absvals);
            MaxMTArray.push(MaxLocalMT);
        }
        let MaxMT = Math.max(...MaxMTArray)
        if(Math.round(MaxMT) == 0){ MaxMT = 1}
    
        let results =    this.Torsion;
        let stations =   this.Stations;
        let startPoint = this.StartPoint;
        let endPoint =   this.EndPoint;
        let rz =         this.Rotation;
        let scale = 1.25/MaxMT;
        let result = ResultsDiagram(results , stations, startPoint, endPoint, 2, rz, scale, "Moment");
        
        this.Draw = result;
        Results.Pattern = pattern
        this.InView();
    }

    Draw_N(pattern)
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
        let PatternResults = Results.ResultsList.filter(res => res.PatternID == pattern);
        let MaxNArray = [];
        for(let i = 0; i < PatternResults.length; i++)
        { 
            let absvals = [];
            PatternResults[i].Normal.forEach(value => absvals.push(Math.abs(value)) );
            let MaxLocalN = Math.max(...absvals);
            MaxNArray.push(MaxLocalN);
        }
        let MaxN = Math.max(...MaxNArray)
        if(Math.round(MaxN) == 0){ MaxN = 1}

        let results =    this.Normal;
        let stations =   this.Stations;
        let startPoint = this.StartPoint;
        let endPoint =   this.EndPoint;
        let rz =         this.Rotation;
        let scale = 1.25/MaxN;
        let result = ResultsDiagram(results , stations, startPoint, endPoint, 2, rz, scale, "Force");
        
        this.Draw = result;
        Results.Pattern = pattern
        this.InView();
    }

    Draw_Vx(pattern)
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
        let PatternResults = Results.ResultsList.filter(res => res.PatternID == pattern);
        let MaxVxArray = [];
        for(let i = 0; i < PatternResults.length; i++)
        { 
            let absvals = [];
            PatternResults[i].ShearX.forEach(value => absvals.push(Math.abs(value)) );
            let MaxLocalVx = Math.max(...absvals);
            MaxVxArray.push(MaxLocalVx);
        }
        let MaxVx = Math.max(...MaxVxArray)
        if(Math.round(MaxVx) == 0){ MaxVx = 1}

        let results =     this.ShearX;
        let stations =    this.Stations;
        let startPoint =  this.StartPoint;
        let endPoint =    this.EndPoint;
        let rz =          this.Rotation;
        let scale = 1.25/MaxVx;
        let result = ResultsDiagram(results , stations, startPoint, endPoint, 2, rz, scale, "Force");
        
        this.Draw = result;
        Results.Pattern = pattern
        this.InView();
    }

    Draw_Vy(pattern)
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
        let PatternResults = Results.ResultsList.filter(res => res.PatternID == pattern);
        let MaxVyArray = [];
        for(let i = 0; i < PatternResults.length; i++)
        { 
            let absvals = [];
            PatternResults[i].ShearY.forEach(value => absvals.push(Math.abs(value)) );
            let MaxLocalVy = Math.max(...absvals);
            MaxVyArray.push(MaxLocalVy);
        }
        let MaxVy = Math.max(...MaxVyArray)
        if(Math.round(MaxVy) == 0){ MaxVy = 1}
        
        let results =    this.ShearY;
        let stations =   this.Stations;
        let startPoint = this.StartPoint;
        let endPoint =   this.EndPoint;
        let rz =         this.Rotation;
        let scale = 1.25/MaxVy;
        let result = ResultsDiagram(results , stations, startPoint, endPoint, 3, rz, scale, "Force");

        this.Draw = result;
        Results.Pattern = pattern
        this.InView();
    }

    Hide()
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw)
        }
    }

    Show()
    {
        Standard();
        scene.add(this.Draw);
    }

    InView()
    {
        if(this.PatternID == Results.Pattern && Results.ResultsMode){
            this.Show();
        }
        else{
            this.Hide();
        }
        if(view == "XY")
        {
            if(this.StartPoint[2] != ViewPosition || this.EndPoint[2] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "XZ")
        {
            if(this.StartPoint[1] != ViewPosition || this.EndPoint[1] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "YZ")
        {
            if(this.StartPoint[0] != ViewPosition || this.EndPoint[0] != ViewPosition)
            {
                this.Hide();
            }
        }
    }
}




//#region // Results visualization
function ResultLines(length, x,y,z, startPoint, endPoint,  direction, rz, scale = 1) // , local = false)
{
    startPoint = new THREE.Vector3(startPoint[0], startPoint[1], startPoint[2]);
    endPoint = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);

    const axis = new THREE.Vector3().subVectors(startPoint, endPoint).normalize(); // Z-local direction
    // let x_axis = crossProduct([axis.x, axis.y, axis.z], [0,0,1]);
    // if(arrayEquals(x_axis,[0,0,0]))
    // {
    //     x_axis = [0,1,0]
    // }
    // const y_axis = crossProduct([axis.x, axis.y, axis.z], x_axis);
    // const X_axis = new THREE.Vector3(x_axis[0], x_axis[1], x_axis[2]);
    // const Y_axis = new THREE.Vector3(y_axis[0], y_axis[1], y_axis[2]);
    let x_axis;
    if(axis.x == 0 && axis.y != 0)
    {
        x_axis = crossProduct([axis.x, axis.y, axis.z], [1*Math.sin((axis.y/Math.abs(axis.y))* -rz), 0, 1*Math.cos(rz)]);   //3-local direction
    }
    else if(axis.x == 0 && axis.y == 0 && axis.z != 0){
        x_axis = crossProduct([axis.x, axis.y, axis.z],[1*Math.cos(rz), 1*Math.sin((axis.z/Math.abs(axis.z))* -rz) , 0]);    
    }
    else if((axis.x != 0 && axis.y != 0 && axis.z != 0))
    {
        x_axis = crossProduct([axis.x, axis.y, axis.z], [1*Math.sin((axis.y/Math.abs(axis.y))* -rz), 1*Math.sin((axis.x/Math.abs(axis.x))* rz),1*Math.cos(rz)]);   //3-local direction
    }
    else{
        x_axis = crossProduct([axis.x, axis.y, axis.z], [0,1*Math.sin((axis.x/Math.abs(axis.x))* rz),1*Math.cos(rz)]);   //3-local direction
    }
    //if(arrayEquals(x_axis,[0,0,0]))
    const y_axis = crossProduct([axis.x, axis.y, axis.z], x_axis);
    const X_axis = new THREE.Vector3(x_axis[0], x_axis[1], x_axis[2]);
    const Y_axis = new THREE.Vector3(y_axis[0], y_axis[1], y_axis[2]);  //2- local direction

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
    return [line, vertices];
}




// This function assumes results are from points distributed equally along the frame
function ResultsDiagram(results , stations, startPoint, endPoint, direction, rz, scale = 1, type)
{
    if(results.length != stations.length)
    {
        return
    }
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
    const geometry = new THREE.BufferGeometry();
    var vertices =[];  
    vertices.push(StartPoint.x, StartPoint.y, StartPoint.z);

    for (let i = 0; i < stations.length ; i++)
    {
        const x = StartPoint.x + ((stations[i]/distance) * dX);
        const y = StartPoint.y + ((stations[i]/distance) * dY);
        const z = StartPoint.z + ((stations[i]/distance) * dZ);
        
        const line = ResultLines(results[i], x, y, z, startPoint, endPoint,direction, rz, scale);
        load.add(line[0]);
 
        vertices.push(line[1][3]+ x, line[1][4]+ y, line[1][5]+ z);
        let position = 0;
        let color;
        
        if(results[i]>=0){
            position -= 0.1;
            color = {r:0,g:0,b:180,a:1}
        }
        else{
            position += 0.1;
            color = {r:180,g:0,b:0,a:1}
        }

        if(results[i] != results[i-1] && (results[i] == max || results[i] == min ))
        {
            let text;
            if(type == "Moment")
            {
                text = projUnits.MomentConvert(results[i]);
            }
            else{
                text = projUnits.ForceConvert(results[i], true);
            }
            if(direction ==1 || direction ==2)
            {
                const textPosition = [line[1][3]+ x, line[1][4]+ y, line[1][5]+ z+ position];
                const txt = makeResultsTextSprite( text.toFixed(2), textPosition[0], textPosition[1], textPosition[2],{fontsize: 110, fontface: "Georgia", textColor:color,
                    vAlign:"center", hAlign:"center"});
                    load.add(txt);
            }
            else{
                const textPosition = [line[1][3]+ x + position, line[1][4]+ y + position, line[1][5]+ z];
                const txt = makeResultsTextSprite( text.toFixed(2), textPosition[0], textPosition[1], textPosition[2],{fontsize: 110, fontface: "Georgia", textColor:color,
                    vAlign:"center", hAlign:"center"});
                    load.add(txt);
            }
        }
    }

    vertices.push(EndPoint.x, EndPoint.y, EndPoint.z);
    
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    const container = new THREE.Line( geometry, material );
    load.add(container);
    return load;
}
//#endregion








// function GetMaxResult (pattern, resultType){
    
//     let maxResultMx = [];
    
//     for (const frame of frames) {
//         if(frame.LoadsAssigned.has(pattern)){
//             let loads = frame.LoadsAssigned.get(pattern);
//             for(const load of loads){
//                 if(load.Magnitude instanceof Array){
//                     let absvals = [];
//                     load.Magnitude.forEach(value => absvals.push(Math.abs(value)) );
//                     maxLoads.push(Math.max(...absvals));
//                 } 
//                 else maxLoads.push(Math.abs(load.Magnitude));
//             }
//         }
//     }
//     return Math.max(...maxLoads);
// }









//#region Text

let _DESCENDER_ADJUST = 1;        // Constant relating to text boarder box height for lables

function makeResultsTextSprite( message, x, y, z, parameters ) 
{ 
    if ( parameters === undefined ) parameters = {}; 
     
    let fontface = parameters.hasOwnProperty("fontface") ?  
        parameters["fontface"] : "Arial"; 
     
    let fontsize = parameters.hasOwnProperty("fontsize") ?  
        parameters["fontsize"] : 28; 
     
    let borderThickness = parameters.hasOwnProperty("borderThickness") ?  
        parameters["borderThickness"] : undefined; //4; 
     
    let borderColor = parameters.hasOwnProperty("borderColor") ? 
        parameters["borderColor"] : undefined; //{ r:0, g:0, b:0, a:0.0 }; 
     
    let fillColor = parameters.hasOwnProperty("fillColor") ? 
        parameters["fillColor"] : undefined; 
 
    let textColor = parameters.hasOwnProperty("textColor") ? 
        parameters["textColor"] : { r:25, g:25, b:25, a:1.0 }; 
 
    let radius = parameters.hasOwnProperty("radius") ? 
                parameters["radius"] : undefined; // 6; 
 
    let vAlign = parameters.hasOwnProperty("vAlign") ? 
                        parameters["vAlign"] : "center"; 
 
    let hAlign = parameters.hasOwnProperty("hAlign") ? 
                        parameters["hAlign"] : "center"; 
 
    let canvas = document.createElement('canvas'); 
    let context = canvas.getContext('2d'); 
     
    // set a large-enough fixed-size canvas  
    canvas.width = 1800; 
    canvas.height = 900; 
     
    context.font = fontsize + "px " + fontface; 
    context.textBaseline = "alphabetic"; 
    context.textAlign = "left"; 
     
    // get size data (height depends only on font size) 
    let metrics = context.measureText( message ); 
    let textWidth = metrics.width; 
     
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
    let cx = canvas.width / 2; 
    let cy = canvas.height / 2; 
    let tx = textWidth/ 2.0; 
    let ty = fontsize / 2.0; 
 
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
            textWidth, fontsize * _DESCENDER_ADJUST, radius, borderThickness, borderColor, fillColor); 
     
    // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas 
    context.fillStyle = getCanvasColor(textColor); 
 
    context.fillText( message, cx - tx, cy + ty); 
  
    // draw some visual references - debug only 
    //drawCrossHairs( context, cx, cy );     
    // outlineCanvas(context, canvas); 
    //addSphere(x,y,z); 
    
    // canvas contents will be used for a texture 
    let texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true; 
 
    let spriteMaterial = new THREE.SpriteMaterial( { map: texture } ); 
    let sprite = new THREE.Sprite( spriteMaterial ); 
     
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






//#endregion
