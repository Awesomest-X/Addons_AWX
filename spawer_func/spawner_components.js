import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

let interactionState = {
  echoShardUsed: false,
  netherStarUsed: false,
};

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent('custom:interaction_handler', {
    onPlayerInteract(e) {
      const block = e.block;
      const player = e.player;

      if (block.hasTag('trial_spawner')) {
        const heldItem = player.getComponent("minecraft:inventory").container.getSlot(0)?.id;

        if (system.activeTrial) {
          system.sendActionBarMessage(player, "A trial is already active. Complete it before starting a new one.");
          return;
        }

        switch (heldItem) {
          case "minecraft:prismarine_shard":
            system.startTrial(block, player, "minecraft:guardian", "Water", "custom:water_reward", "minecraft:trident", [
              { id: "minecraft:channeling", level: 1 }
            ]);
            system.removeItemFromPlayer(player, "minecraft:prismarine_shard");
            break;
          case "minecraft:blaze_rod":
            system.startTrial(block, player, "minecraft:blaze", "Fire", "custom:fire_reward", "minecraft:blaze_rod", [
              { id: "minecraft:fire_aspect", level: 2 }
            ]);
            system.removeItemFromPlayer(player, "minecraft:blaze_rod");
            break;
          case "minecraft:breeze_rod":
    this.startTrial(block, player, "minecraft:skeleton", "Air", "awx:book_of_air", "minecraft:bow", [
                { id: "minecraft:power", level: 3 }
            ]);
            break;
          case "minecraft:pointed_dripstone":
this.startTrial(block, player, "minecraft:blaze", "Earth", "awx:book_of_earth", "minecraft:diamond_pickaxe", [
                { id: "minecraft:efficiency", level: 4 }
            ]);
            this.removeItemFromPlayer(player, "minecraft:pointed_dripstone");
            break;
          case "minecraft:echo_shard":
            if (!interactionState.echoShardUsed) {
              interactionState.echoShardUsed = true;
              system.sendActionBarMessage(player, "Echo Shard used. Now hold a Nether Star to progress.");
            }
            break;
          case "minecraft:nether_star":
            if (interactionState.echoShardUsed && !interactionState.netherStarUsed) {
              interactionState.netherStarUsed = true;
              system.sendActionBarMessage(player, "Nether Star used. Now hold a Dragon's Head to summon a special mob.");
            }
            break;
          case "minecraft:dragon_head":
            if (interactionState.netherStarUsed) {
              system.spawnSpecialMob(block, player);
              system.sendActionBarMessage(player, "Dragon's Head used! A special mob has been summoned.");
            }
            break;
          default:
            system.sendActionBarMessage(player, "You must insert an elemental item.");
            break;
        }
      }
    }
  });
});

// Trial and Reward System
system.startTrial = function(block, player, mobType, element, rewardItem, elementalWeaponReward, elementalWeaponEnchantments) {
  const position = block.location;
  this.activeTrial = { player, block, rewardItem, elementalWeaponReward, elementalWeaponEnchantments, mobsRemaining: 4 };

  const mobEntities = this.spawnMobGroup(position, mobType);
  mobEntities.forEach(mob => mob.addTag("trial_mob"));

  system.sendActionBarMessage(player, `The ${element} trial has started. Defeat the enemies to earn your rewards.`);
};

system.spawnMobGroup = function(position, mobType) {
  const offsets = [
    { x: 4, y: 0, z: 0 },
    { x: -4, y: 0, z: 0 },
    { x: 0, y: 0, z: 4 },
    { x: 0, y: 0, z: -4 }
  ];

  const spawnedMobs = [];
  for (const offset of offsets) {
    const mob = world.getDimension("overworld").spawnEntity(mobType, {
      x: position.x + offset.x,
      y: position.y + offset.y,
      z: position.z + offset.z
    });
    spawnedMobs.push(mob);
  }
  return spawnedMobs;
};

system.onMobDefeated = function(mob) {
  if (!mob.hasTag("trial_mob")) return;

  const trial = this.activeTrial;
  if (!trial) return;

  trial.mobsRemaining--;
  if (trial.mobsRemaining <= 0) {
    this.endTrial(trial.block);
  }
};

system.endTrial = function(block) {
  const trial = this.activeTrial;
  if (!trial) return;

  const { rewardItem, elementalWeaponReward, elementalWeaponEnchantments } = trial;

  this.spawnRewardOnTopOfBlock(block, rewardItem);
  this.spawnRewardOnTopOfBlock(block, elementalWeaponReward);

  const enchantedWeapon = this.spawnEnchantedWeapon(elementalWeaponReward, elementalWeaponEnchantments);
  this.spawnRewardOnTopOfBlock(block, enchantedWeapon);

  system.sendActionBarMessage(trial.player, "You have completed the trial! Rewards have been spawned.");
  this.activeTrial = null;
};

system.spawnRewardOnTopOfBlock = function(block, itemId) {
  const position = block.location;
  const spawnLocation = { x: position.x, y: position.y + 1, z: position.z };
  world.getDimension("overworld").spawnEntity(itemId, spawnLocation);
};

system.spawnSpecialMob = function(block, player) {
  const spawnPosition = {
    x: block.location.x + 5,
    y: block.location.y,
    z: block.location.z
  };

  const mob = world.getDimension("overworld").spawnEntity("minecraft:evoker", spawnPosition);
  mob.addTag("special_boss");
  this.sendActionBarMessage(player, "A powerful boss has been summoned!");
};

system.removeItemFromPlayer = function(player, itemId) {
  const inventory = player.getComponent("minecraft:inventory").container;

  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getSlot(i);
    if (slot && slot.id === itemId) {
      slot.count--;
      if (slot.count <= 0) inventory.setSlot(i, null);
      break;
    }
  }
};

system.sendActionBarMessage = function(player, message) {
  player.runCommandAsync(`title @s actionbar ${message}`);
};

// Mob defeat listener
world.afterEvents.entityDie.subscribe(event => {
  const mob = event.deadEntity;
  system.onMobDefeated(mob);
});
