
let _xhr = new XMLHttpRequest();
document.getElementById('load-json').onclick=LoadJsonFile;
function LoadJsonFile(){
    _xhr.open("Get","./model.json");
    _xhr.send("");
    _xhr.onreadystatechange = function(){
        if(_xhr.readyState==4 && _xhr.status==200){
            let jsonObj = _xhr.responseText;
            let model = JSON.parse(jsonObj);
            console.log(model)
            //read materials
            model.Materials.forEach( material => {
                new Material(material.Name, material.Weight, material.ElasticModulus, material.Poisson, material.ThermalExpansion,material.MaterialType, material.Strength)
            });

            //read sections
            model.Sections.forEach(section => {
                let mat = Material.GetMaterialByName(section.Material);
                new Section(section.Name, mat, section.SecType, section.Dimensions, section.PropModifiers);
            });
             
            //read patterns
            let patterns = [];
            model.Patterns.forEach(pattern => {
                let pat = new LoadPattern(pattern.Details.Name, pattern.Details.Type, pattern.Details.SelfWtMult);
                pat._id = pattern.PatternID;
                patterns.push(pat);
            });
            LoadPattern.LoadPatternsList.clear();
            patterns.forEach( pattern => LoadPattern.LoadPatternsList.set(pattern.ID,pattern));

            //read points
            model.Points.forEach( point => {
                let pt = new Point(point.position);
                pt.Label = point.label;
                pt.Restraint = point.Restraints;
            });
            console.log(Point.PointsArray);

            //read frames
            let frames = []
            model.Frames.forEach( frame => {
                //get start and end points and section
                let startPt = Point.PointsArray.filter( pt => pt.Label == frame.StartPoint)[0];
                let endPt = Point.PointsArray.filter( pt => pt.Label == frame.EndPoint)[0];
                let section = Section.GetSectionByName(frame.Section);
                //create new frame
                let newframe = new FrameElement([...startPt.position,...endPt.position], section);
                //set important properties
                newframe.Label = frame.Label;
                newframe.Rotation = frame.Rotation*Math.PI/180;
                frame.Loads.forEach( load => {
                    let appliedloads = [];
                    load.LoadDetails.forEach( loaddetail => {
                        let appliedload = (loaddetail.Shape == ELoadShape.Point)?
                        new AppliedLoadInfo(loaddetail.CoordSys,loaddetail.Dir,loaddetail.Type, loaddetail.Shape, loaddetail.Distance[0], loaddetail.Magnitude[0]):
                        new AppliedLoadInfo(loaddetail.CoordSys, loaddetail.Dir, loaddetail.Type, loaddetail.Shape, loaddetail.Distance, loaddetail.Magnitude);
                        appliedloads.push(appliedload);
                    });
                    newframe.LoadsAssigned.set(load.Pattern, appliedloads);
                });
                frames.push(newframe);
            });
            
            
            //display frames
            frames.forEach(frame => {
                let drawLine = new DrawLine(frame);
                drawLine.excute();
            })

        }
    }
}