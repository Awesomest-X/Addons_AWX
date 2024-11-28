import { world, system } from "@minecraft/server";
                world.beforeEvents.worldInitialize.subscribe(eventData => {
eventData.itemComponentRegistry.registerCustomComponent('cc_cassette:trigger', {
onUse: e => {
e.source.runCommand("function example_function");
},

});
                });
