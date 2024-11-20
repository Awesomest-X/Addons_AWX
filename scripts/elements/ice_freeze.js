import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('ice_element:ice_element_sword', {

    // Function triggered on item use
    onUse(e) {
      const user = e.source; // The player using the weapon
      const item = e.item;   // The item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Check if the item has durability and reduce it
      if (item.isDamaged) {
        item.damage(1); // Decrease the durability by 1
      }

      // Get all hostile entities within a 5-block radius of the user
      const radius = 5;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        families: ["hostile"] // Only target hostile entities
      });

      // Apply the ice effect to each hostile entity
      nearbyEntities.forEach(target => {
        const targetLocation = target.location;

        // Apply Slowness X to the target
        target.addEffect("slowness", 100, 10, true); // 5 seconds (100 ticks) at Slowness X, particles visible

        // Apply damage to the target
        const damageAmount = 4; // Moderate damage from the ice effect
        target.applyDamage(damageAmount, {
          cause: EntityDamageCause.magic, // Use "magic" to represent the icy nature
          damagingEntity: user // The user causes the damage
        });

        // Summon snowflake particles around the target
        target.dimension.runCommand(`particle minecraft:snowflake_particle ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} 0.5 1 0.5 0.1 20 force`);
      });

      // Add an icy effect on the user for visual flair
      user.dimension.runCommand(`particle minecraft:snowflake_particle ${user.location.x} ${user.location.y + 1} ${user.location.z} 1 1 1 0.1 50 force`);
    }
  });
});
