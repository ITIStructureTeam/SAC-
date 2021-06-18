let pointLoadWin = `
    <div

    id="app-load-window"
    class="main-window"
    data-role="window"
    data-title="Assign Frame Point Loads"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <div class="flex-col">
            <div class="flex-rowm">
                <div class="padding-all-0" data-role="panel" data-width="400" data-height="200" style="height:200px;">
                    <div class="flex-col">

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Pattern</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="app-load-pattern"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Coordinate System</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="coord-sys"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    
                                    <option value=${0}>Global</option>
                                    <option value=${1}>Local</option>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Direction</label>
                            </div>
                            <div class="input-width" id="load-dir-container">
                                <select 
                                id="load-dir"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    <option value=1>X</option>
                                    <option value=3>Y</option>
                                    <option value=2>Z</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="200">
                    <div> <button class="button info" id="ok-ptload-btn" style="width: 64px;"> Ok </button> </div>
                    <div> <button class="button default" id="close-ptload-btn" style="width: 64px;"> Close </button> </div>
                </div>
            </div>

            <div class="padding-all-0" data-role="panel">
                <div class="flex-col">

                    <div class="input-width">
                        <input type="checkbox" id="delete-load" >
                        <label for="fill">Fill Diagram</label>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-dist">
                        <div class="input-width">
                            <label>Relative Distance</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0.25 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0.5 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=1 data-clear-button="false">
                        </div>
                        <div style="width:20px;">
                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-mag">
                        <div class="input-width">
                            <label>Loads</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div >
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div style="width:20px;">
                            <label>${projUnits.ForceUnit}</label>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
`

let distLoadWin = `
    <div

    id="app-load-window"
    class="main-window"
    data-role="window"
    data-title="Assign Frame Point Loads"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <div class="flex-col">
            <div class="flex-rowm">
                <div class="padding-all-0" data-role="panel" data-width="400" data-height="200" style="height:200px;">
                    <div class="flex-col">

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Pattern</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="app-load-pattern"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Coordinate System</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="coord-sys"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    
                                    <option value=${0}>Global</option>
                                    <option value=${1}>Local</option>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Direction</label>
                            </div>
                            <div class="input-width" id="load-dir-container">
                                <select 
                                id="load-dir"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    <option value=1>X</option>
                                    <option value=3>Y</option>
                                    <option value=2>Z</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="200">
                    <div> <button class="button info" id="ok-disload-btn" style="width: 64px;"> Ok </button> </div>
                    <div> <button class="button default" id="close-disload-btn" style="width: 64px;"> Close </button> </div>
                </div>
            </div>

            <div class="padding-all-0" data-role="panel">
                <div class="flex-col">

                    <div class="flex-rowm margin-b-20" id="app-load-dist">
                        <div class="input-width">
                            <label>Relative Distance</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=1 data-clear-button="false">
                        </div>
                        <div style="width:20px;">

                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-mag">
                        <div class="input-width">
                            <label>Loads</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div style="width:20px;">
                            <label>${projUnits.ForceUnit}</label>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
`

function GetPtLoadWin() {
    return  `
    <div

    id="app-load-window"
    class="main-window"
    data-role="window"
    data-title="Assign Frame Point Loads"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <div class="flex-col">
            <div class="flex-rowm">
                <div class="padding-all-0" data-role="panel" data-width="400" data-height="200" style="height:200px;">
                    <div class="flex-col">

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Pattern</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="app-load-pattern"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Coordinate System</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="coord-sys"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    
                                    <option value=${0}>Global</option>
                                    <option value=${1}>Local</option>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Direction</label>
                            </div>
                            <div class="input-width" id="load-dir-container">
                                <select 
                                id="load-dir"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    <option value=1>X</option>
                                    <option value=3>Y</option>
                                    <option value=2>Z</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="200">
                    <div> <button class="button info" id="ok-ptload-btn" style="width: 64px;"> Ok </button> </div>
                    <div> <button class="button default" id="close-ptload-btn" style="width: 64px;"> Close </button> </div>
                </div>
            </div>

            <div class="padding-all-0" data-role="panel">
                <div class="flex-col">

                    <div class="flex-rowm justify-center margin-b-20">
                        <div>
                            <input type="checkbox" id="delete-load" >
                            <label for="delete-load">Delete Existing Load</label>
                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-dist">
                        <div class="input-width">
                            <label>Relative Distance</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0.25 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0.5 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=1 data-clear-button="false">
                        </div>
                        <div style="width:20px;">
                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-mag">
                        <div class="input-width">
                            <label>Loads</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div >
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div style="width:20px;">
                            <label>${projUnits.ForceUnit}</label>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
`;
}

