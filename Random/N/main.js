import { world, system, EntityComponentTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Vector } from "./utils.js"

// Functions
function manaCooldownManager(player) {
    player.runCommand("/scoreboard players add @s allCooldown 1");
    player.runCommand("/scoreboard players remove @s xpBar 400");
}

//Function Sonic Deco
function sonicAreaDec(entity) {
    entity.runCommand("/particle bey:sonic_area_attack ~ ~ ~")
    entity.runCommand("/particle bey:sonic_area_attack ~1 ~ ~")
    entity.runCommand("/particle bey:sonic_area_attack ~1 ~ ~1")
    entity.runCommand("/playsound mob.warden.attack @s ~ ~ ~ 10")
}

//Function Celestial Cookie
function celestialCookie(player) {
    player.runCommand("/scoreboard players set @s xpBar 9999");
    player.runCommand("/playsound random.burp @s ~~~");
    player.runCommand("/playsound random.levelup @s ~~~");
    player.runCommand("/clear @s bey:celestial_cookie 0 1");
}

//Function Celestial Blade
function clestialBladeHit(player, hurtEntity) {
    player.runCommand("/effect @s speed 2 1 true");
    player.runCommand("/particle bey:celestial_hit ~ ~1 ~");
    player.runCommand("/damage @e[rm=1,r=5] 5");
    hurtEntity.runCommand("/damage @s 12");
}

// Functions For Gilded Guiter
function gildedGuiterDec(player) {
    player.runCommand("/playsound gilded.guiter @s ~~~");
    player.runCommand("/summon bey:gilded_guiter_radius ~~~");
}
function gildedGuiterDemonic(player) {
    player.runCommand("/effect @e[r=5,rm=1] slowness 8 2 false");
    player.runCommand("/damage @e[r=5,rm=1] 5");
    player.runCommand("/effect @s regeneration 4 2 true");
}

// Scoreboard Feature
if (!world.scoreboard.getObjective("xpBar")) { world.scoreboard.addObjective("xpBar", "xpBar"); }
if (!world.scoreboard.getObjective("twisterTest")) { world.scoreboard.addObjective("twisterTest", "twisterTest"); }
if (!world.scoreboard.getObjective("allCooldown")) { world.scoreboard.addObjective("allCooldown", "allCooldown"); }
if (!world.scoreboard.getObjective("entityTimer")) { world.scoreboard.addObjective("entityTimer", "entityTimer"); }
if (!world.scoreboard.getObjective("celestialCooldown")) { world.scoreboard.addObjective("celestialCooldown", "celestialCooldown"); }
if (!world.scoreboard.getObjective("gildedScythePlayer")) { world.scoreboard.addObjective("gildedScythePlayer", "gildedScythePlayer"); }
if (!world.scoreboard.getObjective("voidBladeTitle")) { world.scoreboard.addObjective("voidBladeTitle", "voidBladeTitle"); }
if (!world.scoreboard.getObjective("specialUndead")) { world.scoreboard.addObjective("specialUndead", "specialUndead"); }

// Action bar mappings
const actionBarsMana = {
    0: ["", "", "", "", "", "", "", "", "", "", "", ""],
    1: ["", "", "", "", "", "", "", "", "", "", "", ""],
    2: ["", "", "", "", "", "", "", "", "", "", "", ""],
    3: ["", "", "", "", "", "", "", "", "", "", "", ""],
    4: ["", "", "", "", "", "", "", "", "", "", "", ""],
    5: ["", "", "", "", "", "", "", "", "", "", "", ""]
};

const titlesCooldown = ["", "", "", "", "", "", "", "", ""];

