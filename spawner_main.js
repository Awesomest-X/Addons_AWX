let system = server.registerSystem(0, 0);

system.initialize = function() {
    this.listenForEvent("minecraft:block_interacted", (eventData) => this.onBlockInteracted(eventData));
    this.listenForEvent("minecraft:entity_die", (eventData) => this.onEntityDeath(eventData));
    this.mobsToTrack = {}; // Object to track spawned mobs
};

system.onBlockInteracted = function(eventData) {
    let block = eventData.data.block;
    let player = eventData.data.player;

    // Check if the block is the trial spawner block and if the player is holding a specified item
    if (block.hasTag('trial_gauntlet')) {
        let heldItem = this.getHeldItem(player);
        
        if (heldItem === "minecraft:prismarine_shard") {
            this.spawnMobForItem(block, player, "minecraft:guardian", "Prismarine Shard", "minecraft:emerald"); // Prismarine Shard -> Emerald
        } else if (heldItem === "minecraft:blaze_rod") {
            this.spawnMobForItem(block, player, "minecraft:blaze", "Blaze Rod", "minecraft:blaze_powder"); // Blaze Rod -> Blaze Powder
        } else if (heldItem === "minecraft:breeze_rod") {
            this.spawnMobForItem(block, player, "minecraft:skeleton", "Breeze Rod", "minecraft:bone"); // Breeze Rod -> Bone
        } else if (heldItem === "minecraft:iron_ingot") {
            this.spawnMobForItem(block, player, "minecraft:iron_golem", "Iron Ingot", "minecraft:iron_sword"); // Iron Ingot -> Iron Sword
        } else {
            this.sendActionBarMessage(player, "You must hold a Prismarine Shard, Blaze Rod, Breeze Rod, or Iron Ingot.");
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

// Spawn the mob based on the item held and display action bar message
system.spawnMobForItem = function(block, player, mobType, itemName, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    
    // Array to store the positions of spawned mobs to ensure they spawn at separate locations
    let spawnOffsets = [
        { x: 2, y: 0, z: 0 },   // 2 blocks away on the x-axis
        { x: -2, y: 0, z: 0 },  // 2 blocks away on the negative x-axis
        { x: 0, y: 0, z: 2 },   // 2 blocks away on the z-axis
        { x: 0, y: 0, z: -2 },  // 2 blocks away on the negative z-axis
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
