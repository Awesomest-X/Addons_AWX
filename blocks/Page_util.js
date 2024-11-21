import { world } from "@minecraft/server";

// Define the custom component that opens a dialogue
const BlockDialogueComponent = {
    // Triggered when a player interacts with the block
    onPlayerInteract({ player, block }) {
        // Ensure the player and block are valid
        if (!player || !block) return;

        // Run the command to open a dialogue menu for the player
        player.runCommand(`dialogue open @e[type=npc,c=1] @initiator tool_util_menu`);
    }
};

// Register the custom component
world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    // Register the custom component under a specific identifier
    blockComponentRegistry.registerCustomComponent("wiki:block_dialogue_component", BlockDialogueComponent);
});

// Apply the custom component to the block in its JSON file