//Run-Interval
system.runInterval(() => {
    world.getAllPlayers().forEach(player => {

        // PreAdder
        if (!player.hasTag("preadderWeapons")) {
            player.runCommandAsync(`scoreboard players set @s twisterTest 0`);
            player.runCommandAsync(`scoreboard players set @s allCooldown 0`);
            player.runCommandAsync(`scoreboard players set @s xpBar 0`);
            player.runCommandAsync(`scoreboard players set @s entityTimer 0`);
            player.runCommandAsync(`scoreboard players set @s voidBladeTitle 0`);
            player.runCommandAsync(`scoreboard players set @s celestialCooldown 0`);
            player.addTag("preadderWeapons");
        }

        //Usefull Variable
        let currentXp = world.scoreboard.getObjective("xpBar")?.getScore(player) ?? 0;
        let currentTotem = world.scoreboard.getObjective("twisterTest")?.getScore(player) ?? 0;
        let currentCooldown = world.scoreboard.getObjective("allCooldown")?.getScore(player) ?? 0;

        // Accessory
        /// Mana_Heart
        const inv = player.getComponent(`inventory`).container;

        if (currentTotem == 3 && currentXp < 400) {  // Checking currentXp as before
            for (let slot = 0; slot < inv.size; slot++) {
                let itemSlot = inv.getItem(slot);
                if (!itemSlot || !itemSlot.typeId) {
                    continue;
                }

                // Check for mana bottle
                if (itemSlot.typeId == "bey:mana_bottle") {
                    let newXp = currentXp + 800;
                    if (newXp > 1200) {
                        newXp = 1200;  // Ensure XP doesn't exceed 1200
                    }
                    world.scoreboard.getObjective("xpBar").setScore(player, newXp);  // Update XP on scoreboard
                    player.runCommand("/clear @s bey:mana_bottle 0 1");  // Remove one mana bottle
                    player.playSound("random.burp");  // Play sound feedback
                    break;  // Exit after processing one item
                }
            }
        }

        ///Hammer Of Honor
        if (currentTotem == 5) {
            if (currentCooldown != 0) {
                player.runCommand("/scoreboard players add @s allCooldown 2");
            }
        }

        // Check if the player has the equippable component
        let equippableComponent = player.getComponent("equippable");
        let currentVoidState = world.scoreboard.getObjective("voidBladeTitle")?.getScore(player);

        //Hand Equiped
        if (equippableComponent) {
            let playerHeld = equippableComponent.getEquipment(`Mainhand`);
            let playerLoc = player.location;
            let playerTimerScore = world.scoreboard.getObjective("entityTimer")?.getScore(player);

            //Mana Star
            if (playerHeld?.typeId == "bey:mana_star") {
                player.runCommand("/scoreboard players add @s xpBar 4")
            }

            //Basic Hammer Miner
            if (playerHeld?.typeId === "bey:basic_hammer_knocker") {
                player.runCommand("/enchant @s knockback 2")
            }

            //Basic Hammer Knocker
            if (playerHeld?.typeId === "bey:basic_hammer_miner") {
                player.runCommand("/enchant @s fortune 3");
            }

            // Void Blade handling
            if (playerHeld?.typeId == "bey:void_blade") {
                player.runCommand("/scoreboard players add @s entityTimer 1");
            }

            if (playerTimerScore == 9) {
                player.dimension.spawnParticle("bey:void_particle", playerLoc);
            }

            if (playerTimerScore == 10 || playerHeld?.typeId != "bey:void_blade") {
                player.runCommand("/scoreboard players set @s entityTimer 0");
            }
        }

        if (currentVoidState >= 10) {
            player.runCommand("/scoreboard players remove @s voidBladeTitle 4")
        }
        if (currentVoidState > 0 && currentVoidState < 10) {
            player.runCommand("/scoreboard players remove @s voidBladeTitle 1")
        }

        //Gilded Scythe
        if (player.hasTag("shootGilded")) {
            player.runCommandAsync(`scoreboard players add @s gildedScythePlayer 1`);
            let gildedScore = world.scoreboard.getObjective("gildedScythePlayer")?.getScore(player);

            if (gildedScore > 40) {
                player.removeTag("shootGilded");
                player.runCommandAsync(`give @s bey:gilded_scythe`);
                player.runCommandAsync(`scoreboard players set @s gildedScythePlayer 0`);
            }
        }

        //Celestial Cookie
        if (player.hasTag("celestialCookied")) {
            player.runCommandAsync(`scoreboard players add @s celestialCooldown 1`);
            let celestialScore = world.scoreboard.getObjective("celestialCooldown")?.getScore(player);

            if (celestialScore > 400) {
                player.removeTag("celestialCookied");
                player.runCommandAsync(`scoreboard players set @s celestialCooldown 0`);
                player.runCommandAsync(`scoreboard players set @s xpBar 0`);
            }
        }

        // Cooldown handling
        if (currentCooldown == -41 || currentCooldown == -1) {
            player.runCommandAsync(`scoreboard players set @s allCooldown 1`);
        }
        if (currentCooldown == 2 && player.hasTag("celestialCookied")) {
            player.runCommandAsync(`scoreboard players set @s allCooldown 38`);
        }
        if (currentCooldown < 0 && currentCooldown > -40) {
            player.onScreenDisplay.setTitle("");
        }
        if (currentCooldown < -40 && currentCooldown > -200) {
            player.onScreenDisplay.setTitle("");
        }

        if (currentCooldown != 0) {
            player.runCommandAsync(`scoreboard players add @s allCooldown 1`);
        }
        if (currentCooldown >= 70) {
            player.runCommandAsync(`scoreboard players set @s allCooldown 0`);
        }

        if (currentCooldown > 0) {
            let cooldownState = Math.min(Math.floor(currentCooldown / 8), 8);
            player.onScreenDisplay.setTitle(titlesCooldown[cooldownState]);
        }

        // Mana handling
        if (currentXp <= 1200) {
            player.runCommandAsync(`scoreboard players add @s xpBar 1`);
        }

        let state = Math.min(Math.floor(currentXp / 132), 11);
        let celestialScore = world.scoreboard.getObjective("celestialCooldown")?.getScore(player);

        if (celestialScore > 0 && celestialScore < 140) { player.onScreenDisplay.setActionBar("") }
        if (celestialScore > 141 && celestialScore < 280) { player.onScreenDisplay.setActionBar("") }
        if (celestialScore > 281 && celestialScore < 400) { player.onScreenDisplay.setActionBar("") }


        if (celestialScore == 0 && currentVoidState == 0) { player.onScreenDisplay.setActionBar(actionBarsMana[currentTotem][state]); }

        //Void Blade Title
        if (currentVoidState != 0) { player.onScreenDisplay.setActionBar("") }

        // Getting All Entities
        let playerName = player.name;
        player.dimension.getEntities().forEach(entity => {

            //-----------Special Undead---------------//
            const undeadTypes = [
                "minecraft:zombie",
                "minecraft:skeleton",
                "minecraft:stray",
                "minecraft:husk",
                "minecraft:drowned",
                "minecraft:wither_skeleton",
                "minecraft:zombie_horse",
                "minecraft:skeleton_horse",
                "minecraft:zombie_pigman",
                "minecraft:zoglin"
            ];

            //MainCode
            if (undeadTypes.includes(entity.typeId) && !entity.hasTag("preAdderSpecial")) {
                entity.runCommand("/scoreboard players random @s specialUndead 2 5");
                entity.addTag("preAdderSpecial");
            }

            if (undeadTypes.includes(entity.typeId)) {
                let specialUndead = world.scoreboard.getObjective("specialUndead")?.getScore(entity);
                if (specialUndead === 5) {
                    let specialUndeadParticle = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                    entity.addTag("undeadTag");
                    entity.runCommand("/scoreboard players add @s entityTimer 1");
                    if (specialUndeadParticle > 10) {
                        entity.runCommand("/particle bey:special_undead ~~~")
                        entity.runCommand("/scoreboard players set @s entityTimer 0");
                    }
                }
            }


            //Sonic Blade
            if (entity.typeId === "minecraft:armor_stand" && entity.nameTag == "sonicDetecor") {
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");
                entity.runCommand("/effect @s invisibility 1 1 true")
                let sonicHitScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                if (sonicHitScore == 20) {
                    entity.runCommandAsync("/kill @s");
                    sonicAreaDec(entity);
                    entity.runCommand("/damage @e[r=2,type=!item,type=!xp_orb] 12 sonic_boom")
                }
                if (sonicHitScore > 21) {
                    entity.runCommand("/kill @s")
                }
            }

            //Gilded Scythe
            if (entity.typeId === "bey:dark_scythe_shooten") {
                entity.runCommandAsync("/damage @e[type=!bey:dark_scythe_shooten,type=!item,r=3] 6")
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");
                let shottenScytheScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                if (shottenScytheScore > 40) {
                    entity.runCommandAsync("/kill @s");
                }
            }
            //Gilded Guiter
            if (entity.typeId === "bey:gilded_guiter_radius") {
                entity.runCommand("scoreboard players add @s entityTimer 1");
                let gildedGuiterKill = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                if (gildedGuiterKill > 8) {
                    entity.runCommand("/tp @s ~1000 ~1000 ~1000");
                    system.runTimeout(() => {
                        entity.runCommand("/kill @s");
                    }, 20)
                }
            }


            //Circus Cluster
            if (entity.typeId === "bey:circus_bomb") {
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");
                let circusBombScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);

                if (circusBombScore == 30) {
                    entity.runCommandAsync("/kill @s");
                }
            }

            if (entity.hasTag("circusCursed")) {
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");
                let cursedScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                let cursedLoc = entity.location;

                if ([10, 30, 50].includes(cursedScore)) {
                    entity.dimension.spawnParticle("bey:circus_curse", cursedLoc);
                    entity.runCommand("/damage @e[r=5,type=!bey:magma_hammer_killed] 4")
                }
                if (cursedScore == 55) {
                    entity.removeTag("circusCursed")
                }
            }

            //Magma Hammer
            if (entity.typeId === "bey:magma_hammer_killed") {
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");
                let magmaScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                let magmaLoc = entity.location;

                if ([10, 20, 30, 40, 50].includes(magmaScore)) {
                    entity.dimension.spawnParticle("bey:magma_particle", magmaLoc);
                    entity.runCommand("/damage @e[r=5,type=!bey:magma_hammer_killed] 4")
                }
                if (magmaScore == 55) {
                    entity.runCommand("/tp @s ~ ~1000 ~")
                }
                if (magmaScore == 60) {
                    entity.runCommand("/kill @s")
                }
            }

            //Spell Twister handling
            ///Totem Aurora
            if (entity.nameTag === `${playerName}sAurora` && entity.typeId === "bey:heal_circle") {
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");

                let auroraScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);

                if ([20, 40, 60, 70, 80, 90, 120].includes(auroraScore)) {
                    entity.runCommandAsync(`effect @e[name=${playerName},r=4] regeneration 2 1 false`);
                }
                if (auroraScore == 125) {
                    entity.runCommand("/tp @s ~ ~1000 ~")
                }
                if (auroraScore == 130) {
                    entity.runCommand("/kill @s")
                }
            }
            ///Totem Vulcan
            if (entity.nameTag === `${playerName}sVulcan` && entity.typeId === "bey:vulcan_circle") {
                entity.runCommandAsync("scoreboard players add @s entityTimer 1");

                let vulcanScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);

                if ([20, 40, 60, 70, 80, 90, 120].includes(vulcanScore)) {
                    entity.runCommandAsync(`damage @e[name=!${playerName},type=!bey:vulcan_circle,r=4] 2`);
                }
                if (vulcanScore == 125) {
                    entity.runCommand("/tp @s ~ ~1000 ~")
                }
                if (vulcanScore == 130) {
                    entity.runCommand("/kill @s")
                }
            }

            // Ender Wand handling
            if (entity.nameTag === `${playerName}sWand` && entity.typeId === "bey:ender_wand_entity") {
                entity.runCommandAsync(`effect @e[name=!${playerName},r=6] slowness 1 1 false`);
                entity.runCommandAsync(`effect @e[name=!${playerName},r=6] darkness 1 1 false`);
                entity.runCommandAsync(`effect @e[name=${playerName},r=6] speed 1 1 false`);
                entity.runCommandAsync(`effect @e[name=${playerName},r=6] strength 1 1 false`);

                entity.runCommandAsync(`scoreboard players add @s entityTimer 1`);

                let enderWandScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                if (enderWandScore == undefined) return;

                if (enderWandScore == 2) {
                    let entityLoc = entity.location;
                    entity.dimension.spawnParticle("bey:ender_wand_radius", entityLoc);
                }

                if (enderWandScore == 197) {
                    let entityLoc = entity.location;
                    let entityDimension = entity.dimension;
                    world.structureManager.place("mystructure:ender_wand", entityDimension, entityLoc);
                }

                if (enderWandScore >= 200) {
                    entity.runCommand("/tp @s ~ ~1000 ~");
                }

                if (enderWandScore >= 210) {
                    entity.runCommand("/kill @s");
                }
            }

            // Void Smoke handling
            if (entity.typeId === "bey:void_smoke") {
                entity.runCommandAsync("scoreboard players remove @a[r=8] xpBar 3");
                entity.runCommandAsync("scoreboard players add @a[r=8] voidBladeTitle 2");
                entity.runCommandAsync("tag @a[r=8] add isVoided");
                entity.runCommandAsync("tag @a[rm=8,r=10] remove isVoided");

                entity.runCommandAsync(`scoreboard players add @s entityTimer 1`);

                let voidSmokeScore = world.scoreboard.getObjective("entityTimer")?.getScore(entity);
                if (voidSmokeScore == undefined) return;

                if (voidSmokeScore == 155) {
                    entity.runCommand("/tp @s ~ ~1000 ~");
                }

                if (voidSmokeScore == 165) {
                    entity.runCommand("/kill @s");
                }
            }
        });
    });
}, 1);

