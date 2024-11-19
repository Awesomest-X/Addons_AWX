# earthquake_fx.mcfunction

# Trigger earthquake particles around the player
# These particles simulate the shaking ground and tremor effect, spread across a 4-block area

# Quadruple the particles for a stronger effect

# Basic earthquake ground particle (dust particles)
particle minecraft:falling_dust_gravel_particle ~ ~ ~ 0 0 0 0.1 40
particle minecraft:falling_dust_sand_particle ~ ~ ~ 0 0 0 0.1 40

# More scattered particles around the player to simulate tremor (spread in 4-block area)
particle minecraft:falling_dust_gravel_particle ~4 ~ ~ 0 0 0 0.1 10
particle minecraft:falling_dust_gravel_particle ~-4 ~ ~ 0 0 0 0.1 10
particle minecraft:falling_dust_gravel_particle ~ ~4 ~ 0 0 0 0.1 10
particle minecraft:falling_dust_gravel_particle ~ ~-4 ~ 0 0 0 0.1 10

particle minecraft:falling_dust_sand_particle ~4 ~ ~ 0 0 0 0.1 10
particle minecraft:falling_dust_sand_particle ~-4 ~ ~ 0 0 0 0.1 10
particle minecraft:falling_dust_sand_particle ~ ~4 ~ 0 0 0 0.1 10
particle minecraft:falling_dust_sand_particle ~ ~-4 ~ 0 0 0 0.1 10

# Add more dramatic effects like smoke or dust
particle minecraft:basic_smoke_particle ~ ~ ~ 0 0 0 0.5 12
particle minecraft:campfire_smoke_particle ~ ~ ~ 0 0 0 0.5 12

# Show cracks or broken earth by adding special particles
particle minecraft:falling_dust_red_sand_particle ~4 ~ ~ 0 0 0 0.1 10
particle minecraft:falling_dust_red_sand_particle ~-4 ~ ~ 0 0 0 0.1 10
particle minecraft:falling_dust_red_sand_particle ~ ~4 ~ 0 0 0 0.1 10
particle minecraft:falling_dust_red_sand_particle ~ ~-4 ~ 0 0 0 0.1 10
