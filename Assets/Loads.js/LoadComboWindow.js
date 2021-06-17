let comboMainWindow = `
<div

id="combo-main-window"
class="main-window"
data-role="window"
data-title="Define Load Combinations"
data-btn-min="false"
data-btn-max="false"
data-btn-close="false"
data-resizable="false"
data-place="center"
data-width="350">

    <div class="flex-col">
        <div class="flex-rowm">
            <div data-role="panel" data-title-caption="Load Combinations" data-height="200" data-width="250">
                <div id="combo-list-container" style="width: 150px;">
                    <ul data-role="listview" id="combo-list">
                        <li value="1" data-caption="Section1"></li>
                        <li value="2" data-caption="Section2"></li>
                    </ul>
                </div>
            </div>
            <div class="flex-col ctrls" style="margin-top: 20px;">
                <button class="button secondary" id="add-combo-btn"> Add </button>
                <button class="button secondary" id="mod-combo-btn"> Modify </button>
                <button class="button secondary" id="copy-combo-btn"> Copy </button>
                <button class="button secondary" id="delete-combo-btn">Delete</button>
            </div>
        
        </div>
        <div class="flex-rowm justify-center">
            <button id="close-combo-main" class="button info">Close</button>
        </div>
    </div>

</div>
`;

let comboModWindow = `
    <div

    id="combo-sec-window"
    class="secondary-window"
    data-role="window"
    data-title="Load Combination Data"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

    <div class="flex-col justify-start padding-all-0" >
        <div data-role="panel">
            <div class="flex-rowm margin-b-20">
                <div >
                    <label>Load Combination Name</label>
                </div>
                <div class="input-width">
                    <input type="text" class="input-small" data-role="input" data-clear-button="false">
                </div>
            </div>
        </div>
        
        <div class="flex-rowm">

            <div class="padding-all-0" data-role="panel" data-width="340" data-height="200" style="height:200px;">
                <div class="flex-rowm margin-b-20" >
                    <div class="input-width">
                        <strong>Load Case Name</strong>
                    </div>
                    <div class="input-width">
                        <strong>Scale factor</strong>
                    </div>
                </div>    
                <div class="flex-rowm margin-b-20" >
                    <div class="input-width">
                        <select 
                        id="load-case"
                        class="input-small"
                        data-role="select"
                        data-filter="false"
                        data-drop-height=80>
                            
                        </select>
                    </div>
                    <div id="scale-case" class="input-width"> 
                        <input type="number" min="0" class="input-small" data-role="input" data-clear-button="false">
                    </div>
                </div>
                
                <div id="combo-info-container">
                    <ul data-role="listview" id="combo-info">
                        
                    </ul>
                </div>
                
            </div>

            <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="200">
                <div> <button class="button info" id="add-case" style="width: 64px;"> Add </button> </div>
                <div> <button class="button info" id="mod-case" style="width: 64px;"> Modify </button> </div>
                <div> <button class="button default" id="delete-case" style="width: 64px;">Delete</button> </div>
            </div>
        </div>
        <div class="flex-rowm justify-center">
            <button id="save-combo-sec" class="button info">Save</button>
            <button id="cancel-combo-sec" class="button info">Cancel</button>
        </div>
    </div>
    </div>
`

let comboAddWindow = `
    <div

    id="combo-add-window"
    class="secondary-window"
    data-role="window"
    data-title="Load Combination Data"
    data-btn-min="false"
    data-btn-max="false"
    data-resizable="false"
    data-place="center">

    <div class="flex-col justify-start padding-all-0" >
        <div data-role="panel">
            <div class="flex-rowm margin-b-20">
                <div >
                    <label>Load Combination Name</label>
                </div>
                <div class="input-width">
                    <input type="text" class="input-small" data-role="input" data-clear-button="false">
                </div>
            </div>
        </div>
        
        <div class="flex-rowm">

            <div class="padding-all-0" data-role="panel" data-width="340" data-height="200" style="height:200px;">
                <div class="flex-rowm margin-b-20" >
                    <div class="input-width">
                        <strong>Load Case Name</strong>
                    </div>
                    <div class="input-width">
                        <strong>Scale factor</strong>
                    </div>
                </div>    
                <div class="flex-rowm margin-b-20" >
                    <div class="input-width">
                        <select 
                        id="load-case"
                        class="input-small"
                        data-role="select"
                        data-filter="false"
                        data-drop-height=80>
                            
                        </select>
                    </div>
                    <div id="scale-case" class="input-width"> 
                        <input type="number" min="0" class="input-small" data-role="input" data-clear-button="false">
                    </div>
                </div>
                
                <div id="combo-info-container">
                    <ul data-role="listview" id="combo-info">
                        
                    </ul>
                </div>
                
            </div>

            <div class="flex-col justify-center padding-all-0" data-role="panel" data-height="200">
                <div> <button class="button info" id="add-add-case" style="width: 64px;"> Add </button> </div>
                <div> <button class="button info" id="add-mod-case" style="width: 64px;"> Modify </button> </div>
                <div> <button class="button default" id="add-delete-case" style="width: 64px;">Delete</button> </div>
            </div>
        </div>
        <div class="flex-rowm justify-center">
            <button id="add-save-combo-sec" class="button info">Save</button>
            <button id="add-cancel-combo-sec" class="button info">Cancel</button>
        </div>
    </div>
    </div>
`

