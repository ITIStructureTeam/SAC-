import {MapControls} from './Assets/Three.js files/OrbitControls.js'
import {DoubleSide } from './Assets/Three.js files/three.module.js';

let PreProcessor = true;

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
//THREE.Object3D.DefaultUp.set(0, 0, 1);
THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );
camera.position.z = 40;
camera.position.y = 25;
camera.position.x = 40;

camera.lookAt(8,0,16);


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
        console.log(DrawLine.GetDrawnFrames()[0].Section)
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
    // hide loads if shown
    DrawLine.LoadsDisplayed = false;
    DrawLine.HideLoads();
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
                    StatusBar.innerHTML='Select Next Point'
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
                    StatusBar.innerHTML='Select First Point'
                    commands.excuteCommand(new DrawLine(new FrameElement(points,GetSelectedSection())));
                    points = [];
                }
            }
	    }
    }
}

//keys
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
        if(PreProcessor == true){
            Undo();
        }
	}
    if(event.key === "y" && event.ctrlKey){
        if(PreProcessor == true){
		    Redo();
        }
	}
    if( event.key === "Z" && event.shiftKey && event.ctrlKey){
        if(PreProcessor == true){
		    Redo();
        }
	}
    if(event.shiftKey || event.ctrlKey){
        SelectionModeActive = false;
	 document.querySelector("body").style = "cursor:alias"
    }
    if(event.key === "Delete"){
        if(PreProcessor == true){
            DeleteButton();
        }
    }
});

renderer.domElement.addEventListener('dblclick',()=>{
    Unselect();
});

document.addEventListener("keyup", function(){
    if(DrawingModeActive == false)
    {
        SelectionModeActive = true;
	document.querySelector("body").style = "cursor:default"
    }  
});

document.addEventListener( 'mousedown', function ( event ) {
    if(event.button === 2)
    {
        document.querySelector("body").style = "cursor:grabbing"
    }});
document.addEventListener( 'mouseup', function ( event ) {
    if(event.button === 2)
    {
        document.querySelector("body").style = "cursor:default"
    }});










const selection = new THREE.SelectionBox( camera, scene );
const helper = new THREE.SelectionHelper( selection, renderer, 'selectBox' );

renderer.domElement.addEventListener( 'mousedown', function ( event ) {
        if(event.button === 1 || event.button === 2)
        {
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden");
        }
        else{
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "visible");
        }
});
        
renderer.domElement.addEventListener( 'mousedown', function ( event ) {

            if(event.button === 0 && SelectionModeActive == true)
            {  
            selection.startPoint.set(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1,
                0.5 );
            }
} );

renderer.domElement.addEventListener( 'mousemove', function ( event ) {
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

renderer.domElement.addEventListener( 'mouseup', function ( event ) {
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
                    //DrawLine.SelectedLines.pop(filterselected[i].object.DrawLine);
                    let frameIndex = DrawLine.SelectedLines.indexOf(filterselected[i].object.DrawLine);
                    DrawLine.SelectedLines.splice(frameIndex,1); 
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
                            //Point.SelectedPoints.pop(Point.PointsArray[j]);
                            let pointIndex = Point.SelectedPoints.indexOf(Point.PointsArray[j]);
                            Point.SelectedPoints.splice(pointIndex,1); 
                        }
                    }
                }
            }
        }
    }
}


