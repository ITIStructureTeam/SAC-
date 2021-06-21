class JointReactions
{
    static ReactionsList = [];
    static pattern;
    static ReactMode = false;
    constructor(pattern, jointLabel, position, Rx, Ry, Rz, Mx, My, Mz)
    {
        this.PatternID = pattern   ;
        this.JointID   = jointLabel;
        this.Position  = position  ;
        this.ReactionX = Rx;
        this.ReactionY = Ry;
        this.ReactionZ = Rz;
        this.MomentX   = Mx;
        this.MomentY   = My;
        this.Tortion   = Mz;
        this.Draw = new THREE.Group();
        JointReactions.ReactionsList.push(this);
    }

    DrawForces(pattern)
    {
        if(this.Draw.children.length>0 )
        {
            for (let j = this.Draw.children.length-1; j >= 0; j--) {
                this.Draw.remove(this.Draw.children[j]);
            }    
        }
        if(this.Draw != null){ scene.remove(this.Draw);}
       

        if(this.ReactionX[0].toFixed(3) != 0)
        {
            this.Draw.add(ResultForceArrow(this.ReactionX[0], this.Position, 1));
        }

        if(this.ReactionY[0].toFixed(3) != 0)
        {
            this.Draw.add(ResultForceArrow(this.ReactionY[0], this.Position, 3));
        }

        if(this.ReactionZ[0].toFixed(3) != 0)
        {
            this.Draw.add(ResultForceArrow(this.ReactionZ[0], this.Position, 2));
        }
        JointReactions.pattern = pattern;
        this.InView()
    }

    DrawMoments(pattern)
    {
        if(this.Draw.children.length>0)
        {
            for (let j = this.Draw.children.length-1; j >= 0; j--) {
                this.Draw.remove(this.Draw.children[j]);
            }
        }
        if(this.Draw != null){ scene.remove(this.Draw);}

        if(this.MomentX[0].toFixed(3) != 0)
        {
            this.Draw.add(ResultMomentArrow(this.MomentX[0], this.Position, 3));
        }
        if(this.MomentY[0].toFixed(3) != 0)
        {
            this.Draw.add(ResultMomentArrow(this.MomentY[0], this.Position, 1));
        }
        if(this.Tortion[0].toFixed(3) != 0)
        {
            this.Draw.add(ResultMomentArrow(this.Tortion[0], this.Position, 2));
        }
        JointReactions.pattern = pattern;
        this.InView()
    }

    Hide()
    {
        if(this.Draw != null)
        {
            scene.remove(this.Draw);
        }
    }

    Show()
    {
        Standard();
        if(this.Draw != null)
        {
            scene.add(this.Draw);
        }
    }

    InView()
    {
        if(this.PatternID == JointReactions.pattern && JointReactions.ReactMode)
        {
            this.Show();
        }
        else{
            this.Hide();
        }
        
        if(view == "XY")
        {
            if(this.Position[2] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "XZ")
        {
            if(this.Position[1] != ViewPosition)
            {
                this.Hide();
            }
        }
        else if(view == "YZ")
        {
            if(this.Position[0] != ViewPosition)
            {
                this.Hide();
            }
        }
    }
}



function ResultForceArrow(value, Position, direction)
{
    let position = new THREE.Vector3(...Position);
    const material = new THREE.LineBasicMaterial({transparent:false});
    material.color = {r:0,g:0,b:0,a:1}

    let l = 1.1;
    let geometry = new THREE.BufferGeometry();
    let vertices =[];  
    
        
    if(direction == 2)  // Global z- direction
    {
        if(value > 0){
            l = -1*l;
            position.z -= 0.65;
        }
        else if(value < 0){
            position.z -= 1.65;
        }
        vertices.push(0, 0, 0);
        vertices.push(0, 0.12*l, 0.25*l);  
        vertices.push(0, 0, 0.08*l);     
        vertices.push(0, -0.12*l, 0.25*l );      
        vertices.push(0, 0, 0);
        vertices.push(0, 0, l);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    }
    else if(direction == 3)  // Global y- direction
    {
        if(value > 0){
            l = -1*l;
            position.y -= 0.3
        }
        else{
            position.y += 0.3
        }
        vertices.push(0, 0, 0);
        vertices.push(0.12*l, 0.25*l, 0);     
        vertices.push(0, 0.08*l, 0);  
        vertices.push(-0.12*l, 0.25*l, 0 );
        vertices.push(0, 0, 0);
        vertices.push(0, l, 0);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    else if(direction ==1)   // Global x- direction
    {
        if(value > 0){
            l = -1*l;
            position.x -= 0.3
        }
        else{
            position.x += 0.3
        }
        vertices.push(0, 0, 0);
        vertices.push(0.25*l, 0.12*l, 0);
        vertices.push(0.08*l, 0, 0);
        vertices.push(0.25*l, -0.12*l, 0 );
        vertices.push(0, 0, 0);
        vertices.push(l, 0, 0);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    
    let arrow = new THREE.Line( geometry, material );

    if(direction == 2 && value < 0)
    {
        const txt = makeResultsTextSprite( projUnits.ForceConvert(value, true).toFixed(2), vertices[0], vertices[1], vertices[2]-0.2,{fontsize: 140, fontface: "Georgia", textColor:{r:0,g:60,b:0,a:1},
        vAlign:"center", hAlign:"center"});
        arrow.add(txt);
    }
    else{
        const txt = makeResultsTextSprite( projUnits.ForceConvert(value, true).toFixed(2), vertices[15], vertices[16], vertices[17],{fontsize: 140, fontface: "Georgia", textColor:{r:0,g:60,b:0,a:1},
        vAlign:"center", hAlign:"center"});
        arrow.add(txt);
    }

    arrow.position.x = position.x;
    arrow.position.y = position.y;
    arrow.position.z = position.z;
    
    return arrow;
}

function ResultMomentArrow(value, Position, direction)
{
    let position = new THREE.Vector3(...Position);
    const material = new THREE.LineBasicMaterial({transparent:false});
    material.color = {r:0,g:0,b:0,a:1}

    let l = 1.1;
    let geometry = new THREE.BufferGeometry();
    let vertices =[];  
    
        
    if(direction == 2)  // Global z- direction
    {
        if(value > 0){
            l = -1*l;
            position.z -= 0.65;
        }
        else if(value < 0){
            position.z -= 1.65;
        }
        vertices.push(0, 0, 0);
        vertices.push(0, 0.12*l, 0.25*l);  
        vertices.push(0, 0, 0.08*l);     
        vertices.push(0, -0.12*l, 0.25*l );      
        vertices.push(0, 0, 0);
        vertices.push(0, 0, 0.3*l);
        vertices.push(0, 0.12*l, 0.55*l ); 
        vertices.push(0, 0, 0.3*l);
        vertices.push(0, -0.12*l, 0.55*l ); 
        vertices.push(0, 0, 0.3*l);
        vertices.push(0, 0, l);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    }
    else if(direction == 3)  // Global y- direction
    {
        if(value > 0){
            l = -1*l;
            position.y -= 0.3
        }
        else{
            position.y += 0.3
        }
        vertices.push(0, 0, 0);
        vertices.push(0.12*l, 0.25*l, 0);     
        vertices.push(0, 0.08*l, 0);  
        vertices.push(-0.12*l, 0.25*l, 0 );
        vertices.push(0, 0, 0);
        vertices.push(0, 0.3*l, 0);
        vertices.push(0.12*l, 0.55*l, 0); 
        vertices.push(0, 0.3*l, 0);
        vertices.push(-0.12*l, 0.55*l,0 ); 
        vertices.push(0, 0.3*l,0);
        vertices.push(0, l, 0);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    else if(direction ==1)   // Global x- direction
    {
        if(value > 0){
            l = -1*l;
            position.x -= 0.3
        }
        else{
            position.x += 0.3
        }
        vertices.push(0, 0, 0);
        vertices.push(0.25*l, 0.12*l, 0);
        vertices.push(0.08*l, 0, 0);
        vertices.push(0.25*l, -0.12*l, 0 );
        vertices.push(0, 0, 0);
        vertices.push(0.3*l, 0, 0);
        vertices.push(0.55*l, 0.12*l, 0); 
        vertices.push(0.3*l, 0, 0);
        vertices.push(0.55*l, -0.12*l, 0 ); 
        vertices.push(0.3*l, 0, 0);
        vertices.push(l, 0, 0);
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    }
    
    let arrow = new THREE.Line( geometry, material );

    if(direction == 2 && value < 0)
    {
        const txt = makeResultsTextSprite( projUnits.MomentConvert(value).toFixed(2), vertices[0], vertices[1], vertices[2]-0.2,{fontsize: 140, fontface: "Georgia", textColor:{r:0,g:60,b:0,a:1},
        vAlign:"center", hAlign:"center"});
        arrow.add(txt);
    }
    else{
        const txt = makeResultsTextSprite( projUnits.MomentConvert(value).toFixed(2), vertices[30], vertices[31], vertices[32],{fontsize: 140, fontface: "Georgia", textColor:{r:0,g:60,b:0,a:1},
        vAlign:"center", hAlign:"center"});
        arrow.add(txt);
    }

    arrow.position.x = position.x;
    arrow.position.y = position.y;
    arrow.position.z = position.z;
    
    return arrow;
}

