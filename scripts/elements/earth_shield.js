import {
  world,
  system,
  EntityDamageCause,
  ItemStack,
  BlockLocation
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('earth:stonewall_shield', {
    
    // Function triggered when the item is used
    onUse(e) {
      const user = e.source;  // The player using the item
      const item = e.item;    // The item being used

      // Ensure the user and item are valid
      if (!user || !item) return;

      // Check if the item has durability (basic items like shields do)
      if (item.isDamaged) {
        // Decrease the item's durability (damage the item)
        item.damage(1); // Decrease the durability by 1
      }

      // Get the user's current facing direction
      const direction = user.location.direction;

      // Calculate the position in front of the player to spawn the wall (3 blocks ahead)
      const x = user.location.x + direction.x * 3;
      const y = user.location.y;
      const z = user.location.z + direction.z * 3;

      // Create stone wall in front of the user (3x2 blocks)
      // Wall size: 3 blocks long and 2 blocks high, facing the direction the player is facing
      user.dimension.fillBlock(new BlockLocation(x - 1, y, z), new BlockLocation(x + 1, y + 1, z), "minecraft:stone");

      // Apply an effect to the player to block damage (temporary shield)
      user.addEffect("minecraft:resistance", 100, 0);  // Resistance effect for 5 seconds (100 ticks)

      // Particle effect around the stone wall to show it being created
      user.dimension.runCommandAsync(`execute at ${x} ${y} ${z} run particle minecraft:block_crack minecraft:stone 0.5 1 0.5 0.1 10`);

      // Sound effect for the stone wall creation
      user.dimension.runCommandAsync(`execute at ${x} ${y} ${z} run playsound minecraft:block.stone.place master @a[distance=..20]`);

      // Remove the stone wall after 5 seconds (100 ticks)
      system.runTimeout(() => {
        user.dimension.fillBlock(new BlockLocation(x - 1, y, z), new BlockLocation(x + 1, y + 1, z), "minecraft:air");
      }, 100);  // Remove stone wall after 5 seconds

      // Optionally, log a message for feedback (you can remove this if not needed)
      console.log("Stonewall Shield activated in front of the player!");
    }
  });
});
