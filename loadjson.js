
/*let _xhr = new XMLHttpRequest();
document.getElementById('load-json').onclick = LoadJsonFile;
function LoadJsonFile() {
    _xhr.open("Get", "./model.json");
    _xhr.send("");
    _xhr.onreadystatechange = function () {
        if (_xhr.readyState == 4 && _xhr.status == 200) {
            let jsonObj = _xhr.responseText;
            let model = JSON.parse(jsonObj);
            console.log(model)

            //reset default defines
            Section.SectionList.clear();
            Material.MaterialsList.clear();
            LoadCombo.LoadCombosList.clear();
            LoadPattern.LoadPatternsList.clear();

            //#region read grids
            listx = model.Grids.Listx;
            listy = model.Grids.Listy;
            listz = model.Grids.Listz;
            if (group != null) {
                scene.remove(group);
                gridLines.forEach(element => {
                    element.material.dispose()
                    element.geometry.dispose()
                    scene.remove(element);
                });
                gridLines = [];
                for (var i = group.children.length - 1; i >= 0; i--) {
                    group.children[i].material.dispose();
                    group.children[i].geometry.dispose();
                    group.remove(group.children[i]);
                }
                removeSelectionGrids();
            }

            GridSelections();
            group = GridPoints(listx, listy, listz, listx.length, listy.length, listz.length);
            gridLines = GridLine(listx, listy, listz, listx.length, listy.length, listz.length);
            scene.add(group);
            gridLines.forEach(element => {
                scene.add(element);
            });
            //#endregion

            //#region read materials
            model.Materials.forEach(material => {
                new Material(material.Name, material.Weight, material.ElasticModulus, material.Poisson, material.ThermalExpansion, material.MaterialType, material.Strength)
            });
            //#endregion

            //#region read sections
            model.Sections.forEach(section => {
                let mat = Material.GetMaterialByName(section.Material);
                new Section(section.Name, mat, section.SecType, section.Dimensions, section.PropModifiers);
            });
            //#endregion

            //#region read patterns
            let patterns = [];
            model.Patterns.forEach(pattern => {
                let pat = new LoadPattern(pattern.Details.Name, pattern.Details.Type, pattern.Details.SelfWtMult);
                pat._id = pattern.PatternID;
                patterns.push(pat);
            });
            LoadPattern.LoadPatternsList.clear();
            patterns.forEach(pattern => LoadPattern.LoadPatternsList.set(pattern.ID, pattern));
            //#endregion

            //#region read points
            model.Points.forEach(point => {
                let pt = new Point(point.position);
                pt.Label = point.label;
                pt.Restraint = point.Restraints;
                pt.ViewIndication();
            });
            //#endregion

            //#region read frames
            let frames = []
            model.Frames.forEach(frame => {
                //get start and end points and section
                let startPt = Point.PointsArray.filter(pt => pt.Label == frame.StartPoint)[0];
                let endPt = Point.PointsArray.filter(pt => pt.Label == frame.EndPoint)[0];
                let section = Section.GetSectionByName(frame.Section);
                //create new frame
                let newframe = new FrameElement([...startPt.position, ...endPt.position], section);
                //set important properties
                newframe.Label = frame.Label;
                newframe.Rotation = frame.Rotation * Math.PI / 180;
                frame.Loads.forEach(load => {
                    let appliedloads = [];
                    load.LoadDetails.forEach(loaddetail => {
                        let appliedload = (loaddetail.Shape == ELoadShape.Point) ?
                            new AppliedLoadInfo(loaddetail.CoordSys, loaddetail.Dir, loaddetail.Type, loaddetail.Shape, loaddetail.Distance[0], loaddetail.Magnitude[0]) :
                            new AppliedLoadInfo(loaddetail.CoordSys, loaddetail.Dir, loaddetail.Type, loaddetail.Shape, loaddetail.Distance, loaddetail.Magnitude);
                        appliedloads.push(appliedload);
                    });
                    newframe.LoadsAssigned.set(load.Pattern, appliedloads);
                    LoadPattern.LoadPatternsList.get(load.Pattern).OnElements.push(newframe.Label)
                });
                frames.push(newframe);
            });
            //#endregion

            //display frames
            frames.forEach(frame => {
                let drawLine = new DrawLine(frame);
                drawLine.excute();
            })

        }
    }
}*/

