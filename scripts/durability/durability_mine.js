import { EquipmentSlot, GameMode, Player } from "@minecraft/server";

const DurabilityToolComponent = {
onMineBlock({ source }) {
    if (!(source instanceof Player)) return;

    const equippable = source.getComponent("minecraft:equippable");
    if (!equippable) return;

    const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainhand.hasItem()) return;

    // Apply durability damage when not in creative mode
    if (source.getGameMode() === GameMode.creative) return;

    const itemStack = mainhand.getItem(); // Allows us to get item components

    const durability = itemStack.getComponent("minecraft:durability");
    if (!durability) return;

    // Factor in unbreaking enchantment
    const enchantable = itemStack.getComponent("minecraft:enchantable");
    const unbreakingLevel = enchantable?.getEnchantment("unbreaking")?.level;

    const damageChance = durability.getDamageChance(unbreakingLevel) / 100;

    if (Math.random() > damageChance) return; // Randomly skip damage based on unbreaking level

    // Damage the item
    const shouldBreak = durability.damage === durability.maxDurability;

    if (shouldBreak) {
        mainhand.setItem(undefined); // Remove the item
        source.playSound("random.break"); // Play break sound
    } else {
        durability.damage++; // Increase durability damage
        mainhand.setItem(itemStack); // Update item in main hand
    }
}
}

  
world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("wiki:tool_durability", DurabilityToolComponent);
});
