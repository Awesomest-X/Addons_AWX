import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('evoker:fangs_sword', {
    
    // Function triggered on item use
    onUse(e) {
      const user = e.source; // The player using the weapon
      const item = e.item;   // The item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Decrease the item's durability
      if (item.isDamaged) {
        item.damage(1); // Reduce durability by 1
      }

      // Find a target entity within a 10-block radius in front of the user
      const maxDistance = 10;
      const nearbyEntities = user.dimension.getEntities({
        location: user.location,
        maxDistance,
        excludeFamilies: ['player', 'friendly'] // Exclude players and friendly entities
      });

      let closestTarget = null;
      let closestDistance = maxDistance;

      nearbyEntities.forEach(entity => {
        const distance = Math.sqrt(
          (entity.location.x - user.location.x) ** 2 +
          (entity.location.y - user.location.y) ** 2 +
          (entity.location.z - user.location.z) ** 2
        );

        if (distance < closestDistance) {
          closestTarget = entity;
          closestDistance = distance;
        }
      });

      // If no valid target is found, return
      if (!closestTarget) return;

      // Calculate the direction and summon fangs in a line to the target
      const startX = user.location.x;
      const startY = user.location.y;
      const startZ = user.location.z;

      const endX = closestTarget.location.x;
      const endY = closestTarget.location.y;
      const endZ = closestTarget.location.z;

      const fangCount = 6; // Number of fangs in the line
      const stepX = (endX - startX) / fangCount;
      const stepY = (endY - startY) / fangCount;
      const stepZ = (endZ - startZ) / fangCount;

      for (let i = 1; i <= fangCount; i++) {
        const x = startX + stepX * i;
        const y = startY + stepY * i;
        const z = startZ + stepZ * i;

        // Summon evocation fang at the calculated position
        system.runTimeout(() => {
          user.dimension.runCommandAsync(
            `summon evocation_fang ${x} ${y} ${z}`
          );
        }, i * 5); // Stagger each fang by 5 ticks
      }

      // Apply damage to the closest target
      closestTarget.applyDamage(10, {
        cause: EntityDamageCause.magic,
        damagingEntity: user
      });
    }
  });
});