setInterval(CheckForUpdates, 700);
function CheckForUpdates()
{
    if( secAssigned && DrawLine.SelectedLines.length){
        DrawLine.LoadsDisplayed=false;
        DrawLine.HideLoads();
        commands.excuteCommand( new AssignFrameSection( assignedSection ) );
        secAssigned = false;
        if(state == true){
            DrawLine.DisplaySectionNames();
        }
    }

    if(secUpdated && !state){
        DrawLine.DrawLinesArray.forEach( drawLine=> drawLine.ReExtrude());
        secUpdated = false
    }

    if(unitsUpdated){
        DrawLine.DrawLinesArray.forEach( line => line.DisplayLoad());
        unitsUpdated = false;
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
        renderer.domElement.addEventListener( 'click', ClickToDrawLine, false );
        hover();
        SelectionModeActive == false;
    }
    else{
        renderer.domElement.removeEventListener( 'click', ClickToDrawLine, false );
        SelectionModeActive == true;
    }
    
    if(SelectionModeActive == true){    
        renderer.domElement.addEventListener('click',ClickToSelectElement,false);
    } 
    else{
        document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden");
        renderer.domElement.removeEventListener('click',ClickToSelectElement,false);
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
    let position = 0;
    for (let i = 0; i <= listz.length; i++)
    {
        const text = "Z = "+ projUnits.LengthConvert(position, true);
        position += listz[i];
        $("#XY").append(`<option value=${position} >${text}</option>`);
    }

    position = 0;
    for (let i = 0; i <= listy.length; i++)
    {
        const text = "Z = "+ projUnits.LengthConvert(position, true);
        position += listy[i];
        $("#XZ").append(`<option value=${position} >${text}</option>`);
    }

    position = 0;
    for (let i = 0; i <= listx.length; i++)
    {
        const text = "Z = "+ projUnits.LengthConvert(position, true);
        position += listx[i];
        $("#YZ").append(`<option value=${position} >${text}</option>`);
    }
    
    // const yz = document.getElementById("YZ");
    // position = 0;
    // for (let i = 0; i <= listx.length; i++)
    // {
    //     const option = document.createElement("option");
    //     option.text = "X = "+position;
    //     yz.add(option, yz[i]);
    //     position += listx[i];
    // }
}

function removeSelectionGrids()
{
    const xy = $('#XY').children().length;
    for (let i = xy - 1; i >= 0; i--) {
        $('#XY').children()[i].remove(); 
    }
    
    const xz = $('#XZ').children().length;
    for (let i = xz - 1; i >= 0; i--) {
        $('#XZ').children()[i].remove(); 
    }
    
    const yz = $('#YZ').children().length;
    for (let i = yz - 1; i >= 0; i--) {
        $('#YZ').children()[i].remove(); 
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
    for (let j = 0; j < Results.ResultsList.length; j++)
    {
        if(Results.ResultsList[i].Draw != null)
        {
            Results.ResultsList[i].InView();
        }
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

    document.getElementById("StatusBar").innerHTML = "Z = " + projUnits.LengthConvert(ViewPosition, true) + projUnits.LenUnit ; 
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
    for (let j = 0; j < Results.ResultsList.length; j++)
    {
        if(Results.ResultsList[j].Draw != null)
        {
            Results.ResultsList[j].InView();
        }
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

    document.getElementById("StatusBar").innerHTML = "Y = " + projUnits.LengthConvert(ViewPosition, true) + projUnits.LenUnit ;
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
    for (let j = 0; j < Results.ResultsList.length; j++)
    {
        if(Results.ResultsList[j].Draw != null)
        {
            Results.ResultsList[j].InView();
        }
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

    document.getElementById("StatusBar").innerHTML = "X = " + projUnits.LengthConvert(ViewPosition, true) + projUnits.LenUnit ; 
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
    for (let i = 0; i < Results.ResultsList.length; i++)
    {
        if(Results.ResultsList[i].Draw != null)
        {
            Results.ResultsList[i].InView();
        }
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












        








class RootData
{
    constructor()
    {
        this.Materials = [...Material.MaterialsList.values()];
        this.Sections = [...Section.SectionList.values()];
        this.Patterns = Array.from(LoadPattern.LoadPatternsList, ([PatternID, Details]) => ({ PatternID, Details }));
        this.Combinations = Array.from(LoadCombo.LoadCombosList, ([CombinationID, Details]) => ({ CombinationID, Details }));
        this.Points = [...Point.PointsArray];
        this.Frames = DrawLine.GetDrawnFrames();
    }
}


function DisaplePreProcessorButtons()
{
    Unselect();
    DrawingModeActive = false;
    PreProcessor = false;
    document.getElementById("Move").disabled = true;
    document.getElementById("Copy").disabled = true;
    document.getElementById("Delete").disabled = true;
    document.getElementById("Undo").disabled = true;
    document.getElementById("Redo").disabled = true;
    document.getElementById("Rotate").disabled = true;
    document.getElementById("point-load-btn").disabled = true;
    document.getElementById("distributed-load-btn").disabled = true;
    document.getElementById("JointRestraints").disabled = true;
    document.getElementById("assign-framesec-btn").disabled = true;
    document.getElementById("Draw").disabled = true;
    document.getElementById("AddPointsOnFrame").disabled = true;
    document.getElementById("grids-btn").disabled = true;
    document.getElementById("materialsBtn").disabled = true;
    document.getElementById("DefineSections").disabled = true;
    document.getElementById("pattern-btn").disabled = true;
    document.getElementById("combo-btn").disabled = true;
    document.getElementById("Run").disabled = true;
    document.getElementById("Unlock").disabled = false;
}

function EnaplePreProcessorButtons()
{
    PreProcessor = true;
    document.getElementById("Move").disabled = false;
    document.getElementById("Copy").disabled = false;
    document.getElementById("Delete").disabled = false;
    document.getElementById("Undo").disabled = false;
    document.getElementById("Redo").disabled = false;
    document.getElementById("Rotate").disabled = false;
    document.getElementById("point-load-btn").disabled = false;
    document.getElementById("distributed-load-btn").disabled = false;
    document.getElementById("JointRestraints").disabled = false;
    document.getElementById("assign-framesec-btn").disabled = false;
    document.getElementById("disp-load-btn").disabled = false;
    document.getElementById("Draw").disabled = false;
    document.getElementById("AddPointsOnFrame").disabled = false;
    document.getElementById("grids-btn").disabled = false;
    document.getElementById("materialsBtn").disabled = false;
    document.getElementById("DefineSections").disabled = false;
    document.getElementById("pattern-btn").disabled = false;
    document.getElementById("combo-btn").disabled = false;
    document.getElementById("Run").disabled = false;
    document.getElementById("Unlock").disabled = true;
}

document.getElementById("Unlock").onclick=function(){Unlock()};
function Unlock()
{ 
    EnaplePreProcessorButtons();
    Results.ResultsList.forEach(res => res.Hide());
    Results.ResultsList = [];
}




    

    $("#Run").click(function()
    {
        DisaplePreProcessorButtons()

        let OutPut = JSON.stringify(new RootData());
        console.log(OutPut);
        $.ajax({
            type: "POST",
            url: "/api/RunAnalysis/LoadFramesData",                 
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: OutPut,
            cache: false,
            success: function (result) {
                console.log(result);
                let InputResults = [...result.strainingActions];
                for(let i = 0 ; i < InputResults.length; i++)
                {
                    let patternID  = InputResults[i].patternID ;
                    let frameID    = InputResults[i].frameID   ;
                    let startPoint = InputResults[i].startPoint;
                    let endPoint   = InputResults[i].endPoint  ;
                    let stations   = InputResults[i].stations  ;
                    let momentX    = InputResults[i].momentX   ;
                    let momentY    = InputResults[i].momentY   ;
                    let torsion    = InputResults[i].torsion   ;
                    let normal     = InputResults[i].normal    ;
                    let shearX     = InputResults[i].shearX    ;
                    let shearY     = InputResults[i].shearY    ;
                    let rotation   = InputResults[i].rotation  ;
                    new Results(patternID, frameID, startPoint,endPoint,stations,momentX,momentY,torsion,normal,shearX,shearY,rotation) 
                }

                console.log(Results.ResultsList)
            },
            error: function (ex) {
                console.log(ex.responseText);
            }
        });
    });