document.querySelector('#combo-btn').addEventListener('click',function(){
    if(!document.querySelector('.main-window')){
        $('body').append(comboMainWindow);
        LoadDefCombos();

        //#region  check if locked
        if (locked) {
            console.log('load combo main')
            let bts = document.querySelectorAll('#combo-main-window button');
            bts.forEach(bt => bt.disabled = true);
            $('#mod-combo-btn')[0].disabled = false;
            $('#close-combo-main')[0].disabled = false;
        }
        //#endregion

        document.querySelector('#mod-combo-btn').addEventListener("click", function(){

            let current = document.querySelector('#combo-main-window .current-select');
            
            if(!document.querySelector('.secondary-window') && current){
                let comboId = current.getAttribute('value')
                let combo = LoadCombo.LoadCombosList.get(comboId);
                let backup = combo.DeepCopyComboData();

                $('body').append(comboModWindow);
                LoadDefCases();
                document.querySelector(`option[value=${comboId}]`).remove();
                LoadComboData(comboId);

                //#region check if locked
                if (locked) {
                    let bts = document.querySelectorAll('#combo-sec-window button');
                    let inputs = document.querySelectorAll('#combo-sec-window input');
                    bts.forEach(bt => bt.disabled = true);
                    inputs.forEach(bt => bt.disabled = true);
                    $('#load-case')[0].disabled = true;
                }
                //#endregion

                document.querySelector('#add-case').addEventListener("click", function(){
                    
                    AddComboField(comboId);
                });

                document.querySelector('#mod-case').addEventListener("click", function(){
                    if(document.querySelector('#combo-sec-window .current-select')){                      
                        ModifyCase(comboId);
                    }
                });

                document.querySelector('#delete-case').addEventListener("click", function(){
                    if(document.querySelector('#combo-sec-window .current-select')){                      
                        DeleteComboCase(comboId);
                    }
                });

                document.querySelector('#save-combo-sec').addEventListener("click", function(){
                    ChangeComboName(comboId);
                    document.querySelector('#combo-sec-window').parentElement.parentElement.remove();
                    LoadDefCombos();
                });

                document.querySelector('#cancel-combo-sec').addEventListener("click", function(){
                    combo.Delete();
                    let combo2 = new LoadCombo(backup.Name, backup.LoadCasesInfo);
                    combo2._cpyNo = backup.cpyNo;
                    document.querySelector('#combo-sec-window').parentElement.parentElement.remove();
                    LoadDefCombos();
                });
            }
        });

        document.querySelector('#add-combo-btn').addEventListener("click",function(){
            if(!document.querySelector('.secondary-window')){
                $('body').append(comboAddWindow);
                LoadDefCases();
                let loadCaseInfo = [];

                document.querySelector('#add-add-case').addEventListener("click", function(){
                    AddNewComboField(loadCaseInfo);
                });
                document.querySelector('#add-mod-case').addEventListener("click", function(){
                    if(document.querySelector('#combo-add-window .current-select')){
                        ModifyNewCase(loadCaseInfo);
                    }
                });

                document.querySelector('#add-delete-case').addEventListener("click", function(){
                    if(document.querySelector('#combo-add-window .current-select')){
                        DeleteNewComboCase(loadCaseInfo);
                    }
                });

                document.querySelector('#add-save-combo-sec').addEventListener("click", function(){
                    let name = document.querySelector('#combo-add-window input[type="text"]').value;
                    try{
                        new LoadCombo(name, loadCaseInfo);
                        document.querySelector('#combo-add-window').parentElement.parentElement.remove();
                        LoadDefCombos();
                    }catch(error){
                        Metro.dialog.create({
                            title: "Error",
                            content: `<div>${error.message}</div>`,
                            closeButton: true
                        });
                    }
                });

                document.querySelector('#add-cancel-combo-sec').addEventListener("click", function(){
                    document.querySelector('#combo-add-window').parentElement.parentElement.remove();
                    LoadDefCombos();
                })
                //document.querySelector()
            }
        }); 

        document.querySelector('#copy-combo-btn').addEventListener("click", function(){
            if(document.querySelector('#combo-main-window .current-select') && !$('.secondary-window')[0]){
                let comboId = document.querySelector('#combo-main-window .current-select').getAttribute('value');
                let combo = LoadCombo.LoadCombosList.get(String(comboId));
                combo.Clone();
                LoadDefCombos();
            }
        });

        document.querySelector('#delete-combo-btn').addEventListener("click", function(){
            if(document.querySelector('#combo-main-window .current-select') && !$('.secondary-window')[0]){
                let comboId = document.querySelector('#combo-main-window .current-select').getAttribute('value')
                DeleteCombo(comboId)
            }
        });
        
        document.querySelector('#close-combo-main').addEventListener("click", function(){
            if(!$('.secondary-window')[0])
            document.querySelector('.main-window').parentElement.parentElement.remove();
        })
    }
});

