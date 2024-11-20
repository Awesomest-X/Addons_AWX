import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('wind:wind_blast', {

    onUse(e) {
      const user = e.source; // The player using the ability
      const item = e.item;

      if (!user || !item) return;

      // Get the nearest entity in the player's line of sight
      const maxDistance = 10; // Max distance to find the target
      const target = user.dimension.getEntities({
        location: user.location,
        maxDistance: maxDistance,
        families: ["hostile"], // Only targets hostile mobs
        excludeEntities: [user] // Exclude the user themselves
      }).sort((a, b) => user.location.distanceTo(a.location) - user.location.distanceTo(b.location))[0];

      if (!target) return;

      // Apply knockback to the target
      const directionX = target.location.x - user.location.x;
      const directionZ = target.location.z - user.location.z;
      const magnitude = Math.sqrt(directionX ** 2 + directionZ ** 2);
      const normalizedX = directionX / magnitude;
      const normalizedZ = directionZ / magnitude;

      target.applyKnockback(normalizedX, 1, normalizedZ, 12, 0.4); // High knockback away from user

      // Apply visual effects and sound
      target.dimension.runCommandAsync(`particle minecraft:cloud ${target.location.x} ${target.location.y + 1} ${target.location.z} 0.5 0.5 0.5 0 20`);
      user.dimension.runCommandAsync(`playsound minecraft:entity.generic.explode @a[r=10] ~ ~ ~`);
    }
  });
});
