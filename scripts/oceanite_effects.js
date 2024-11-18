import {
  world,
  system,
  EntityDamageCause,
  ItemStack
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('awx:oceanite_armor_effects', {
    onPlayerInventoryChange(e) {
      const player = e.player;
      const inventory = player.getComponent('minecraft:inventory').container;

      // Check if the player is wearing Oceanite Armor (Helmet and Leggings)
      const helmet = inventory[5]; // Helmet slot
      const leggings = inventory[7]; // Leggings slot

      // Check if player is in water
      const isInWater = this.isPlayerInWater(player);

      if (helmet && helmet.id === "awx:oceanite_helmet" && isInWater) {
        this.applyWaterBreathing(player);
      } else {
        this.removeWaterBreathing(player);
      }

      if (leggings && leggings.id === "awx:oceanite_leggings" && isInWater) {
        this.applySwimmingSpeed(player);
      } else {
        this.removeSwimmingSpeed(player);
      }
    }
  });
});

// Check if the player is in water
system.isPlayerInWater = function(player) {
  const position = player.getComponent('minecraft:position');
  const x = Math.floor(position.x);
  const y = Math.floor(position.y);
  const z = Math.floor(position.z);

  // Check for water blocks below the player
  const block = world.getDimension(player.dimension).getBlock(x, y - 1, z);
  return block && block.id === "minecraft:water";
};

// Apply Water Breathing effect
system.applyWaterBreathing = function(player) {
  player.runCommandAsync("/effect @s minecraft:water_breathing 99999 0 true");
};

// Remove Water Breathing effect
system.removeWaterBreathing = function(player) {
  player.runCommandAsync("/effect @s minecraft:water_breathing 0 0 true");
};

// Apply Swimming Speed effect
system.applySwimmingSpeed = function(player) {
  player.runCommandAsync("/effect @s minecraft:speed 99999 1 true");
};

// Remove Swimming Speed effect
system.removeSwimmingSpeed = function(player) {
  player.runCommandAsync("/effect @s minecraft:speed 0 0 true");
};

// Listen for player inventory changes (every tick)
world.afterEvents.tick.subscribe(() => {
  world.getPlayers().forEach(player => {
    const inventory = player.getComponent('minecraft:inventory').container;

    // Trigger the custom component to check inventory and apply effects
    player.triggerEvent('awx:oceanite_armor_effects', { player: player });
  });
});