function GetDistLoadWin() {
    return `
    <div

    id="app-load-window"
    class="main-window"
    data-role="window"
    data-title="Assign Frame Point Loads"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <div class="flex-col">
            <div class="flex-rowm">
                <div class="padding-all-0" data-role="panel" data-width="400" data-height="200" style="height:200px;">
                    <div class="flex-col">

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Pattern</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="app-load-pattern"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Coordinate System</label>
                            </div>
                            <div class="input-width">
                                <select 
                                id="coord-sys"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    
                                    <option value=${0}>Global</option>
                                    <option value=${1}>Local</option>

                                </select>
                            </div>

                        </div>

                        <div class="flex-rowm margin-b-20">

                            <div class="input-width">
                                <label>Load Direction</label>
                            </div>
                            <div class="input-width" id="load-dir-container">
                                <select 
                                id="load-dir"
                                class="input-small"
                                data-role="select"
                                data-filter="false"
                                data-drop-height=80>
                                    <option value=1>X</option>
                                    <option value=3>Y</option>
                                    <option value=2>Z</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="200">
                    <div> <button class="button info" id="ok-disload-btn" style="width: 64px;"> Ok </button> </div>
                    <div> <button class="button default" id="close-disload-btn" style="width: 64px;"> Close </button> </div>
                </div>
            </div>

            <div class="padding-all-0" data-role="panel">
                <div class="flex-col">

                    <div class="flex-rowm justify-center margin-b-20">
                        <div>
                            <input type="checkbox" id="delete-load" >
                            <label for="delete-load">Delete Existing Load</label>
                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-dist">
                        <div class="input-width">
                            <label>Relative Distance</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=1 data-clear-button="false">
                        </div>
                        <div style="width:20px;">

                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20" id="app-load-mag">
                        <div class="input-width">
                            <label>Loads</label>
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div class="width-80">
                            <input type="number" min="0" class="input-small" data-role="input" value=0 data-clear-button="false">
                        </div>
                        <div style="width:20px;">
                            <label>${projUnits.ForceUnit}</label>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
`
}

function AppliedLoadPatts(){
    LoadPattern.LoadPatternsList.forEach( (value, key) => {
        $('#app-load-pattern').append(`
            <option value=${key}>${value.Name}</option>
        `)
    });
}

function FillLoadsDirs() {
    $('#load-dir-container').empty();
    let coordSys = Boolean(Number($('#coord-sys')[0].value)) ;
    if(coordSys){
        $('#load-dir-container').append(`
            <select 
            id="load-dir"
            class="input-small"
            data-role="select"
            data-filter="false"
            data-drop-height=80>
                <option value=1>Local 1</option>
                <option value=2>Local 2</option>
                <option value=3>Local 3</option>
            </select>
        `);

    }else{
        $('#load-dir-container').append(`
            <select 
            id="load-dir"
            class="input-small"
            data-role="select"
            data-filter="false"
            data-drop-height=80>
                <option value=1>X</option>
                <option value=3>Y</option>
                <option value=2>Z</option>
            </select>
        `);
    }
}

