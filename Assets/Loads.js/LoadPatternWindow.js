let loadWindow = `
    <div
    class="main-window"
    id="pattern-window"
    data-role="window"
    data-title="Define Load Patterns"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

        <div class="flex-col">
            <div class="flex-rowm align-center">

                <!--for inputs-->
                <div class="flex-col justify-start padding-all-0" data-role="panel" data-width="420" id="load-data" data-height="250" style="height:250px;" > 

                    <div class="flex-rowm margin-b-20 border-bottom bd-grayMouse">
                        <div style="width:120px;">
                            <strong>Name</strong>
                        </div>
                        <div style="width:120px;">
                            <strong>Type</strong>
                        </div>
                        <div style="width:120px;">
                            <strong>Self weight multiplier</strong>
                        </div>
                    </div>

                    <div class="flex-rowm margin-b-20">
                        <div style="width:120px;">
                            <input type="text" class="input-small" data-role="input" data-clear-button="false">
                        </div>
                        <div style="width:120px;">
                            <select 
                            id="pattern-type"
                            class="input-small"
                            data-role="select"
                            data-filter="false"
                            data-drop-height=80>
                                <option value='0'>Dead</option>
                                <option value='1'>Live</option>
                                <option value='2'>Wind</option>
                                <option value='3'>Other</option>
                            </select>
                        </div>
                        <div style="width:120px;">
                            <input type="number" min="0" class="input-small" data-role="input" data-clear-button="false">
                        </div>
                    </div>
                    <div id="patts-view-container">
                        <ul data-role="listview" id="patts-view">



                        </ul>
                    </div>
                </div>

                <!--for edit buttons-->
                <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="250">
                    <div> <button class="button info" id="add-pattern" style="width: 64px;"> Add </button> </div>
                    <div> <button class="button info" id="mod-pattern" style="width: 64px;"> Modify </button> </div>
                    <div> <button class="button default" id="delete-pattern" style="width: 64px;">Delete</button> </div>
                </div>

            </div>
            <!--for confirm buttons-->
            <div class="flex-rowm margin-b-20" style="justify-content: center;">
                <button id="pattern-close-btn" class="button default" style="width: 64px;"> Close </button>
            </div>
        </div>
    </div>
`
document.querySelector('#pattern-btn').addEventListener("click",function(){
    if(!document.querySelector('.main-window')){
        $('body').append(loadWindow);
        LoadDefPatterns();
        if(document.querySelector('#load-data .current-select'))ShowPattData();
        
        if (locked) {
            let bts = document.querySelectorAll('#pattern-window button');
            let inputs = document.querySelectorAll('#pattern-window input');
            bts.forEach( bt => bt.disabled = true);
            inputs.forEach( input => input.disabled = true);
            $('#pattern-type')[0].disabled = true;
            $('#pattern-close-btn')[0].disabled = false;
        }

        document.querySelector('#mod-pattern').addEventListener("click",function(){
            let pattId= document.querySelector('#load-data .current-select').getAttribute('value');
            ModifyPattern(pattId);
        } );

        document.querySelector('#add-pattern').addEventListener("click",function(){
            AddLoadPattern();
        })

        document.getElementById('pattern-close-btn').addEventListener("click",function(){
            document.querySelector('#pattern-window').parentElement.parentElement.remove();
        })

        document.getElementById('delete-pattern').addEventListener("click",function(){
            let pattId= document.querySelector('#load-data .current-select').getAttribute('value');
            DeletePattern(pattId);
        })
    }
})


function AddLoadPattern(){
    
    let name = document.querySelector('#load-data input[type="text"]').value;
    let type = Number(document.querySelector('#pattern-type').value);
    let wtmult = document.querySelector('#load-data input[type="number"]').valueAsNumber;
    let patt; 
    try {
        patt = new LoadPattern(name, type, wtmult);
        $('#patts-view').append(`
        <li value=${patt.ID} class="node" style="display:inline-block;">
            <div class="flex-rowm ">
                <div style="width:122px;">${patt.Name}</div>
                <div style="width:122px;">${Object.keys(ELoadPatternType)[patt.Type]}</div>
                <div style="width:122px;">${patt.SelfWtMult}</div>
            </div>
        </li>
        `);
    } catch (error) {
        Metro.dialog.create({
            title: "Can not modify load pattern",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
    //LoadDefPatterns();
    
}

function LoadDefPatterns() {
    document.querySelectorAll('#load-data ul li').forEach(elem => elem.remove());
    LoadPattern.LoadPatternsList.forEach( (value,key) => {
        $('#load-data ul').append(`
        <li value="${key}" class="node" style="display:inline-block;">
            <div class="flex-rowm ">
                <div style="width:122px;">${value.Name}</div>
                <div style="width:122px;">${Object.keys(ELoadPatternType)[value.Type]}</div>
                <div style="width:122px;">${value.SelfWtMult}</div>
            </div>
        </li>
        `);

    });
    document.querySelector('#load-data ul li').classList.add('current-select');
}

function ShowPattData() {
    let pattId= document.querySelector('#load-data .current-select').getAttribute('value');
    let pattern = LoadPattern.LoadPatternsList.get(pattId);
    document.querySelector('#load-data input[type="text"]').value = pattern.Name;
    document.querySelector('#load-data input[type="number"]').value = pattern.SelfWtMult;
    //console.log(pattern.Type)
}

function ModifyPattern(pattId){ 
    let pattern = LoadPattern.LoadPatternsList.get(pattId);
    let selectedElement = $(".current-select")[0];
    try{
        pattern.Name = document.querySelector('#load-data input[type="text"]').value;
        pattern.Type = Number(document.querySelector('#load-data select').value) ;
        pattern.SelfWtMult = document.querySelector('#load-data input[type="number"]').valueAsNumber;

        while (selectedElement.lastElementChild) {
            selectedElement.removeChild(selectedElement.lastElementChild);
        }
    
        $(".current-select").append(`
            <div class="flex-rowm ">
                <div style="width:122px;">${pattern.Name}</div>
                <div style="width:122px;">${Object.keys(ELoadPatternType)[pattern.Type]}</div>
                <div style="width:122px;">${pattern.SelfWtMult}</div> 
            </div>  
        `);

    }catch(error){
        Metro.dialog.create({
            title: "Can not modify load pattern",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
    

}

function DeletePattern(pattId) {
    let pattern = LoadPattern.LoadPatternsList.get(pattId);
    let selectedElement = $(".current-select")[0];
    try {
        pattern.Delete();
        $(".current-select")[0].remove();
    } catch (error) {
        Metro.dialog.create({
            title: "Error",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
}

function RefreshPattList() {
    document.querySelector('#patts-view-container').children[0].remove();
    //document.querySelectorAll(`#load-data ul li`).forEach(elem => elem.remove());
    //document.querySelector(`#load-data ul`).remove();
    $('#patts-view-container').append(`
    <ul data-role="listview"
    data-view="table"
    data-select-node="true"
    data-structure='{"type": true, "wtmult": true}'
    data-on-node-click="ShowPattData"
    >
    </ul>
    `);
    LoadDefPatterns();
}