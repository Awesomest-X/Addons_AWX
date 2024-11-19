import {
  world,
  system,
  EntityDamageCause,
  BlockLocation
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('water_spout:water_spout_sword', {
    
    onHitEntity(e) {
      const attacker = e.attackingEntity;
      const target = e.hitEntity;

      // Ensure the hit was successful and the item has a cooldown (will not run if cooldown is active)
      if (!e.hadEffect || !attacker || !target) return; // Check if attacker or target is valid

      // Apply water spout effects (particles, sound, etc.)
      target.runCommandAsync('function weapon/water_spout_fx');

      // Determine the location where the water spout will appear (under the attacked entity)
      const targetLocation = target.location;
      const spoutLocation = new BlockLocation(targetLocation.x, targetLocation.y - 1, targetLocation.z);

      // Check if the block below is solid, if not, don't create the water spout
      const blockBelow = target.dimension.getBlock(spoutLocation);
      if (blockBelow && blockBelow.id !== "minecraft:water") {
        // Create a water spout effect with particles and sound
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:water_bubble ~ ~ ~ 0 1 0 0.5 15`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:splash ~ ~ ~ 0 1 0 0.5 15`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run playsound minecraft:ambient.weather.rain master @a[distance=..20]`);
      }

      // Apply vertical knockback to the target (upward) to send them 4.5 blocks high
      const knockbackStrength = 6.5;  // Vertical knockback adjusted to 6.5
      target.applyKnockback(0, knockbackStrength, 0, 0.6);  // Apply upward knockback

      // Apply damage to the entity (based on water spout intensity)
      const damageAmount = 6;  // You can adjust the damage value
      target.applyDamage(damageAmount, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: attacker
      });

      // Receding water effect after a delay (before the entity hits the ground)
      system.runTimeout(() => {
        // After 1 second, remove water particles and recede the water
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:water_bubble ~ ~ ~ 0 1 0 0.1 5`);
        target.dimension.runCommand(`execute at ${targetLocation.x} ${targetLocation.y} ${targetLocation.z} run particle minecraft:splash ~ ~ ~ 0 1 0 0.1 5`);
      }, 20);  // The water recedes after 1 second (20 ticks)
    }
  });
});
