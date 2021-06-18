let deformWin = `
    <div
    class="main-window"
    id="deformed-window"
    data-role="window"
    data-title="Display Deformed Shape"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <p class="panel-head">Case/Combo</p>
        <div class="flex-col justify-center padding-all-0" data-role="panel">
            <div class="flex-rowm justify-start" style="height:120px;">
                <div class="input-width"> <label> Case/Combo Name </label> </div>
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

        <div class="flex-rowm justify-center">
            <div> <button class="button default" id="ok-deform-btn" style="width: 64px;"> Ok </button> </div>
            <div> <button class="button default" id="close-deform-btn" style="width: 64px;"> Close </button> </div>
            <div> <button class="button default" id="app-deform-btn" style="width: 64px;">Apply</button> </div>
        </div>


    </div>
`
let prevDefOptions;

document.querySelector('#deformed-btn').addEventListener("click", function(){
    $('body').append(deformWin)
    FillFForcesCases();
    LoadPrevFForcesOptions();

    
    document.querySelector('#ok-deform-btn').addEventListener("click", function(){
        let caseId = prevDefOptions = GetDeformData();

        // hide loads if displayed
        if (DrawLine.LoadsDisplayed) {
            DrawLine.LoadsDisplayed = false;
            DrawLine.HideLoads();
        }

        // hide reactions
        if(JointReactions.ReactMode){
            JointReactions.ReactMode = false
            JointReactions.ReactionsList.forEach(reaction => reaction.Hide());
        }

        //hide results
        if (Results.ResultsMode) {
            Results.ResultsMode = false
            Results.ResultsList.forEach(result => result.Hide());
        }

        // hide drawline ---dont work----
        DrawLine.DrawLinesArray.forEach(drawline=> drawline.Hide());

        //go to standard view
        //Standard();

        // hide displayed deformations
        if (DeformedShape.deformationMode) {
            DeformedShape.DeformShapesList.forEach( defShape=> defShape.Hide() );      
        }

        // show deformation for load case
        DeformedShape.deformationMode = true;
        DeformedShape.displayedLoadCase = caseId;
        DeformedShape.DeformShapesList.forEach( defShape=> defShape.InView() );

        document.querySelector('.main-window').parentElement.parentElement.remove();
    });

    document.querySelector('#app-deform-btn').addEventListener("click", function(){
        let caseId = prevDefOptions =  GetDeformData();

        // hide loads if displayed
        if (DrawLine.LoadsDisplayed) {
            DrawLine.LoadsDisplayed = false;
            DrawLine.HideLoads();
        }

        // hide reactions
        if(JointReactions.ReactMode){
            JointReactions.ReactMode = false
            JointReactions.ReactionsList.forEach(reaction => reaction.Hide());
        }

        //hide results
        if (Results.ResultsMode) {
            Results.ResultsMode = false
            Results.ResultsList.forEach(result => result.Hide());
        }

        // hide drawline ---dont work----
        DrawLine.DrawLinesArray.forEach(drawline=> drawline.Hide());

        //go to standard view
        //Standard();

        // hide displayed deformations
        if (DeformedShape.deformationMode) {
            DeformedShape.DeformShapesList.forEach( defShape=> defShape.Hide() );      
        }

        // show deformation for load case
        DeformedShape.deformationMode = true;
        DeformedShape.displayedLoadCase = caseId;
        DeformedShape.DeformShapesList.forEach( defShape=> defShape.InView() );
    });

    document.querySelector('#close-deform-btn').addEventListener("click", function(){
        document.querySelector('.main-window').parentElement.parentElement.remove();
    });
});


function GetDeformData() {
    let caseId = $('#case-combo-select')[0].value;
    return caseId;
}

function LoadPrevFForcesOptions() {
    if(prevDefOptions){
        $('#case-combo-select')[0].value = prevDefOptions;
    }
}