let drawWin = `
 <div
 id = "DrawingWindow"
 class="main-window"
 data-on-window-create="InitFramePropWindow"
 data-role="window"
 data-title="Frame Properties"
 data-btn-min="false"
 data-btn-max="false"
 data-btn-close="true"
 data-resizable="false"
 data-on-close-click = "ExitDrawingMode()"
 data-place="left"
 data-width="200">
    

    <div class="padding-all-0" data-role="panel">
        <div class="flex-rowm align-start" style="height:130px;">
            <div class="input-width">
                <label>Section</label>
            </div>
            <div class="input-width">
                <select 
                id="frameprop-sec-list"
                class="input-small"
                data-role="select"
                data-filter="false"
                data-drop-height="85">
                    <option>xyz</option>
                </select>
            </div>
        </div>
    </div>

</div>
`

document.querySelector('#Draw').addEventListener("click", function () {

    if (!document.querySelector('.main-window')) {
        $('body').append(drawWin);
       StatusBar = document.getElementById('StatusBar');
      StatusBar.innerHTML = 'Select First Point';
    }
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape") {
            if (document.querySelector('#DrawingWindow')) {

                ExitDrawingMode();
                document.querySelector('.main-window').parentElement.parentElement.remove();
            }
        }
    });

})


function InitFramePropWindow() {
    FillSectionList();
    DrawingModeActive = true;
    SelectionModeActive = false;
    Unselect();
    document.querySelector('#frameprop-sec-list').addEventListener("change", GetSelectedSection);
}

function FillSectionList() {
    let length = $('#frameprop-sec-list').children().length;
    for (let i = length - 1; i >= 0; i--) {
        $('#frameprop-sec-list').children()[i].remove();
    }
    Section.SectionList.forEach((value, key) => {
        $("#frameprop-sec-list").append(`<option value=${key} >${value.Name}</option>`);
    });

}

//this function is also called in main.js when line is drawing
function GetSelectedSection() {
    let selectedId = document.querySelector('#frameprop-sec-list').value;
    return Section.SectionList.get(selectedId);
}

function ExitDrawingMode() {
    DrawingModeActive = false;
    SelectionModeActive = true;
}