function GridSelections()
{
    let position = 0;
    for (let i = 0; i <= listz.length; i++)
    {
        const text = "Z = "+ projUnits.LengthConvert(position, true);
        position += listz[i];
        $("#XY").append(`<option value=${position} >${text}</option>`);
    }

    position = 0;
    for (let i = 0; i <= listy.length; i++)
    {
        const text = "Y = "+ projUnits.LengthConvert(position, true);
        position += listy[i];
        $("#XZ").append(`<option value=${position} >${text}</option>`);
    }

    position = 0;
    for (let i = 0; i <= listx.length; i++)
    {
        const text = "X = "+ projUnits.LengthConvert(position, true);
        position += listx[i];
        $("#YZ").append(`<option value=${position} >${text}</option>`);
    }
    
}

function removeSelectionGrids()
{
    const xy = $('#XY').children().length;
    for (let i = xy - 1; i >= 0; i--) {
        $('#XY').children()[i].remove(); 
    }
    
    const xz = $('#XZ').children().length;
    for (let i = xz - 1; i >= 0; i--) {
        $('#XZ').children()[i].remove(); 
    }
    
    const yz = $('#YZ').children().length;
    for (let i = yz - 1; i >= 0; i--) {
        $('#YZ').children()[i].remove(); 
    }
}