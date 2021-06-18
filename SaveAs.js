function SaveAsWindow() {
    if (!$('#validatenamewindow').length) {

        $('body').append(`
<div   
id="SaveAsWin" data-top="200"
style="z-index: 10;
visibility: visible;"
data-left="500"
data-role="window"
data-width="420" 
data-height="125"
data-title="Project Information"
data-resizable="false"

data-icon="<img src='Assets/images/InformationLogo.png'>"> 

<input id = "Model_Name" type="text" data-role="input" data-prepend="Model Name: ">

<div style="margin-top: 6px;margin-right: 10px;">
        <span id = "Not_Valid" style = "color:red; visibility:hidden; float: left; width:350px; overflow-wrap: break-word; margin-left:10px" >The model name is already used or not valid</span>
        <button id = "Ok_SaveAs" onclick="CheckModelName()" class="button secondary" style="float: right;">OK</button>
        <button onclick="CloseSaveAsWindow()" class="button default" style="float: right;">Cancel</button>
    </div>
</div>`);

    }
}


function CloseSaveAsWindow() {
    Metro.window.close('#SaveAsWin');
}
function CheckModelName() 
{
let input = JSON.stringify(document.getElementById("Model_Name").value);
$.ajax({
    type: "POST",
    url: "/api/RunAnalysis/CheckModelName",                 
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: input,
    cache: false,
    success: function (result) {
        if(result == "True")
        {
            Project_Name = document.getElementById("Model_Name").value;
            CloseSaveAsWindow();
            SaveModel();
        }
        else{
            document.getElementById("Not_Valid").style.visibility = 'visible';
        }
    },
    error: function (ex) {
        console.log(ex.responseText);
    }
});
}
