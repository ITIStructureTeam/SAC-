
let userPrecision = 1;
let newTable = [];
let newElement;
let ResultantPattern;
let ResultantFrame;
let patternchoise;
let memberchoise;


function fillTable() {
    ResultantPattern = Results.ResultsList.filter(res => res.PatternID == patternchoise);
    ResultantFrame = ResultantPattern.filter(res => res.FrameID == memberchoise);

    for (let i = 0; i < ResultantFrame.length; i++) {
        for (let j = 0; j < ResultantFrame[i].Stations.length; j++) {
            newElement = {

                Station: projUnits.LengthConvert(parseFloat(ResultantFrame[i].Stations[j]), true).toFixed(userPrecision),
                MomentX: projUnits.MomentConvert(parseFloat(ResultantFrame[i].MomentX[j])).toFixed(userPrecision),
                MomentY: projUnits.MomentConvert(parseFloat(ResultantFrame[i].MomentY[j])).toFixed(userPrecision),
                ShearX: projUnits.ForceConvert(parseFloat(ResultantFrame[i].ShearX[j]), true).toFixed(userPrecision),
                ShearY: projUnits.ForceConvert(parseFloat(ResultantFrame[i].ShearY[j]), true).toFixed(userPrecision),
                Normal: projUnits.ForceConvert(parseFloat(ResultantFrame[i].Normal[j]), true).toFixed(userPrecision),
                Torsion: projUnits.MomentConvert(parseFloat(ResultantFrame[i].Torsion[j])).toFixed(userPrecision)

            };
            newTable.push(newElement);
        }
    }
}

// Builds the HTML Table out of myList.
function buildHtmlTable(myList, selector) {
    let columns = addAllColumnHeaders(myList, selector);
    for (let i = 0; i < myList.length; i++) {
        let row$ = $('<tr/>');
        for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            let cellValue = myList[i][columns[colIndex]];
            if (JSONValueIsArray(cellValue)) {
                for (let j = 0; j < cellValue.length; j++) {
                    if (cellValue == null) cellValue = "";
                    row$.append($('<td/>').html(cellValue[j]));
                    if (colIndex < columns.length - 2)
                        colIndex++;
                }
            } else {

                if (cellValue == null) cellValue = "";
                row$.append($('<td/>').html(cellValue));
            }
        }
        $(selector).append(row$);
    }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(myList, selector) {
    let columnSet = [];
    let headerTr$ = $('<tr />');

    for (let i = 0; i < myList.length; i++) {
        let rowHash = myList[i];

        for (let key in rowHash) {
            if ($.inArray(key, columnSet) == -1) {

                if (JSONValueIsArray(rowHash[key])) {
                    for (let j = 0; j < rowHash[key].length; j++) {
                        columnSet.push(key);
                        headerTr$.append($('<th style="background-color:rgb(45, 45, 230);;color: white;position:sticky;z-index:50;"/>').html(key));
                    }
                }
                else {
                    columnSet.push(key);
                    headerTr$.append($('<th style="background-color:rgb(59, 100, 122);;top: 0;color: white;position:sticky;z-index:50;"/>').html(key));
                }
            }
        }
    }
    $(selector).append(headerTr$);

    return columnSet;
}

