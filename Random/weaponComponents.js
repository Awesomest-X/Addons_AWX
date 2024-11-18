import {
  world,
  system,
  EntityDamageCause,
  ItemStack
}
from "@minecraft/server";
world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('dungeons:large_sweep', {
      onHitEntity(e) {
        //Assigns data from the component type to our script
        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        //Stops script continuing if the attack did nothing
        if (!e.hadEffect) return;

        //If has cooldown, runs code to remove it
        let sweepCD = world.scoreboard.getObjective('sweepCD').getScore(attacker)

        if (sweepCD > 0) {
          if (sweepCD < 20) world.scoreboard.getObjective('sweepCD').setScore(attacker, 20)
          return;
        }

        world.scoreboard.getObjective('sweepCD').addScore(attacker, 20)

        target.runCommandAsync('function weapon/sweep_battlestaff_fx') //Particle and Sound

        //Grabs all mobs in a radius, and runs code in the forEach
        target.dimension.getEntities({
          location: target.location,
          maxDistance: 2.5,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          if (entity === target || entity === attacker) return; //Stops target and attacker being hit by sweep
          if (entity === undefined || !entity.isValid()) return; //prevents an error being thrown for trying to run effects on a dead mob
          //Sweep effects
          entity.applyKnockback(target.location.x, target.location.z, 0.5, 0.25);
          entity.applyDamage(5, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:bone_club_sounds', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;

        if (!e.hadEffect) return;

        attacker.runCommandAsync('function weapon/bone_club_fx')

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:strong_knockback', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target || !target.isValid()) return;

        const xDif = target.location.x - attacker.location.x;
        const zDif = target.location.z - attacker.location.z;

        target.applyKnockback(xDif, zDif, 1, 0.23);

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:swirling_quick', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target) return;

        attacker.runCommandAsync('function weapon/swirling')

        attacker.dimension.getEntities({
          location: attacker.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif = entity.location.x - attacker.location.x;
          const zDif = entity.location.z - attacker.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif, zDif, 0.25, 0.25);
          entity.applyDamage(3, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });
        })
      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:swirling_standard', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target) return;

        let swirlCD = world.scoreboard.getObjective('swirlCD').getScore(attacker)

        if (swirlCD > 0) {
          if (swirlCD < 20) world.scoreboard.getObjective('swirlCD').setScore(attacker, 20)
          return;
        }
        world.scoreboard.getObjective('swirlCD').addScore(attacker, 20)

        attacker.runCommandAsync('function weapon/swirling')

        attacker.dimension.getEntities({
          location: attacker.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif = entity.location.x - attacker.location.x;
          const zDif = entity.location.z - attacker.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif, zDif, 0.25, 0.25);
          entity.applyDamage(3, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });
        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:shockwave', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target) return;

        let shockwaveCD = world.scoreboard.getObjective('shockwaveCD').getScore(attacker)

        if (shockwaveCD > 0) {
          if (shockwaveCD < 20) world.scoreboard.getObjective('shockwaveCD').setScore(attacker, 20)
          return;
        }

        world.scoreboard.getObjective('shockwaveCD').addScore(attacker, 20)

        const shockwave = Math.floor(Math.random() * 2);
        if (attacker.hasTag('dungeons:debug')) attacker.sendMessage(`${shockwave}`)
        if (shockwave == 1) return;

        target.runCommandAsync('function weapon/shockwave_fx')

        const xDif = target.location.x - attacker.location.x;
        const zDif = target.location.z - attacker.location.z;

        target.applyKnockback(xDif, zDif, 0.3, 0.6);

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif2 = entity.location.x - target.location.x;
          const zDif2 = entity.location.z - target.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif2, zDif2, 0.3, 0.5);
          entity.applyDamage(1, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });
        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:great_hammer_shockwave', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;
        const item = e.itemStack;

        if (!e.hadEffect) return;

        let hammerCD = world.scoreboard.getObjective('hammerCD').getScore(attacker)
        let CT = world.scoreboard.getObjective('cooldownTime').getScore(attacker)
        let CMAX = world.scoreboard.getObjective('cooldownMax').getScore(attacker)

        if (hammerCD > 0) {
          if (hammerCD < 20) world.scoreboard.getObjective('hammerCD').setScore(attacker, 20)
          world.scoreboard.getObjective('cooldownTime').setScore(attacker, 20)
          world.scoreboard.getObjective('cooldownMax').setScore(attacker, 20)
          return;
        }

        world.scoreboard.getObjective('hammerCD').addScore(attacker, 20)
        world.scoreboard.getObjective('cooldownTime').addScore(attacker, 20)
        world.scoreboard.getObjective('cooldownMax').setScore(attacker, 20)

        target.runCommandAsync('function weapon/great_hammer_fx')

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif = entity.location.x - target.location.x;
          const zDif = entity.location.z - target.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif, zDif, 0.77, 0.25);
          entity.applyDamage(4, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:stormlander_shockwave', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;
        const item = e.itemStack;

        if (!e.hadEffect) return;

        let hammerCD = world.scoreboard.getObjective('hammerCD').getScore(attacker)
        let CT = world.scoreboard.getObjective('cooldownTime').getScore(attacker)
        let CMAX = world.scoreboard.getObjective('cooldownMax').getScore(attacker)

        if (hammerCD > 0) {
          if (hammerCD < 20) world.scoreboard.getObjective('hammerCD').setScore(attacker, 20)
          world.scoreboard.getObjective('cooldownTime').setScore(attacker, 20)
          world.scoreboard.getObjective('cooldownMax').setScore(attacker, 20)
          return;
        }

        world.scoreboard.getObjective('hammerCD').addScore(attacker, 20)
        world.scoreboard.getObjective('cooldownTime').addScore(attacker, 20)
        world.scoreboard.getObjective('cooldownMax').setScore(attacker, 20)

        target.runCommandAsync('function weapon/stormlander_fx')

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif = entity.location.x - target.location.x;
          const zDif = entity.location.z - target.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif, zDif, 0.77, 0.25);
          entity.applyDamage(4, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

        const thundering = Math.floor(Math.random() * 3);
        if (attacker.hasTag('dungeons:debug')) attacker.sendMessage(`${thundering}`)
        if (thundering == 1) {

          target.runCommandAsync('function weapon/thundering_fx')

          target.dimension.getEntities({
            location: target.location,
            maxDistance: 5,
            closest: 3,
            excludeFamilies: ['ignore']
          }).forEach(entity => {

            if (entity === target || entity === attacker) return;
            if (entity === undefined || !entity.isValid()) return;

            entity.applyDamage(6, {
              cause: EntityDamageCause.lightning,
              damagingEntity: attacker
            });

          });

        }

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:gravity_hammer_shockwave', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;
        const item = e.itemStack;

        if (!e.hadEffect) return;

        let hammerCD = world.scoreboard.getObjective('hammerCD').getScore(attacker)
        let CT = world.scoreboard.getObjective('cooldownTime').getScore(attacker)
        let CMAX = world.scoreboard.getObjective('cooldownMax').getScore(attacker)

        if (hammerCD > 0) {
          if (hammerCD < 20) world.scoreboard.getObjective('hammerCD').setScore(attacker, 20)
          world.scoreboard.getObjective('cooldownTime').setScore(attacker, 20)
          world.scoreboard.getObjective('cooldownMax').setScore(attacker, 20)
          return;
        }

        world.scoreboard.getObjective('hammerCD').addScore(attacker, 20)
        world.scoreboard.getObjective('cooldownTime').addScore(attacker, 20)
        world.scoreboard.getObjective('cooldownMax').setScore(attacker, 20)

        target.runCommandAsync('function weapon/gravity_hammer_fx')

        target.applyKnockback(0, 0, 0, 0.3);

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyDamage(4, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 4,
          excludeFamilies: ['ignore', 'gravity_immune']
        }).forEach(entity => {

          const xDif = entity.location.x - target.location.x;
          const zDif = entity.location.z - target.location.z;

          var xDif2 = 0;
          var zDif2 = 0;

          if (xDif < 0) {
            xDif2 = xDif * -1
          }
          if (xDif >= 0) {
            xDif2 = xDif
          }
          if (zDif < 0) {
            zDif2 = zDif * -1
          }
          if (zDif >= 0) {
            zDif2 = zDif
          }

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(-xDif, -zDif, (xDif2 + zDif2) / 2.1, 0.3);

        });

      }
    }),

    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:short_cooldown', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;

        if (!e.hadEffect) return;

        let CT = world.scoreboard.getObjective('cooldownTime').getScore(attacker)
        let CMAX = world.scoreboard.getObjective('cooldownMax').getScore(attacker)

        if (CT > 0) {
          if (CT < 8) world.scoreboard.getObjective('cooldownTime').setScore(attacker, 8)
          world.scoreboard.getObjective('cooldownMax').setScore(attacker, 8)

        }

        world.scoreboard.getObjective('cooldownTime').addScore(attacker, 8)
        world.scoreboard.getObjective('cooldownMax').setScore(attacker, 8)

        attacker.addEffect("weakness", 8, {
          amplifier: 2,
          showParticles: false
        });
        attacker.addEffect("mining_fatigue", 8, {
          amplifier: 0,
          showParticles: false
        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:soul_siphon', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (attacker.typeId !== 'minecraft:player') return;
          const souls = world.scoreboard.getObjective('soulGauge').getScore(attacker)
        if(souls >= 100) return;

        const soul = Math.floor(Math.random() * 5);
        if (attacker.hasTag('dungeons:debug')) attacker.sendMessage(`roll : ${soul}`)
        if (soul > 0) return;

        if (target.matches({
            families: ['monster']
          })) {

          target.runCommandAsync('function weapon/soul_siphon_fx_target')
          attacker.runCommandAsync('function weapon/soul_siphon_fx_player')



          world.scoreboard.getObjective('soulGauge').addScore(attacker, 1)

if(souls < 99 && attacker.hasTag('dungeons:verdant_armour')) world.scoreboard.getObjective('soulGauge').addScore(attacker, 1)

        }
      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:obsidian_claymore', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;

        let obsidianCD = world.scoreboard.getObjective('obsidianCD').getScore(attacker)
        let CT = world.scoreboard.getObjective('cooldownTime').getScore(attacker)
        let CMAX = world.scoreboard.getObjective('cooldownMax').getScore(attacker)

        if (obsidianCD > 0) {
          if (obsidianCD < 40) world.scoreboard.getObjective('obsidianCD').setScore(attacker, 40)
          world.scoreboard.getObjective('cooldownTime').setScore(attacker, 40)
          world.scoreboard.getObjective('cooldownMax').setScore(attacker, 40)
          return;
        }

        world.scoreboard.getObjective('obsidianCD').addScore(attacker, 40)
        world.scoreboard.getObjective('cooldownTime').addScore(attacker, 40)
        world.scoreboard.getObjective('cooldownMax').setScore(attacker, 40)

        target.runCommandAsync('function weapon/obsidian_claymore_fx')

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 4,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif = entity.location.x - target.location.x;
          const zDif = entity.location.z - target.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif, zDif, 1.2, 0.5);
          entity.applyDamage(4, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:starless_night', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;

        let obsidianCD = world.scoreboard.getObjective('obsidianCD').getScore(attacker)
        let CT = world.scoreboard.getObjective('cooldownTime').getScore(attacker)
        let CMAX = world.scoreboard.getObjective('cooldownMax').getScore(attacker)

        if (obsidianCD > 0) {
          if (obsidianCD < 40) world.scoreboard.getObjective('obsidianCD').setScore(attacker, 40)
          world.scoreboard.getObjective('cooldownTime').setScore(attacker, 40)
          world.scoreboard.getObjective('cooldownMax').setScore(attacker, 40)
          return;
        }

        world.scoreboard.getObjective('obsidianCD').addScore(attacker, 40)
        world.scoreboard.getObjective('cooldownTime').addScore(attacker, 40)
        world.scoreboard.getObjective('cooldownMax').setScore(attacker, 40)

        target.runCommandAsync('function weapon/starless_night_fx')

        const areaDamage = target.dimension.getEntities({
          location: target.location,
          maxDistance: 4,
          excludeFamilies: ['ignore']
        });

        areaDamage.forEach(entity => {

          const xDif = entity.location.x - target.location.x;
          const zDif = entity.location.z - target.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          const knockbackModifier = areaDamage.length * 0.2;
          const damageModifier = areaDamage.length * 2.5;

          entity.applyKnockback(xDif, zDif, 1.2 + knockbackModifier, 0.5 + knockbackModifier);
          entity.applyDamage(4 + damageModifier, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:sweep_attack', {
      onHitEntity(e) {
        const attacker = e.attackingEntity;
        const target = e.hitEntity;
        const item = e.itemStack;

        if (!e.hadEffect) return;

        let sweepCD = world.scoreboard.getObjective('sweepCD').getScore(attacker)

        if (sweepCD > 0) {
          if (sweepCD < 15) world.scoreboard.getObjective('sweepCD').setScore(attacker, 15)
          return;
        }

        world.scoreboard.getObjective('sweepCD').addScore(attacker, 15)

        if (item.typeId === 'dungeons:rapier') target.runCommandAsync('function weapon/sweep_rapier_fx')
        if (item.typeId === 'dungeons:freezing_foil') target.runCommandAsync('function weapon/sweep_freeze_fx')
        if (item.typeId === 'dungeons:bee_stinger') target.runCommandAsync('function weapon/sweep_bee_fx')

        target.dimension.getEntities({
          location: target.location,
          maxDistance: 1.25,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(target.location.x, target.location.z, 0.5, 0.25);
          entity.applyDamage(3, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

        });

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:freezing', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target) return;

        target.addEffect("slowness", 66, {
          amplifier: 2,
          showParticles: true
        });

        target.runCommandAsync('function weapon/freezing_fx')

      }
    }),
    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:busy_bee', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target) return;

        const bee = Math.floor(Math.random() * 10);
        if (attacker.hasTag('dungeons:debug')) attacker.sendMessage(`roll : ${bee}`)
        if (bee > 0) return;

        const pet = target.dimension.spawnEntity('dungeons:pet_bee', target.location);

        let beeTameable = pet.getComponent('minecraft:tameable')
        beeTameable.tame(attacker);

      }
    }),

    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:chains', {
      onHitEntity(e) {

        const target = e.hitEntity;

        if (!e.hadEffect) return;

        target.runCommandAsync('function weapon/chaining')

      }
    }),

    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:less_knockback', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;

        target.runCommandAsync('function weapon/scythe_fx')
        target.applyKnockback(attacker.location.x, attacker.location.z, 0.1, 0.1);

      }
    }),

    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:dagger_multihit', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;
        const weapon = e.itemStack;

        if (!e.hadEffect || !target) return;

        var damage = 1;

        if (weapon.typeId === 'dungeons:daggers') {
          damage = damage + 4;
        } else if (weapon.typeId === 'dungeons:moon_daggers' || weapon.typeId === 'dungeons:sheer_daggers' || weapon.typeId === 'dungeons:frost_knives') {
          damage = damage + 6;
        } else {
          return;
        }

        const enchantable = weapon.getComponent('minecraft:enchantable');

        for (const enchantment of enchantable.getEnchantments()) {

          if (enchantment.type.id === 'sharpness') {
            damage = damage + Math.floor(enchantment.level * 1.25);
          }

          if (enchantment.type.id === 'smite') {
            if (target.matches({
                families: ['undead']
              })) {
              damage = damage + Math.floor(enchantment.level * 2.5);
            }
          }
          if (enchantment.type.id === 'bane_of_arthropods') {
            if (target.matches({
                families: ['arthropod']
              })) {
              damage = damage + Math.floor(enchantment.level * 2.5);
            }
          }

        }

        if(attacker.getEffect('strength')) {
          const strength = attacker.getEffect('strength').amplifier;

          damage = damage * Math.pow(1.3, strength) + ((Math.pow(1.3, strength)-1)/0.3);
        }
        if(attacker.getEffect('weakness')) {
          const weakness = attacker.getEffect('weakness').amplifier;

          damage = damage * Math.pow(0.8, weakness) + ((Math.pow(0.8, weakness)-1)/0.4);
        }

        if(damage < 0) damage = 0;
          attacker.dimension.playSound('weapon.daggers.hit', attacker.location, {volume: 0.6});

        attacker.playAnimation('animation.player.attack_daggers');
        system.runTimeout(() => {

         target.dimension.spawnParticle('dungeons:daggers_strike', target.location);
          attacker.dimension.playSound('weapon.daggers.hit', attacker.location, {volume: 0.3});

          target.applyDamage(damage, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });

          if(weapon.typeId === 'dungeons:sheer_daggers') {
attacker.runCommandAsync('function weapon/swirling')

        attacker.dimension.getEntities({
          location: attacker.location,
          maxDistance: 2,
          excludeFamilies: ['ignore']
        }).forEach(entity => {

          const xDif = entity.location.x - attacker.location.x;
          const zDif = entity.location.z - attacker.location.z;

          if (entity === target || entity === attacker) return;
          if (entity === undefined || !entity.isValid()) return;

          entity.applyKnockback(xDif, zDif, 0.25, 0.25);
          entity.applyDamage(3, {
            cause: EntityDamageCause.entityAttack,
            damagingEntity: attacker
          });
        })
}

        }, 11);

      }
    }),

    initEvent.itemComponentRegistry.registerCustomComponent('dungeons:weakening', {
      onHitEntity(e) {

        const attacker = e.attackingEntity;
        const target = e.hitEntity;

        if (!e.hadEffect) return;
        if (!target || !target.isValid()) return;
        if(target.getEffect('weakness')) return;

        target.addEffect('weakness', 100);
        target.dimension.spawnParticle('dungeons:cauldron_summon', {x: target.location.x, y: target.location.y+1, z: target.location.z});
        target.dimension.getEntities({
          location: target.location,
          maxDistance: 4,
          families: ['monster']
        }).forEach(entity => {

          if(entity !== attacker) {
            entity.addEffect('weakness', 75);
          }
        });
      }
    })
});