//Entity Shoot Component
world.afterEvents.itemUse.subscribe(eventData => {
    const player = eventData.source;
    const item = eventData.itemStack;
    let currentXp = world.scoreboard.getObjective("xpBar").getScore(player);
    let currentTotem = world.scoreboard.getObjective("twisterTest").getScore(player);
    let currentCooldown = world.scoreboard.getObjective("allCooldown").getScore(player);

    let canUseAbility = currentCooldown === 0 && currentXp >= 400;

    const shootProjectile = (projectile, power) => {
        const headLoc = player.getHeadLocation();
        const viewVector = player.getViewDirection();
        const direction = { x: headLoc.x + viewVector.x, y: headLoc.y + viewVector.y, z: headLoc.z + viewVector.z };
        const velocity = { x: viewVector.x * power, y: viewVector.y * power, z: viewVector.z * power };
        const projectileEntity = player.dimension.spawnEntity(projectile, direction);
        if (projectileEntity) {
            projectileEntity.getComponent(EntityComponentTypes.Projectile).shoot(velocity);
        }
    };


    //Circus Cluster
    if (item.typeId === "bey:circus_cluster" && canUseAbility) {
        shootProjectile("bey:circus_bomb", 1.6);
        manaCooldownManager(player);
        player.runCommand("/playsound beacon.activate @s ~ ~ ~");
    }

    //Gilded Scythe
    if (item.typeId === "bey:gilded_scythe" && canUseAbility) {
        shootProjectile("bey:dark_scythe_shooten", 1.6);
        manaCooldownManager(player);
        player.runCommand("/playsound beacon.activate @s ~ ~ ~");
        player.runCommand("/clear @s bey:gilded_scythe 0 1");
        player.addTag("shootGilded");
    }
});

