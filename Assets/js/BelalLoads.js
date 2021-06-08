class LoadPatterns {
    constructor(name, type, multiplier) {
        this.name = name;
        this.type = type;
        this.multiplier = multiplier;
    }
    static LoadPatternsList = [];
    static LoadPatternIndex = 0;
    static NullElementCheck = false;
}

class LoadCombinations {
    constructor(name, LoadCombinationItem) {
        this.name = name;
        this.LoadCombinationItem = LoadCombinationItem;
    }
    static LoadCombinationItem = [];
    static LoadCombinationList = [];
    static LoadCombinationIndex = 0;
    static LoadCombinationItemList = [];
}

function LoadPattern() {
    Metro.toast.create("Defining Load Pattern", null, null, "primary");
    if ($("#LoadPattern").length > 0 ) {
        alert("Window is Opened !!");
    } else {
        $('body').append(`<div id="LoadPattern"
         data-top="200" style="z-index: 3;  " data-left="500" data-role="window" data-width="700"
        data-height="360" data-resizable="false" data-title="Define Load Patterns" data-btn-close="false"
        data-icon="<img src='Assets/images/LoadPatternIcon.png'>  data-btn-min="false"
        data-btn-max="false"">

        <div class="flex-rowm">
            <div data-role="panel" data-title-caption="Load Patterns" data-width="532">
                <div style="display: flex;">
                    <div class="LoadPatternItems">
                        <p>Load pattern name </p>
                        <input id="LoadPatternName" type="text">
                    </div>
                    <div class="LoadPatternItems">
                        <p>Load Type </p>
                        <select id="LoadType" data-role="select">
                            <option value="Dead">Dead</option>
                            <option value="Live">Live</option>
                        </select>
                    </div>
                    <div class="LoadPatternItems">

                        <p>Self Weight Mutiplier </p>
                        <input id="SelfWeightMulti" type="text" value="1" data-validate="required">

                    </div>
                </div>

                <div>
                    <ul data-role="listview" id="LoadPatternList">


                    </ul>

                </div>
            </div>

            <div class="flex-col" style="margin-top: 20px;">
                <button onclick="AddLoadPatternclick()" class="button secondary">Add</button>
                <button id="patternmodifybtn" onclick="LoadPatternModifyBTN()" class="button shadowed" disabled>Modify</button>
                <button id="patterndeletebtn" onclick="patterndeletebtn()" class="button shadowed" disabled>Delete</button>
                <button id="deleteallbtn" onclick="patterndeleteallbtn()" class="button shadowed">Reset</button>
            
               <div class="flex-col" style="margin-top: 20px;">
                   <button onclick="OKBtn()" class="button secondary">OK</button>
                   <button onclick="CancelBtn()" class="button shadowed">Cancel</button>
               </div>
            </div>

        </div>

    </div>`);
        if (LoadPatterns.LoadPatternsList.length || LoadPatterns.LoadPatternsList[i] != null) {
            for (var i = 0; i < LoadPatterns.LoadPatternsList.length; i++) {
                $('#LoadPatternList').append(`
          <li id="loadpatternitem${i}" class="node d-flex flex-justify-between" value=${i} onclick="enablebtn('patternmodifybtn','patterndeletebtn')">
            <div>${LoadPatterns.LoadPatternsList[i].name}</div>
            <div>${LoadPatterns.LoadPatternsList[i].type}</div>
            <div>${LoadPatterns.LoadPatternsList[i].multiplier}</div>          
          </li>
        `)
            }
        }
    }
}
function AddLoadPatternclick() {
    var LoadPatternName = document.getElementById('LoadPatternName').value;
    var LoadPatternType = document.getElementById('LoadType').value;
    var LoadPatternMultiplier = document.getElementById('SelfWeightMulti').value;

    if (!LoadPatternName || !LoadPatternMultiplier) {
        alert('Load pattern name is Required');
        return;
    } else {
        for (var i = 0; i < LoadPatterns.LoadPatternsList.length; i++) {
            if (LoadPatterns.LoadPatternsList[i] != null && LoadPatterns.LoadPatternsList[i].name == LoadPatternName) {
                alert('Load pattern name is Duplicated')
                return;
            } else LoadPatterns.NullElementCheck = true;
        }
    }
    LoadPatterns.LoadPatternsList.push(new LoadPatterns(LoadPatternName, LoadPatternType, LoadPatternMultiplier));

    $('#LoadPatternList').append(`
          <li id="loadpatternitem${LoadPatterns.LoadPatternIndex}" class="node d-flex flex-justify-between" value=${LoadPatterns.LoadPatternIndex} onclick="enablebtn('patternmodifybtn','patterndeletebtn')">
            <div>${LoadPatterns.LoadPatternsList[LoadPatterns.LoadPatternIndex].name}</div>
            <div>${LoadPatterns.LoadPatternsList[LoadPatterns.LoadPatternIndex].type}</div>
            <div>${LoadPatterns.LoadPatternsList[LoadPatterns.LoadPatternIndex].multiplier}</div>          
          </li>
        `)

    LoadPatterns.LoadPatternIndex++;
}
function enablebtn(ModiId, DeleteBTNid) {

    document.getElementById(ModiId).removeAttribute("disabled");
    document.getElementById(DeleteBTNid).removeAttribute("disabled");
}
function disbledbtn(ModiId, DeleteBTNid) {
    document.getElementById(ModiId).setAttribute("disabled", true);
    document.getElementById(DeleteBTNid).setAttribute("disabled", true);
}
function LoadPatternModifyBTN() {
    var LoadPatternName = document.getElementById('LoadPatternName').value;
    var LoadPatternType = document.getElementById('LoadType').value;
    var LoadPatternMutiplier = document.getElementById('SelfWeightMulti').value;

    var selectedElement = $(".current-select")[0];
    for (var i = 0; i < LoadPatterns.LoadPatternsList.length; i++) {
        if (LoadPatterns.LoadPatternsList[i] != null && LoadPatterns.LoadPatternsList[i].name == LoadPatternName && LoadPatterns.LoadPatternsList[selectedElement.value].name != LoadPatternName) {
            alert('Load pattern name is Duplicated')
            return;
        } else LoadPatterns.NullElementCheck = true;
    }
    LoadPatterns.LoadPatternsList[selectedElement.value].name = LoadPatternName;
    LoadPatterns.LoadPatternsList[selectedElement.value].type = LoadPatternType;
    LoadPatterns.LoadPatternsList[selectedElement.value].multiplier = LoadPatternMutiplier;

    while (selectedElement.lastElementChild) {
        selectedElement.removeChild(selectedElement.lastElementChild);
    }

    $("#" + selectedElement.id).append(`
            <div>${LoadPatterns.LoadPatternsList[selectedElement.value].name}</div>
            <div>${LoadPatterns.LoadPatternsList[selectedElement.value].type}</div>
            <div>${LoadPatterns.LoadPatternsList[selectedElement.value].multiplier}</div>   
    `);

}
function patterndeletebtn() {
    var selectedElement = $(".current-select")[0];
    delete LoadPatterns.LoadPatternsList[selectedElement.value];
    $("#" + selectedElement.id).remove();
    disbledbtn('patternmodifybtn', 'patterndeletebtn');
    if (LoadPatterns.LoadPatternsList[LoadPatterns.LoadPatternsList.length - 1] == undefined && !LoadPatterns.NullElementCheck) {
        patterndeleteallbtn()

    }
}
function patterndeleteallbtn() {
    $("#LoadPatternList li").remove();
    disbledbtn('patternmodifybtn', 'patterndeletebtn');
    LoadPatterns.LoadPatternIndex = 0;
    LoadPatterns.LoadPatternsList.splice(0);
    LoadPatterns.NullElementCheck = false;
}
function CancelBtn() {
    patterndeleteallbtn();
    Metro.window.close('#LoadPattern');
}
function OKBtn() {
    FillLoadPatterns();
    Metro.window.close('#LoadPattern');
}

