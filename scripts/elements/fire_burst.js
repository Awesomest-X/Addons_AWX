import {
  world,
  system,
  EntityDamageCause,
  ItemStack,
  Entity
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('fireblast:fire_blast_sword', {
    
    // Function triggered when the sword is used
    onUse(e) {
      const attacker = e.source;  // The player using the weapon
      const item = e.item;  // The item being used

      // Check if the attacker or item is invalid
      if (!attacker || !item) return;

      // Check if the item has durability (like a sword)
      if (item.isDamaged) {
        // Decrease the durability of the item
        item.damage(1);  // Decrease durability by 1 (you can adjust this as needed)
      }

      // Find all entities within a 5-block radius around the attacker
      const nearbyEntities = attacker.dimension.getEntities({
        location: attacker.location,
        maxDistance: 5,
        excludeEntities: [attacker]  // Exclude the attacker from being targeted
      });

      // If there are any entities within 5 blocks (excluding the player)
      if (nearbyEntities.length > 0) {
        // Find the closest entity to the player
        const target = nearbyEntities.sort((a, b) => {
          const aDist = Math.sqrt(Math.pow(a.location.x - attacker.location.x, 2) +
                                  Math.pow(a.location.y - attacker.location.y, 2) +
                                  Math.pow(a.location.z - attacker.location.z, 2));
          const bDist = Math.sqrt(Math.pow(b.location.x - attacker.location.x, 2) +
                                  Math.pow(b.location.y - attacker.location.y, 2) +
                                  Math.pow(b.location.z - attacker.location.z, 2));
          return aDist - bDist;  // Sort by distance (ascending)
        })[0];  // The closest entity

        // Launch a fireball towards the closest entity
        if (target) {
          // Create the fireball entity and set its direction toward the target
          const fireball = attacker.dimension.createEntity("minecraft:fireball", {
            location: attacker.location.add(0, 1.5, 0)  // Spawn the fireball slightly above the player
          });

          // Calculate direction to the target
          const direction = target.location.subtract(fireball.location).normalize();

          // Apply velocity to the fireball to launch it toward the target
          fireball.setVelocity(direction.multiply(0.5));  // Adjust the speed as needed

          // Optional: Apply fireball damage on impact (to be handled by the fireball entity itself)
          fireball.onHitEntity.subscribe(hitEvent => {
            if (hitEvent.hitEntity !== attacker) {
              hitEvent.hitEntity.applyDamage(6, {  // Apply damage on fireball hit
                cause: EntityDamageCause.fire,
                damagingEntity: attacker
              });
            }
          });

          // Optional: Fireball sound effect when launched
          attacker.dimension.runCommand(`execute at ${fireball.location.x} ${fireball.location.y} ${fireball.location.z} run playsound minecraft:entity.blaze.shoot master @a[distance=..20]`);
        }
      }
    }
  });
});