function LoadDefCombos() {
    let length = $('#combo-list').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#combo-list').children()[i].remove();      
    } 

    LoadCombo.LoadCombosList.forEach((value,key) => {
        $("#combo-list").append(`<li class="node" value=${key} >${value.Name}</li>`); 
    })
}

function RefreshComboList() {
    document.querySelector('#combo-list').remove();
    $('#combo-list-container').append(`
        <ul data-role="listview" id="combo-list">
            <li></li>
        </ul>
    `)
    LoadDefCombos();
}

function LoadDefCases() {
    let length = $('#load-case').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#load-case').children()[i].remove();      
    }
    LoadPattern.LoadPatternsList.forEach((value,key) => {
        $('#load-case').append(`
            <option value=${key}>${value.Name}</option>
        `)
    });
    LoadCombo.LoadCombosList.forEach((value,key) => {
        $('#load-case').append(`
            <option value=${key}>${value.Name}</option>
        `)
    });
}

function LoadComboData(comboId) {

    let length = $('#combo-info').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#combo-info').children()[i].remove();      
    } 
    let combo = LoadCombo.LoadCombosList.get(comboId);
    let infoArr = combo.LoadCasesInfo;
    document.querySelector('#combo-sec-window input[type="text"]').value = combo.Name;
    for (const info of infoArr) {
        let caseId = info.caseId;
        let scale = info.scaleFactor;
        let loadCase = GetLoadCase(caseId);
        
        $('#combo-info').append(`
        <li style="display:inline-block;" value="${caseId}">
            <div class="flex-rowm justify-start">
                <div class="width-160">${loadCase.Name}</div>
                <div>${scale}</div>
            </div>
        </li>
        `);
    }
    $('#load-case')[0].value = infoArr[0].caseId;
    $('#scale-case input')[0].value = infoArr[0].scaleFactor;
}

