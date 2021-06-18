document.querySelector('#undeformed-btn').addEventListener("click", function(){
     
    if (DeformedShape.deformationMode) {
        DeformedShape.deformationMode = false;
        DeformedShape.DeformShapesList.forEach( defShape=> {
            defShape.Hide();
        });      
    }

    if(Results.ResultsMode){
        Results.ResultsMode = false;
        for(let i = 0; i<Results.ResultsList.length; i++)
        {
            Results.ResultsList[i].Hide();
        }
    }

    // if in reaction mode
    if (JointReactions.ReactMode) {
        JointReactions.ReactMode = false;
        for(let i = 0; i< JointReactions.ReactionsList.length; i++)
        {
            JointReactions.ReactionsList[i].Hide();
        }
    }

    if(DrawLine.LoadsDisplayed){
        
        DrawLine.LoadsDisplayed = false;
        DrawLine.HideLoads();
    }
    DrawLine.DrawLinesArray.forEach(drawline => drawline.InView());
});