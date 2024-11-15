let system = server.registerSystem(0, 0);

system.initialize = function() {
    // Listening for the script logger event (just to confirm the script is loaded)
    this.listenForEvent("minecraft:script_logger_config", (eventData) => this.onScriptLoggerConfig(eventData));
    
    // Listening for entity hit event
    this.listenForEvent("minecraft:entity_hit", (eventData) => this.onEntityHit(eventData)); 
    
    // Start applying fire damage tick
    this.runFireDamageTick();
};

// Event listener for entity hit
system.onEntityHit = function(eventData) {
    let hitEntity = eventData.data.entity;
    let attacker = eventData.data.attacker;
    let maceItem = "custom:mace"; // Custom mace item identifier

    // Check if the attacker is holding the mace
    if (attacker && attacker.getComponent("minecraft:inventory").container.hasItem(maceItem)) {
        
        // Apply the fire effect to the hit entity for 5 seconds
        hitEntity.addTag("on_fire");
        hitEntity.setOnFire(100); // Set entity on fire for 5 seconds (100 ticks)

        // Add a fire particle effect at the entity's position
        this.spawnFireParticle(hitEntity);

        // Track when the fire damage should stop
        this.setFireDuration(hitEntity, 3); // 3 seconds duration for fire damage
    }
};

// Function to spawn fire particles at the entity's position
system.spawnFireParticle = function(entity) {
    let position = entity.getComponent("minecraft:transform").translation;
    this.broadcastEvent("minecraft:display_particle_effect", {
        "effect_name": "minecraft:fire",
        "position": position,
        "particle_type": "minecraft:fire",
        "particle_count": 5
    });
};

// Function to simulate fire damage to an entity (called every tick)
system.runFireDamageTick = function() {
    this.executeAfter(20, () => { // Run every 1 second (20 ticks)
        this.applyFireDamage();
        this.runFireDamageTick(); // Continue the loop
    });
};

// Function to apply fire damage every tick to entities with the "on_fire" tag
system.applyFireDamage = function() {
    let entities = this.getEntitiesFromWorld();
    
    entities.forEach(entity => {
        // Check if the entity is on fire and if the fire duration has not expired
        if (entity.hasTag("on_fire") && !entity.hasTag("fire_duration_expired")) {
            // Apply damage to the entity every tick while it's on fire
            entity.damage(1, "fire"); // Fire damage (1 damage per tick)
            
            // Keep the entity on fire for the specified time (100 ticks)
            entity.setOnFire(100); 
        }
    });
};

// Function to track the fire duration and stop fire damage after 3 seconds
system.setFireDuration = function(entity, durationInSeconds) {
    // Set a custom tag when the fire damage should stop after the given time
    this.executeAfter(durationInSeconds * 20, () => { // Convert seconds to ticks
        entity.addTag("fire_duration_expired"); // Mark the fire duration as expired
    });
};