function ShowResultsTable() {

    if ($("#tableswindow").length) {
        alert("Window is Opened !!");
    } else {
        $('body').append(`<div   
        id="tableswindow" data-top="200"
        style="z-index: 3;"
        data-left="350"
        data-role="window"
        data-width="720" 
        data-height="560"
        data-resizable="false"
        data-title="Table of Results"
    
        data-icon="<img src='Assets/images/showtables.jpg'>"> 
        <div class="flex-rowm margin-b-20">
            <div class="input-width "> 
                <div class="text-bold">  Load Pattern </div>
                    <select 
                            id="LoadData"
                            style="margin-left: 20px;
                            margin-bottom: 20px;"
                            onchange="PrecisionValue()"
                            class="input-small"
                            data-role="select"
                            data-filter="false"
                            data-drop-height=80>

                    </select>
            </div>


            <div class="input-width">
                <div class="text-bold">  Precision </div>
                <select 
                id="Precision"
                onchange="PrecisionValue()"
                style="margin-left: 20px;
                margin-bottom: 20px;"
                class="input-small"
                data-role="select"
                data-filter="false"
                data-drop-height=80>
                    <option value=1>0.0</option>
                    <option value=2>0.00</option>
                    <option value=3>0.000</option>
                </select>
               
            </div>

            <div class="input-width">
                <div class="text-bold">  Element </div>
                <select 
                id="FrameLablesList"
                onchange="PrecisionValue()"
                style="margin-left: 20px;
                margin-bottom: 20px;"
                class="input-small"
                data-role="select"
                data-filter="false"
                data-drop-height=80>
                    
                </select>
               
            </div>
        </div>

                        
            <table id="excelDataTable" class="table row-hover cell-border">
            </table>

        </div>`);
        // ResetFrameLables();
        buildHtmlTable(newTable, '#excelDataTable');

        LoadDefCases(LoadData);

        let selectedFrames = [...DrawLine.SelectedLines];
        let FrameLables = []
        for (let i = 0; i < selectedFrames.length; i++) {

            FrameLables.push(selectedFrames[i].Frame.Label);
        }
        for (let k = 0; k < FrameLables.length; k++) {

            $('#FrameLablesList').append(`
            <option value=${FrameLables[k]}>${FrameLables[k]}</option>
        `)
        }
    }


}

function PrecisionValue() {
    userPrecision = $('#Precision')[0].value;
    patternchoise = $('#LoadData')[0].value;
    memberchoise = $('#FrameLablesList')[0].value;
    $('#excelDataTable').remove();
    newTable.splice(0);
    fillTable();
    $("#tableswindow").append('<table id="excelDataTable" class="table row-hover cell-border"> </table>')
    buildHtmlTable(newTable, '#excelDataTable');
}

function JSONValueIsArray(element) {
    return Object.prototype.toString.call(element) === '[object Array]';
}

function fillDeformationTable() {
    NewList.forEach(function (element) {

        element.station=projUnits.LengthConvert(parseFloat(element.station), true).toFixed(userPrecision) ;
        element.u1= projUnits.DeformConvert(parseFloat(element.u1)).toFixed(userPrecision) ;
        element.u2= projUnits.DeformConvert(parseFloat(element.u2)).toFixed(userPrecision) ;
        element.u3= projUnits.DeformConvert(parseFloat(element.u3)).toFixed(userPrecision) ;
        element.r1=element.r1.toFixed(userPrecision);
        element.r2=element.r2.toFixed(userPrecision);
        element.r3=element.r3.toFixed(userPrecision);
      });

}