function LoadCombination() {
    Metro.toast.create("Defining Load Combination", null, null, "primary");
    if ($("#LoadCombination").length > 0){
        alert("Window is Opened !!");
    } else {
        $('body').append(`<div id="LoadCombination" data-top="200" style="z-index: 3;  " data-left="500" data-role="window" data-width="700"
    data-height="360" data-resizable="false" data-title="Load Combination Data"
    data-icon="<img src='Assets/images/LoadCompinationIcon.JPG'>">

    <div class="flex-rowm">
        <div data-role="panel" data-title-caption="Load Combination List" data-width="532">
           
                
            <div>
                <ul data-role="listview" id="LoadCombinationListView">
                    
                </ul>

            </div>
        </div>

        <div class="flex-col" style="margin-top: 20px;">
            <button onclick="AddLoadCombination()" class="button secondary">Add New Combo</button>
            <button onclick="ModifyCombination()" id="combomodibtn" class="button shadowed" disabled>Modify</button>
            <button onclick="DeleteCombination()" id="combodeletebtn" class="button shadowed" disabled>Delete</button>
            <button onclick="ResetCombination()" class="button shadowed">Reset</button>

            <div class="flex-col" style="margin-top: 20px;">
                <button onclick="OKCombination()" class="button secondary">OK</button>
                <button onclick="CancelCombination()" class="button shadowed">Cancel</button>
            </div>

        </div>

    </div>

</div>`);
        for (var i = 0; i < LoadCombinations.LoadCombinationList.length; i++) {
            if (LoadCombinations.LoadCombinationList.length || LoadCombinations.LoadCombinationList[i] != null) {

                $('#LoadCombinationListView').append(`
    <li id="LoadCombinationListitem${i}" class="node d-flex flex-justify-between" onclick="enablebtn('combomodibtn','combodeletebtn')">
      <div>${LoadCombinations.LoadCombinationList[i].name}</div>       
    </li>`
                )
            }
        }

    }
}
function AddLoadCombination() {
    if ($("#AddLoadCombination").length > 0) { alert('Window is Opened'); return; }
    if (!LoadPatterns.LoadPatternsList.length) {
        
        alert('Warning!! There is no Load Patterns')
        Metro.toast.create("Lets Define Some Load Pattern", null, 10000, "primary");
        setTimeout(LoadPattern, 0.1);
        return;
    }
    $('body').append(`<div id="AddLoadCombination" data-top="200" style="z-index: 3;  " data-left="500" data-role="window"
    data-width="700" data-height="360" data-resizable="false" data-title="Load Combination Data"  data-draggable="false"
    data-icon="<img src='Assets/images/LoadCompinationIcon.JPG'>">
    <div class="flex-rowm">
        <div data-role="panel" data-title-caption="New Combo" data-width="532">
        
            <div class="LoadCombinationName">
                <p>Load Combination name </p>
                <input id="LoadComboName" type="text">
            </div>
            <div style="display: flex;">
             
                <div class="LoadPatternItems">
                    <p>Load Type </p>
                    <select id="LoadCombinationList">
                    </select>
                </div>
                <div class="LoadPatternItems">
                    <p>Scale Factor </p>
                    <input id="ScaleFactor" type="text" value="1">

                    </div>
            </div>
            <div>
                <ul data-role="listview" id="LoadComboList">

                </ul>
            </div>

        </div>

        <div class="flex-col" style="margin-top: 20px;">
            <button  class="button secondary" onclick="AddNewCombo()">Add</button>
            <button onclick="ModifyCombinationDataBTN()" class="button shadowed" id="ModifyAddCombo" disabled>Modify</button>
            <button onclick="DeleteCombinationDataBTN()" class="button shadowed" id="DeleteAddCombo" disabled>Delete</button>
            <button onclick="ResetCombinationBTN()"      class="button shadowed">Reset</button>

            <div class="flex-col" style="margin-top: 20px;">
                <button onclick="OKNewCombo()" class="button secondary">OK</button>
                <button onclick="CancelCombo()"class="button shadowed">Cancel</button>
            </div>

        </div>
    </div>
    </div>  `);
    FillLoadPatterns();
}
function AddNewCombo() {

    var LoadCombinationType = document.getElementById('LoadCombinationList').value;
    var LoadCombinationScaleFactor = document.getElementById('ScaleFactor').value;

    for (var i = 0; i < LoadCombinations.LoadCombinationItem.length; i++) {
        if (LoadCombinations.LoadCombinationItem[i] != undefined && LoadCombinations.LoadCombinationItem[i].type == LoadCombinationType) {
            alert('Cannot Repeat Load Case for Load Combination!')
            return;
        }
    }
    LoadCombinations.LoadCombinationItem.push({
        type: LoadCombinationType,
        scaleFactor: LoadCombinationScaleFactor
    });

    LoadCombinations.LoadCombinationItemList = Array.from(LoadCombinations.LoadCombinationItem);

    $('#LoadComboList').append(`
    <li id="LoadCombinationItem${LoadCombinations.LoadCombinationIndex}" class="node d-flex flex-justify-between" onclick="enablebtn('ModifyAddCombo','DeleteAddCombo')" value="${LoadCombinations.LoadCombinationIndex}">
      <div>${LoadCombinations.LoadCombinationItemList[LoadCombinations.LoadCombinationIndex].type}</div>
      <div>${LoadCombinations.LoadCombinationItemList[LoadCombinations.LoadCombinationIndex].scaleFactor}</div>       
    </li>`
    )
    LoadCombinations.LoadCombinationIndex++;
}

