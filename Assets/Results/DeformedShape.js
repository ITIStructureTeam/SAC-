class DeformedShape {

    static _circlesPositions = new Map();
    static DeformShapesList = new Array();
    static displayedLoadCase;
    static deformationMode = false;
    static scaleMap;

    constructor(frameLabel, backResults) {
        this.Frame = DrawLine.GetDrawnFrames().filter(frame => frame.Label == frameLabel)[0];

        this.Results = backResults;
        this.DeformedLines = new Map();
        this.CreateDeformedLines();
        DeformedShape.DeformShapesList.push(this);
    }

    CheckPosEquality(pos1, pos2) {
        // pos1 ---> [x1, y1, z1]
        // pos2 ---> [x2, y2, z2]
        let rounding = 0.01;
        let isequal = false;
        let dx = Math.abs(pos1[0] - pos2[0]);
        let dy = Math.abs(pos1[1] - pos2[1]);
        let dz = Math.abs(pos1[2] - pos2[2]);
        if (dx <= rounding && dy <= rounding && dz <= rounding) {
            isequal = true;
        }
        return isequal;
    }

    AddCircle(deformedLine, loadcase, startdeform, enddeform) {

        delete startdeform.stations;
        delete enddeform.stations;

        if (!DeformedShape._circlesPositions.has(loadcase)) {

            DeformedShape._circlesPositions.set(loadcase, []);
        }

        let circlesPos = DeformedShape._circlesPositions.get(loadcase);

        let geometry = new THREE.RingGeometry(0.1, 0.2, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });

        let positions = deformedLine.geometry.attributes.position;

        let pos1 = [positions.getX(0), positions.getY(0), positions.getZ(0)];
        if (!(circlesPos.some(pos => this.CheckPosEquality(pos, pos1)))) {

            circlesPos.push(pos1);
            let circle1 = new THREE.Mesh(geometry, material);
            circle1.position.set(...pos1);
            circle1.deformation = startdeform;
            circle1.visible = false;
            deformedLine.add(circle1);

        }

        let lastindex = deformedLine.geometry.attributes.position.count - 1;
        let pos2 = [positions.getX(lastindex), positions.getY(lastindex), positions.getZ(lastindex)];
        if (!(circlesPos.some(pos => this.CheckPosEquality(pos, pos2)))) {

            circlesPos.push(pos2);
            let circle2 = new THREE.Mesh(geometry, material);
            circle2.position.set(...pos2);
            circle2.deformation = enddeform;
            circle2.visible = false;
            deformedLine.add(circle2);
        }

    }

    CreateDeformedLines() {


        for (const result of this.Results) {
            let caseId = result.caseID;
            let pointsdeform = result.pointsDeformationDetails;
            let pointsarr = [];
            let maxdelta = parseFloat(DeformedShape.scaleMap.get(caseId).toFixed(4));
            let amplify = (maxdelta) ? 1 / maxdelta : 1;

            for (const pointdeform of pointsdeform) {

                let pointpos = pointdeform.stations[0];
                let x = pointpos.x + pointdeform.u1[0] * amplify;
                let y = pointpos.y + pointdeform.u2[0] * amplify;
                let z = pointpos.z + pointdeform.u3[0] * amplify;

                let point = new THREE.Vector3(x, y, z);
                //point.applyAxisAngle(new THREE.Vector3(1,0,0), pointdeform.r1[0]);
                //point.applyAxisAngle(new THREE.Vector3(0,1,0), pointdeform.r2[0]);
                //point.applyAxisAngle(new THREE.Vector3(0,0,1), pointdeform.r3[0]);
                pointsarr.push(point);
            }
            let curve = new THREE.CatmullRomCurve3(pointsarr);
            let points = curve.getPoints(50);
            let geometry = new THREE.BufferGeometry().setFromPoints(points);
            let deformedLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 'rgb(10,10,200)' }));
            this.AddCircle(deformedLine, caseId, pointsdeform[0], pointsdeform[pointsdeform.length - 1]);
            this.DeformedLines.set(caseId, deformedLine);
        }
    }

    static GetAddedCircles() {
        let circles = [];
        DeformedShape.DeformShapesList.forEach(defshape => {
            let deformedline = defshape.DeformedLines.get(DeformedShape.displayedLoadCase);
            deformedline.children.forEach(circle => circles.push(circle));
        });
        return circles;
    }

    Hide() {
        let deformedline = this.DeformedLines.get(DeformedShape.displayedLoadCase);
        scene.remove(deformedline);
    }

    Show() {
        if (DeformedShape.deformationMode) {
            let deformedline = this.DeformedLines.get(DeformedShape.displayedLoadCase);
            scene.add(deformedline);
        }
    }

    InView() {

        if (view == "XY" && (this.Frame.StartPoint.position[2] != ViewPosition || this.Frame.EndPoint.position[2] != ViewPosition)) {
            this.Hide();
        }
        else if (view == "XZ" && (this.Frame.StartPoint.position[1] != ViewPosition || this.Frame.EndPoint.position[1] != ViewPosition)) {
            this.Hide();
        }
        else if (view == "YZ" && (this.Frame.StartPoint.position[0] != ViewPosition || this.Frame.EndPoint.position[0] != ViewPosition)) {
            this.Hide();
        }
        else {
            this.Show();
        }
    }

    static GetDeformsList(frameID) {

        let defshape = DeformedShape.DeformShapesList.filter(defshape => defshape.Frame.Label == frameID)[0];
        let stPoint = defshape.Frame.StartPoint.position;
        let endPoint = defshape.Frame.EndPoint.position;
        /* [
            {caseId: , deforms: {stations: }

        ]*/
        let framedeforms = [];
        for (const result of defshape.Results) {

            let ptdeforms = [];
            let ptresults = result.pointsDeformationDetails;
            for (let i = 0; i < ptresults.length; i++) {

                let pos;
                
                if (i == 0) {

                    pos = { x: stPoint[0], y: stPoint[1], z: stPoint[2] }

                } else if (i == ptresults.length - 1) {

                    pos = { x: endPoint[0], y: endPoint[1], z: endPoint[2] }

                } else {

                    pos = ptresults[i].stations[0];
                }

                let dx2 = Math.pow((stPoint[0] - pos.x), 2);
                let dy2 = Math.pow((stPoint[1] - pos.y), 2);
                let dz2 = Math.pow((stPoint[2] - pos.z), 2);
                let reldis = Math.sqrt(dx2 + dy2 + dz2);

                ptdeforms.push({
                    station: reldis,
                    u1: ptresults[i].u1[0],
                    u2: ptresults[i].u2[0],
                    u3: ptresults[i].u3[0],
                    r1: ptresults[i].r1[0],
                    r2: ptresults[i].r2[0],
                    r3: ptresults[i].r3[0]
                });
            }

            framedeforms.push(
                {
                    caseID: result.caseID,
                    details: ptdeforms
                }
            );

        }
        return framedeforms;
    }
}

