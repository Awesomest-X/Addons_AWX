import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('awx:fireball_impact', {

    // Function triggered when the item hits an entity
    onHitEntity(e) {
      const attacker = e.attackingEntity;
      const target = e.hitEntity;

      // Ensure a valid attacker and target
      if (!attacker || !target) return;

      // Apply fireball particles and knockback effect
      target.runCommandAsync('function weapon/fireball_impact_fx');

      // Apply knockback to the target (away from the attacker)
      const xDiff = target.location.x - attacker.location.x;
      const zDiff = target.location.z - attacker.location.z;
      const distance = Math.sqrt(xDiff * xDiff + zDiff * zDiff);

      // Normalize the direction vector for knockback
      const knockbackX = xDiff / distance;
      const knockbackZ = zDiff / distance;

      // Apply knockback (target is knocked 4 blocks horizontally and 0.5 blocks vertically)
      target.applyKnockback(knockbackX, 0.5, knockbackZ, 4, 0.5);

      // After knockback, place fire at the target's landing position
      system.runTimeout(() => {
        const { x, y, z } = target.location;
        target.dimension.runCommandAsync(`setblock ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} minecraft:fire`);
      }, 20); // Small delay to ensure fire is placed after knockback

      // Optionally reduce item durability (or add cooldown)
      const item = attacker.getComponent('minecraft:hand_container')?.container?.getItem(0);
      if (item) {
        item.getComponent('minecraft:durability')?.damage(1);
      }
    }
  });
});
