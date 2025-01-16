import { ItemComponentUseOnEvent, ItemCustomComponent } from "@minecraft/server";

  initEvent.itemComponentRegistry.registerCustomComponent("awx:play_pigstep", {
  onUse(arg: ItemComponentUseOnEvent) {
    arg.source.playSound("record.pigstep"); 
  }
}
