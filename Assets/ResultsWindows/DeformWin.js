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
            <div class="flex-rowm justify-start">
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

        

        <p class="panel-head">Scaling</p>
        <div class="flex-col justify-center padding-all-0" data-role="panel">
            <div class="input-width">
                <input type="radio" id="auto" name="scale" value="auto" >
                <label for="auto">Automatic</label>
            </div>
            <div class="flex-rowm justify-between">
                <div class="input-width">
                    <input type="radio" id="user" name="scale" value="user">
                    <label for="user">User Defined</label>
                </div>
                <div class="width-80">
                    <input type="number" min="0" class="input-small" data-role="input" data-clear-button="false" disabled>
                </div>
            </div>

        </div>

        <p class="panel-head">Options</p>
        <div class="flex-col justify-center padding-all-0" data-role="panel">
            <div class="flex-rowm justify-start">
                <div class="input-width">
                    <input type="radio" id="Wire" name="diagram" value="Wire" >
                    <label for="Wire">Wire Shadow</label>
                </div>
                <div class="input-width">
                    <input type="radio" id="cubic" name="diagram" value="cubic">
                    <label for="cubic">Cubic Curve</label>
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
let prevDefOptions = [];

document.querySelector('#deformed-btn').addEventListener("click", function(){
    $('body').append(deformWin)
    FillFForcesCases();
    LoadPrevFForcesOptions();
    document.querySelector('#user').addEventListener("input", function(){
        document.querySelector('input[type="number"]').disabled = false;
    });
    document.querySelector('#auto').addEventListener("input", function(){
        document.querySelector('input[type="number"]').disabled = true;
    });
    document.querySelector('#ok-deform-btn').addEventListener("click", function(){
        let defOpt = prevDefOptions = GetDeformData();
        console.log(defOpt)
        document.querySelector('.main-window').parentElement.parentElement.remove();
    });
    document.querySelector('#app-deform-btn').addEventListener("click", function(){
        let defOpt = prevDefOptions =  GetDeformData();
    });
    document.querySelector('#close-deform-btn').addEventListener("click", function(){
        document.querySelector('.main-window').parentElement.parentElement.remove();
    });
});

function GetDeformData() {
    let caseId = $('#case-combo-select')[0].value;
    let scale = (document.querySelector('input[value="user"]').checked)? document.querySelector('input[type="number"]').value: null;
    let digOption = document.querySelector('input[name="diagram"]:checked').value;
    return[caseId, scale, digOption]
}

function LoadPrevFForcesOptions() {
    if(prevDefOptions.length){
        $('#case-combo-select')[0].value = prevDefOptions[0];
        if(prevDefOptions[1]){
            document.querySelector(`input[value="user"]`).checked = true;
            document.querySelector('input[type="number"]').disabled = false
            document.querySelector('input[type="number"]').value = prevDefOptions[1];
        }else{
            document.querySelector(`input[value="auto"]`).checked = true;
        }
        document.querySelector(`input[value="${prevDefOptions[2]}"]`).checked = true;       
    }else{
        document.querySelector('input[value="auto"]').checked=true
        //document.querySelector('input[value="cubic"]').checked = true;
    }
}