import {
  world,
  system,
  EntityDamageCause,
  Effect
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('ice:slowness_sword', {

    // Function triggered on hit
    onHitEntity(e) {
      const attacker = e.attackingEntity;
      const target = e.hitEntity;

      // Ensure the hit was successful
      if (!e.hadEffect || !attacker || !target) return;

      // Apply ice particles (you can change the type of particle for the ice effect)
      target.runCommandAsync('function weapon/ice_hit_fx');

      // Apply Slowness effect to the target entity (Slowness level 2 for 5 seconds)
      target.addEffect(Effect.slowness, 40, 10); // 100 ticks = 5 seconds at Level 2

      // Optionally apply damage to the target (can be adjusted or removed)
      const damageAmount = 3; // Adjust the damage value based on your preference
      target.applyDamage(damageAmount, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: attacker // The attacker causes the damage
      });
    }
  });
});
