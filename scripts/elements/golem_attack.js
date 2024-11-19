import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('golem_force:golem_smash', {

    // Triggered when the item is used on an entity
    onHitEntity(e) {
      const attacker = e.attackingEntity;
      const target = e.hitEntity;

      // Ensure the attacker and target are valid
      if (!attacker || !target) return;

      // Iron Golem-like knockback values
      const horizontalKnockback = 2; // Push target away horizontally
      const verticalKnockback = 1;   // Launch target upward

      // Apply knockback to the target
      const xDif = target.location.x - attacker.location.x;
      const zDif = target.location.z - attacker.location.z;

      // Normalize the direction vector
      const distance = Math.sqrt(xDif * xDif + zDif * zDif);
      const normalizedX = xDif / distance || 0;
      const normalizedZ = zDif / distance || 0;

      target.applyKnockback(normalizedX, verticalKnockback, normalizedZ, horizontalKnockback);

      // Apply damage to the target
      const damageAmount = 7; // Equivalent to an iron golem's melee damage
      target.applyDamage(damageAmount, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: attacker // Assign the attacker as the damage source
      });

      // Play a particle effect to simulate the smash
      target.dimension.runCommandAsync(`particle minecraft:critical_hit_emitter ${target.location.x} ${target.location.y} ${target.location.z}`);
      
      // Optional: Add a sound effect for impact
      target.dimension.runCommandAsync(`playsound mob.irongolem.attack @a[distance=..20] ${target.location.x} ${target.location.y} ${target.location.z}`);
    }
  });
});
