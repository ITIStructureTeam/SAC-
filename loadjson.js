
function LoadJson(jsonobj) {

    let model = JSON.parse(jsonobj); 

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

    //read materials
    Material.ReadFromJson(model.Materials);

    // read sections
    Section.ReadFromJson(model.Sections);

    //read patterns
    LoadPattern.ReadFromJson(model.Patterns)

    //read combinations
    LoadCombo.ReadFromJson(model.Combinations);

    // read points
    Point.ReadFromJson( model.Points );

    // read frames
    let frames = FrameElement.ReadFromJson( model.Frames );


    //display frames
    frames.forEach(frame => {
        let drawLine = new DrawLine(frame);
        drawLine.excute();
    });

}
