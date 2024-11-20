import {
  world,
  system,
  EntityDamageCause
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('earthquake:earthquake_sword', {
    
    // Listen for the item being used (right-click or equivalent)
    onUse(e) {
      const attacker = e.source;  // The entity using the item (player)
      if (!attacker || !attacker.isValid()) return; // Ensure the attacker is valid

      // Apply earthquake effects (particles, sound, etc.)
      attacker.runCommandAsync('function weapon/earthquake_fx');

      // Get the player's current position
      const playerLocation = attacker.location;
      
      // Earthquake radius and intensity
      const earthquakeRadius = 5; // Radius of the earthquake effect
      const earthquakeStrength = 9; // Vertical knockback strength (Y-axis)
      const earthquakeDamage = 7; // Damage dealt by the earthquake

      // Create earthquake particles around the player to represent the tremor
      attacker.runCommandAsync(`particle minecraft:falling_dust_gravel_particle ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} 0 0 0 1 10`);
      attacker.runCommandAsync(`particle minecraft:falling_dust_sand_particle ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} 0 0 0 1 10`);

      // Create 16 random particles within the area of effect (random positions within radius)
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2; // Random angle for the particle
        const distance = Math.random() * earthquakeRadius; // Random distance within the radius
        const xOffset = Math.cos(angle) * distance;
        const zOffset = Math.sin(angle) * distance;

        // Random Y offset for vertical variation
        const yOffset = Math.random() * 2 - 1; // Random between -1 and 1

        // Generate random particles around the player
        attacker.runCommandAsync(`particle minecraft:falling_dust_gravel_particle ${playerLocation.x + xOffset} ${playerLocation.y + yOffset} ${playerLocation.z + zOffset} 0 0 0 1 5`);
      }
      
      // Apply camera shake effect to the player to simulate the earthquake
      attacker.runCommandAsync(`cameraShake @s 1.5 1 30`);  // Adjust intensity (1.5), duration (1), and interval (30)

      // Get all entities within the earthquake radius (5 blocks)
      attacker.dimension.getEntities({
        location: attacker.location,
        maxDistance: earthquakeRadius,
        excludeFamilies: ['ignore']
      }).forEach(entity => {
        if (entity === attacker) return;  // Exclude the attacker themselves

        if (entity === undefined || !entity.isValid()) return;  // Avoid errors from invalid entities

        // Create earthquake shockwave effect (knockback in vertical direction only)
        const xDif = entity.location.x - attacker.location.x;
        const yDif = entity.location.y - attacker.location.y;
        const zDif = entity.location.z - attacker.location.z;

        // Apply vertical knockback only (Y-axis) with strength 9
        entity.applyKnockback(0, earthquakeStrength, 0, 0, 0);  // Vertical knockback only

        // Apply damage to the entity (earthquake effect)
        entity.applyDamage(earthquakeDamage, {  
          cause: EntityDamageCause.entityAttack,
          damagingEntity: attacker
        });

        // Apply the "tremor" effect visually with particles around the affected entities
        entity.runCommandAsync(`particle minecraft:falling_dust_gravel_particle ${entity.location.x} ${entity.location.y} ${entity.location.z} 0 0 0 1 5`);
        
        // Generate dripstone under the affected mob (simulate the ground breaking)
        const dripstoneLocation = entity.location.offset(0, -1, 0);  // One block below the entity
        dripstoneLocation.dimension.getBlock(dripstoneLocation).setType('minecraft:pointed_dripstone');  // Set the block to dripstone
      });
    }
  });
});
