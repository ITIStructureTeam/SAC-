

var matMainWindow = `

        <div
        class="main-window"
        id="mat-main-window"
        data-role="window"
        data-title="Define Material"
        data-btn-min="false"
        data-btn-max="false"
        data-resizable="false"
        data-place="center"
        data-width="350px">

           <div class="flex-col">
               <div class="flex-rowm">
                   <div class="def-mats" data-role="panel" data-title-caption="Materials" data-height="200" data-width="250">
                        <div id="mat-list-container" style="width: 150px;">
                            <ul data-role="listview" id="mat-list">
                                <li ></li>
                                <li ></li>
                            </ul>
                        </div>
                   </div>
                   <div class="ctrls">
                       <button class="button secondary" id="add-mat-btn">Add</button>
                       <button class="button secondary" id="mod-mat-btn" disabled >Modify</button>
                       <button class="button secondary" id="copy-mat-btn" disabled>Copy</button>
                       <button class="button secondary" id="delete-mat-btn" disabled>Delete</button>
                   </div>
                
               </div>
               <div class="mat-form-btn">
                   <button id="close-mat-btn" class="button info">Close</button>
               </div>
           </div>

        </div>

`

var materialWindowHtml = `

            <div
            class="secondary-window"
            id="mat-define-window"
            data-role="window"
            data-title="Material properties"
            data-btn-min="false"
            data-btn-max="false"
            data-resizable="false"
            data-place="center"
            data-width="375">
            
               <table class="table compact" id="mat-form">
               <tbody style="height:370px;">
                <tr>
                
                    <th>
                        <label>Material Type</label>
                    </th>
                    <th>
                        <select 
                        id="mat-type"
                        class="input-small"
                        data-role="select"
                        data-filter="false"
                        data-drop-height=80
                        >
                        </select>
                    </th>        
                </tr>

                   <tr>
                       <th>
                           <label for="">Name</label>
                       </th>
                       <th>
                           <input id="mat-name" class="input-small" type="text" data-role="input">
                       </th>
                   </tr>
               
                   <tr >
                       <th>
                           <label for="">Elastic Modulus</label>
                       </th>
                       <th>
                           <input id="mat-elastic" class="input-small" type="number" data-role="input">
                       </th>
                   </tr>
               
                   <tr>
                       <th>
                           <label for="">Density</label>
                       </th>
                       <th>
                           <input id="mat-density" class="input-small" type="number" data-role="input">
                       </th>               
                   </tr>
               
                   <tr>
                       <th>
                           <label class="" for="">Poisson Ratio</label>
                       </th>
                      <th>
                       <input id="mat-poisson" class="input-small" type="number" data-role="input">
                      </th>

                   </tr>

                   <tr>
                       <th>
                           <label class="" for="">Thermal Expansion</label>
                       </th>
                      <th>
                       <input id="mat-thermal" class="input-small" type="number" data-role="input">
                      </th>

                   </tr>
               
                   <tr>
                       <th>
                           <label for="">Yield Strength</label>
                       </th>
                       <th>
                           <input id="mat-yield" class="input-small" type="number" data-role="input">
                       </th>           
                   </tr>
               
                   <tr>
                       <th>
                           <label for="">Ultimate Strength</label>
                       </th>
                       <th>
                           <input id="mat-ultimate" class="input-small" type="number" data-role="input">
                       </th>           
                   </tr>
                   <!--tr>
                        <th>
                            <button id="new-mat-save">Save Changes</button>
                        </th>
                    </tr-->
               </tbody>
               </table>

               <div style="text-align: center;">
                    <button id="new-mat-save"  class="button info">Save Changes</button>
                    <button id="new-mat-close"  class="button info">Close</button>
                </div>
            </div>

`

document.getElementById("materialsBtn").addEventListener("click",
        
        function(){
            if(!document.querySelector(".main-window")){
                InitMatMainWindow();
            } 
        }          
);

function InitMatMainWindow(){

    $('body').append(matMainWindow);

    FillMaterialDropList();

    document.querySelector('#mat-main-window').addEventListener("click",ActivateEditButtons);

    document.querySelector('#add-mat-btn').addEventListener("click",function(){
        if(!document.querySelector(".secondary-window"))
        {
            InitAddMaterialWindow();
            document.querySelector('#new-mat-save').addEventListener("click",AddNewMaterial);
            document.querySelector('#new-mat-close').addEventListener("click",function(){
                CloseWindow('mat-define-window');
            });
        }
    });

    document.querySelector('#mod-mat-btn').addEventListener("click",function(){
        if(!document.querySelector(".secondary-window"))
        {
            InitAddMaterialWindow();
            LoadMaterialData();
            document.querySelector('#new-mat-save').addEventListener("click",ModifyMaterial);
            document.querySelector('#new-mat-close').addEventListener("click",function(){
                CloseWindow('mat-define-window');
            });
        }
    });

    document.querySelector('#delete-mat-btn').addEventListener("click",DeleteMaterial);

    document.querySelector('#copy-mat-btn').addEventListener("click",CopyMaterial);

    document.querySelector('#close-mat-btn').addEventListener("click",function () {
        CloseWindow('mat-main-window');
    })

}

function InitAddMaterialWindow(){
    $('body').append(materialWindowHtml);
    FillMaterialType(); 
}

function FillMaterialDropList(){
    let length = $('#mat-list').children().length;
    for (let i = length-1; i >= 0 ; i--) {
        $('#mat-list').children()[i].remove();      
    }
    Material.MaterialsList.forEach((value,key) => {
        $("#mat-list").append(`<li value=${key} >${value.Name}</li>`); 
    });                  
}

