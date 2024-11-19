import {
  world,
  system,
  EntityDamageCause,
  ItemStack,
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.itemComponentRegistry.registerCustomComponent(
    "lightning:lightning_burst",
    {
      onUse(e) {
        const player = e.source; // The player using the item
        const item = e.itemStack;

        if (!player || !item) return;

        const playerLoc = player.location;
        const dimension = player.dimension;

        // Hostile mob families to prioritize
        const hostileFamilies = ["monster"];

        // Lightning ability logic
        const nearbyEntities = dimension.getEntities({
          location: playerLoc,
          maxDistance: 5,
          excludeFamilies: ["player"], // Exclude players
        });

        // Filter to hostile mobs
        const hostileTargets = nearbyEntities.filter((entity) =>
          hostileFamilies.some((family) => entity.typeId.includes(family))
        );

        // If no hostile entities are nearby, return
        if (hostileTargets.length === 0) return;

        // Determine the base damage and knockback
        let baseDamage = 8; // Default damage
        let chainRange = 4; // Range for chain reaction

        // Scale power based on enchantments
        const unbreakingLevel = item.getEnchantment("minecraft:unbreaking") || 0;
        const mendingLevel = item.getEnchantment("minecraft:mending") || 0;

        baseDamage += unbreakingLevel * 2; // Increase damage with Unbreaking
        chainRange += mendingLevel; // Increase chain range with Mending

        // Strike the initial target and start chain reaction
        const mainTarget = hostileTargets[0]; // Prioritize the first hostile entity
        dimension.runCommandAsync(
          `summon lightning_bolt ${mainTarget.location.x} ${mainTarget.location.y} ${mainTarget.location.z}`
        );

        mainTarget.applyDamage(baseDamage, {
          cause: EntityDamageCause.lightning,
          damagingEntity: player,
        });

        // Add particles and sounds for the initial strike
        dimension.spawnParticle(
          "minecraft:electric_spark_particle",
          mainTarget.location,
          { spread: [1, 1, 1], count: 30 }
        );

        player.playSound("minecraft:item.trident.thunder", { volume: 1 });

        // Chain Reaction Logic
        const chainEntities = dimension.getEntities({
          location: mainTarget.location,
          maxDistance: chainRange,
          excludeFamilies: ["player"],
        });

        chainEntities.forEach((entity) => {
          if (entity === mainTarget || !hostileFamilies.some((f) => entity.typeId.includes(f))) return;

          dimension.runCommandAsync(
            `summon lightning_bolt ${entity.location.x} ${entity.location.y} ${entity.location.z}`
          );
          entity.applyDamage(baseDamage / 2, {
            cause: EntityDamageCause.lightning,
            damagingEntity: player,
          });

          // Particles for chained entities
          dimension.spawnParticle(
            "minecraft:electric_spark_particle",
            entity.location,
            { spread: [1, 1, 1], count: 15 }
          );
        });

        // Durability Logic
        item.damage(5 - unbreakingLevel, player); // Reduce damage by Unbreaking level
      },
    }
  );
});
