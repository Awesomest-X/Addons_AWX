import {
  world
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('we:firefly_bottle', {
    onUse(e) {
      const player = e.source;

      player.runCommandAsync('function firefly');
    }
  });
});