let system = server.registerSystem(0, 0);
let interactionState = {
    echoShardUsed: false,
    netherStarUsed: false,
};
system.initialize = function() {
    this.listenForEvent("minecraft:block_interacted", (eventData) => this.onBlockInteracted(eventData));
    this.listenForEvent("minecraft:entity_die", (eventData) => this.onEntityDeath(eventData));
    this.mobsToTrack = {}; // Object to track spawned mobs
};

system.onBlockInteracted = function(eventData) {
    let block = eventData.data.block;
    let player = eventData.data.player;

    // Check if the block is the trial spawner block and if the player is holding a specified item
    if (block.hasTag('trial_spawner')) {
        let heldItem = this.getHeldItem(player);
        
        if (heldItem === "minecraft:prismarine_shard") {
            this.spawnMobForItem(block, player, "minecraft:guardian", "Water", "awx:book_of_water"); // Prismarine Shard -> Emerald
        } else if (heldItem === "minecraft:blaze_rod") {
            this.spawnMobForItem(block, player, "minecraft:blaze", "Fire", "awx:book_of_fire"); // Blaze Rod -> Blaze Powder
        } else if (heldItem === "minecraft:breeze_rod") {
            this.spawnMobForItemWithArmor(block, player, "minecraft:skeleton", "Air", "awx:book_of_air", "minecraft:diamond_chestplate");
        } else if (heldItem === "minecraft:pointed_dripstone") {
            this.spawnMobForItem(block, player, "minecraft:blaze", "Earth", "awx:book_of_earth"); // Blaze Rod -> Blaze Powder
        } else if (heldItem === "minecraft:iron_ingot") {
            this.spawnIronGolems(block, player, "Steel", "awx:book_of_steel"); // Iron Ingot -> Iron Sword (Only 2 Iron Golems)
        } else if (heldItem.id === "minecraft:echo_shard" && !interactionState.echoShardUsed) {
        interactionState.echoShardUsed = true;
        this.sendActionBarMessage(player, "Echo Shard used. Now hold a Nether Star to progress.");
        return;
    }

    // Handle interaction when the player holds a Nether Star after Echo Shard
    else if (heldItem.id === "minecraft:nether_star" && interactionState.echoShardUsed && !interactionState.netherStarUsed) {
        interactionState.netherStarUsed = true;
        this.sendActionBarMessage(player, "Nether Star used. Now hold a Dragon's Head to summon a special mob.");
        return;
    }

    // Handle interaction when the player holds a Dragon's Head after Nether Star
  else if (heldItem.id === "minecraft:dragon_head" && interactionState.netherStarUsed) {
        this.spawnSpecialMob(block, player);
        this.sendActionBarMessage(player, "Dragon's Head used! A special mob has been summoned.");
        return;
    }

        else {
            this.sendActionBarMessage(player, "You must insert an elemental item");
        }
    }
};

// Get the item that the player is holding in their main hand
system.getHeldItem = function(player) {
    let inventory = player.getComponent("minecraft:inventory").container;
    let slot = inventory.getSlot(0);  // Check the main hand (index 0)
    
    if (slot) {
        return slot.id; // Return the item ID
    }
    return null;
};

system.spawnSpecialMob = function(block, player) {
    let pos = block.getComponent("minecraft:position").data;

    // Spawn the special mob at a specific position
    let spawnLocation = { x: pos.x + 5, y: pos.y, z: pos.z };

    // Create the special mob (for example, a custom mob like a "Dragon Warrior")
    let mob = this.createEntity("minecraft:evoker", spawnLocation);

    // Apply custom armor (diamond chestplate as an example)
    mob.addComponent('minecraft:armor', {
        items: [{
            id: "minecraft:diamond_chestplate", // Example armor
            damage: 0
        }]
    });

    // Track the mob for future checks
    this.mobsToTrack[block.id] = [mob];

    // Reward the player when the mob is defeated
    this.trackMobDefeat(block, mob);
};

// Spawn the mob based on the item held and display action bar message
system.spawnMobForItem = function(block, player, mobType, element, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    
    // Array to store the positions of spawned mobs to ensure they spawn at separate locations
    let spawnOffsets = [
        { x: 3, y: 0, z: 0 },   // 3 blocks away on the x-axis
        { x: -3, y: 0, z: 0 },  // 3 blocks away on the negative x-axis
        { x: 0, y: 0, z: 3 },   // 3 blocks away on the z-axis
        { x: 0, y: 0, z: -3 },  // 3 blocks away on the negative z-axis
    ];

    // Array to store spawned mobs for tracking
    this.mobsToTrack[block.id] = [];

    // Spawn 4 mobs at different locations and track them
    for (let i = 0; i < spawnOffsets.length; i++) {
        let offset = spawnOffsets[i];
        let spawnLocation = {
            x: pos.x + offset.x,//
            y: pos.y + offset.y,
            z: pos.z + offset.z
        };
        
        let mob = this.createEntity(mobType, spawnLocation);
        this.mobsToTrack[block.id].push(mob);
    }

    // Show message in action bar when mobs are spawned
    this.sendActionBarMessage(player, `The ${element} element has spawned enemies`);

    // Reward the player based on the item held
    this.spawnRewardOnTopOfBlock(block, rewardItem);
};

