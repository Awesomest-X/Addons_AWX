import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('wind:wind_uplift', {

    onUse(e) {
      const user = e.source; // The player using the ability
      const item = e.item;

      if (!user || !item) return;

      // Get all entities within a 4-block radius of the user
      const radius = 4;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        families: ["hostile"], // Only affects hostile mobs
        excludeEntities: [user] // Exclude the user themselves
      });

      // Apply levitation effect to each entity in the radius
      nearbyEntities.forEach(target => {
        target.addEffect("levitation", 40, 2, true); // 2 seconds of levitation
        target.dimension.runCommandAsync(`particle minecraft:cloud ${target.location.x} ${target.location.y + 1} ${target.location.z} 0.5 1 0.5 0.1 40`);
      });

      // Play sound and apply additional visual effects
      user.dimension.runCommandAsync(`particle minecraft:basic_smoke_particle ${user.location.x} ${user.location.y + 1} ${user.location.z} 1 1 1 0.2 30`);
      user.dimension.runCommandAsync(`playsound minecraft:entity.ender_dragon.flap @a[r=10] ~ ~ ~`);
    }
  });
});