function GetPtLoadInfo() {
    let coordSys = Boolean(Number($('#coord-sys')[0].value)) ;
    let dir = Number($('#load-dir')[0].value);
    let magnitudes = [];
    let distances = [];
    let inputMags = $('#app-load-mag').find('input');
    let relDists = $('#app-load-dist').find('input');

    for (let i = 0; i < inputMags.length; i++) {
        let magnitude = Number(inputMags[i].value);
        let distance = Number(relDists[i].value);
        if( magnitude!= 0){
            magnitudes.push(magnitude);
            distances.push(distance);
        }     
    }

    if(distances.some(dist => (dist<0||dist>1))){
        Metro.dialog.create({
            title: "Error",
            content: `<div>Relative distance must be between 0 and 1 inclusive</div>`,
            closeButton: true
        });
        return;
    }

    let appliedLoads = [];
    for (let i = 0; i < magnitudes.length; i++) {
        let loadInfo = new AppliedLoadInfo(coordSys,dir,0,0,distances[i], projUnits.ForceConvert( magnitudes[i]));
        appliedLoads.push(loadInfo);    
    }
    return appliedLoads;
}

function GetDistLoadInfo() {

    let coordSys = Boolean(Number($('#coord-sys')[0].value)) ;
    let dir = Number($('#load-dir')[0].value);
    let magnitudes = [];
    let distances = [];
    let inputMags = $('#app-load-mag').find('input');
    let relDists = $('#app-load-dist').find('input');

    for (let i = 0; i < inputMags.length; i++) {
        let magnitude = Number(inputMags[i].value);
        let distance = Number(relDists[i].value);
        magnitudes.push( projUnits.ForceConvert(magnitude) );
        distances.push(distance);   
    }

    if( magnitudes.every( mag => mag==0 ) ) return;

    if(distances.some(dist => (dist<0||dist>1))){
        Metro.dialog.create({
            title: "Error",
            content: `<div>Relative distance must be between 0 and 1 inclusive</div>`,
            closeButton: true
        });
        return;
    }

    let appliedLoad = new AppliedLoadInfo(coordSys, dir, 0, 1, distances, magnitudes);
    return [appliedLoad];
}

function GetAppLoadPatternId() {
    return $('#app-load-pattern')[0].value;
}


document.querySelector('#point-load-btn').addEventListener("click", function(){
    if(!document.querySelector('.main-window')){
        $('body').append(GetPtLoadWin());
        AppliedLoadPatts();
        let delLoadOption = document.getElementById('delete-load');
        
        document.querySelector('#coord-sys').addEventListener("change",FillLoadsDirs);

        delLoadOption.addEventListener("input", function(e){
            let distInputs = document.querySelectorAll('#app-load-dist input');
            let magsInputs = document.querySelectorAll('#app-load-mag input');
            if(e.target.checked){               
                distInputs.forEach(input => input.disabled=true);
                magsInputs.forEach(input=> input.disabled=true);
            }else{
                distInputs.forEach(input => input.disabled=false);
                magsInputs.forEach(input=> input.disabled=false);
            }
        });

        document.querySelector('#ok-ptload-btn').addEventListener('click', function(){
            let appliedLoads =  GetPtLoadInfo();
            let patternId = GetAppLoadPatternId();
            DrawLine.DisplayedPattern = patternId;
            
            if(DrawLine.SelectedLines.length){

                if(delLoadOption.checked){

                    //#region Check validity of lines to delete loads from
                    let trustedlines = [];
                    let lines = DrawLine.SelectedLines.filter(drawline => drawline.Frame.LoadsAssigned.has(patternId) );
                    lines.forEach( line => {
                        let existingload = line.Frame.LoadsAssigned.get(patternId).filter( appload => appload.Shape == ELoadShape.Point );
                        if(existingload.length) trustedlines.push(line);
                    });
                    //#endregion

                    if(trustedlines.length)
                    commands.excuteCommand(new DeleteFrameLoad(trustedlines, patternId, ELoadShape.Point));

                }else if(appliedLoads.length){

                    commands.excuteCommand(new AssignFrameLoad(DrawLine.SelectedLines, patternId, appliedLoads));

                }
           
            }
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });

        document.querySelector('#close-ptload-btn').addEventListener('click', function(){
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });
    }
});

