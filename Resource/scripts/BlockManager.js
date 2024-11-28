import { world, system, Dimension, EquipmentSlot } from "@minecraft/server";
                world.beforeEvents.worldInitialize.subscribe(eventData => {
eventData.blockComponentRegistry.registerCustomComponent('cc_Creaking Heart Active:trigger', {
onPlayerInteract: e => {
e.player.runCommand("function example_function");
},

});
eventData.blockComponentRegistry.registerCustomComponent('cc_boom_shroom_mushroom:trigger', {
onPlayerDestroy: e => {
const players = e.dimension.getPlayers();
if (players.length > 0) {
 const player = players[0];
 player.runCommand("function mushroombanditloot2");
}
},

});
                });