// Special function for spawning Skeletons with armor
system.spawnMobForItemWithArmor = function(block, player, mobType, itemName, rewardItem, armorItem) {
    let pos = block.getComponent("minecraft:position").data;
    
    // Array to store the positions of spawned mobs to ensure they spawn at separate locations
    let spawnOffsets = [
        { x: 2, y: 0, z: 0 },   // 3 blocks away on the x-axis
        { x: -2, y: 0, z: 0 },  // 3 blocks away on the negative x-axis
        { x: 0, y: 0, z: 2 },   // 3 blocks away on the z-axis
        { x: 0, y: 0, z: -2 },  // 3 blocks away on the negative z-axis
    ];

    // Array to store spawned mobs for tracking
    this.mobsToTrack[block.id] = [];

    // Spawn 4 mobs at different locations and track them
    for (let i = 0; i < spawnOffsets.length; i++) {
        let offset = spawnOffsets[i];
        let spawnLocation = {
            x: pos.x + offset.x,
            y: pos.y + offset.y,
            z: pos.z + offset.z
        };
        
        let mob = this.createEntity(mobType, spawnLocation);

        // Equip the Skeleton with armor (diamond chestplate)
        mob.addComponent('minecraft:armor', { items: [{ id: armorItem, damage: 0 }] });

        this.mobsToTrack[block.id].push(mob);
    }

    // Show message in action bar when mobs are spawned
    this.sendActionBarMessage(player, `${itemName} mobs have spawned with armor!`);

    // Reward the player based on the item held
    this.spawnRewardOnTopOfBlock(block, rewardItem);
};

// Special function for spawning Iron Golems (only 2 mobs)
system.spawnIronGolems = function(block, player, itemName, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    
    // Spawn 2 Iron Golems at different locations
    let spawnOffsets = [
        { x: 3, y: 0, z: 0 },   // 3 blocks away on the x-axis
        { x: -3, y: 0, z: 0 },  // 3 blocks away on the negative x-axis
    ];

    // Array to store spawned mobs for tracking
    this.mobsToTrack[block.id] = [];

    // Spawn only 2 Iron Golems and track them
    for (let i = 0; i < spawnOffsets.length; i++) {
        let offset = spawnOffsets[i];
        let spawnLocation = {
            x: pos.x + offset.x,
            y: pos.y + offset.y,
            z: pos.z + offset.z
        };
        
        let mob = this.createEntity("minecraft:iron_golem", spawnLocation);
        this.mobsToTrack[block.id].push(mob);
    }

    // Show message in action bar when mobs are spawned
    this.sendActionBarMessage(player, `${itemName} mobs have spawned!`);

    // Reward the player based on the item held
    this.spawnRewardOnTopOfBlock(block, rewardItem);
};

// Function to create an entity at a specific position
system.createEntity = function(entityId, position) {
    let entity = this.createEntity(entityId, position);
    return entity;
};

// Function to send a message to a player's action bar
system.sendActionBarMessage = function(player, message) {
    player.runCommand(`/title ${player.name} actionbar ${message}`);
};

// Handle entity death and check if all spawned mobs are defeated
system.onEntityDeath = function(eventData) {
    let deadEntity = eventData.data.entity;
    let blockId = this.findBlockForMob(deadEntity);

    // If the mob was spawned by a trial spawner
    if (blockId && this.mobsToTrack[blockId]) {
        // Remove the mob from the tracking list
        this.mobsToTrack[blockId] = this.mobsToTrack[blockId].filter(mob => mob.id !== deadEntity.id);

        // If all mobs have been defeated, spawn a reward on top of the block
        if (this.mobsToTrack[blockId].length === 0) {
            this.spawnRewardOnTopOfBlock(blockId);
        }
    }
};

// Find the block ID that spawned a particular mob
system.findBlockForMob = function(mob) {
    for (let blockId in this.mobsToTrack) {
        if (this.mobsToTrack[blockId].some(spawnedMob => spawnedMob.id === mob.id)) {
            return blockId;
        }
    }
    return null;
};

// Spawn a reward on top of the block based on the held item
system.spawnRewardOnTopOfBlock = function(block, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    let rewardLocation = {
        x: pos.x,
        y: pos.y + 1,  // Spawn the reward 1 block above the original block
        z: pos.z
    };

    // Spawn the specified reward item (could be any item like emeralds, blaze powder, etc.)
    this.createItem(rewardLocation, rewardItem);

    // Show message in action bar when the reward spawns
    this.sendActionBarMessageToAll(`All mobs defeated! A reward (${rewardItem}) has spawned on top of the block.`);
};

// Function to create an item at a specific position
system.createItem = function(position, itemId) {
    let item = this.createItem(itemId, position);
    return item;
};

// Send action bar message to all players
system.sendActionBarMessageToAll = function(message) {
    let players = this.server.getPlayers();
    for (let i = 0; i < players.length; i++) {
        this.sendActionBarMessage(players[i], message);
    }
};
