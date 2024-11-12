let enchantOptions = ["Sharpness", "Efficiency", "Protection", "Unbreaking"];
let selectedEnchantment = "";
let xpCost = 0;

world.events.itemUseOn.subscribe((event) => {
  if (event.block.id === "custom:enchantment_table") {
    let player = event.source;
    let heldItem = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlot);

    if (heldItem) {
      // Start the dialogue with the player to choose enchantments
      player.triggerEvent("start_enchantment_dialogue");
    } else {
      player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"You need to hold an item to enchant it."}]}`);
    }
  }
});

// Listen for dialogue events and apply the enchantment when selected
world.events.dialogueSelect.subscribe((event) => {
  let player = event.source;
  let heldItem = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlot);
  xpCost = Math.floor(Math.random() * 3 + 4); // Random cost between 4-6 XP

  if (heldItem) {
    switch (event.selection) {
      case "apply_sharpness":
        applyEnchantment(player, heldItem, "sharpness");
        break;
      case "apply_efficiency":
        applyEnchantment(player, heldItem, "efficiency");
        break;
      case "apply_protection":
        applyEnchantment(player, heldItem, "protection");
        break;
      case "apply_unbreaking":
        applyEnchantment(player, heldItem, "unbreaking");
        break; 
      default:
        player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Enchantment selection canceled."}]}`);
        break;
    }
  }
});

function applyEnchantment(player, item, enchantment) {
  if (player.getXpLevel() >= xpCost) {
    // Deduct XP before attempting enchantment
    player.setXpLevel(player.getXpLevel() - xpCost);

    // Try to apply the enchantment
    const enchantCommand = player.runCommand(`enchant @s ${enchantment}`);
    if (enchantCommand.success) {
      // Success: Provide feedback and visual effects
      player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"${enchantment} applied for ${xpCost} XP!"}]}`);
      player.runCommand("particle minecraft:enchanting_table_particle ~ ~1 ~ 0.5 0.5 0.5 0.1 50");
    } else {
      // Enchantment failed, refund XP and show error message
      player.setXpLevel(player.getXpLevel() + xpCost);
      player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"This enchantment cannot be applied to this item."}]}`);
    }
  } else {
    player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Not enough XP for this enchantment."}]}`);
  }
}
