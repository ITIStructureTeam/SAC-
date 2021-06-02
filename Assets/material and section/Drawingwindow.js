 let drawWin = `
 <div
 class="main-window"
 data-on-window-create="InitFramePropWindow"
 data-role="window"
 data-title="Frame Properties"
 data-btn-min="false"
 data-btn-max="false"
 data-resizable="false"
 data-place="center"
 data-width="200">
    <table class="table compact" >
        <tbody style="height:130px" >
        <tr>
            <td>
                <label>Section</label>
            </td>
            <td class="label" >
                <select
                id="frameprop-sec-list"
                class="input-small"
                data-role="select"
                data-filter="false"
                data-drop-height=90>
                    <option>xyz</option>
                    <option>xyz</option>
                    <option>xyz</option>
                </select>
            </td>
        </tr>
        </tbody>
    </table>
    
</div>
`

document.querySelector('#Draw').addEventListener("click",function(){

    if(!document.querySelector('.main-window')) $('body').append(drawWin);
})


function InitFramePropWindow(){
    FillSectionList();
    document.querySelector('#frameprop-sec-list').addEventListener("change",GetSelectedSection);
}

function FillSectionList(){
    let length = $('#frameprop-sec-list').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#frameprop-sec-list').children()[i].remove();      
    }
    Section.SectionList.forEach((value,key) => {
        $("#frameprop-sec-list").append(`<option value=${key} >${value.Name}</option>`); 
    });   
    
}

//this function is also called in main.js when line is drawing
function GetSelectedSection(){
    let selectedId = document.querySelector('#frameprop-sec-list').value;
    console.log(Section.SectionList.get(selectedId))
    return Section.SectionList.get(selectedId);  
}