# This could be a simple water splash particle effect around the hit location
execute at @s run particle minecraft:water_splash ~ ~ ~ 0 0 0 1 10 force
# Optionally, play a sound effect
execute at @s run playsound minecraft:entity.player.swim splash @a[distance=0..5]
