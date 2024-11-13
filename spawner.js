let system = server.registerSystem(0, 0);

system.initialize = function() {
    this.listenForEvent("minecraft:block_interacted", (eventData) => this.onBlockInteracted(eventData));
    this.listenForEvent("minecraft:entity_die", (eventData) => this.onEntityDeath(eventData));
    this.mobsToTrack = {}; // Object to track spawned mobs
};

system.onBlockInteracted = function(eventData) {
    let block = eventData.data.block;
    let player = eventData.data.player;

    // Check if the block has the tag 'trial_spawner' and if the player is holding the key item
    if (block.hasTag('trial_spawner') && this.isPlayerHoldingKey(player)) {
        this.spawnTrialEntities(block, player);
    }
};

// Check if the player is holding the key item
system.isPlayerHoldingKey = function(player) {
    let inventory = player.getComponent("minecraft:inventory").container;
    let keyItem = "minecraft:diamond"; // The item you want to use as the key (can change this)

    // Check each slot in the player's inventory for the key item
    for (let i = 0; i < inventory.size(); i++) {
        let slot = inventory.getSlot(i);
        if (slot && slot.id === keyItem) {
            return true;
        }
    }
    return false;
};

// Spawn four mobs of the same type at the block location
system.spawnTrialEntities = function(block, player) {
    let pos = block.getComponent("minecraft:position").data;
    let spawnLocation = pos;

    // Example mob type: Zombie. You can change this to any entity type.
    let mobType = "minecraft:zombie"; 

    // Array to store spawned mobs for tracking
    this.mobsToTrack[block.id] = [];

    // Spawn 4 mobs of the same type and track them
    for (let i = 0; i < 4; i++) {
        let mob = this.createEntity(mobType, spawnLocation);
        this.mobsToTrack[block.id].push(mob);
    }

    // Show message in action bar when mobs are spawned
    this.sendActionBarMessage(player, "Four trial mobs have spawned!");
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

// Spawn a reward on top of the block
system.spawnRewardOnTopOfBlock = function(blockId) {
    let block = server.getEntity(blockId);
    if (block) {
        let pos = block.getComponent("minecraft:position").data;
        let rewardLocation = {
            x: pos.x,
            y: pos.y + 1,  // Spawn the reward 1 block above the original block
            z: pos.z
        };

        // Example of spawning a reward item (golden apple)
        let rewardItem = "minecraft:golden_apple"; 
        this.createItem(rewardLocation, rewardItem);

        // Show message in action bar when the reward spawns
        this.sendActionBarMessageToAll("All mobs defeated! A reward has spawned on top of the block.");
    }
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
