import {
  world,
  system,
  ItemStack
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('we:potion', {
    onConsume(e) {
      const player = e.source;
      const item = e.itemStack;
      
      switch (item.typeId) {
        case 'we:potion_of_durability':

          player.addEffect('resistance', 3600, {amplifier: 0, showParticles: true});

          break;
        case 'we:potion_of_durability_long':

          player.addEffect('resistance', 9600, {amplifier: 0, showParticles: true});

          break;
        case 'we:potion_of_durability_strong':

          player.addEffect('resistance', 1800, {amplifier: 1, showParticles: true});

          break;
        case 'we:potion_of_ocean_tide':

          player.addEffect('conduit_power', 3600, {amplifier: 0, showParticles: true});

          break;
        case 'we:potion_of_ocean_tide_long':

          player.addEffect('conduit_power', 9600, {amplifier: 0, showParticles: true});

          break;

        default:
          return;
      }
    }
  });
});