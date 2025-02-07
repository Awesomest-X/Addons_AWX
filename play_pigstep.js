import { EquipmentSlot, world } from "@minecraft/server";

/** @type {import("@minecraft/server").BlockCustomComponent} */
const PlayPigstepComponent = {
    onPlayerInteract({ block, dimension, player }) {
        if (!player) return;

        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return;

        const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
        if (!mainhand || mainhand.typeId !== "awx:pigstep_cassette") return;

        // Remove the item stack from the player's hand
        mainhand.setItem(undefined);

        // Play the Pigstep sound
        dimension.playSound("record.pigstep", block.center(), {
            pitch: 0.9,
            volume: 0.9,
        });
    },
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "awx:play_pig",
        PlayPigstepComponent
    );
});
