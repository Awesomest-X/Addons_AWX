import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('soulshock:soul_shock_sword', {

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

      // Get all entities within a 7-block radius of the user (including hostile entities)
      const radius = 7;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius
      });

      // Apply the soul shockwave effect to all entities in the radius
      nearbyEntities.forEach(target => {
        // Avoid affecting the user
        if (target === user) return;

        // Apply a soul shockwave effect (particles, sound, etc.)
        target.dimension.runCommand(`execute at ${target.location.x} ${target.location.y} ${target.location.z} run particle minecraft:sculk_soul_particle ~ ~ ~ 0 1 0 0.2 10`);
        target.dimension.runCommand(`execute at ${target.location.x} ${target.location.y} ${target.location.z} run playsound minecraft:warden.scream master @a[distance=..20]`);

        // Apply damage to the target entity (soul shockwave damage)
        const damageAmount = 8; // Damage caused by the soul shockwave (similar to the Warden's strength)
        target.applyDamage(damageAmount, {
          cause: EntityDamageCause.entityAttack,
          damagingEntity: user // The user causes the damage
        });

        // Apply a brief knockback effect to simulate the shockwave knockback
        const knockbackStrength = 2; // Knockback caused by the shockwave (you can adjust this)
        target.applyKnockback(0, knockbackStrength, 0, 0.5); // Apply knockback to the target
      });
    }
  });
});
