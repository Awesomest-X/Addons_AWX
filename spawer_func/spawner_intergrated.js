let system = server.registerSystem(0, 0);
let interactionState = {
    echoShardUsed: false,
    netherStarUsed: false,
};



system.randomRewards = [
    // Medium rarity items (multiplied by 1.5, rounded up)
    "minecraft:diamond_axe",
    "minecraft:bow",
    "minecraft:iron_sword",
    "minecraft:iron_pickaxe",
    "minecraft:flint_and_steel",
    "minecraft:shield",
    "minecraft:bucket",
    
    // Super rare items
    "minecraft:nether_star",
    "minecraft:dragon_egg",

    // Common rarity items (doubled)
    "minecraft:stone",
    "minecraft:wooden_sword",
    "minecraft:iron_axe",
    "minecraft:torch",
    "minecraft:bread",
    "minecraft:leather_helmet",
    "minecraft:oak_planks",
    "minecraft:cobblestone",
    "minecraft:wooden_shovel",
    "minecraft:sticks",
    "minecraft:leather_boots",

    // New super rare item
    "minecraft:enchanted_golden_apple",


    // Armor trims in Minecraft
    "minecraft:armor_trim_sentry",
    "minecraft:armor_trim_dune",
    "minecraft:armor_trim_tide",
    "minecraft:armor_trim_ward",
    "minecraft:armor_trim_rib",
    "minecraft:armor_trim_flow",
    
];

system.enchantedRewards = [
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:sharpness',lvl:2}]}",
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:unbreaking',lvl:2}]}",
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:fortune',lvl:1}]}",
    
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:respiration',lvl:1}]}",
    
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:sharpness',lvl:1}]}",
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:protection',lvl:1}]}",
    "minecraft:enchanted_book{Enchantments:[{id:'minecraft:fire_aspect',lvl:1}]}"
];

system.initialize = function() {
    this.listenForEvent("minecraft:block_interacted", (eventData) => this.onBlockInteracted(eventData));
    this.listenForEvent("minecraft:entity_die", (eventData) => this.onEntityDeath(eventData));
    this.mobsToTrack = {}; // Object to track spawned mobs
    this.activeTrial = null; // Store the active trial
    this.startCheckingBounds();
};