function ModifyCombinationDataBTN() {
    var LoadCombinationType = document.getElementById('LoadCombinationList').value;
    var LoadCombinationScaleFactor = document.getElementById('ScaleFactor').value;

    var selectedElement = $(".current-select")[0];
    for (var i = 0; i < LoadCombinations.LoadCombinationItem.length; i++) {
        if (LoadCombinations.LoadCombinationItem[i] != undefined && LoadCombinations.LoadCombinationItem[i].type == LoadCombinationType && LoadCombinations.LoadCombinationItemList[selectedElement.value].type != LoadCombinationType) {
            alert('Cannot Repeat Load Case for Load Combination!')
            return;
        }
    }
    LoadCombinations.LoadCombinationItemList[selectedElement.value].type = LoadCombinationType;
    LoadCombinations.LoadCombinationItemList[selectedElement.value].scaleFactor = LoadCombinationScaleFactor;

    while (selectedElement.lastElementChild) {
        selectedElement.removeChild(selectedElement.lastElementChild);
    }

    $("#" + selectedElement.id).append(`
    <div>${LoadCombinations.LoadCombinationItemList[selectedElement.value].type}</div>
    <div>${LoadCombinations.LoadCombinationItemList[selectedElement.value].scaleFactor}</div>       
    `)
}
function DeleteCombinationDataBTN() {
    var selectedElement = $(".current-select")[0];
    delete LoadCombinations.LoadCombinationItemList[selectedElement.value];
    $("#" + selectedElement.id).remove();
    disbledbtn('ModifyAddCombo', 'DeleteAddCombo');

}
function ResetCombinationBTN() {
    $("#LoadComboList li").remove();
    disbledbtn('ModifyAddCombo', 'DeleteAddCombo');
    LoadCombinations.LoadCombinationIndex = 0;
    LoadCombinations.LoadCombinationItemList.splice(0);
    LoadCombinations.LoadCombinationItem.splice(0);
}
function OKNewCombo() {
    var LoadCombinationName = document.getElementById('LoadComboName').value;
    if (!LoadCombinationName) {
        alert('Load Combination Name is Required');
        return;
    }
    for (var i = 0; i < LoadCombinations.LoadCombinationList.length; i++) {
        if (LoadCombinations.LoadCombinationList[i] != null && LoadCombinations.LoadCombinationList[i].name == LoadCombinationName) {
            alert('Cannot Repeat Load Combination Name!');
            return;
        }
    }

    LoadCombinations.LoadCombinationList.push(new LoadCombinations(LoadCombinationName, LoadCombinations.LoadCombinationItemList))
    Metro.window.close('#AddLoadCombination');

    LoadCombinations.LoadCombinationIndex = 0;
    LoadCombinations.LoadCombinationItem.splice(0);

    $('#LoadCombinationListView').append(`
    <li id="LoadCombinationListitem${LoadCombinations.LoadCombinationList.length - 1}" class="node d-flex flex-justify-between" onclick="enablebtn('combomodibtn','combodeletebtn')">
      <div>${LoadCombinations.LoadCombinationList[LoadCombinations.LoadCombinationList.length - 1].name}</div>       
    </li>`
    )

}
function CancelCombo() {
    ResetCombinationBTN();
    Metro.window.close('#AddLoadCombination');
}
function ModifyCombination() {
    DeleteCombination();
    AddLoadCombination();
}
function DeleteCombination() {
    var selectedElement = $(".current-select")[0];
    $("#" + selectedElement.id).remove();
    delete LoadCombinations.LoadCombinationList[selectedElement.value]
    disbledbtn('combomodibtn', 'combodeletebtn');
}
function ResetCombination() {
    $("#LoadCombinationListView li").remove();
    disbledbtn('combomodibtn', 'combodeletebtn');
    LoadCombinations.LoadCombinationList.splice(0);
}