function DeformPrecisionValue() {
    userPrecision = $('#Precision')[0].value;
    
    CaseIDChoise = $('#LoadData')[0].value;
    let frameIDChoise = $('#FrameLablesList')[0].value;
    let DeformationResultsList;
        if(frameIDChoise){
            DeformationResultsList = DeformedShape.GetDeformsList(frameIDChoise);
            //let DeformationResultsList = JSON.parse('[{"caseID":"c1","details":[{"station":0,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":0.7999999999999998,"u1":0,"u2":0,"u3":-0.0007039999999999967,"r1":0.0014196363636363564,"r2":0,"r3":0},{"station":1.6,"u1":0,"u2":0,"u3":-0.0022900363636363524,"r1":0.002280727272727259,"r2":0,"r3":0},{"station":2.4,"u1":0,"u2":0,"u3":-0.004367127272727248,"r1":0.0027229090909090723,"r2":0,"r3":0},{"station":3.2,"u1":0,"u2":0,"u3":-0.00665599999999996,"r1":0.0028858181818181613,"r2":0,"r3":0},{"station":4,"u1":0,"u2":0,"u3":-0.008989090909090853,"r1":0.00290909090909089,"r2":0,"r3":0}]},{"caseID":"p1","details":[{"station":0,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":0.7999999999999998,"u1":0,"u2":0,"u3":-0.0007039999999999967,"r1":0.0014196363636363564,"r2":0,"r3":0},{"station":1.6,"u1":0,"u2":0,"u3":-0.0022900363636363524,"r1":0.002280727272727259,"r2":0,"r3":0},{"station":2.4,"u1":0,"u2":0,"u3":-0.004367127272727248,"r1":0.0027229090909090723,"r2":0,"r3":0},{"station":3.2,"u1":0,"u2":0,"u3":-0.00665599999999996,"r1":0.0028858181818181613,"r2":0,"r3":0},{"station":4,"u1":0,"u2":0,"u3":-0.008989090909090853,"r1":0.00290909090909089,"r2":0,"r3":0}]},{"caseID":"p2","details":[{"station":0,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":0.7999999999999998,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":1.6,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":2.4,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":3.2,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0},{"station":4,"u1":0,"u2":0,"u3":0,"r1":0,"r2":0,"r3":0}]}]');
            
            PointsDeformationList = DeformationResultsList.filter(caseid => caseid.caseID == CaseIDChoise)[0].details;
            PointsDeformationList.forEach(obj=>NewList.push({...obj}))
    
    
        $('#DeformationDataTable').remove();
        NewList=[];
        PointsDeformationList.forEach(obj=>NewList.push({...obj}))
        fillDeformationTable()
        $("#Deformationtableswindow").append('<table id="DeformationDataTable" class="table row-hover cell-border"> </table>')
        buildHtmlTable(NewList, '#DeformationDataTable');
        }

}

let NewList=[]; 
let PointsDeformationList;
let CaseIDChoise;

function ShowDeformationResultsTable() {
    if ($("#Deformationtableswindow").length) {
        alert("Window is Opened !!");
    } else {
        $('body').append(`<div   
        id="Deformationtableswindow" data-top="200"
        style="z-index: 3;"
        data-left="350"
        data-role="window"
        data-width="730" 
        data-height="560"
        data-resizable="false"
        data-title="Table of Results"
    
        data-icon="<img src='Assets/images/showtables.jpg'>"> 
        <div class="flex-rowm margin-b-20">
            <div class="input-width "> 
                <div class="text-bold">  Load Case </div>
                    <select 
                            id="LoadData"
                            style="margin-left: 20px;
                            margin-bottom: 20px;"
                            onchange="DeformPrecisionValue()"
                            class="input-small"
                            data-role="select"
                            data-filter="false"
                            data-drop-height=80>

                    </select>
            </div>


            <div class="input-width">
                <div class="text-bold">  Precision </div>
                <select 
                id="Precision"
                onchange="DeformPrecisionValue()"
                style="margin-left: 20px;
                margin-bottom: 20px;"
                class="input-small"
                data-role="select"
                data-filter="false"
                data-drop-height=80>
                    <option value=1>0.0</option>
                    <option value=2>0.00</option>
                    <option value=3>0.000</option>
                    <option value=4>0.0000</option>
                    <option value=5>0.00000</option>
                    <option value=6>0.000000</option>
                </select>
               
            </div>

            <div class="input-width">
                <div class="text-bold">  Element </div>
                <select 
                id="FrameLablesList"
                onchange="DeformPrecisionValue()"
                style="margin-left: 20px;
                margin-bottom: 20px;"
                class="input-small"
                data-role="select"
                data-filter="false"
                data-drop-height=80>
                    
                </select>
               
            </div>
        </div>

                        
            <table id="DeformationDataTable" class="table row-hover cell-border">
            </table>

        </div>`);

        buildHtmlTable(NewList, '#DeformationDataTable');
        LoadDefCases(LoadData);
        let selectedFrames = [...DrawLine.SelectedLines];
        let FrameLables = []
        for (let i = 0; i < selectedFrames.length; i++) {

            FrameLables.push(selectedFrames[i].Frame.Label);
        }
        for (let k = 0; k < FrameLables.length; k++) {

            $('#FrameLablesList').append(`
            <option value=${FrameLables[k]}>${FrameLables[k]}</option>
        `)
        }
    }
}