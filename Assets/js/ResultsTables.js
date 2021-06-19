
let ListofAllResults = JSON.parse(testerForResults).StrainingActions;

let userPrecision = 1;
let newTable = [];
let newElement;
let ResultantPattern;
let ResultantFrame;
let patternchoise;
let memberchoise;
//fillTable();

function fillTable() {
    ResultantPattern = Results.ResultsList.filter(res => res.PatternID == patternchoise);

    ResultantFrame = ResultantPattern.filter(res => res.FrameID == memberchoise);


    for (let i = 0; i < ResultantFrame.length; i++) {
        for (let j = 0; j < ResultantFrame[i].Stations.length; j++) {
            newElement = {
                Station: projUnits.LengthConvert( parseFloat(ResultantFrame[i].Stations[j].toFixed(userPrecision)), true),
                MomentX: projUnits.MomentConvert(parseFloat( ResultantFrame[i].MomentX[j].toFixed(userPrecision) )),
                MomentY: projUnits.MomentConvert(parseFloat(ResultantFrame[i].MomentY[j].toFixed(userPrecision) )),
                ShearX: projUnits.ForceConvert(parseFloat(ResultantFrame[i].ShearX[j].toFixed(userPrecision)), true) ,
                ShearY: projUnits.ForceConvert(parseFloat(ResultantFrame[i].ShearY[j].toFixed(userPrecision)), true),
                Normal: projUnits.ForceConvert(parseFloat(ResultantFrame[i].Normal[j].toFixed(userPrecision)), true),
                Torsion: projUnits.MomentConvert(parseFloat(ResultantFrame[i].Torsion[j].toFixed(userPrecision)))
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
        console.log($('#FrameLablesList'))
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