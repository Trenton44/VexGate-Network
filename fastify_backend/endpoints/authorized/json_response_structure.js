

function characterInventoriesComponent(input){
    let data = input.data.items;
    return data;
}

function characterEquipmentComponent(input){
    let data = input.data.items;
    let transform = data.map(function(current, index){
        return {
            
        }
    });

}
function characterInfoComponent(input){
    
}
module.exports = {characterInventoriesComponent, characterEquipmentComponent, characterInfoComponent};