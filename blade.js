import { world, system, EntityEffect } from "@minecraft/server";

// Define the custom component for the item behavior
const SoulHitItemComponent = {
    // Triggered when the item is used to hit an entity
    onHitEntity(event) {
        const { hitEntity, attackingEntity, itemStack } = event;
        
        // Ensure the attacking entity is a player
        if (!(attackingEntity && attackingEntity.isPlayer())) {
            return;
        }

        // Inflict Slowness 40 on the hit entity
        hitEntity.addEffect(EntityEffect.slowness(40), 50);
      hitEntity.playSound("game.player.attack.strong", 1, 1);// Duration of 100 ticks
        // Optionally, play a sound or add any other effects here
    }
};

// Register the custom component
world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("wiki:soul_hit_item", SoulHitItemComponent);
});
