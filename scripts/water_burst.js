import {
  world,
  system,
  EntityDamageCause,
  ItemStack
}
from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('dungeons:water_burst', {
    onHitEntity(e) {
      const attacker = e.attackingEntity;
      const target = e.hitEntity;

      // Ensure that there was a successful hit
      if (!e.hadEffect) return;

      // If there is a cooldown, return early to prevent abuse
      let tridentCD = world.scoreboard.getObjective('water_trident_cooldown').getScore(attacker);

      if (tridentCD > 0) {
        if (tridentCD < 20) world.scoreboard.getObjective('water_trident_cooldown').setScore(attacker, 20);
        return;
      }
      world.scoreboard.getObjective('water_trident_cooldown').addScore(attacker, 20);

      // Apply water burst effects (particle effects, sound, etc.)
      target.runCommandAsync('function weapon/water_trident_fx');

      // Get all entities within a 5-block radius of the target
      target.dimension.getEntities({
        location: target.location,
        maxDistance: 5,
        excludeFamilies: ['ignore']
      }).forEach(entity => {
        if (entity === target || entity === attacker) return;  // Exclude the target and attacker

        if (entity === undefined || !entity.isValid()) return;  // Avoid errors from invalid entities

        // Apply knockback in the direction away from the trident's target
        const xDif = entity.location.x - target.location.x;
        const zDif = entity.location.z - target.location.z;

        // Knockback effect
        entity.applyKnockback(xDif, zDif, 1.5, 0.3);

        // Apply damage to the entity hit
        entity.applyDamage(3, {
          cause: EntityDamageCause.entityAttack,
          damagingEntity: attacker
        });
      });
    }
  });
});