//Food Uses
world.afterEvents.itemCompleteUse.subscribe((event) => {
    let food = event.itemStack;
    let player = event.source;
    let currentXp = world.scoreboard.getObjective("xpBar").getScore(player);
    if (food.typeId == "bey:mana_bottle") {
        // Calculate the new XP value
        let newXp = currentXp + 800;

        // Ensure the new XP doesn't exceed 1200
        if (newXp > 1200) {
            newXp = 1200;
        }

        // Set the new XP value
        world.scoreboard.getObjective("xpBar").setScore(player, newXp);
        player.applyDamage(4)
    }
});

//Weapon Kill Ability
world.afterEvents.entityDie.subscribe((event) => {
    let player = event.damageSource.damagingEntity;
    if (player == undefined) return;
    let killedEntity = event.deadEntity;
    let currentCooldown = world.scoreboard.getObjective("allCooldown").getScore(player);
    let playerHeld = player?.getComponent("equippable").getEquipment("Mainhand");
    let canUseAbility = currentCooldown === 0;
    let currentXp = world.scoreboard.getObjective("xpBar").getScore(player);

    //Blood Cracker
    if (["bey:blood_cracker_mana", "bey:blood_cracker_demonized"].includes(playerHeld.typeId) && canUseAbility && currentXp < 1600) {
        player.runCommand("/scoreboard players add @s xpBar 200");
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }

    //Magma Hammer
    if (playerHeld.typeId === "bey:magma_hammer" && canUseAbility && killedEntity) {
        killedEntity.runCommand("/summon bey:magma_hammer_killed");
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }
})

