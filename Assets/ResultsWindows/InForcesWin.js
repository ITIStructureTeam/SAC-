let frameForceWin = `
    <div
    class="main-window"
    id="frame-forces-window"
    data-role="window"
    data-title="Display Frame Forces"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <p class="panel-head">Case/Combination</p>
        <div class="flex-col justify-center padding-all-0" data-role="panel">
            <div class="flex-rowm justify-start">
                <div class="input-width"> <label> Case/Combination Name </label> </div>
                <div class="input-width">
                    <select 
                    id="case-combo-select"
                    class="input-small "
                    data-role="select"
                    data-filter="false"
                    data-drop-height=90>
                        <option value = 1>Dead</option>
                        <option value = 2>Live</option>
                        <option value = 3>Combo1</option>
                        <option value = 4>Combo2</option>
                    </select>
                </div>
            </div>
        </div>

        <p class="panel-head">Component</p>
        <div class="flex-col justify-center padding-all-0" data-role="panel">
            <div class="flex-rowm justify-start">
                <div class="input-width">
                    <input type="radio" id="axial" name="force" value="axial" checked="checked">
                    <label for="axial">Axial Force</label>
                </div>
                <div class="input-width">
                    <input type="radio" id="torsion" name="force" value="torsion">
                    <label for="torsion">Torsion</label>
                </div>
            </div>

            <div class="flex-rowm justify-start">
                <div class="input-width">
                    <input type="radio" id="shear2" name="force" value="shear2">
                    <label for="shear2">Shear 2-2</label>
                </div>
                <div class="input-width">
                    <input type="radio" id="moment2" name="force" value="moment2">
                    <label for="moment2">Moment 2-2</label>
                    
                </div>
            </div>
            
            <div  class="flex-rowm justify-start">
                <div class="input-width">
                    <input type="radio" id="shear3" name="force" value="shear3">
                    <label for="shear3">Shear 3-3</label>
                </div>
                <div class="input-width">
                    <input type="radio" id="moment3" name="force" value="moment3">
                    <label for="moment3">Moment 3-3</label>
                </div>
            </div>    
            
        </div>

        <div class="flex-rowm justify-center">
            <div> <button class="button default" id="ok-fforce-btn" style="width: 64px;"> Ok </button> </div>
            <div> <button class="button default" id="close-fforce-btn" style="width: 64px;"> Close </button> </div>
            <div> <button class="button default" id="app-fforce-btn" style="width: 64px;">Apply</button> </div>
        </div>


    </div>
`
let prevFForcedOptions = [];

document.querySelector('#frame-forces').addEventListener("click", function(){
    if(!document.querySelector('.main-window')){
        $('body').append(frameForceWin);
        FillFForcesCases();
        LoadPrevFForcesOptions();

        document.querySelector('#ok-fforce-btn').addEventListener("click", function(){

            GetForcesDiagData();
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });

        document.querySelector('#app-fforce-btn').addEventListener("click", function(){

            GetForcesDiagData();
        });

        document.querySelector('#close-fforce-btn').addEventListener("click", function(){
            document.querySelector('.main-window').parentElement.parentElement.remove();
        })
    }
});

function FillFForcesCases() {
    let length = $('#case-combo-select').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#case-combo-select').children()[i].remove();      
    }
    LoadPattern.LoadPatternsList.forEach((value,key) => {
        $('#case-combo-select').append(`
            <option value=${key}>${value.Name}</option>
        `);
    });
    LoadCombo.LoadCombosList.forEach((value,key) => {
        $('#case-combo-select').append(`
            <option value=${key}>${value.Name}</option>
        `);
    });

}

function GetForcesDiagData() {
    let caseId = $('#case-combo-select')[0].value;
    let force =  document.querySelector('input[name="force"]:checked').value;
 
    let results = Results.ResultsList.filter(res=> res.PatternID == caseId)
    
    // if in deformation mode go out
    if(DeformedShape.deformationMode){
        DeformedShape.deformationMode = false;
        DeformedShape.DeformShapesList.forEach(defshape => defshape.Hide());
    }

    // if in load mode go out
    if(DrawLine.LoadsDisplayed){
        DrawLine.LoadsDisplayed = false;
        DrawLine.HideLoads();
    }

    //if in reactiomn mode
    if (JointReactions.ReactMode) {
        JointReactions.ReactMode = false;
        for(let i = 0; i< JointReactions.ReactionsList.length; i++)
        {
            JointReactions.ReactionsList[i].Hide();
        }
    }
    
    for(let i = 0; i<Results.ResultsList.length; i++)
    {
        Results.ResultsList[i].Hide();
    }

    Results.ResultsMode = true;

    
    switch(force)
    {
        case 'axial':
            for(let i = 0; i<results.length; i++)
            {
                results[i].Draw_N(caseId);
            }
            break;
        case 'moment3':
            for(let i = 0; i<results.length; i++)
            {
                results[i].Draw_Mx(caseId);
            }
            break;
        case 'moment2':
            for(let i = 0; i<results.length; i++)
            {
                results[i].Draw_My(caseId);
            }
            break;
        case 'shear2':
            for(let i = 0; i<results.length; i++)
            {
                results[i].Draw_Vx(caseId);
            }
            break;
        case 'shear3':
            for(let i = 0; i<results.length; i++)
            {
                results[i].Draw_Vy(caseId);
            }
            break;
        case 'torsion':
            for(let i = 0; i<results.length; i++)
            {
                results[i].Draw_Tz(caseId);
            }
            break;
        }
}


function LoadPrevFForcesOptions() {
    if(prevFForcedOptions.length){
        $('#case-combo-select')[0].value = prevFForcedOptions[0];
        document.querySelector(`input[value="${prevFForcedOptions[1]}"]`).checked = true
    }else{
        document.querySelector('input[value="axial"]').checked=true
    }
}