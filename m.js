let enchantOptions = ["Sharpness", "Efficiency", "Protection", "Unbreaking"];
let selectedEnchantment = "";
let playerConfirmed = false;
let xpCost = 0;

world.events.itemUseOn.subscribe((event) => {
  if (event.block.id === "custom:enchantment_table") {
    let player = event.source;
    let heldItem = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlot);

    if (heldItem) {
      // Display options in chat
      player.runCommand(`say Select an enchantment for your item:`);
      enchantOptions.forEach((enchant, index) => {
        player.runCommand(`say [${index + 1}] ${enchant}`);
      });
      player.runCommand("say Type the number of your choice in chat.");

      // Listen for the player's chat input to select enchantment
      world.events.beforeChat.subscribe((chatEvent) => {
        if (chatEvent.sender === player && !playerConfirmed) {
          let choice = parseInt(chatEvent.message);
          if (choice > 0 && choice <= enchantOptions.length) {
            selectedEnchantment = enchantOptions[choice - 1];
            xpCost = Math.floor(Math.random() * 3 + 4); // Random cost between 4-6 XP

            // Confirm choice with feedback
            player.runCommand(`say Selected ${selectedEnchantment}. Cost: ${xpCost} XP.`);
            playerConfirmed = true;
          } else {
            player.runCommand("say Invalid choice. Please select a valid number.");
          }
          chatEvent.cancel = true; // Prevent the message from showing in chat
        }
      });

      // Check XP and apply the enchantment on confirmation
      if (playerConfirmed && selectedEnchantment) {
        if (player.getXpLevel() >= xpCost) {
          player.runCommand(`enchant @s ${selectedEnchantment.toLowerCase()}`);
          player.setXpLevel(player.getXpLevel() - xpCost);
          player.runCommand(`say Enchantment ${selectedEnchantment} applied! Used ${xpCost} XP.`);

          // Visual feedback with particles
          player.runCommand("particle minecraft:enchanting_table_particle ~ ~1 ~ 0.5 0.5 0.5 0.1 50");

          // Reset selection for next use
          playerConfirmed = false;
          selectedEnchantment = "";
        } else {
          player.runCommand("say Not enough XP for this enchantment.");
          playerConfirmed = false; // Allow the player to reselect if they don’t have enough XP
        }
      }
    } else {
      player.runCommand("say You need to hold an item to enchant it.");
    }
  }
});
