import {
  world,
  system,
  EntityDamageCause,
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.itemComponentRegistry.registerCustomComponent("storm:storm_blade", {
    onUse(e) {
      const user = e.source; // The player using the weapon
      const item = e.item; // The item being used

      if (!user || !item) return;

      const userLocation = user.location;
      const dimension = user.dimension;

      // Hostile mob families to target
      const hostileFamilies = ["monster"];

      // Start the storm (thunder weather)
      dimension.runCommandAsync("weather thunder");

      // Get hostile entities within a 5-block radius
      const radius = 5;
      const nearbyEntities = dimension.getEntities({
        location: userLocation,
        maxDistance: radius,
        families: hostileFamilies,
      });

      if (nearbyEntities.length === 0) {
        // End the storm immediately if no targets
        dimension.runCommandAsync("weather clear");
        return;
      }

      // Storm effect begins
      nearbyEntities.forEach((target) => {
        const targetLocation = target.location;

        // Apply lightning strike effect
        dimension.runCommandAsync(
          `summon lightning_bolt ${targetLocation.x} ${targetLocation.y} ${targetLocation.z}`
        );
        target.applyDamage(8, {
          cause: EntityDamageCause.lightning,
          damagingEntity: user,
        });

        // Apply vertical knockback to simulate wind and water effects
        target.applyKnockback(0, 6, 0, 0.8); // Launch entity upwards

        // Particles for storm effects (smoke and electric sparks)
        dimension.runCommandAsync(
          `particle minecraft:smoke ${targetLocation.x} ${targetLocation.y + 1} ${targetLocation.z} 0.5 0.5 0.5 0.2 30`
        );
        dimension.runCommandAsync(
          `particle minecraft:electric_spark_particle ${targetLocation.x} ${targetLocation.y + 1} ${targetLocation.z} 0.5 0.5 0.5 0.2 20`
        );
        dimension.runCommandAsync(
          `particle minecraft:splash ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} 0.5 0.5 0.5 0.3 20`
        );

        // Receding effect after 1 second
        system.runTimeout(() => {
          dimension.runCommandAsync(
            `particle minecraft:water_bubble ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} 0.5 0.5 0.5 0.2 10`
          );
        }, 20); // 1 second delay (20 ticks)
      });

      // Area-wide shockwave effect
      dimension.runCommandAsync(
        `particle minecraft:smoke ${userLocation.x} ${userLocation.y} ${userLocation.z} 4 0.5 4 0.1 50`
      );
      dimension.runCommandAsync(
        `playsound minecraft:item.trident.thunder @a[distance=..10] ${userLocation.x} ${userLocation.y} ${userLocation.z}`
      );

      // End the storm after 5 seconds
      system.runTimeout(() => {
        dimension.runCommandAsync("weather clear");
      }, 100); // 5 seconds (100 ticks)

      // Damage durability of the item
      if (item.isDamaged) {
        item.damage(2); // Reduce durability by 2
      }
    },
  });
});
