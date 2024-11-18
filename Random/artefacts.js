import {
  world,
  system,
  ItemStack,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('dungeons:use_artefact', {
    onUse(e) {
      const player = e.source;
      const item = e.itemStack;
      if (player.hasTag('dungeons:debug')) {
        player.sendMessage(`You have used a ${item.typeId}`);
      }

      item.getComponent('cooldown').startCooldown(player);

      switch (item.typeId) {


        case 'dungeons:blast_fungus':
          player.runCommandAsync('function artifact/blast_fungus')
          break;
        case 'dungeons:rare_blast_fungus':
          player.runCommandAsync('function artifact/blast_fungus')
          break;
        case 'dungeons:corrupted_seeds':
          player.runCommandAsync('function artifact/corrupted_seeds')
          break;
        case 'dungeons:rare_corrupted_seeds':
          player.runCommandAsync('function artifact/corrupted_seeds')
          break;
        case 'dungeons:death_cap_mushroom':
          player.runCommandAsync('function artifact/death_cap_weak')
          break;
        case 'dungeons:rare_death_cap_mushroom':
          player.runCommandAsync('function artifact/death_cap_strong')
          break;
        case 'dungeons:gong_of_weakening':
          player.runCommandAsync('function artifact/gong_common')
          break;
        case 'dungeons:rare_gong_of_weakening':
          player.runCommandAsync('function artifact/gong_rare')
          break;
        case 'dungeons:harvester':
          player.runCommandAsync('function artifact/harvester')
          break;
        case 'dungeons:rare_harvester':
          player.runCommandAsync('function artifact/harvester_rare')
          break;
        case 'dungeons:iron_hide_amulet':
          player.runCommandAsync('function artifact/iron_common')
          break;
        case 'dungeons:rare_iron_hide_amulet':
          player.runCommandAsync('function artifact/iron_rare')
          break;
        case 'dungeons:satchel_of_elements':
          player.runCommandAsync('function artifact/satchel_elements')
          break;
        case 'dungeons:rare_satchel_of_elements':
          player.runCommandAsync('function artifact/satchel_elements')
          break;
        case 'dungeons:shadow_shifter':
          player.runCommandAsync('function artifact/shadow_shifter_common')
          break;
        case 'dungeons:rare_shadow_shifter':
          player.runCommandAsync('function artifact/shadow_shifter_rare')
          break;
        case 'dungeons:shock_powder':
          player.runCommandAsync('function artifact/shock_powder')
          break;
        case 'dungeons:rare_shock_powder':
          player.runCommandAsync('function artifact/shock_powder_rare')
          break;
        case 'dungeons:soul_healer':
          player.runCommandAsync('function artifact/soul_healer_common')
          break;
        case 'dungeons:rare_soul_healer':
          player.runCommandAsync('function artifact/soul_healer_rare')
          break;
        case 'dungeons:totem_of_regeneration':
          player.runCommandAsync('function artifact/totem_of_regen')
          break;
        case 'dungeons:rare_totem_of_regeneration':
          player.runCommandAsync('function artifact/totem_of_regen')
          break;
        case 'dungeons:totem_of_shielding':
          player.runCommandAsync('function artifact/totem_of_shield')
          break;
        case 'dungeons:rare_totem_of_shielding':
          player.runCommandAsync('function artifact/totem_of_shield')
          break;
        case 'dungeons:wind_horn':
          player.runCommandAsync('function artifact/wind_horn_common')
          break;
        case 'dungeons:rare_wind_horn':
          player.runCommandAsync('function artifact/wind_horn_rare')
          break;

        case 'dungeons:enchanted_grass':
          player.runCommandAsync('function artifact/enchanted_grass')
          const sheep = player.dimension.spawnEntity('dungeons:enchanted_sheep', player.location);

          let sheepTameable = sheep.getComponent('minecraft:tameable')
          sheepTameable.tame(player);

          break;
        case 'dungeons:rare_enchanted_grass':
          player.runCommandAsync('function artifact/enchanted_grass')
          const raresheep = player.dimension.spawnEntity('dungeons:enchanted_sheep', player.location);

          let rareSheepTameable = raresheep.getComponent('minecraft:tameable')
          rareSheepTameable.tame(player);

          break;
        case 'dungeons:vexing_chant':
          player.runCommandAsync('function artifact/vexing_chant')
          const vex0 = player.dimension.spawnEntity('dungeons:guardian_vex', player.location);
          const vex1 = player.dimension.spawnEntity('dungeons:guardian_vex', player.location);
          const vex2 = player.dimension.spawnEntity('dungeons:guardian_vex', player.location);

          let vexTameable0 = vex0.getComponent('minecraft:tameable')
          vexTameable0.tame(player);
          let vexTameable1 = vex1.getComponent('minecraft:tameable')
          vexTameable1.tame(player);
          let vexTameable2 = vex2.getComponent('minecraft:tameable')
          vexTameable2.tame(player);

          break;
        case 'dungeons:rare_vexing_chant':
          player.runCommandAsync('function artifact/vexing_chant')

          const rareVex0 = player.dimension.spawnEntity('dungeons:guardian_vex', player.location);
          const rareVex1 = player.dimension.spawnEntity('dungeons:guardian_vex', player.location);
          const rareVex2 = player.dimension.spawnEntity('dungeons:guardian_vex', player.location);

          let rareVexTameable0 = rareVex0.getComponent('minecraft:tameable')
          rareVexTameable0.tame(player);
          let rareVexTameable1 = rareVex1.getComponent('minecraft:tameable')
          rareVexTameable1.tame(player);
          let rareVexTameable2 = rareVex2.getComponent('minecraft:tameable')
          rareVexTameable2.tame(player);
          break;

        case 'dungeons:ice_wand':
          player.runCommandAsync('function artifact/ice_wand')

          const iceChunkRayCast = player.getBlockFromViewDirection({
            maxDistance: 24,
            includePassableBlocks: false,
            includeLiquidBlocks: true
          });
          if (!iceChunkRayCast) {
            player.runCommandAsync('summon dungeons:ice_chunk_player ^^^24')
            break;
          }
          player.dimension.spawnEntity('dungeons:ice_chunk_player', iceChunkRayCast.block.location);
          break;

        case 'dungeons:rare_ice_wand':
          player.runCommandAsync('function artifact/ice_wand')

          const rareIceChunkRayCast = player.getBlockFromViewDirection({
            maxDistance: 24,
            includePassableBlocks: false,
            includeLiquidBlocks: true
          });
          if (!rareIceChunkRayCast) {
            player.runCommandAsync('summon dungeons:ice_chunk_player ^^^24')
            break;
          }
          player.dimension.spawnEntity('dungeons:ice_chunk_player', rareIceChunkRayCast.block.location);
          break;

        case 'dungeons:lightning_rod':
          let soulGauge = world.scoreboard.getObjective('soulGauge').getScore(player)

          if(soulGauge < 8) {
            player.runCommandAsync('function artifact/lightning_rod_fail')
            break;
          } else {
            player.runCommandAsync('function artifact/lightning_rod_vfx')
          }

            const entities = player.dimension.getEntities({
              location: player.location,
              maxDistance: 16,
              closest: 1,
              minDistance: 2,
              excludeFamilies: ['ignore']
            });
          

          if (!entities) break;

          for (const entity of entities) {
        if (!entity.matches({
            families: ['monster']
          }) && !entity.matches({
            families: ['player']
          })) return;


            const loc = entity.location;
            entity.dimension.spawnParticle('dungeons:lightning_rod_circle', loc);
entity.dimension.playSound('weapon.enchant.thundering', loc, {volume: 0.25});
            system.runTimeout(() => {
entity.dimension.playSound('weapon.enchant.thundering', loc, {volume: 0.5});
            },10)
            system.runTimeout(() => {
entity.dimension.playSound('weapon.enchant.thundering', loc, {volume: 1.0, pitch:1.2});
              
entity.dimension.spawnEntity('minecraft:lightning_bolt', {x:loc.x, y:loc.y+1.33, z:loc.z});

              const damageRange = entity.dimension.getEntities({
                location: loc,
                maxDistance: 2.333,
                excludeFamilies: ['ignore']
              });

              for (const target of damageRange) {
                const damage = 21 - (Math.abs(target.location.x - loc.x) + Math.abs(target.location.y - loc.y) + Math.abs(target.location.z - loc.z));

                target.applyDamage(damage, {
                  cause: EntityDamageCause.lightning,
                  damagingEntity: player
                });

              }
            }, 20);
          }
          break;
        case 'dungeons:rare_lightning_rod':
          let soulGauge2 = world.scoreboard.getObjective('soulGauge').getScore(player)

          if(soulGauge2 < 8) {
            player.runCommandAsync('function artifact/lightning_rod_fail')
            break;
          } else {
            player.runCommandAsync('function artifact/lightning_rod_vfx')
          }

          const rare_entities = player.dimension.getEntities({
              location: player.location,
              maxDistance: 18,
              closest: 1,
              minDistance: 2,
              excludeFamilies: ['ignore']
          });

          if (!rare_entities) break;

          for (const entity of rare_entities) {
        if (!entity.matches({
            families: ['monster']
          }) && !entity.matches({
            families: ['player']
          })) return;

            const loc = entity.location;
            entity.dimension.spawnParticle('dungeons:lightning_rod_circle_large', loc);
entity.dimension.playSound('weapon.enchant.thundering', loc, {volume: 0.25});
            system.runTimeout(() => {
entity.dimension.playSound('weapon.enchant.thundering', loc, {volume: 0.5});
            },8)
            system.runTimeout(() => {
entity.dimension.playSound('weapon.enchant.thundering', loc, {volume: 1.0, pitch:1.2});
              
entity.dimension.spawnEntity('minecraft:lightning_bolt', {x:loc.x, y:loc.y+1.33, z:loc.z});

              const damageRange = entity.dimension.getEntities({
                location: loc,
                maxDistance: 2.6,
                excludeFamilies: ['ignore']
              });

              for (const target of damageRange) {
                const damage = 24 - (Math.abs(target.location.x - loc.x) + Math.abs(target.location.y - loc.y) + Math.abs(target.location.z - loc.z));

                target.applyDamage(damage, {
                  cause: EntityDamageCause.lightning,
                  damagingEntity: player
                });

              }
            }, 16);
          }
          break;

        default:
          return;
      }
    }
  });
});