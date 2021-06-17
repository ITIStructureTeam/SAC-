
let reactionsWin = `
    <div
    class="main-window"
    id="reactions-window"
    data-role="window"
    data-title="Display Support reactions"
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
                    id="Rcase-combo-select"
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
                    <input type="radio" id="Forces" name="force" value="force" checked="checked">
                    <label for="Forces">Forces</label>
                </div>
                <div class="input-width">
                    <input type="radio" id="Moments" name="force" value="moment">
                    <label for="Moments">Moments</label>
                </div>
            </div>   
            
        </div>

        <div class="flex-rowm justify-center">
            <div> <button class="button default" id="ok-reactions-btn" style="width: 64px;"> Ok </button> </div>
            <div> <button class="button default" id="close-reactions-btn" style="width: 64px;"> Close </button> </div>
            <div> <button class="button default" id="app-reactions-btn" style="width: 64px;">Apply</button> </div>
        </div>
    </div>
    
`
let prevReactionsOptions = [];

document.querySelector('#reactions').addEventListener("click", function(){
    if(!document.querySelector('.main-window')){
        $('body').append(reactionsWin);
        FillResultsCases();
        //LoadPrevReactionsOptions();
    
        document.querySelector('#ok-reactions-btn').addEventListener("click", function(){
            DrawLine.LoadsDisplayed = false;
            DrawLine.HideLoads();
            GetResults();
            document.querySelector('.main-window').parentElement.parentElement.remove();
        });
        document.querySelector('#app-reactions-btn').addEventListener("click", function(){
            DrawLine.LoadsDisplayed = false;
            DrawLine.HideLoads();
            GetResults();
        });
        document.querySelector('#close-reactions-btn').addEventListener("click", function(){
            document.querySelector('.main-window').parentElement.parentElement.remove();
        })
    }
});

function FillResultsCases() {
    let length = $('#Rcase-combo-select').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#Rcase-combo-select').children()[i].remove();      
    }
    LoadPattern.LoadPatternsList.forEach((value,key) => {
        $('#Rcase-combo-select').append(`
            <option value=${key}>${value.Name}</option>
        `);
    });
    LoadCombo.LoadCombosList.forEach((value,key) => {
        $('#Rcase-combo-select').append(`
            <option value=${key}>${value.Name}</option>
        `);
    });

}

function GetResults() {

    let caseId = $('#Rcase-combo-select')[0].value;
    let force =  document.querySelector('input[name="force"]:checked').value;

    let results = JointReactions.ReactionsList.filter(res=> res.PatternID == caseId)

    for(let i = 0; i< JointReactions.ReactionsList.length; i++)
    {
        JointReactions.ReactionsList[i].Hide();
    }
    
    for(let i = 0; i<Results.ResultsList.length; i++)
    {
        Results.ResultsList[i].Hide();
    }

    switch(force)
    {
        case 'force':
            for(let i = 0; i<results.length; i++)
            {
                results[i].DrawForces(caseId);
            }
            break;
        case 'moment':
            for(let i = 0; i<results.length; i++)
            {
                results[i].DrawMoments(caseId);
            }
            break;
        }
}


// function LoadPrevReactionsOptions() {
//     if(prevFForcedOptions.length){
//         $('#Rcase-combo-select')[0].value = prevReactionsOptions[0];
//         document.querySelector(`input[value="${prevReactionsOptions[1]}"]`).checked = true
//         if(prevReactionsOptions[2]){
//             document.querySelector(`input[value="user"]`).checked = true;
//             document.querySelector('input[type="number"]').disabled = false
//             document.querySelector('input[type="number"]').value = prevReactionsOptions[2];
//         }else{
//             document.querySelector(`input[value="auto"]`).checked = true;
//         }
//         document.querySelector(`input[value="${prevReactionsOptions[3]}"]`).checked = true;       
//     }else{
//         document.querySelector('input[value="Force"]').checked=true
//         document.querySelector('input[value="auto"]').checked=true
//         document.querySelector('input[value="fill"]').checked = true;
//     }
// }