// Weapon Damage Ability
world.afterEvents.entityHitEntity.subscribe((event) => {
    let player = event.damagingEntity;
    let hurtEntity = event.hitEntity;
    let playerLoc = player.location;
    if (player.typeId != "minecraft:player" || hurtEntity == undefined) return;
    let currentCooldown = world.scoreboard.getObjective("allCooldown").getScore(player);
    let playerHeld = player?.getComponent("equippable").getEquipment("Mainhand");
    let playerName = player.nameTag;
    let canUseAbility = currentCooldown === 0;
    if (!playerHeld) return;

    //Knocker Basic Hammer
    if (playerHeld.typeId === "bey:basic_hammer_knocker" && canUseAbility) {
        hurtEntity.runCommand("particle minecraft:camera_shoot_explosion ~ ~1 ~");
        hurtEntity.runCommand("particle minecraft:camera_shoot_explosion ~1 ~1 ~");
        hurtEntity.runCommand("particle minecraft:camera_shoot_explosion ~ ~1 ~1");
        hurtEntity.runCommand("effect @s slowness 3 1 false");
        player.runCommand("/scoreboard players add @s allCooldown 20");
    }

    //Lighting Basic Hammer
    if (playerHeld.typeId == "bey:basic_hammer_lightning" && canUseAbility) {
        hurtEntity.runCommand("/summon lightning_bolt ~ ~ ~");
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }

    //Blood Cracker
    if (["bey:blood_cracker_na", "bey:blood_cracker_demonized"].includes(playerHeld.typeId)) {
        player.runCommand("/effect @s regeneration 1 2 true");
    }

    //War Mace
    if (playerHeld.typeId == "bey:war_mace" && canUseAbility) {
        hurtEntity.runCommand("/effect @s slowness 2 0 false");
        player.runCommand("/scoreboard players add @s allCooldown 20");
    }

    //Sonic Blade
    if (playerHeld.typeId == "bey:sonic_blade" && canUseAbility) {
        event.hitEntity.runCommand("/summon armor_stand sonicDetecor ~ ~1 ~");
        player.runCommand("/scoreboard players add @s allCooldown 20");
    }

    //Crimson Blade
    if (playerHeld.typeId === "bey:crimson_blade" && canUseAbility) {
        hurtEntity.runCommand("/effect @s levitation 1 1 false");
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }

    //Gilded Scythe
    if (playerHeld.typeId === "bey:gilded_scythe" && canUseAbility) {
        player.runCommand("/particle bey:gilded_hit ^ ^1.4 ^2");
        player.runCommand("/scoreboard players add @s allCooldown 1");
        hurtEntity.runCommand(`/damage @e[r=2,type=!xp_orb,type=!item,name=!${playerName}] 9`);
    }

    //Celestial Blade
    if (playerHeld.typeId === "bey:celestial_blade" && canUseAbility) {
        player.runCommand("/scoreboard players add @s allCooldown 1");
        clestialBladeHit(player, hurtEntity);

    }

    //Circus Cluster
    if (playerHeld.typeId === "bey:circus_cluster" && canUseAbility) {
        hurtEntity.runCommand("/tag @s add circusCursed");
        player.runCommand("/scoreboard players add @s allCooldown -40");
    }

    //Skull Wand
    if (playerHeld.typeId === "bey:skull_wand" && canUseAbility) {
        hurtEntity.runCommand("/effect @s wither 2 2 false");
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }

    // Ender Wand
    if (playerHeld.typeId === "bey:ender_wand" && canUseAbility) {
        hurtEntity.runCommand("/effect @s levitation 1 2 false");
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }
});