function LoadJson(jsonobj) {

    let model = JSON.parse(jsonobj);
    //let model = jsonobj;

    //reset default defines
    Section.SectionList.clear();
    Material.MaterialsList.clear();
    LoadCombo.LoadCombosList.clear();
    LoadPattern.LoadPatternsList.clear();

    //#region read grids
    listx = model.GridData[0];
    listy = model.GridData[1];
    listz = model.GridData[2];
    if (group != null) {
        scene.remove(group);
        gridLines.forEach(element => {
            element.material.dispose()
            element.geometry.dispose()
            scene.remove(element);
        });
        gridLines = [];
        for (var i = group.children.length - 1; i >= 0; i--) {
            group.children[i].material.dispose();
            group.children[i].geometry.dispose();
            group.remove(group.children[i]);
        }
        removeSelectionGrids();
    }

    GridSelections();
    group = GridPoints(listx, listy, listz, listx.length, listy.length, listz.length);
    gridLines = GridLine(listx, listy, listz, listx.length, listy.length, listz.length);
    scene.add(group);
    gridLines.forEach(element => {
        scene.add(element);
    });
    //#endregion

    //#region read materials
    model.Materials.forEach(material => {
        new Material(material.Name, material.Weight, material.ElasticModulus, material.Poisson, material.ThermalExpansion, material.MaterialType, material.Strength)
    });
    //#endregion

    //#region read sections
    model.Sections.forEach(section => {
        let mat = Material.GetMaterialByName(section.Material);
        new Section(section.Name, mat, section.SecType, section.Dimensions, section.PropModifiers);
    });
    //#endregion

    //#region read patterns
    let patterns = [];
    model.Patterns.forEach(pattern => {
        let pat = new LoadPattern(pattern.Details.Name, pattern.Details.Type, pattern.Details.SelfWtMult);
        pat._id = pattern.PatternID;
        patterns.push(pat);
    });
    LoadPattern.LoadPatternsList.clear();
    patterns.forEach(pattern => LoadPattern.LoadPatternsList.set(pattern.ID, pattern));
    //#endregion

    //#region read points
    model.Points.forEach(point => {
        let pt = new Point(point.position);
        pt.Label = point.label;
        pt.Restraint = point.Restraints;
        pt.ViewIndication();
    });
    //#endregion

    //#region read frames
    let frames = []
    model.Frames.forEach(frame => {
        //get start and end points and section
        let startPt = Point.PointsArray.filter(pt => pt.Label == frame.StartPoint)[0];
        let endPt = Point.PointsArray.filter(pt => pt.Label == frame.EndPoint)[0];
        let section = Section.GetSectionByName(frame.Section);
        //create new frame
        let newframe = new FrameElement([...startPt.position, ...endPt.position], section);
        //set important properties
        newframe.Label = frame.Label;
        newframe.Rotation = frame.Rotation * Math.PI / 180;
        frame.Loads.forEach(load => {
            let appliedloads = [];
            load.LoadDetails.forEach(loaddetail => {
                let appliedload = (loaddetail.Shape == ELoadShape.Point) ?
                    new AppliedLoadInfo(loaddetail.CoordSys, loaddetail.Dir, loaddetail.Type, loaddetail.Shape, loaddetail.Distance[0], loaddetail.Magnitude[0]) :
                    new AppliedLoadInfo(loaddetail.CoordSys, loaddetail.Dir, loaddetail.Type, loaddetail.Shape, loaddetail.Distance, loaddetail.Magnitude);
                appliedloads.push(appliedload);
            });
            newframe.LoadsAssigned.set(load.Pattern, appliedloads);
            LoadPattern.LoadPatternsList.get(load.Pattern).OnElements.push(newframe.Label)
        });
        frames.push(newframe);
    });
    //#endregion

    //display frames
    frames.forEach(frame => {
        let drawLine = new DrawLine(frame);
        drawLine.excute();
    });

}