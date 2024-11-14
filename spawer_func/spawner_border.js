let system = server.registerSystem(0, 0);
let interactionState = {
    echoShardUsed: false,
    netherStarUsed: false,
};
system.initialize = function() {
    this.listenForEvent("minecraft:block_interacted", (eventData) => this.onBlockInteracted(eventData));
    this.listenForEvent("minecraft:entity_die", (eventData) => this.onEntityDeath(eventData));
    this.mobsToTrack = {}; // Object to track spawned mobs
    this.trialBorders = {}; // Object to store trial borders
    this.activeTrials = {}; // Object to store active trials
    this.startCheckingBounds();
};

system.onBlockInteracted = function(eventData) {
    let block = eventData.data.block;
    let player = eventData.data.player;

    if (block.hasTag('trial_spawner')) {
        let heldItem = this.getHeldItem(player);
        
        if (heldItem === "minecraft:prismarine_shard") {
            this.startTrial(block, player, "minecraft:guardian", "Water", "awx:book_of_water");
        } else if (heldItem === "minecraft:blaze_rod") {
            this.startTrial(block, player, "minecraft:blaze", "Fire", "awx:book_of_fire");
        } else if (heldItem === "minecraft:breeze_rod") {
            this.startTrialWithArmor(block, player, "minecraft:skeleton", "Air", "awx:book_of_air", "minecraft:diamond_chestplate");
        } else if (heldItem === "minecraft:pointed_dripstone") {
            this.startTrial(block, player, "minecraft:blaze", "Earth", "awx:book_of_earth");
        } else if (heldItem === "minecraft:iron_ingot") {
            this.startIronGolemTrial(block, player, "Steel", "awx:book_of_steel");
        } else if (heldItem.id === "minecraft:echo_shard" && !interactionState.echoShardUsed) {
            interactionState.echoShardUsed = true;
            this.sendActionBarMessage(player, "Echo Shard used. Now hold a Nether Star to progress.");
            return;
        } else if (heldItem.id === "minecraft:nether_star" && interactionState.echoShardUsed && !interactionState.netherStarUsed) {
            interactionState.netherStarUsed = true;
            this.sendActionBarMessage(player, "Nether Star used. Now hold a Dragon's Head to summon a special mob.");
            return;
        } else if (heldItem.id === "minecraft:dragon_head" && interactionState.netherStarUsed) {
            this.spawnSpecialMob(block, player);
            this.sendActionBarMessage(player, "Dragon's Head used! A special mob has been summoned.");
            return;
        } else {
            this.sendActionBarMessage(player, "You must insert an elemental item");
        }
    }
};

system.startTrial = function(block, player, mobType, element, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    this.activeTrials[block.id] = {
        player,
        center: { x: pos.x, y: pos.y, z: pos.z },
        rewardItem,
    };

    this.spawnMobForItem(block, player, mobType, element, rewardItem);
    this.createBorderParticles(pos);
};

system.createBorderParticles = function(center) {
    for (let x = center.x - 10; x <= center.x + 10; x++) {
        for (let z = center.z - 10; z <= center.z + 10; z++) {
            let distance = Math.sqrt((x - center.x) ** 2 + (z - center.z) ** 2);
            if (Math.abs(distance - 10) < 1) { // Slightly inside or outside of 10 blocks
                this.spawnParticle("minecraft:portal", { x, y: center.y, z });
            }
        }
    }
};

// Function to restrict movement within a 10-block radius of the spawner block
system.startCheckingBounds = function() {
    this.listenForEvent("minecraft:tick", () => {
        for (let blockId in this.activeTrials) {
            let trial = this.activeTrials[blockId];
            let { player, center } = trial;

            // Check if player is outside the 10-block radius
            let playerPos = player.getComponent("minecraft:position").data;
            if (this.distance(playerPos, center) > 10) {
                player.runCommand(`tp ${center.x} ${center.y} ${center.z}`);
            }

            // Check if any mobs are outside the 10-block radius
            if (this.mobsToTrack[blockId]) {
                this.mobsToTrack[blockId] = this.mobsToTrack[blockId].filter(mob => {
                    let mobPos = mob.getComponent("minecraft:position").data;
                    if (this.distance(mobPos, center) > 10) {
                        mob.runCommand(`tp ${center.x} ${center.y} ${center.z}`);
                    }
                    return mob;
                });
            }
        }
    });
};

system.distance = function(pos1, pos2) {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.z - pos2.z) ** 2);
};

// When trial ends, remove the border particles and reset the trial state
system.endTrial = function(blockId) {
    delete this.activeTrials[blockId];
    delete this.mobsToTrack[blockId];
    
    // Clear particles around the trial area
    let center = this.activeTrials[blockId].center;
    for (let x = center.x - 10; x <= center.x + 10; x++) {
        for (let z = center.z - 10; z <= center.z + 10; z++) {
            this.spawnParticle("minecraft:clear_particle", { x, y: center.y, z }); // This assumes a clear particle, substitute as needed
        }
    }
};

system.onEntityDeath = function(eventData) {
    let deadEntity = eventData.data.entity;
    let blockId = this.findBlockForMob(deadEntity);

    if (blockId && this.mobsToTrack[blockId]) {
        this.mobsToTrack[blockId] = this.mobsToTrack[blockId].filter(mob => mob.id !== deadEntity.id);

        if (this.mobsToTrack[blockId].length === 0) {
            let trial = this.activeTrials[blockId];
            if (trial) {
                this.spawnRewardOnTopOfBlock(blockId, trial.rewardItem);
                this.sendActionBarMessage(trial.player, "Trial complete! Your reward has spawned.");
                this.endTrial(blockId);
            }
        }
    }
};