// Weapon Interaction Ability
world.afterEvents.itemUse.subscribe((event) => {
    let item = event.itemStack;
    let player = event.source;
    let playerLoc = event.source.location;
    let playerName = event.source.name;
    let currentXp = world.scoreboard.getObjective("xpBar").getScore(player);
    let currentTotem = world.scoreboard.getObjective("twisterTest").getScore(player);
    let currentCooldown = world.scoreboard.getObjective("allCooldown").getScore(player);
    let playerView = player.getViewDirection();

    let canUseAbility = currentCooldown === 0 && currentXp >= 400;

    //Accessory
    ///Blood Heart
    const BOOKS_LIST = [
        "bey:celestial_blade",
        "bey:reinforced_blade",
        "bey:void_blade"
    ]
    if (BOOKS_LIST.includes(item.typeId) && currentTotem == 4) {
        player.addEffect("regeneration", 60, { amplifier: 2 })
    }


    // Accessory definitions
    const accessories = {
        "bey:totem_vulcan": { setScore: 1 },
        "bey:totem_aurora": { setScore: 2 },
        "bey:mana_heart": { setScore: 3 },
        "bey:blood_heart": { setScore: 4 },
        "bey:hammer_of_honor": { setScore: 5 },
        // Add more accessories in the same way if needed
    };

    // Main event for using an accessory
    let currentAccessory = null;

    // Loop through accessories to find which one the player currently has based on the score
    for (let key in accessories) {
        if (accessories[key].setScore === currentTotem) {
            currentAccessory = key;  // Identify the current accessory based on the scoreboard
            break;
        }
    }

    // If the item used is the same as the current accessory, do nothing
    if (currentAccessory === item.typeId) {
        return;  // Exit without doing anything if the item is the same as the current accessory
    }

    // Check if the item is one of the accessories
    if (accessories[item.typeId]) {
        // First, remove the new accessory (the one being used)
        player.runCommand(`/clear @s ${item.typeId} 0 1`);

        // After clearing the new item, give the old accessory back to the player
        if (currentAccessory) {
            player.runCommand(`/give @s ${currentAccessory}`);
        }

        // Update the scoreboard with the corresponding value
        const accessory = accessories[item.typeId];
        if (accessory.setScore !== undefined) {
            player.runCommand(`/scoreboard players set @s twisterTest ${accessory.setScore}`);
        }
    }



    //Celestial Book
    if (item.typeId == "bey:celestial_blade" && canUseAbility && currentCooldown == 0) {
        manaCooldownManager(player);
        player.addEffect("speed", 40, { amplifier: 2 })
        player.dimension.spawnParticle("bey:celestial_hit", playerLoc)
        player.dimension.getEntities({ maxDistance: 6, location: playerLoc }).forEach((entity) => {
            if (entity.nameTag != playerName) {
                entity.applyDamage(5)
                entity.addEffect("levitation", 30, { amplifier: 3 })
            }
        })
    }

    //Reinforced Book
    if (item.typeId == "bey:reinforced_blade" && canUseAbility && currentCooldown == 0) {
        manaCooldownManager(player);
        player.dimension.spawnParticle("bey:up_netherite_particle", playerLoc)
        player.dimension.getEntities({ maxDistance: 6, location: playerLoc }).forEach((entity) => {
            if (entity.nameTag != playerName) {
                entity.setOnFire(25)
            }
        })
    }

    //Blood Cracker
    if (["bey:blood_cracker_na", "bey:blood_cracker_demonized"].includes(item.typeId) && canUseAbility && !player.isSneaking && currentCooldown == 0) {
        player.runCommand("/effect @s instant_health 1 2");
        player.runCommand(`/particle bey:cracker_blood ~~~`);
        player.runCommand("/playsound beacon.activate @s ~~~");
        manaCooldownManager(player);
    }
    if (item.typeId === "bey:blood_cracker_mana" && canUseAbility && !player.isSneaking && currentCooldown == 0) {
        player.runCommand("/effect @s instant_health 1 2");
        player.runCommand(`/particle bey:cracker_mana ~~~`);
        player.runCommand("/playsound beacon.activate @s ~~~");
        manaCooldownManager(player);
    }

    //Blood Cracker [Weapon Switcher]
    if (item.typeId === "bey:blood_cracker_na" && currentCooldown === 0 && player.isSneaking) {
        player.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 bey:blood_cracker_mana`);
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }
    if (item.typeId === "bey:blood_cracker_mana" && currentCooldown === 0 && player.isSneaking) {
        player.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 bey:blood_cracker_na`);
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }

    //War Weaposn
    const weaponCycle = {
        "bey:war_axe": "bey:war_hammer",
        "bey:war_hammer": "bey:war_mace",
        "bey:war_mace": "bey:war_axe"
    };

    if (canUseAbility && weaponCycle[item.typeId]) {
        const nextWeapon = weaponCycle[item.typeId];
        player.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 ${nextWeapon}`);
        player.runCommand("/scoreboard players add @s allCooldown 1");
    }

    //Sonic Blade
    if (item.typeId === "bey:sonic_blade" && canUseAbility) {
        for (let i = 1; i <= 16; i++) { player.runCommand(`execute at @s positioned ^ ^ ^${i} run damage @e[r=1,name=!${playerName}] 12`); }
        for (let i = 1; i <= 16; i++) { player.runCommand(`execute at @s positioned ^ ^1.5 ^${i} run particle minecraft:sonic_explosion ~~~`); }
        player.runCommand("/playsound mob.warden.attack @s ~ ~ ~ 10");
        manaCooldownManager(player);
    }

    //Crimson Slicer
    if (item.typeId == "bey:crimson_slicer" && canUseAbility) {
        player.applyKnockback(playerView.x, playerView.z, 5, 0);
        manaCooldownManager(player);
        player.runCommand("/playsound main.slicer @s ~~~");
        player.runCommand("/effect @s strength 2 0 true");
    }    ///Demonized
    if (item.typeId == "bey:demonized_crimson_slicer" && canUseAbility) {
        player.applyKnockback(playerView.x, playerView.z, 5, 0);
        manaCooldownManager(player);
        player.runCommand("/playsound main.slicer @s ~~~");
        player.runCommand("/effect @s strength 2 0 true");
        player.runCommand("/effect @s absorption 2 1 true");
        player.runCommand("/scoreboard players set @s allCooldown 30");
    }

    //Celestial Cookies
    if (item.typeId === "bey:celestial_cookie" && currentCooldown === 0) {
        player.addTag("celestialCookied");
        manaCooldownManager(player);
        celestialCookie(player);
    }

    //Skull Wand
    if (item.typeId === "bey:skull_wand" && canUseAbility) {
        player.runCommand("/scriptevent bey:mummy_summon");
        manaCooldownManager(player);
    }

    //Spell Twister
    ///Spell Twister With Totem
    if (item.typeId === "bey:spell_twister" && !player.isSneaking && currentTotem == 2 && canUseAbility) {
        player.runCommand(`/summon bey:heal_circle "${playerName}sAurora"`);
        manaCooldownManager(player);
    }
    if (item.typeId === "bey:spell_twister" && !player.isSneaking && currentTotem == 1 && canUseAbility) {
        player.runCommand(`/summon bey:vulcan_circle "${playerName}sVulcan"`);
        manaCooldownManager(player);
    }
    ///Spell Twister Totem Take Out
    if (item.typeId === "bey:spell_twister" && player.isSneaking && currentTotem != 0) {
        if (currentTotem == 1) { player.runCommand("/give @s bey:totem_vulcan") }
        if (currentTotem == 2) { player.runCommand("/give @s bey:totem_aurora") }
        player.runCommand("/scoreboard players set @s twisterTest 0")
    }

    //Void Blade
    if (item.typeId === "bey:void_blade" && canUseAbility) {
        manaCooldownManager(player);
        player.runCommand("/summon bey:void_smoke ~ ~ ~");
        player.runCommand("/scoreboard players set @s allCooldown -201");
        player.runCommand("/playsound void.smoke @s ~~~");
    }

    // Gilded Guiter
    if (item.typeId === "bey:gilded_guiter" && canUseAbility) {
        manaCooldownManager(player);
        player.runCommand("/scriptevent beyond:knockback");
        gildedGuiterDec(player);
    }
    if (item.typeId === "bey:gilded_guiter_demonized" && canUseAbility) {
        manaCooldownManager(player);
        player.runCommand("/scriptevent beyond:knockback");
        gildedGuiterDec(player);
        gildedGuiterDemonic(player);
    }

    // Ender Wand
    if (item.typeId === "bey:ender_wand" && canUseAbility) {
        player.runCommand(`/summon bey:ender_wand_entity "${playerName}sWand"`);
        player.runCommand("/clear @s bey:ender_wand 0 1");
        player.runCommand("/playsound beacon.activate @s ~~~");
        manaCooldownManager(player);
    }
});

//Structure Drops
// Structure Load
world.afterEvents.entityDie.subscribe(event => {
    const damageSource = event.damageSource;
    const deadEntity = event.deadEntity;
    if (damageSource?.damagingEntity?.typeId === "minecraft:player" && deadEntity) {
        if (deadEntity.hasTag("undeadTag")) {
            deadEntity.runCommand("/structure load mystructure:nightmare_heart ~~~");
        }
        if (deadEntity.typeId === "minecraft:warden") {
            deadEntity.runCommand("/structure load mystructure:wardens_leather ~~~");
        }
        if (deadEntity.typeId === "minecraft:elder_guardian") {
            deadEntity.runCommand("/structure load mystructure:pure_essence ~~~");
        }
    }
});


// Script Events
system.afterEvents.scriptEventReceive.subscribe(eventData => {
    if (eventData.id === "bey:mummy_summon") {
        const entity = eventData.sourceEntity.dimension.spawnEntity("bey:mummy_summoner", eventData.sourceEntity.location);
        if (entity) {
            entity.getComponent(EntityComponentTypes.Projectile).owner = eventData.sourceEntity;
            entity.triggerEvent("bey:on_hit");
        }
    }
});

system.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity: player }) => {
    if (!player || id !== 'beyond:knockback') return;

    const entities = player.dimension.getEntities({ location: player.location, maxDistance: 6 });

    for (const entity of entities) {
        if (entity.id === player.id) continue;
        const { x, z } = Vector.subtract(entity.location, player.location);
        entity?.applyKnockback(x, z, 3, 0.8);
    }
});
