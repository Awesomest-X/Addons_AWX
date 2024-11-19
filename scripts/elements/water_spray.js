import {
  world,
  system,
  EntityDamageCause,
  ItemStack
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('awx:water_spout', {
    
    // Function triggered on item use
    onUse(e) {
      const attacker = e.source;  // The player using the weapon
      const item = e.item;  // The item being used
      const target = e.hitEntity;  // The target entity being hit (if any)

      // Check if the attacker or item is invalid
      if (!attacker || !item || !target) return;

      // Check if the item has durability (basic items like swords do)
      if (item.isDamaged) {
        // Decrease the item's durability (damage the item)
        item.damage(1);  // Decrease the durability by 1 (you can adjust this as needed)
      }

      // Apply water spout effects (particles, sound, etc.) to the target area
      const targetLocation = target.location;
      
      // Check if the block below the target is solid for the water spout
      const spoutLocation = target.dimension.getBlock(targetLocation.x, targetLocation.y - 1, targetLocation.z);
      if (spoutLocation && spoutLocation.id !== "minecraft:water") {
        // Create water spout effects (particles and sound)
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:water_bubble ~ ~ ~ 0 1 0 0.5 15`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:splash ~ ~ ~ 0 1 0 0.5 15`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run playsound minecraft:ambient.weather.rain master @a[distance=..20]`);
      }

      // Apply vertical knockback to the target (to simulate being lifted by the water spout)
      const knockbackStrength = 6.5;  // Vertical knockback strength to launch upwards
      target.applyKnockback(0, knockbackStrength, 0, 0.6);  // Apply upward knockback to the target

      // Apply damage to the target entity
      const damageAmount = 6;  // Adjust the damage value based on the desired effect
      target.applyDamage(damageAmount, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: attacker  // The attacker causes the damage
      });

      // Receding water effect after a delay (before the entity hits the ground)
      system.runTimeout(() => {
        // After 1 second, remove water particles and recede the water
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:water_bubble ~ ~ ~ 0 1 0 0.1 5`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:splash ~ ~ ~ 0 1 0 0.1 5`);
      }, 20);  // Water recedes after 1 second (20 ticks)
    }
  });
});
