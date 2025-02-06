import { system, world, BlockPermutation, ItemStack } from "@minecraft/server";

// Define the four block growth states
const BLOCK_STATE_1 = "custom:plant_stage_1";
const BLOCK_STATE_2 = "custom:plant_stage_2";
const BLOCK_STATE_3 = "custom:plant_stage_3";
const BLOCK_STATE_4 = "custom:plant_stage_4";
const REWARD_ITEM = "minecraft:apple";

// Growth timing (in ticks, 1 second = 20 ticks)
const STAGE_1_DURATION = 1000;
const STAGE_2_DURATION = 1000;
const STAGE_3_DURATION = 3000; // Lasts longer
const STAGE_4_DURATION = 1000;

const plantGrowthTimes = new Map();

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { block, player } = event;
    if (!block) return;

    const blockLocation = block.location;
    const blockType = block.typeId;
    const currentPermutation = block.permutation;

    if (blockType.startsWith("custom:plant_stage")) {
        if (blockType === BLOCK_STATE_4) {
            // Give the player an item
            const item = new ItemStack(REWARD_ITEM, 1);
            player.getComponent("minecraft:inventory").container.addItem(item);
            
            // Revert to stage 3
            block.setPermutation(BlockPermutation.resolve(BLOCK_STATE_3));
            plantGrowthTimes.set(blockLocation, system.currentTick + STAGE_3_DURATION);
        }
    }
});

system.runInterval(() => {
    for (const [location, growTime] of plantGrowthTimes) {
        if (system.currentTick >= growTime) {
            const block = world.getBlock(location);
            if (block) {
                if (block.typeId === BLOCK_STATE_1) {
                    block.setPermutation(BlockPermutation.resolve(BLOCK_STATE_2));
                    plantGrowthTimes.set(location, system.currentTick + STAGE_2_DURATION);
                } else if (block.typeId === BLOCK_STATE_2) {
                    block.setPermutation(BlockPermutation.resolve(BLOCK_STATE_3));
                    plantGrowthTimes.set(location, system.currentTick + STAGE_3_DURATION);
                } else if (block.typeId === BLOCK_STATE_3) {
                    block.setPermutation(BlockPermutation.resolve(BLOCK_STATE_4));
                    plantGrowthTimes.set(location, system.currentTick + STAGE_4_DURATION);
                }
            }
        }
    }
}, 20);