function OKCombination() {
    Metro.window.close('#LoadCombination');
}
function CancelCombination() {
    if (!LoadCombinations.LoadCombinationList.length)
        ResetCombination();
    Metro.window.close('#LoadCombination');
}

function CloseRestraint() {
    Metro.window.close('#JointRestraint');
}

function JointRestraint() {
    if ($("#JointRestraint").length > 0) { alert('Window is Opened'); return; }
    $('body').append(`<div id="JointRestraint" data-top="200" style="z-index: 3;  " data-left="500" data-role="window"
    data-width="330" data-height="330" data-resizable="false" data-title="Joint Restraint"
    data-icon="<img src='Assets/images/JointRestraintIcon.png'>" data-btn-min="false" data-btn-max="false">

    <div class="flex-rowm">
        <div class="flex-col" style="margin-top: 20px;">
            <button class="shortcut  secondary outline">
                <span class="badge">Fixed</span>
                <img src="Assets/images/FixedSupportIcon.png">
            </button>
            <button class="shortcut  secondary outline">
                <span class="caption">Hinged</span>
                <img src="Assets/images/HingedIcon.JPG">
            </button>

        </div>
        <div class="flex-col" style="margin-top: 20px;">
            <button class="shortcut  secondary outline">
                <span class="badge">Roller</span>
                <img src="Assets/images/RollerIcon.JPG">
            </button>
            <button class="shortcut  secondary outline">
                <span class="caption">Free</span>
                <img src="Assets/images/FreeSupportIcon.png">
            </button>
        </div>


    </div>
    <div id="RestraintBtnGroup" data-role="panel">
        <div class="node d-flex flex-justify-between">
            <button class="button secondary">OK</button>
            <button onclick="CloseRestraint()" class="button shadowed">Cancel</button>
            <button class="button shadowed">Apply</button>
        </div>
    </div>

</div>`)
}

