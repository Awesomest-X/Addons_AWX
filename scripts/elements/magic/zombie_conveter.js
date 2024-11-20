import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('zombie_conversion:zombie_conversion_item', {

    // Function triggered on item use
    onUse(e) {
      const user = e.source; // The player using the item

      // Ensure the user is valid
      if (!user) return;

      // Get all pillagers within a 10-block radius
      const radius = 5;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        type: "minecraft:pillager" // Only target pillagers
      });

      // Convert each pillager into a zombie
      nearbyEntities.forEach(entity => {
        const entityLocation = entity.location;

        // Save the entity's current position
        const spawnX = entityLocation.x;
        const spawnY = entityLocation.y;
        const spawnZ = entityLocation.z;

        // Remove the pillager
        entity.kill();

        // Summon a zombie at the same location
        entity.dimension.runCommandAsync(`summon minecraft:zombie ${spawnX} ${spawnY} ${spawnZ}`);

        // Apply properties to the new zombie (set health to half a heart)
        system.runTimeout(() => {
          const zombies = entity.dimension.getEntities({
            location: { x: spawnX, y: spawnY, z: spawnZ },
            maxDistance: 1,
            type: "minecraft:zombie"
          });

          zombies.forEach(zombie => {
            zombie.runCommandAsync("effect @s minecraft:instant_health 1 2 true"); // Ensure the zombie's health is exactly 1
          });
        }, 1); // Delay to allow zombie to spawn before modifying
      });
    }
  });
});
