import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('earthquake:earthquake_sword', {

    // Function triggered on item use
    onUse(e) {
      const user = e.source; // The player using the weapon
      const item = e.item;   // The item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Check if the item has durability (basic items like swords do)
      if (item.isDamaged) {
        // Decrease the item's durability (damage the item)
        item.damage(1); // Decrease the durability by 1 (you can adjust this as needed)
      }

      // Find a single target (nearest hostile mob)
      const radius = 5;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        families: ["hostile"] // Only target hostile entities
      });

      // If no target is found, exit
      if (nearbyEntities.length === 0) return;

      // Get the closest hostile entity
      const target = nearbyEntities[0];

      // Apply earthquake effect (earth tremor and pillars)
      const targetLocation = target.location;
      const userLocation = user.location;

      // Start ground shaking and display earth particles around the mob
      target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:falling_dust ~ ~ ~ 0 1 0 0.5 20`);
      target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run playsound minecraft:ambient.weather.thunder master @a[distance=..20]`);

      // Erupt stone pillars beneath the mob (simulate earth lifting the mob)
      target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run fill ~-1 ~-1 ~-1 ~1 ~1 ~1 minecraft:stone replace minecraft:air`);

      // Apply knockback to the mob (earthquake shockwave effect)
      const knockbackStrength = 4.0; // Moderate knockback to push the mob
      target.applyKnockback(0, knockbackStrength, 0, 0.5); // Vertical knockback

      // Apply damage to the mob
      const damageAmount = 8; // Adjust damage based on the desired impact
      target.applyDamage(damageAmount, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: user // The user causes the damage
      });

      // Now, lift the player into the air for the shockwave hit
      user.applyKnockback(0, 6.5, 0, 1); // Lift the player upwards with strong vertical knockback

      // Add some temporary invincibility (no fall damage)
      user.addEffect("minecraft:resistance", 3, 1); // Temporary resistance to prevent fall damage

      // After a short delay, make the player land and deal the shockwave hit
      system.runTimeout(() => {
        // Make the user fall back down and deal damage to nearby enemies
        user.applyKnockback(0, -6.5, 0, 1); // Drop the player back down

        // Find nearby mobs to apply the shockwave hit when the player lands
        user.dimension.getEntities({
          location: user.location,
          maxDistance: 5,
          families: ["hostile"]
        }).forEach(entity => {
          if (entity !== user) {
            // Apply knockback and damage to the entities affected by the shockwave
            entity.applyKnockback(0, 3, 0, 1.5); // Moderate shockwave knockback
            entity.applyDamage(10, {
              cause: EntityDamageCause.entityAttack,
              damagingEntity: user
            });
          }
        });

        // Aftershock particles to add extra drama
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:falling_dust ~ ~ ~ 0 0.5 0 0.2 10`);
      }, 60); // Delay (3 seconds) before the shockwave hit and aftershock

    }
  });
});