function PointLoads() {
    if ($("#PointForces").length > 0) { alert('Window is Opened'); return; }
    $('body').append(`<div id="PointForces" data-top="60" style="z-index: 3;  " data-left="400" data-role="window" data-width="720"
    data-height="650" data-resizable="false" data-title="Point Forces" data-icon="<img src='Assets/images/PointLoadIcon.png'>">
    
    <div class="flex-rowm">
        <div data-role="panel">
            <div data-role="panel" data-title-caption="Coordinate System" data-width="532">
                <select id="GlobalOrLocal" onchange="GlobalANDLocal(value)" >
                    <option value="Global">GLOBAL</option>
                    <option value="Local">Local</option>
                </select>

            </div>
            <div data-role="panel" data-title-caption="Load Pattern Name" data-width="532">
                <button onclick="LoadPattern()" class="action-button second">
                    <span class="icon"><span class="mif-plus"></span></span>
                </button>
                <select id="LoadCombinationList"> </select>
            </div>
            <div id="PointLoadsMomentsContainer"  data-role="panel" data-title-caption="Loads Value">
                <div id="PointLoadsMoments"></div> 
            </div>
        </div>
        <div class="flex-col" style="margin-top: 20px;">
            <button class="button secondary" >Add Load</button>
            <button class="button shadowed">Replace Load</button>
            <button class="button shadowed" >Delete Load</button>

            <div class="flex-col" style="margin-top: 20px;">
                <button onclick="ClosePointLoads()" class="button secondary">OK</button>
                <button onclick="ClosePointLoads()" class="button shadowed">Cancel</button>
            </div>

        </div>
    </div>
    
      
</div>`);
    FillLoadPatterns();
    GlobalANDLocal('GlobalOrLocal'.value);
}
function FillLoadPatterns() {
    $('#LoadCombinationList option').remove();

    for (var i = 0; i < LoadPatterns.LoadPatternsList.length; i++) {
        $('#LoadCombinationList').append('<option value="'
            + LoadPatterns.LoadPatternsList[i].name + '">'
            + LoadPatterns.LoadPatternsList[i].name + '</option>');
    }
}

function ClosePointLoads() {
    Metro.window.close('#PointForces');
}
function GlobalANDLocal(value) {

      $('#PointLoadsMoments').remove();

    if (value != 'Local') {
        $('#PointLoadsMomentsContainer').append(`<div id="PointLoadsMoments">
                <input data-default-value="0" type="text" data-role="input" data-prepend="Force Global X:        ">
                <input data-default-value="0" type="text" data-role="input" data-prepend="Force Global Y:        ">
                <input data-default-value="0" type="text" data-role="input" data-prepend="Force Global Z:        ">
                <input data-default-value="0" type="text" data-role="input" data-prepend="Moment about Global X: ">
                <input data-default-value="0" type="text" data-role="input" data-prepend="Moment about Global Y: ">
                <input data-default-value="0" type="text" data-role="input" data-prepend="Moment about Global Z: ">
               </div> `)
    } else {
        $('#PointLoadsMomentsContainer').append(`<div id="PointLoadsMoments">
        <input data-default-value="0" type="text" data-role="input" data-prepend="Force Local 1:        ">
        <input data-default-value="0" type="text" data-role="input" data-prepend="Force Local 2:        ">
        <input data-default-value="0" type="text" data-role="input" data-prepend="Force Local 3:        ">
        <input data-default-value="0" type="text" data-role="input" data-prepend="Moment about Local 1: ">
        <input data-default-value="0" type="text" data-role="input" data-prepend="Moment about Local 2: ">
        <input data-default-value="0" type="text" data-role="input" data-prepend="Moment about Local 3: ">
        </div>`)
    }
}