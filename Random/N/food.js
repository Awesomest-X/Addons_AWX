import {
  world,
  system,
  ItemStack
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('we:food', {
    onConsume(e) {
      const player = e.source;
      const item = e.itemStack;
      
      switch (item.typeId) {
        case 'we:raw_ostrich':

          const random = Math.floor(Math.random()*3);
          if (random == 0) {
            player.addEffect('hunger', 400, {amplifier: 1, showParticles: true});
          }

          break;
        case 'we:cooked_ostrich':

          player.addEffect('resistance', 60, {amplifier: 0, showParticles: true});

          break;
        case 'we:poison_sac':

          player.addEffect('poison', 1200, {amplifier: 3, showParticles: true});

          break;
        case 'we:prickly_pear':

          player.addEffect('regeneration', 200, {amplifier: 0, showParticles: true});

          break;
        case 'we:salted_flesh':

          player.removeEffect('hunger');

          break;

        default:
          return;
      }
    }
  });
});