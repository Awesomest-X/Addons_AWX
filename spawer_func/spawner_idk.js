let system = server.registerSystem(0, 0);
let interactionState = {
    echoShardUsed: false,
    netherStarUsed: false,
};

system.initialize = function() {
    this.listenForEvent("minecraft:block_interacted", (eventData) => this.onBlockInteracted(eventData));
    this.listenForEvent("minecraft:entity_die", (eventData) => this.onEntityDeath(eventData));
    this.mobsToTrack = {}; // Object to track spawned mobs
    this.activeTrials = {}; // Object to store active trials
    this.startCheckingBounds();
};

system.onBlockInteracted = function(eventData) {
    let block = eventData.data.block;
    let player = eventData.data.player;

    if (block.hasTag('trial_spawner')) {
        let heldItem = this.getHeldItem(player);
        
        if (heldItem === "minecraft:prismarine_shard") {
            this.startTrial(block, player, "minecraft:guardian", "Water", "awx:book_of_water", "minecraft:trident", [
                { id: "minecraft:channeling", level: 1 }  // Channeling for Water Trident
            ]);
        } else if (heldItem === "minecraft:blaze_rod") {
            this.startTrial(block, player, "minecraft:blaze", "Fire", "awx:book_of_fire", "minecraft:blaze_rod", [
                { id: "minecraft:fire_aspect", level: 2 }  // Fire Aspect for Blaze Rod
            ]);
        } else if (heldItem === "minecraft:breeze_rod") {
            this.startTrialWithArmor(block, player, "minecraft:skeleton", "Air", "awx:book_of_air", "minecraft:diamond_chestplate", "minecraft:bow", [
                { id: "minecraft:power", level: 3 }  // Power for Bow
            ]);
        } else if (heldItem === "minecraft:pointed_dripstone") {
            this.startTrial(block, player, "minecraft:blaze", "Earth", "awx:book_of_earth", "minecraft:diamond_pickaxe", [
                { id: "minecraft:efficiency", level: 4 }  // Efficiency for Diamond Pickaxe
            ]);
        } else if (heldItem === "minecraft:iron_ingot") {
            this.startIronGolemTrial(block, player, "Steel", "awx:book_of_steel", "minecraft:diamond_sword", [
                { id: "minecraft:sharpness", level: 5 }  // Sharpness for Diamond Sword
            ]);
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

system.startTrial = function(block, player, mobType, element, rewardItem, elementalWeaponReward, elementalWeaponEnchantments) {
    let pos = block.getComponent("minecraft:position").data;
    this.activeTrials[block.id] = {
        player,
        center: { x: pos.x, y: pos.y, z: pos.z },
        rewardItem,
        elementalWeaponReward,
        elementalWeaponEnchantments
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

system.startCheckingBounds = function() {
    this.listenForEvent("minecraft:tick", () => {
        for (let blockId in this.activeTrials) {
            let trial = this.activeTrials[blockId];
            let { player, center } = trial;

            let playerPos = player.getComponent("minecraft:position").data;
            if (this.distance(playerPos, center) > 10) {
                player.runCommand(`tp ${center.x} ${center.y} ${center.z}`);
            }

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

system.endTrial = function(blockId) {
    let trial = this.activeTrials[blockId];
    if (!trial) return;

    let { player, center, rewardItem, elementalWeaponReward, elementalWeaponEnchantments } = trial;

    // Spawn primary reward item (the book)
    this.spawnRewardOnTopOfBlock(blockId, rewardItem);
    
    // Spawn elemental weapon reward item with enchantments
    let enchantedWeapon = this.spawnEnchantedWeapon(elementalWeaponReward, elementalWeaponEnchantments);
    this.spawnRewardOnTopOfBlock(blockId, enchantedWeapon);

    this.sendActionBarMessage(player, "Trial complete! Your enchanted rewards have spawned.");
    this.endTrial(blockId);
};

system.spawnEnchantedWeapon = function(itemId, enchantments) {
    let weapon = server.createEntity(itemId);
    weapon.addComponent("minecraft:enchantments", enchantments);  // Add enchantments to the weapon
    return weapon;
};

system.onEntityDeath = function(eventData) {
    let deadEntity = eventData.data.entity;
    let blockId = this.findBlockForMob(deadEntity);

    if (blockId && this.mobsToTrack[blockId]) {
        // Remove the defeated mob from the tracking list
        this.mobsToTrack[blockId] = this.mobsToTrack[blockId].filter(mob => mob.id !== deadEntity.id);

        // Check if all mobs for this block have been defeated
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

system.getHeldItem = function(player) {
    let inventory = player.getComponent("minecraft:inventory").container;
    let slot = inventory.getSlot(0);
    
    if (slot) {
        return slot.id;
    }
    return null;
};

system.spawnSpecialMob = function(block, player) {
    let pos = block.getComponent("minecraft:position").data;
    let spawnLocation = { x: pos.x + 5, y: pos.y, z: pos.z };

    let mob = this.createEntity("minecraft:evoker", spawnLocation);

    mob.addComponent('minecraft:armor', {
        items: [{
            id: "minecraft:diamond_chestplate",
            damage: 0
        }]
    });

    this.mobsToTrack[block.id] = [mob];
    this.sendActionBarMessage(player, "A special mob has been summoned!");
};

system.spawnMobForItem = function(block, player, mobType, element, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    let spawnOffsets = [
        { x: 3, y: 0, z: 0 },
        { x: -3, y: 0, z: 0 },
        { x: 0, y: 0, z: 3 },
        { x: 0, y: 0, z: -3 },
    ];

    this.mobsToTrack[block.id] = [];

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

    this.spawnRewardOnTopOfBlock(block.id, rewardItem);
};

system.spawnRewardOnTopOfBlock = function(blockId, item) {
    let block = server.getBlock(blockId);
    let pos = block.getComponent("minecraft:position").data;

    let rewardEntity = server.createEntity(item);
    rewardEntity.addComponent("minecraft:position", { x: pos.x, y: pos.y + 1, z: pos.z });
};

system.sendActionBarMessage = function(player, message) {
    player.runCommand(`tellraw @s {"rawtext":[{"text":"${message}"}]}`);
};