//// end of DeformedShape class ////

function ShowDefLineCircles() {
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let i = 0; i < intersects.length; i++) {

        if (intersects[i].object.deformation) {

            intersects[i].object.visible = true;
            intersects[i].object.lookAt(camera.position);

            if (!document.querySelector('.deform-info-label')) {

                let div = document.createElement('div');
                div.classList.add("deform-info-label");
                div.style.left = window.innerWidth / 2 * (1 + mouse.x) + 20 + 'px';
                div.style.top = window.innerHeight / 2 * (1 - mouse.y) - 50 + 'px';

                for (const deform in intersects[i].object.deformation) {
                    let p = document.createElement('p');

                    p.innerHTML = `${deform} = ${projUnits.DeformConvert(intersects[i].object.deformation[deform][0])}`
                    div.appendChild(p);

                }
                document.body.appendChild(div);
            }
        }

    }
}

function HideDefLineCircles() {
    let circles = DeformedShape.GetAddedCircles();
    let div = document.querySelector('.deform-info-label');
    if (circles.length) {
        for (let i = 0; i < circles.length; i++) {
            circles[i].visible = false;
        }
    }
    if (div) {
        for (let i = 0; i < div.children.length; i++) {
            div.children[i].remove();
        }
        document.body.removeChild(div);
    }
}


function GetDefScaleMap(modeldeformations) {

    let framesmaximums = [];

    for (const frame of modeldeformations) {

        let framemaxms = [];
        for (const casedeform of frame.deformationDetails) {

            let framecasedeltas = [];
            for (const pointdeform of casedeform.pointsDeformationDetails) {
                let dx2 = Math.pow(pointdeform.u1[0], 2);
                let dy2 = Math.pow(pointdeform.u2[0], 2);
                let dz2 = Math.pow(pointdeform.u3[0], 2);
                let delta = Math.sqrt(dx2 + dy2 + dz2);
                framecasedeltas.push(delta);
            }
            framemaxms.push({ caseID: casedeform.caseID, max: Math.max(...framecasedeltas) });
        }
        framesmaximums.push(framemaxms);
    }

    let scalemap = new Map();
    framesmaximums[0].forEach(obj => scalemap.set(obj.caseID, 0));

    for (const key of scalemap.keys()) {
        let max = 0
        for (const framemaxms of framesmaximums) {
            let value = framemaxms.filter(arr => arr.caseID == key)[0].max;
            max = (value > max) ? value : max;
        }
        scalemap.set(key, parseFloat(max.toFixed(5)));
    }
    return scalemap
}