system.onBlockInteracted = function(eventData) {
    let block = eventData.data.block;
    let player = eventData.data.player;

    // Check if a trial is already active
    if (this.activeTrial) {
        this.sendActionBarMessage(player, "A trial is already active. Complete it before starting a new one.");
        return;
    }

    if (block.hasTag('trial_spawner')) {
        let heldItem = this.getHeldItem(player);
            
        if (heldItem === "minecraft:prismarine_shard") {
            this.startTrial(block, player, "minecraft:guardian", "Water", "awx:book_of_water", "minecraft:trident", [
                { id: "minecraft:channeling", level: 1 }
            ]);
            this.removeItemFromPlayer(player, "minecraft:prismarine_shard");
        } else if (heldItem === "minecraft:blaze_rod") {
            this.startTrial(block, player, "minecraft:blaze", "Fire", "awx:book_of_fire", "minecraft:blaze_rod", [
                { id: "minecraft:fire_aspect", level: 2 }
            ]);
            this.removeItemFromPlayer(player, "minecraft:blaze_rod");
        } else if (heldItem === "minecraft:breeze_rod") {
            this.startTrialWithArmor(block, player, "minecraft:skeleton", "Air", "awx:book_of_air", "minecraft:diamond_chestplate", "minecraft:bow", [
                { id: "minecraft:power", level: 3 }
            ]);
            this.removeItemFromPlayer(player, "minecraft:breeze_rod");
        } else if (heldItem === "minecraft:pointed_dripstone") {
            this.startTrial(block, player, "minecraft:blaze", "Earth", "awx:book_of_earth", "minecraft:diamond_pickaxe", [
                { id: "minecraft:efficiency", level: 4 }
            ]);
            this.removeItemFromPlayer(player, "minecraft:pointed_dripstone");
        } else if (heldItem === "minecraft:iron_ingot") {
            this.startIronGolemTrial(block, player, "Steel", "awx:book_of_steel", "minecraft:diamond_sword", [
                { id: "minecraft:sharpness", level: 5 }
            ]);
            this.removeItemFromPlayer(player, "minecraft:iron_ingot");
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
    this.activeTrial = {
        player,
        center: { x: pos.x, y: pos.y, z: pos.z },
        rewardItem,
        elementalWeaponReward,
        elementalWeaponEnchantments,
        blockId: block.id
    };

    // Start trial by spawning the mob and adding a visual effect
    this.spawnMobForItem(block, player, mobType, element, rewardItem);

    // Create border particles around the block
    this.createBorderParticles(pos);

    // Add visual effect to show the trial has started (e.g., "portal" effect)
    this.spawnParticleEffect("minecraft:portal", { x: pos.x, y: pos.y + 1, z: pos.z }, 50);
};
system.spawnParticleEffect = function(effectType, location, count) {
    for (let i = 0; i < count; i++) {
        this.spawnParticle(effectType, location);
    }
};

system.createBorderParticles = function(center) {
    // Define the distance for the border (radius)
    let radius = 10;
    
    // Define positions for corner and edge particles
    let positions = [
        { x: center.x + radius, y: center.y, z: center.z }, // Right
        { x: center.x - radius, y: center.y, z: center.z }, // Left
        { x: center.x, y: center.y, z: center.z + radius }, // Front
        { x: center.x, y: center.y, z: center.z - radius }, // Back
        { x: center.x + radius, y: center.y, z: center.z + radius }, // Top-Right
        { x: center.x - radius, y: center.y, z: center.z - radius }, // Bottom-Left
        { x: center.x + radius, y: center.y, z: center.z - radius }, // Top-Left
        { x: center.x - radius, y: center.y, z: center.z + radius }  // Bottom-Right
    ];

    // Spawn particles at these positions to create a more optimized border effect
    positions.forEach(pos => {
        this.spawnParticle("minecraft:portal", pos);
    });
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
    let trial = this.activeTrial;
    if (!trial || trial.blockId !== blockId) return;

    delete this.mobsToTrack[blockId];
    
    let center = trial.center;
    for (let x = center.x - 10; x <= center.x + 10; x++) {
        for (let z = center.z - 10; z <= center.z + 10; z++) {
            this.spawnParticle("minecraft:clear_particle", { x, y: center.y, z });
        }
    }
        let randomReward = this.randomRewards[Math.floor(Math.random() * this.randomRewards.length)];
            let enchantedReward = this.enchantedRewards[Math.floor(Math.random() * this.enchantedRewards.length)];

    // Spawn both the element-specific reward and the random reward on top of the block
    this.spawnRewardOnTopOfBlock(blockId, trial.rewardItem); // Element-specific reward
    this.spawnRewardOnTopOfBlock(blockId, randomReward); // Additional random reward
    this.spawnRewardOnTopOfBlock(blockId, enchantedReward); // Additional random reward

    // Also spawn the enchanted elemental weapon reward
    let enchantedWeapon = this.spawnEnchantedWeapon(trial.elementalWeaponReward, trial.elementalWeaponEnchantments);
    this.spawnRewardOnTopOfBlock(blockId, enchantedWeapon);

    // Clear the active trial
    this.activeTrial = null;
};
system.spawnEnchantedWeapon = function(itemId, enchantments) {
    let weapon = server.createEntity(itemId);
    weapon.addComponent("minecraft:enchantments", enchantments);  // Add enchantments to the weapon
    return weapon;
};

system.onEntityDeath = function(eventData) {
    let deadEntity = eventData.data.entity;
    let blockId = this.findBlockForMob(deadEntity);

    if (!blockId) {
        console.warn(`No trial found for mob: ${deadEntity.id}`);
        return;
    }

    let trial = this.activeTrials[blockId];
    if (!trial) {
        console.warn(`No active trial found for blockId: ${blockId}`);
        return;
    }

    let { player, center, rewardItem, elementalWeaponReward, elementalWeaponEnchantments } = trial;

    if (this.mobsToTrack[blockId]) {
        this.mobsToTrack[blockId] = this.mobsToTrack[blockId].filter(mob => mob.id !== deadEntity.id);

        if (this.mobsToTrack[blockId].length === 0) {
            if (deadEntity.id === "minecraft:evoker") {
                // Special mob defeated - play an epic visual effect (e.g., fireworks or explosion)
                this.spawnParticleEffect("minecraft:explosion", center, 30); // Explosion particles at the center
                this.sendActionBarMessage(player, "You have defeated the special mob! Your rewards have spawned.");
                this.spawnSpecialRewards(blockId, player);
                this.endTrial(blockId);
            } else {
                // Regular mob defeated - play a victory effect (e.g., heart particles)
                this.spawnParticleEffect("minecraft:heart", center, 20); // Heart particles for regular trials
                this.spawnRewardOnTopOfBlock(blockId, rewardItem);
                let enchantedWeapon = this.spawnEnchantedWeapon(elementalWeaponReward, elementalWeaponEnchantments);
                this.spawnRewardOnTopOfBlock(blockId, enchantedWeapon);
                this.sendActionBarMessage(player, "Trial complete! Your reward has spawned.");
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
system.removeItemFromPlayer = function(player, itemId) {
    let inventory = player.getComponent("minecraft:inventory").container;

    for (let i = 0; i < inventory.size; i++) {
        let slot = inventory.getSlot(i);
        if (slot && slot.id === itemId) {
            slot.count -= 1;  // Decrease the item count
            if (slot.count <= 0) {
                inventory.removeItem(slot);  // Remove the item if count reaches zero
            }
            break;
        }
    }
};

    system.spawnSpecialRewards = function(blockId, player) {
    // Special book reward
    let specialBook = "awx:book_of_power";
    this.spawnRewardOnTopOfBlock(blockId, specialBook);
    
    // Enchanted weapon reward (for example, a diamond sword with special enchantments)
    let enchantedWeapon = this.spawnEnchantedWeapon("minecraft:diamond_sword", [
        { id: "minecraft:sharpness", level: 5 }, // Example enchantment
        { id: "minecraft:unbreaking", level: 3 }
    ]);
    this.spawnRewardOnTopOfBlock(blockId, enchantedWeapon);
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
    this.trackMobDefeat(block, mob);
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

    this.sendActionBarMessage(player, `The ${element} element has spawned enemies`);
};
system.spawnMobForItemWithArmor = function(block, player, mobType, element, rewardItem, armorItem) {
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
    this.sendActionBarMessage(player, `${element} mobs have spawned`);

  
};

// Special function for spawning Iron Golems (only 2 mobs)
system.spawnIronGolems = function(block, player, element, rewardItem) {
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
    this.sendActionBarMessage(player, `${element} mobs have spawned!`);

    };

system.trackMobDefeat = function(block, mob) {
    // This function now doesn't need to override `onEntityDeath`.
    // The death of mobs is already handled by the `onEntityDeath` event.
    // You can also keep a reference of the mob for additional handling if necessary.
    console.log(`Tracking defeat of mob: ${mob.id} for block: ${block.id}`);
};


system.findBlockForMob = function(mob) {
    for (let blockId in this.mobsToTrack) {
        if (this.mobsToTrack[blockId].some(spawnedMob => spawnedMob.id === mob.id)) {
            return blockId;
        }
    }
    return null;
};

system.spawnRewardOnTopOfBlock = function(block, rewardItem) {
    let pos = block.getComponent("minecraft:position").data;
    let rewardLocation = { x: pos.x, y: pos.y + 1, z: pos.z };
    this.createItem(rewardLocation, rewardItem);
    this.sendActionBarMessageToAll(`All mobs defeated! A reward (${rewardItem}) has spawned on top of the block.`);
};

system.createItem = function(location, itemId) {
    let itemEntity = this.createEntity("minecraft:item", location);
    itemEntity.addComponent("minecraft:item", { item: itemId });
};

system.sendActionBarMessage = function(player, message) {
    player.runCommand(`tellraw @s {"rawtext":[{"text":"${message}"}]}`);
};
