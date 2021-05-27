// // renderer
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor('rgb(255,255,255)');
// document.body.appendChild(renderer.domElement);

// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
// camera.position.set(0, 0, 100);

// // scene
// const scene = new THREE.Scene();


// // controls
// const controls = new THREE.OrbitControls(camera, renderer.domElement);

// // axes
// scene.add(new THREE.AxesHelper(10));

// render();

// const material = new THREE.LineBasicMaterial({ color: 'grey' });

// const points = []

// //THREE.group

// const Xpoints = [];
// const Ypoints = [];
// const Zpoints = [];

// // var x = prompt("Enter x Grid Data");
// // console.log("x Grid Data");
// // while (x != "") {
// //     Xpoints.push(x);
// //     console.log(x);
// //     x = prompt("Enter x Grid Data");
// // }

// var x;
// Xpoints.push(0);
// Xpoints.push(3);
// Xpoints.push(5);
// Xpoints.push(9);
// Ypoints.push(0);
// Ypoints.push(4);
// Ypoints.push(6);
// Ypoints.push(10);
// Zpoints.push(1);
// Zpoints.push(3);
// Zpoints.push(5);


// // var y = prompt("Enter y Grid Data");
// // console.log("y Grid Data");
// // while (y != "") {
// //     Ypoints.push(y);
// //     console.log(y);
// //     y = prompt("Enter y Grid Data");
// // }

// // var z = prompt("Enter z Grid Data");
// // console.log("z Grid Data");
// // while (z != "") {
// //     Zpoints.push(z);
// //     console.log(z);
// //     z = prompt("Enter z Grid Data");
// // }

// var i, j, k, l, m;

// // Vertical Grids
// for (m = 0; m < Zpoints.length - 1; m++) {
//     for (i = 0; i < Xpoints.length; i++) {

//         for (j = 0; j < Ypoints.length - 1; j++) {

//             //Lower Points
//             points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//             j++;
//             points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//             j--;

//             // Upper Points
//             points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//             m++;
//             points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));

//             points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//             j++;
//             points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//             j--;

//             m--;
//         }
//         points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//         m++;

//         points.push(new THREE.Vector3(Xpoints[i], Ypoints[j], Zpoints[m]));
//         m--;
//     }

// }

// // Horizontal Grids
// for (m = 0; m < Zpoints.length; m++) {

//     for (k = 0; k < Ypoints.length; k++) {

//         for (l = 0; l < Xpoints.length - 1; l++) {
//             points.push(new THREE.Vector3(Xpoints[l], Ypoints[k], Zpoints[m]));
//             l++;
//             points.push(new THREE.Vector3(Xpoints[l], Ypoints[k], Zpoints[m]));
//             l--;
//         }
//     }
// }

// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const line = new THREE.LineSegments(geometry, material);

// scene.add(line);

// function render() {
//     requestAnimationFrame(render);
//     renderer.render(scene, camera);
// }

// /----------------------------------------------------------------------------\ 
// Don't Remove that part
function init() {
    Metro.activity.open({
        overlayColor: '#fff',
        overlayAlpha: 1,
        text: `<img style="width: 500px;"
        src="Assets/images/kiwi-icon-27.png" alt="KiweIcon" />
        <div class=\'mt-2 text-large\'>KIWE Structural Analysis...</div>
        <div class=\'mt-2 text-large\'>Loading...</div>`,
        type: 'bars',
        autoHide: 1000
    });
}


document.getElementsByTagName('body')[0].addEventListener("click", function() {
    Metro.sidebar.close('#sb1');
});

// function undoclick() {
//     Metro.toast.create("Undo Clicked", null, 500, "primary");
//     if ($("#undowindow").length > 0) {
//         alert("Window is Opened !!");
//     } else {
//         $('body').append(`<div   
//     id="undowindow" data-top="200"
//     style="z-index: 3;"
//     data-left="100"
//     data-role="window"
//     data-width="200" 
//     data-height="160"
//     data-title="Undo Window"

//     data-icon="<img src='Assets/images/UndoIcon.png'>"> 
//     Put Your Code Here for the Window >> or you can make the window display hidden and on click function it will be visible!
//     Thank You So Much:D :D 
//     </div>`);

//     }
// }

var flag = true;

function resizeribbon() {
    Metro.toast.create("Resizing Ribbon", null, 1000);
    if (flag) {
        var x = $("button.ribbon-button");
        document.getElementById('resizeribbonbtn').style.top = "70%";
        // document.getElementById('sb4').style.marginTop = "132.4px";

        for (i = 0; i < x.length; i++) {
            if (x[i].className == 'ribbon-button')
                x[i].setAttribute('class', 'ribbon-icon-button');
            else
                x[i].setAttribute('class', 'ribbon-icon-button dropdown-toggle');
        }
        flag = !flag;
    } else {
        var x = $("button.ribbon-icon-button");
        document.getElementById('resizeribbonbtn').style.top = "76%";
        // document.getElementById('sb4').style.marginTop = "174px";

        for (i = 0; i < x.length; i++) {
            if (x[i].className == 'ribbon-icon-button')
                x[i].setAttribute('class', 'ribbon-button');
            else
                x[i].setAttribute('class', 'ribbon-button dropdown-toggle');
        }
        flag = !flag;
    }
}