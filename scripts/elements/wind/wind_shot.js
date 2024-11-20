import {
  world,
  system,
  Vector,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('wind:wind_blast', {

    onUse(e) {
      const user = e.source; // The player using the ability
      const item = e.item;

      if (!user || !item) return;

      // Ensure the player is holding the "wind_charge" item
      if (!item.typeId.includes("minecraft:wind_charge")) return;

      // Create a wind charge projectile
      const projectile = user.dimension.spawnEntity("minecraft:wind_charge_projectile", user.location);
      if (!projectile) return;

      // Set projectile velocity in the player's facing direction
      const facing = Vector.direction(user.getViewDirection());
      projectile.applyImpulse({
        x: facing.x * 2, // Speed multiplier for the projectile
        y: facing.y * 2,
        z: facing.z * 2
      });

      // Tag the projectile to identify it as a wind charge
      projectile.addTag("wind_blast_projectile");

      // Add particles to the projectile
      const projectileTick = system.runInterval(() => {
        if (!projectile || !projectile.isValid()) {
          system.clearRunInterval(projectileTick);
          return;
        }
        projectile.dimension.runCommandAsync(`particle minecraft:cloud ${projectile.location.x} ${projectile.location.y + 0.5} ${projectile.location.z} 0.2 0.2 0.2 0 5`);
      });

      // Sound effect
      user.dimension.runCommandAsync(`playsound minecraft:item.trident.throw @a[r=15] ~ ~ ~`);
    }
  });
});

// Wind charge projectile logic
system.runInterval(() => {
  const dimension = world.getDimension("overworld");

  // Check for all wind charge projectiles
  const projectiles = dimension.getEntities({
    type: "minecraft:wind_charge_projectile",
    tags: ["wind_blast_projectile"]
  });

  projectiles.forEach(projectile => {
    // Check for entities near the projectile
    const nearbyEntities = projectile.dimension.getEntities({
      location: projectile.location,
      maxDistance: 1.5,
      families: ["hostile"], // Only affects hostile mobs
      excludeEntities: [projectile.owner] // Avoid hitting the shooter
    });

    nearbyEntities.forEach(target => {
      // Apply knockback to the hit entity
      const directionX = target.location.x - projectile.location.x;
      const directionZ = target.location.z - projectile.location.z;
      const magnitude = Math.sqrt(directionX ** 2 + directionZ ** 2);
      const normalizedX = directionX / magnitude;
      const normalizedZ = directionZ / magnitude;

      target.applyKnockback(normalizedX, 1, normalizedZ, 10, 0.6); // Knockback away from impact point
      target.applyDamage(5, {
        cause: EntityDamageCause.projectile,
        damagingEntity: projectile.owner
      });

      // Play particle effects at the hit location
      target.dimension.runCommandAsync(`particle minecraft:basic_smoke_particle ${target.location.x} ${target.location.y + 1} ${target.location.z} 0.5 0.5 0.5 0.1 15`);

      // Remove the projectile
      projectile.kill();
    });
  });
});
