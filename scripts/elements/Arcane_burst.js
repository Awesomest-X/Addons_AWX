import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('awx:arcane_burst', {

    // Triggered on use of the magical item
    onUse(e) {
      const user = e.source; // The player using the staff
      const item = e.item;   // The magical item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Reduce the durability of the item
      if (item.isDamaged) {
        item.damage(2); // Decrease durability by 2
      }

      // Get all entities within a 7-block radius of the user
      const radius = 7;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        families: ["monster"] // Target everything except players
      });

      // Magic burst effects at the user's location
      const userLocation = user.location;
      user.dimension.runCommand(`execute at ${userLocation.x} ${userLocation.y} ${userLocation.z} run particle minecraft:evoker_spell ~ ~1 ~ 0.5 0.5 0.5 0.1 50`);
      user.dimension.runCommand(`execute at ${userLocation.x} ${userLocation.y} ${userLocation.z} run playsound minecraft:block.enchantment_table.use master @a[distance=..20]`);

      // Apply effects to each nearby entity
      nearbyEntities.forEach(target => {
        const targetLocation = target.location;

        // Calculate the direction for knockback (away from the user)
        const xDif = targetLocation.x - userLocation.x;
        const zDif = targetLocation.z - userLocation.z;
        const distance = Math.sqrt(xDif * xDif + zDif * zDif);
        const normalizedX = xDif / distance;
        const normalizedZ = zDif / distance;

        // Staggered knockback: First levitation, then horizontal knockback
        target.addEffect("levitation", 40, 1); // Levitate for 2 seconds (40 ticks)

        system.runTimeout(() => {
          target.applyKnockback(normalizedX, 0, normalizedZ, 4, 0.2); // Horizontal knockback after 1 second
        }, 20); // Delay knockback by 1 second

        // Apply arcane particles on each entity
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:end_chest ~ ~ ~ 0.5 0.5 0.5 0.1 30`);

        // Apply damage to the target
        const damageAmount = 8; // Damage value for the arcane burst
        target.applyDamage(damageAmount, {
          cause: EntityDamageCause.magic,
          damagingEntity: user
        });
      });

      // Create a secondary particle effect after the main burst
      system.runTimeout(() => {
        user.dimension.runCommand(`execute at ${userLocation.x} ${userLocation.y} ${userLocation.z} run particle minecraft:critical_hit_emitter ~ ~1 ~ 0.5 0.5 0.5 0.2 100`);
      }, 20); // Delayed effect (1 second later)
    }
  });
});