function FillMaterialType(){
    for (const type in EmaterialType) {
        $('#mat-type').append(`<option value=${EmaterialType[type]}>${type}</option>`)
    }        
}

function ReloadMaterialWindow(){
    //$('#mat-main-window')[0].parentElement.parentElement.remove();
    //InitMatMainWindow();
    document.querySelector('#mat-list').remove();
    $('#mat-list-container').append(`
        <ul data-role="listview" id="mat-list">
            <li></li>
        </ul>
    `)
    FillMaterialDropList();
}

function LoadMaterialData(){
    
    let selectedKey =  $(".current-select")[0].value;
    let selectedMaterial = Material.MaterialsList.get(String(selectedKey));
    $('#mat-type').val(selectedMaterial.MaterialType);
    $('#mat-name').val(selectedMaterial.Name);
    $('#mat-elastic').val(selectedMaterial.ElasticModulus);
    $('#mat-density').val(selectedMaterial.Weight);
    $('#mat-poisson').val(selectedMaterial.Poisson);
    $('#mat-thermal').val(selectedMaterial.ThermalExpansion);
    $('#mat-yield').val(selectedMaterial.Strength[0]);
    $('#mat-ultimate').val(selectedMaterial.Strength[1]);
}

function AddNewMaterial(){
    let type = document.querySelector('#mat-type').value;
    let name = document.querySelector('#mat-name').value;
    let elastic = document.querySelector('#mat-elastic').valueAsNumber;
    let density = document.querySelector('#mat-density').valueAsNumber;
    let poisson = document.querySelector('#mat-poisson').valueAsNumber;
    let thermal = document.querySelector('#mat-thermal').valueAsNumber;
    let yield = document.querySelector('#mat-yield').valueAsNumber;
    let ultimate = document.querySelector('#mat-ultimate').valueAsNumber;
    try{
        if($('#mat-define-window')[0].querySelector('p')) $('#mat-define-window')[0].querySelector('p').remove();
        var mat = new Material(name,density,elastic,poisson,thermal,type,[yield,ultimate]);
        ReloadMaterialWindow();
        $('#mat-define-window')[0].parentElement.parentElement.remove();

    }catch(error){               
        $('#mat-define-window').append(`<p style="color:#CE352C;">${error.message}</p>`);
    }
}
    
function ModifyMaterial(){
    let selectedKey =  $(".current-select")[0].value;
    let selectedMaterial = Material.MaterialsList.get(String(selectedKey));
    if($('#mat-define-window')[0].querySelector('p')) $('#mat-define-window')[0].querySelector('p').remove();
    try{    
        selectedMaterial.Name = document.querySelector('#mat-name').value;
        selectedMaterial.Weight = document.querySelector('#mat-density').valueAsNumber;
        selectedMaterial.ElasticModulus = document.querySelector('#mat-elastic').valueAsNumber;
        selectedMaterial.Poisson=document.querySelector('#mat-poisson').valueAsNumber;
        selectedMaterial.ThermalExpansion=document.querySelector('#mat-thermal').valueAsNumber;
        selectedMaterial.MaterialType = document.querySelector('#mat-type').value;
        let strength = [document.querySelector('#mat-yield').valueAsNumber, document.querySelector('#mat-ultimate').valueAsNumber];
        selectedMaterial.Strength = strength;
        ReloadMaterialWindow();
        $('#mat-define-window')[0].parentElement.parentElement.remove();
    }catch(error){               
        $('#mat-define-window').append(`<p style="color:#CE352C;">${error.message}</p>`);
    }          
}

function DeleteMaterial(){
    let selectedKey =  $(".current-select")[0].value;
    let selectedMaterial = Material.MaterialsList.get(String(selectedKey));
    if($('#mat-main-window')[0].querySelector('p')) $('#mat-main-window')[0].querySelector('p').remove();
    try {
        selectedMaterial.Delete();
        ReloadMaterialWindow();
    } catch (error) {
        $('#mat-main-window').append(`<p style="color:#CE352C;">${error.message}</p>`);
    }
}

function CopyMaterial(){
    let selectedKey =  $(".current-select")[0].value;
    let selectedMaterial = Material.MaterialsList.get(String(selectedKey));
    if($('#mat-main-window')[0].querySelector('p')) $('#mat-main-window')[0].querySelector('p').remove();
    selectedMaterial.Clone();
    ReloadMaterialWindow();
}

function CloseWindow(windowId) {
    $('#'+windowId)[0].parentElement.parentElement.remove();
}
    
function ActivateEditButtons() {
    if (document.querySelector('.current-select')){
        let buttons = document.querySelector('.ctrls').querySelectorAll('button')
        for (let i = 1; i < buttons.length; i++) {
            buttons[i].removeAttribute("disabled")            
        }
    }
}

/*window.addEventListener("click",function(){

    if(document.querySelector('.window-container')){   
        document.querySelector('.window-container').classList.add('overlay');
        if(document.querySelector('.secondary-window-container')){
            document.querySelectorAll('.overlay').forEach(e => e.classList.remove('overlay'));
            document.querySelector('.secondary-window-container').classList.add('overlay');
    
            if(document.querySelector('.ter-window-container')){
                document.querySelectorAll('.overlay').forEach(e => e.classList.remove('overlay'));
                document.querySelector('.ter-window-container').classList.add('overlay');
            }
        }       
    }
   
});*/