document.querySelector('#distributed-load-btn').addEventListener("click", function(){
    if(!document.querySelector('.main-window')){
        $('body').append(GetDistLoadWin());
        AppliedLoadPatts();
        let delLoadOption = document.getElementById('delete-load');
        document.querySelector('#coord-sys').addEventListener("change",FillLoadsDirs);
        
        delLoadOption.addEventListener("input", function(e){
            let distInputs = document.querySelectorAll('#app-load-dist input');
            let magsInputs = document.querySelectorAll('#app-load-mag input');
            if(e.target.checked){               
                distInputs.forEach(input => input.disabled=true);
                magsInputs.forEach(input=> input.disabled=true);
            }else{
                distInputs.forEach(input => input.disabled=false);
                magsInputs.forEach(input=> input.disabled=false);
            }
        });

        document.querySelector('#ok-disload-btn').addEventListener('click', function(){
            let appliedLoads =  GetDistLoadInfo();
            let patternId = GetAppLoadPatternId();
            DrawLine.DisplayedPattern = patternId;
            if(DrawLine.SelectedLines.length){
                
                if(delLoadOption.checked){

                    //#region Check validity of lines to delete loads from
                    let trustedlines = [];
                    let lines = DrawLine.SelectedLines.filter(drawline => drawline.Frame.LoadsAssigned.has(patternId) );
                    lines.forEach( line => {
                        let existingload = line.Frame.LoadsAssigned.get(patternId).filter(appload => appload.Shape == ELoadShape.Distributed);
                        if(existingload.length) trustedlines.push(line);
                    });
                    //#endregion

                    if(trustedlines.length)
                    commands.excuteCommand(new DeleteFrameLoad(trustedlines, patternId, ELoadShape.Distributed));

                }else if(appliedLoads.length){

                    commands.excuteCommand(new AssignFrameLoad(DrawLine.SelectedLines, patternId, appliedLoads));

                }
            }
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });

        document.querySelector('#close-disload-btn').addEventListener('click', function(){
            document.querySelector('.main-window').parentElement.parentElement.remove();
        })
    }
});

document.querySelector('#disp-load-btn').addEventListener("click", function(){
    if(!document.querySelector('.main-window')){
        $('body').append(dispLoadsWindow);
        DispLoadPatts();
        document.querySelector('#ok-disp-load-btn').addEventListener("click", function(){

            // if in deformation mode go out
            if(DeformedShape.deformationMode){
                DeformedShape.deformationMode = false;
                DeformedShape.DeformShapesList.forEach(defshape => defshape.Hide());
            }

            // if in results mode
            if(Results.ResultsMode){
                Results.ResultsMode = false;
                for(let i = 0; i<Results.ResultsList.length; i++)
                {
                    Results.ResultsList[i].Hide();
                }
            }

            // if in reaction mode
            if (JointReactions.ReactMode) {
                JointReactions.ReactMode = false;
                for(let i = 0; i< JointReactions.ReactionsList.length; i++)
                {
                    JointReactions.ReactionsList[i].Hide();
                }
            }
            
            // go in show load mode
            let patId = GetDispLoadPatternId();
            DrawLine.LoadsDisplayed = true;
            DrawLine.DisplayedPattern = patId;
            Standard();
            DrawLine.DrawLinesArray.forEach(line => {                
                line.DisplayLoad(patId);
                line.InView();
            });
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });
        document.querySelector('#close-disp-load-btn').addEventListener("click", function(){
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });
    }
});