

class RootData {
    constructor() {
        this.ProjectName = Project_Name;
        this.Materials = [...Material.MaterialsList.values()];
        this.Sections = [...Section.SectionList.values()];
        this.Patterns = Array.from(LoadPattern.LoadPatternsList, ([PatternID, Details]) => ({ PatternID, Details }));
        this.Combinations = Array.from(LoadCombo.LoadCombosList, ([CombinationID, Details]) => ({ CombinationID, Details }));
        this.Points = [...Point.PointsArray];
        this.Frames = DrawLine.GetDrawnFrames();
        this.GridData = [listx, listy, listz];
    }
}


function DisablePostProcessBts() {
    $('#deformed-btn')[0].disabled = true;
    $('#reactions')[0].disabled = true;
    $('#frame-forces')[0].disabled = true;
}

function EnablePostProcessBts() {
    $('#deformed-btn')[0].disabled = false;
    $('#reactions')[0].disabled = false;
    $('#frame-forces')[0].disabled = false;
}

function DisaplePreProcessorButtons() {
    Unselect();
    DrawingModeActive = false;
    PreProcessor = false;
    document.getElementById("Move").disabled = true;
    document.getElementById("Copy").disabled = true;
    document.getElementById("Delete").disabled = true;
    document.getElementById("Undo").disabled = true;
    document.getElementById("Redo").disabled = true;
    document.getElementById("Rotate").disabled = true;
    document.getElementById("point-load-btn").disabled = true;
    document.getElementById("distributed-load-btn").disabled = true;
    document.getElementById("JointRestraints").disabled = true;
    document.getElementById("assign-framesec-btn").disabled = true;
    document.getElementById("Draw").disabled = true;
    document.getElementById("AddPointsOnFrame").disabled = true;
    document.getElementById("grids-btn").disabled = true;
    document.getElementById("Run").disabled = true;
    document.getElementById("Unlock").disabled = false;
}

function EnaplePreProcessorButtons() {
    PreProcessor = true;
    document.getElementById("Move").disabled = false;
    document.getElementById("Copy").disabled = false;
    document.getElementById("Delete").disabled = false;
    document.getElementById("Undo").disabled = false;
    document.getElementById("Redo").disabled = false;
    document.getElementById("Rotate").disabled = false;
    document.getElementById("point-load-btn").disabled = false;
    document.getElementById("distributed-load-btn").disabled = false;
    document.getElementById("JointRestraints").disabled = false;
    document.getElementById("assign-framesec-btn").disabled = false;
    document.getElementById("disp-load-btn").disabled = false;
    document.getElementById("Draw").disabled = false;
    document.getElementById("AddPointsOnFrame").disabled = false;
    document.getElementById("grids-btn").disabled = false;
    document.getElementById("materialsBtn").disabled = false;
    document.getElementById("DefineSections").disabled = false;
    document.getElementById("pattern-btn").disabled = false;
    document.getElementById("combo-btn").disabled = false;
    document.getElementById("Run").disabled = false;
    document.getElementById("Unlock").disabled = true;
}

document.getElementById("Unlock").onclick = function () { Unlock() };

function Unlock() {

    locked = false;
    DisablePostProcessBts();
    EnaplePreProcessorButtons();
    document.getElementById("StatusBar").innerHTML = "";


    // reset Results class
    Results.ResultsList.forEach(res => res.Hide());
    Results.ResultsList = [];

    // reset JointReactions class
    JointReactions.ReactionsList.forEach(reaction => reaction.Hide());
    JointReactions.ReactionsList = [];

    //reset DeformedShape class
    if (DeformedShape.deformationMode) {
        DeformedShape.deformationMode = false;
        DeformedShape.DeformShapesList.forEach(defshape => defshape.Hide());
    }
    DeformedShape.DeformShapesList = [];
}

