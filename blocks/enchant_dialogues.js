import { world } from "@minecraft/server";

// Define the custom component that opens a dialogue
const BlockDialogueComponent = {
    // Triggered when a player interacts with the block
    onPlayerInteract({ player, block }) {
        // Ensure the player and block are valid
        if (!player || !block) return;

        // Get the tags of the block
        const tags = block.getTags();

        // Determine the dialogue to open based on the block tags
        let dialogue = '';

        if (tags.includes('tag1')) {
            dialogue = 'tool_util_menu';
        } else if (tags.includes('tag2')) {
            dialogue = 'dialogue2';
        } else if (tags.includes('tag3')) {
            dialogue = 'dialogue3';
        } else if (tags.includes('tag4')) {
            dialogue = 'dialogue4';
        } else if (tags.includes('tag5')) {
            dialogue = 'dialogue5';
        } else if (tags.includes('tag6')) {
            dialogue = 'dialogue6';
        } else if (tags.includes('tag7')) {
            dialogue = 'dialogue7';
        }

        // Only run the command if a valid dialogue is found
        if (dialogue) {
            player.runCommand(`dialogue open @e[type=npc,c=1] @initiator ${dialogue}`);
        }
    }
};

// Register the custom component
world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    // Register the custom component under a specific identifier
    blockComponentRegistry.registerCustomComponent("awx:enchant_page", BlockDialogueComponent);
});

// Apply the custom component to the block in its JSON file
