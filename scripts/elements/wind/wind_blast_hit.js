import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('wind:wind_blast', {

    onHitEntity(e) {
      const attacker = e.attackingEntity;
      const target = e.hitEntity;

      // Ensure the attack was valid and entities exist
      if (!attacker || !target) return;

      // Apply knockback to the target
      const directionX = target.location.x - attacker.location.x;
      const directionZ = target.location.z - attacker.location.z;
      const magnitude = Math.sqrt(directionX ** 2 + directionZ ** 2);
      const normalizedX = directionX / magnitude;
      const normalizedZ = directionZ / magnitude;

      target.applyKnockback(normalizedX, 1, normalizedZ, 12, 0.4); // High knockback away from attacker

      // Apply visual effects and sound
      target.dimension.runCommandAsync(`particle minecraft:cloud ${target.location.x} ${target.location.y + 1} ${target.location.z} 0.5 0.5 0.5 0 20`);
      attacker.dimension.runCommandAsync(`playsound minecraft:entity.generic.explode @a[r=10] ~ ~ ~`);

      // Optionally, deal additional damage
      target.applyDamage(5, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: attacker
      });
    }
  });
});
