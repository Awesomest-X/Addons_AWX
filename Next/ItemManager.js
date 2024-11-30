import { world, system } from "@minecraft/server";
                world.beforeEvents.worldInitialize.subscribe(eventData => {
eventData.itemComponentRegistry.registerCustomComponent('cc_weapon:trigger', {
onHitEntity: e => {
e.hitEntity.addEffect("slowness", 5, {amplifier: 30});
},

});
                });
