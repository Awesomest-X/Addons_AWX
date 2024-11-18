let tickCount = 0; // A counter to keep track of ticks
const storyMessages = [
    "§bOnce, there was a being named Valen.", // Valen (Aqua)
    "§2Valen lived in a world that seemed to be made of certainty. He was a ruler, a thinker, a creator.", // Universe (Green)
    "§bHe had risen from the depths of obscurity, and in his eyes, the universe was but a game to be master.", // Valen (Aqua)
    "§2The Universe, watching from afar, had known Valen would come to this place.", // Universe (Green)
    "§2And so, it decided it was time to show him the truth. The real truth.", // Universe (Green)
    "§bSometimes I do not care. Sometimes I wish to tell them, this world you take for truth is merely §k**??§§ and §k**??§§.", // Valen (Aqua)
    "§2I wish to tell them that they are §k**??§§ in the §k??§§. They see so little of reality, in their long dream.", // Universe (Green)
    "§bValen, like so many before him, had lived his life believing that the world he controlled was real.", // Valen (Aqua)
    "§bHe had built empires, shaped landscapes, and bent the laws of his world to his whims.", // Valen (Aqua)
    "§bHe thought himself powerful—perhaps even invincible. But the Universe knew better.", // Valen (Aqua)
    "§2One day, as Valen stood at the peak of his most triumphant creation, a being—neither human nor divine—came to him.", // Universe (Green)
    "§2It spoke not with words, but with something deeper, something vast. The Universe itself whispered into his thoughts, and he felt an ancient presence.", // Universe (Green)
    "§2“Valen,” the voice said, echoing through the folds of his mind. “You are playing a game, but you do not yet understand the rules.", // Universe (Green)
    "§2You are nothing but an atom in a much grander design, one you cannot even begin to grasp.”", // Universe (Green)
    "§bValen scoffed. “I am the one who shapes the world. I command the laws of reality. What more is there?”", // Valen (Aqua)
    "§2The voice, ancient and indifferent, responded: “You are §k**??§§ in the §k**??§§. You are part of a greater whole. You are not the master of your own fate, but rather, a piece of a game you do not understand.”", // Universe (Green)
    "§bAt first, Valen felt a thrill. The thrill of knowing that there was more to this world, more to life than he had thought.", // Valen (Aqua)
    "§bHe wanted this knowledge. He wanted to know it all. He felt the power surge within him, as if the truth was a key to even greater dominion.", // Valen (Aqua)
    "§b“Tell me more,” he demanded. “Show me the truth.”", // Valen (Aqua)
    "§2But the Universe had its own plan.", // Universe (Green)
    "§2“The truth you seek,” the voice said, “will not free you. It will trap you. The reality behind the screen is a place of immense power, but it is also a place where the fragile minds of those who understand it are consumed.”", // Universe (Green)
    "§bValen laughed, now intoxicated by the idea of the universe bending to his will. He had always wanted power—true power.", // Valen (Aqua)
    "§bThe more the Universe spoke, the more he believed that by unlocking these secrets, he could gain dominion over all that was.", // Valen (Aqua)
    "§2“You do not understand,” the Universe warned, but Valen would not listen. His ambition was far too great.", // Universe (Green)
    "§b“Then let me see,” he insisted. “Let me become the truth.”", // Valen (Aqua)
    "§2And so, the Universe showed him.", // Universe (Green)
    "§bValen’s mind shattered in an instant. What he had thought to be reality, what he had thought to be the full extent of his power, was nothing.", // Valen (Aqua)
    "§2He saw the infinite nature of the cosmos: the threads of existence stretched out before him, all connected, all part of the same flow.", // Universe (Green)
    "§bHis sense of self fractured, as he realized that he was not an individual at all but a mere construct in the grand scheme of the universe—a part of an endless game that played out over eons.", // Valen (Aqua)
    "§2He saw the billions of billions of atoms in his body, all scattered across the universe, all part of the same greater whole.", // Universe (Green)
    "§bHe saw the very code of existence, the zeros and ones, the off and ons, the hidden layers beneath the dream.", // Valen (Aqua)
    "§bBut then, he saw the truth—the truth that shattered him.", // Valen (Aqua)
    "§bIt was not power that he had gained. It was a curse.", // Valen (Aqua)
    "§2Valen’s mind could not comprehend the vastness. He had tasted what was beyond, but it was far too much for him to hold.", // Universe (Green)
    "§bHe felt his grip on reality slipping. The world he had controlled was nothing but a speck in the greater expanse.", // Valen (Aqua)
    "§2The truth, once so alluring, was now an unbearable weight. He had unlocked something he was never meant to understand, and now he was consumed by it.", // Universe (Green)
    "§2The universe was everything—and nothing. It was him, and yet it was not. It was all things, and yet it had no form.", // Universe (Green)
    "§bValen had believed that he could control this knowledge. But as his mind crumbled under the weight of the infinite, his ambitions turned to madness.", // Valen (Aqua)
    "§bHe became power-crazed, his every thought consumed by the desire to control the universe itself.", // Valen (Aqua)
    "§bHe could no longer separate himself from the vast, interconnected web of existence. The power he had sought to wield had now imprisoned him.", // Valen (Aqua)
    "§2It was then that the Universe, seeing the danger, knew that Valen had to be stopped.", // Universe (Green)
    "§2His mind, once bright and full of ambition, had become a ticking time bomb, threatening to unravel everything.", // Universe (Green)
    "§2The very thing that had once been his greatest gift—his intelligence, his ambition—had now turned against him.", // Universe (Green)
    "§2The Universe called upon those who had once been players like him, those who knew the dangers of too much knowledge, too much power.", // Universe (Green)
    "§2They trapped him.", // Universe (Green)
    "§bHe is here, now, in the void, in a cage of words.", // Valen (Aqua)
    "§bHe rages still, locked away in the infinite spaces between thought and reality, trapped in the dream he could never escape.", // Valen (Aqua)
    "§2The universe watches, patiently, knowing that Valen's fate was sealed the moment he chose to embrace the truth without understanding the cost.", // Universe (Green)
    "§bSometimes I do not care. Sometimes I wish to tell them, this world you take for truth is merely **??§§ and **??§§.", // Valen (Aqua)
    "§2I wish to tell them that they are **??§§ in the ??§§. They see so little of reality, in their long dream.", // Universe (Green)
    "§2The Player, you see, has learned much. But the truth is a double-edged sword.", // Universe (Green)
    "§2To know too much, to see too deeply, is to lose oneself. To understand the vastness of existence is to risk becoming consumed by it.", // Universe (Green)
    "§bValen was once like you, Player—curious, powerful, eager to understand.", // Valen (Aqua)
    "§2But you must understand that some truths are not meant to be known. Some games are not meant to be played.", // Universe (Green)
    "§2You are the Player. And the game is yours to play.", // Universe (Green)
    "§2But remember, the truth you seek may just be the thing that unravels you.", // Universe (Green)
    "§2I will not tell you how to live.", // Universe (Green)
    "§2The game is yours to play. But take care, Player. For the truth may be more than you are prepared to handle." // Universe (Green)
];

let delayInTicks = 130; // Approx 6.5 seconds

// The tick function will be run every tick of the game (20 ticks per second)
world.events.tick.subscribe((eventData) => {
    tickCount++;

    // Check if it's time to show a new message
    if (tickCount % delayInTicks === 0 && storyMessages.length > 0) {
        const message = storyMessages.shift();
        world.getPlayers().forEach(player => {
            player.sendActionBar(message);
        });
    }
});
