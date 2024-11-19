import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('windburst:wind_burst_sword', {
    
    // Listen for the item being used (right-click or equivalent)
    onUse(e) {
      const attacker = e.source;  // The entity using the item (player)
      if (!attacker || !attacker.isValid()) return; // Ensure the attacker is valid

      // Apply wind burst effects (particles, sound, etc.)
      attacker.runCommandAsync('function weapon/wind_burst_fx');

      // Get the player's current position
      const playerLocation = attacker.location;
      
      // Spawn a particle directly at the player
      attacker.runCommandAsync(`particle minecraft:knockback_roar_particle ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} 0 0 0 1 1`);
      
      // Calculate positions for 8 surrounding particles
      const radius = 2; // The distance around the player where particles will be spawned
      const angleStep = Math.PI / 4; // 8 particles = 360° / 8

      for (let i = 0; i < 8; i++) {
        // Calculate the position for each surrounding particle
        const angle = i * angleStep;  // Increment the angle
        const xOffset = Math.cos(angle) * radius;
        const zOffset = Math.sin(angle) * radius;

        // Spawn a particle at each surrounding position
        attacker.runCommandAsync(`particle minecraft:knockback_roar_particle ${playerLocation.x + xOffset} ${playerLocation.y} ${playerLocation.z + zOffset} 0 0 0 1 1`);
      }

      // Get all entities within a 5-block radius of the attacker
      attacker.dimension.getEntities({
        location: attacker.location,
        maxDistance: 5,
        excludeFamilies: ['ignore']
      }).forEach(entity => {
        if (entity === attacker) return;  // Exclude the attacker themselves

        if (entity === undefined || !entity.isValid()) return;  // Avoid errors from invalid entities

        // Calculate the direction away from the attacker (omni-directional)
        const xDif = entity.location.x - attacker.location.x;
        const yDif = entity.location.y - attacker.location.y;
        const zDif = entity.location.z - attacker.location.z;

        // Normalize the direction vector to make the knockback even
        const distance = Math.sqrt(xDif * xDif + yDif * yDif + zDif * zDif);
        const normalizedX = xDif / distance;
        const normalizedY = yDif / distance;
        const normalizedZ = zDif / distance;

        // Apply knockback in the direction away from the attacker
        entity.applyKnockback(normalizedX, normalizedY, normalizedZ, 15, 0.6);  // Increased knockback to 15 for 6 block knockback

        // Apply damage to the entity hit
        entity.applyDamage(5, {  // Higher damage for the knockback effect
          cause: EntityDamageCause.entityAttack,
          damagingEntity: attacker
        });
      });
    }
  });
});
