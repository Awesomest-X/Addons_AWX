import { world, system } from '@minecraft/server';
import "./blocks/double_plant.js"

function mainTick() {
    if (system.currentTick === 120) {
        world.getDimension("overworld").runCommand("playsound random.orb @a");
        world.sendMessage("Thank You for downloading the §l§7PALE GARDEN PLUS §raddon! Make sure to §l§4SUBSCRIBE §rto §lMR. MASTERY §rfor more Minecraft Bedrock Addon content!");
    }
    system.run(mainTick);
}
system.run(mainTick);

const daytimeComp = {
    onTick(data) {
        const { block } = data;
        const timeOfDay = world.getTimeOfDay();

        if (timeOfDay > 13000) {
            block.setPermutation(block.permutation.withState('mc:is_daytime', false));
        } else {
            block.setPermutation(block.permutation.withState('mc:is_daytime', true));
        }
    }
}

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent('mc:daytime_component', daytimeComp);
});