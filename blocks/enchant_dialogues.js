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

        if (tags.includes('power_tool')) {
            dialogue = 'tool_util_menu';
        } else if (tags.includes('water_element')) {
            dialogue = 'water_dialogue';
        } else if (tags.includes('fire_element')) {
            dialogue = 'fire_dialogue';
        } else if (tags.includes('earth_element')) {
            dialogue = 'earth_dialogue';
        } else if (tags.includes('air_element')) {
            dialogue = 'air_dialogue';
        } else if (tags.includes('power_weapon')) {
            dialogue = 'weapons_combat_menu';
        } else if (tags.includes('storm_element')) {
            dialogue = 'storm_dialogue';
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
