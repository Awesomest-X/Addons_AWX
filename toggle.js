import { system, world, BlockPermutation } from "@minecraft/server";

// Define the two block states to toggle between
const BLOCK_STATE_1 = "minecraft:redstone_lamp[lit=false]";
const BLOCK_STATE_2 = "minecraft:redstone_lamp[lit=true]";

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { block, player } = event;
    if (!block) return;

    const blockLocation = block.location;
    const blockType = block.typeId;
    
    // Get current block permutation
    const currentPermutation = block.permutation;
    
    // Determine new block state
    let newPermutation;
    if (blockType === "minecraft:redstone_lamp") {
        newPermutation = currentPermutation.matches(BLOCK_STATE_1)
            ? BlockPermutation.resolve(BLOCK_STATE_2)
            : BlockPermutation.resolve(BLOCK_STATE_1);

        // Set the new block state
        block.setPermutation(newPermutation);
    }
});
