import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('water_spout:water_spiral_area_sword', {

    // Function triggered on item use
    onUse(e) {
      const user = e.source; // The player using the weapon
      const item = e.item;   // The item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Get all hostile entities within a 4-block radius of the player
      const radius = 4;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        families: ["hostile"]
      });

      if (nearbyEntities.length === 0) return; // No entities found to target

      // Spin each entity around the player
      nearbyEntities.forEach(target => {
        const distance = Math.sqrt(
          Math.pow(target.location.x - user.location.x, 2) + 
          Math.pow(target.location.z - user.location.z, 2)
        );

        let angle = 0; // Starting angle for each entity

        // Run the spin effect and apply knockback at the end of a full spin
        system.runInterval(() => {
          angle += 0.05; // Increase the angle to make the target spin

          // Get the x and z offsets for the spin
          const xOffset = Math.cos(angle) * distance;
          const zOffset = Math.sin(angle) * distance;

          // Apply water bubble particles as the entity spins
          user.dimension.spawnParticle('minecraft:basic_bubble_particle', {
            x: user.location.x + xOffset,
            y: target.location.y,
            z: user.location.z + zOffset,
          });

          // Apply knockback after a full rotation (angle reaches 2π)
          if (angle >= Math.PI * 2) {
            // Apply knockback to the target in the opposite direction
            const knockbackDirectionX = (target.location.x - user.location.x) / distance;
            const knockbackDirectionZ = (target.location.z - user.location.z) / distance;

            target.applyKnockback(knockbackDirectionX, 0, knockbackDirectionZ, 6.5, 0.3);

            // Reset angle to start a new spin for each entity
            angle = 0;
          }

          // Update the target's position to make it spin around the player
          target.teleport({
            x: user.location.x + xOffset,
            y: target.location.y,
            z: user.location.z + zOffset
          });
        }, 1); // Run the spinning effect every tick
      });
    }
  });
});
