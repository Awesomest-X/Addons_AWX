import {
  world,
  system,
  ItemStack,
  Entity,
  player as MinecraftPlayer
} from "@minecraft/server";

// Store item data for each player in persistent storage
world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.itemComponentRegistry.registerCustomComponent('awx:wind_book', {

    // Function triggered when the item is used
    onUseItem(e) {
      const player = e.player;  // The player using the item
      const item = e.itemStack;  // The item being used (storage item)

      // Fetch stored items from persistent storage or initialize empty
      let storedItems = player.getComponent('wind_book_storage').get('awx:wind_storage') || [];

      if (storedItems.length > 0) {
        // If there are stored items, give them back to the player
        giveStoredItems(player, storedItems);

        // Reset the stored items data
        player.getComponent('wind_book_storage').set('awx:wind_storage', []);

        // Action Bar message informing the player
        player.sendActionBarMessage("You Have Opened The Book Of Wind!");
      } else {
        // If no items are stored, store up to 7 items from the player's inventory that have a specific tag
        storeItems(player, item);

        // Action Bar message informing the player
        player.sendActionBarMessage("You Have Opened The Book Of Wind.");
      }
    }
  });
});

// Function to store up to 7 items from the player's inventory that have the 'storage:storeable' tag
function storeItems(player, item) {
  const inventory = player.getComponent('inventory').container;

  let itemsStored = 0;
  let storedItemData = [];

  // Loop through the player's inventory and store up to 7 items with the specific tag
  for (let slot = 0; slot < inventory.size; slot++) {
    const slotItem = inventory.getItem(slot);

    if (slotItem && itemsStored < 7) {
      // Check if the item has the required tag
      if (slotItem.getTags().includes('awx:wind_page')) {
        // Store the item details (type, amount, tags) in the storedItemData array
        storedItemData.push({
          type: slotItem.id,
          amount: slotItem.amount,
          tags: slotItem.getTags()
        });

        // "Store" the item (add it to the in-memory storage data)
        itemsStored++;

        // Remove the item from the player's inventory
        inventory.removeItem(slot, slotItem.amount);
      }
    }
  }

  // Update the stored item data in persistent storage for this player
  player.getComponent('wind_book_storage').set('awx:wind_storage', storedItemData);

  // Action Bar message informing the player how many items were stored
  player.sendActionBarMessage(`You Have Added ${itemsStored} Page(s) To The Book`);
}

// Function to check if the player's inventory has enough space to hold the stored items
function hasInventorySpace(player, items) {
  const inventory = player.getComponent('inventory').container;
  let spaceAvailable = 0;

  // Loop through the player's inventory to check for space
  for (let slot = 0; slot < inventory.size; slot++) {
    const slotItem = inventory.getItem(slot);
    if (!slotItem || slotItem.amount < slotItem.maxAmount) {
      spaceAvailable++;
    }
  }

  // Return true if there is enough space for all the items
  return spaceAvailable >= items.length;
}

// Function to give the player the exact stored items (same type, amount, tags)
function giveStoredItems(player, storedItems) {
  const inventory = player.getComponent('inventory').container;

  // First, check if there is enough space in the inventory
  if (!hasInventorySpace(player, storedItems)) {
    player.sendActionBarMessage("Your Inventory Is Too Full To Open");
    return;
  }

  // Loop to give the stored items back to the player
  storedItems.forEach(itemData => {
    // Create a new item stack for each stored item with the exact amount and tags
    const item = new ItemStack(itemData.type, itemData.amount);

    // Add the tags from the stored item
    itemData.tags.forEach(tag => item.addTag(tag));

    // Add the item to the player's inventory
    inventory.addItem(item);
  });

  // Reset the stored items data after giving them back to the player
  player.getComponent('wind_book_storage').set('awx:wind_storage', []);
}