function Run() {
    document.getElementById("StatusBar").innerHTML = "Running Model";
    let inPut = JSON.stringify(Project_Name);
    console.log(inPut)
    $.ajax({
        type: "POST",
        url: "/api/RunAnalysis/LoadFramesData",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: inPut,
        cache: false,
        success: function (result) {
            locked = true;
            EnablePostProcessBts();
            console.log(result);
            let InputResults = [...result.strainingActions];
            for (let i = 0; i < InputResults.length; i++) {
                let patternID = InputResults[i].patternID;
                let frameID = InputResults[i].frameID;
                let startPoint = InputResults[i].startPoint;
                let endPoint = InputResults[i].endPoint;
                let stations = InputResults[i].stations;
                let momentX = InputResults[i].momentX;
                let momentY = InputResults[i].momentY;
                let torsion = InputResults[i].torsion;
                let normal = InputResults[i].normal;
                let shearX = InputResults[i].shearX;
                let shearY = InputResults[i].shearY;
                let rotation = InputResults[i].rotation;
                new Results(patternID, frameID, startPoint, endPoint, stations, momentX, momentY, torsion, normal, shearX, shearY, rotation)
            }

            let InputRactions = [...result.reactions];
            for (let i = 0; i < InputRactions.length; i++) {
                let jointID = InputRactions[i].jointID;
                let patternID = InputRactions[i].patternID;
                let position = InputRactions[i].position;
                let rx = InputRactions[i].rx;
                let ry = InputRactions[i].ry;
                let rz = InputRactions[i].rz;
                let mx = InputRactions[i].my;
                let my = InputRactions[i].mx;
                let mz = InputRactions[i].mz;
                new JointReactions(patternID, jointID, position, rx, ry, rz, mx, my, mz)
            }

            DeformedShape.scaleMap = GetDefScaleMap(result.deformations);
            DeformedShape.displayedLoadCase = DeformedShape.scaleMap.keys().next().value;
            for (const framedeform of result.deformations) {
                new DeformedShape(framedeform.frameID, framedeform.deformationDetails);
            }
            console.log(Results.ResultsList);
            console.log(JointReactions.ReactionsList);
            document.getElementById("StatusBar").innerHTML = "Run Complete";
        },
        error: function (ex) {
            console.log(ex.responseText);
            document.getElementById("StatusBar").innerHTML = "Run Failed";
        }
    });
}



function SaveModelforRun(func) {
    document.getElementById("StatusBar").innerHTML = "Saving ...";
    let OutPut = JSON.stringify(new RootData());

    $.ajax({
        type: "POST",
        url: "/api/RunAnalysis/SaveModel",
        contentType: "application/json; charset=utf-8",
        //dataType: "json",
        data: OutPut,
        cache: false,
        success: function (result) {
            if (func != null) {
                func();
            }
            console.log("Data saved");
            document.getElementById("StatusBar").innerHTML = "Data Saved";
        },
        error: function (ex) {
            console.log(ex.responseText);
            document.getElementById("StatusBar").innerHTML = "Could not save model";
        }
    });
}


document.querySelector("#SaveButton").addEventListener("click", SaveModel);

function SaveModel() {
    document.getElementById("StatusBar").innerHTML = "Saving ...";
    let OutPut = JSON.stringify(new RootData());
    console.log(OutPut);
    $.ajax({
        type: "POST",
        url: "/api/RunAnalysis/SaveModel",
        contentType: "application/json; charset=utf-8",
        //dataType: "json",
        data: OutPut,
        cache: false,
        success: function (result) {
            document.getElementById("StatusBar").innerHTML = "Data Saved";
            console.log("Data saved");
            console.log(result)
        },
        error: function (ex) {
            console.log(ex.responseText);
            document.getElementById("StatusBar").innerHTML = "Could not save model";
        }
    });
}



function ImportProjectData() {
    document.getElementById("StatusBar").innerHTML = "Importing ...";
    const input = JSON.stringify(Project_Name);
    $.ajax({
        type: "POST",
        url: "/api/RunAnalysis/ImportProject",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: input,
        cache: false,
        success: function (result) {
            document.getElementById("StatusBar").innerHTML = "Creating model ...";
            // Code goes in here
            LoadJson(result);
            console.log(result);
            document.getElementById("StatusBar").innerHTML = "Model created successfully";
            localStorage.setItem('ModelState', "New")
        },
        error: function (ex) {
            document.getElementById("StatusBar").innerHTML = "Failed to import model";
            console.log(ex.responseText);
        }
    });
}

$("#Run").click(function () {
    DisaplePreProcessorButtons();
    SaveModelforRun(Run);
});

document.querySelector("#SaveAsButton").addEventListener("click", SaveModelAs);
function SaveModelAs() {
    SaveModel();
    SaveAsWindow();
}