function AddComboField(comboId) {

    let caseId = $('#load-case')[0].value;
    let loadCase = GetLoadCase(caseId);
    let scale = $('#scale-case input')[0].value;

    try {
        
        let combo = LoadCombo.LoadCombosList.get(comboId);
        combo.AddLoadCaseInfo(caseId, Number(scale));

        $('#combo-info').append(`
        <li class="node" style="display:inline-block;" value=${caseId}>
            <div class="flex-rowm justify-start">
                <div class="width-160">${loadCase.Name}</div>
                <div>${scale}</div>
            </div>
        </li>
        `);

    } catch (error) {
        Metro.dialog.create({
            title: "Error",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
    
}

function ModifyCase(comboId) {
    let combo = LoadCombo.LoadCombosList.get(comboId);

    //old data
    let oldCaseId = document.querySelector('#combo-sec-window .current-select').getAttribute('value');

    //new data
    let newCaseId = $('#load-case')[0].value;
    let scale = $('#scale-case input')[0].value;
    let loadCase = GetLoadCase(newCaseId);

    try {
        combo.ModifyCaseInfo(oldCaseId, newCaseId, Number(scale));
        let li = document.querySelector(`#combo-info li[value='${oldCaseId}']`);
        li.setAttribute('value',newCaseId);
        let divs = li.querySelector('div').querySelectorAll('div')
        divs[0].innerHTML = loadCase.Name;
        divs[1].innerHTML = Number(scale);   
    } catch (error) {
        Metro.dialog.create({
            title: "Error",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
}

function DeleteComboCase(comboId) {
    let combo = LoadCombo.LoadCombosList.get(comboId);
    let caseId = $('#combo-sec-window .current-select')[0].value;

    try {
        combo.DeleteCaseInfo(caseId);
        document.querySelector(`#combo-info li[value='${caseId}']`).remove();
    } catch (error) {
        Metro.dialog.create({
            title: "Error",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }    
}

function ChangeComboName(comboId){
    let name = document.querySelector('#combo-sec-window input[type="text"]').value;
    try {
        LoadCombo.LoadCombosList.get(comboId).Name = name
    } catch (error) {
        Metro.dialog.create({
            title: "Error",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
}

function AddNewComboField(loadcasesArray) {
    
    let caseId = $('#load-case')[0].value;
    let loadCase = GetLoadCase(caseId)
    let scale = $('#scale-case input')[0].value;

    let matching = loadcasesArray.filter( info => info.caseId == caseId);
    if(matching.length){
        Metro.dialog.create({
            title: "Error",
            content: `<div>the load pattern can not be duplicated</div>`,
            closeButton: true
        });
    }else if(Number(scale)==0){
        Metro.dialog.create({
            title: "Error",
            content: `<div>Scale factor must be added</div>`,
            closeButton: true
        });
    }else{
        loadcasesArray.push({caseId: caseId, scaleFactor: Number(scale)});
        $('#combo-info').append(`
        <li class="node" style="display:inline-block;" value=${caseId}>
            <div class="flex-rowm justify-start">
                <div class="width-160">${loadCase.Name}</div>
                <div>${scale}</div>
            </div>
        </li>
        `);
    }
}

function ModifyNewCase(loadcasesArray) {
    let oldCaseId = document.querySelector('#combo-add-window .current-select').getAttribute('value');

    //new data
    let caseId = $('#load-case')[0].value;
    let scale = $('#scale-case input')[0].value;
    let loadCase = GetLoadCase(caseId);
    if(Number(scale) == 0){
        Metro.dialog.create({
            title: "Error",
            content: `<div>Scale factor must be added</div>`,
            closeButton: true
        });
        return;
    }

    let matching = loadcasesArray.filter(info => info.caseId == caseId);

    if(oldCaseId == caseId){
        matching[0].scaleFactor = Number(scale);
        
    }else if(matching.length){
        Metro.dialog.create({
            title: "Error",
            content: `<div>load pattern cannot be duplicated</div>`,
            closeButton: true
        });
        return;
    }else{
        let modified = loadcasesArray.filter(info => info.caseId==oldCaseId)[0];
        let index = loadcasesArray.indexOf(modified);
        loadcasesArray[index]={caseId: caseId, scaleFactor: Number(scale)};
    }
    let li = document.querySelector(`#combo-info li[value='${oldCaseId}']`);
    li.value = caseId;
    let divs = li.querySelector('div').querySelectorAll('div')
    divs[0].innerHTML = loadCase.Name;
    divs[1].innerHTML = Number(scale);     

}

function DeleteNewComboCase(loadcasesArray) {
    let caseId = $('#combo-add-window .current-select')[0].value;
    let deleted = loadcasesArray.filter(info => info.caseId==caseId)[0];
    let index = loadcasesArray.indexOf(deleted);
    loadcasesArray.splice(index, 1);
    document.querySelector(`#combo-info li[value='${caseId}']`).remove();
}

function DeleteCombo(comboId) {
    let combo = LoadCombo.LoadCombosList.get(String(comboId));
    try {
        combo.Delete();
        LoadDefCombos();
    } catch (error) {
        Metro.dialog.create({
            title: "Error",
            content: `<div>${error.message}</div>`,
            closeButton: true
        });
    }
    
}