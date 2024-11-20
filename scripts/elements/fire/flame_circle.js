import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('fire_circle:fire_ring_sword', {

    // Function triggered when the item is used
    onUse(e) {
      const user = e.source;  // The player using the item
      const item = e.item;    // The item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Create a fire circle effect around the user with a 3-block radius
      const radius = 3;
      const entitiesInRadius = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        excludeFamilies: ['ignore']
      });

      // Apply fire damage and effects to all entities in the radius
      entitiesInRadius.forEach(target => {
        if (target === user) return;  // Exclude the user from being affected by their own ability

        // Apply burning effect to entities
        target.setOnFire(5);  // Apply fire for 5 seconds
        target.applyDamage(4, {  // Fire damage over time
          cause: EntityDamageCause.entityAttack,
          damagingEntity: user  // The user is the source of damage
        });

        // Create fire particles around the affected entities
        target.dimension.runCommand(`execute at ${target.location.x} ${target.location.y} ${target.location.z} run particle minecraft:flame ~ ~ ~ 0 1 0 0.5 10`);
      });

      // Play sound effect for fire circle activation
      user.dimension.runCommandAsync(`playsound minecraft:ambient.weather.rain master @a[distance=..20]`);
    }
  });
});
