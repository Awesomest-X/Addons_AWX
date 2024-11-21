import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('awx:water_spray', {

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

      // Get all hostile entities within a 5-block radius of the user
      const radius = 5;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance: radius,
        families: ["monster"] // Only target hostile entities
      });

      // Apply the water spout effect to each hostile entity
      nearbyEntities.forEach(target => {
        const targetLocation = target.location;

        // Apply water spout effects (particles and sound)
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:water_bubble ~ ~ ~ 0 1 0 0.5 15`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:splash ~ ~ ~ 0 1 0 0.5 15`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run playsound minecraft:ambient.weather.rain master @a[distance=..20]`);

        // Apply vertical knockback to the target (to simulate being lifted by the water spout)
        const knockbackStrength = 6.5; // Vertical knockback strength to launch upwards
        target.applyKnockback(0, knockbackStrength, 0, 0.6); // Apply upward knockback to the target

        // Apply damage to the target entity
        const damageAmount = 6; // Adjust the damage value based on the desired effect
        target.applyDamage(damageAmount, {
          cause: EntityDamageCause.entityAttack,
          damagingEntity: user // The user causes the damage
        });

        // Receding water effect after a delay (before the entity hits the ground)
        system.runTimeout(() => {
          // After 1 second, remove water particles and recede the water
          target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:water_bubble ~ ~ ~ 0 1 0 0.1 5`);
          target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:splash ~ ~ ~ 0 1 0 0.1 5`);
        }, 20); // Water recedes after 1 second (20 ticks)
      });
    }
  });
});
