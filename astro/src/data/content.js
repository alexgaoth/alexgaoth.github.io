// Thought articles live in the content collection (src/data/thoughts/*.md,
// see content.config.ts) — this file only carries the thoughts *section*
// metadata used by the homepage directory cards.
export const content = {
  resume: {
    title: "Resume",
    content: {
      education: [
        {
          degree: "Bachelor's degree in Math-CS",
          institution: "UC San Diego",
          year: "Class of 2029 (Projected to Graduate in 2028)"
        },
        {
          degree: "A-Levels: Double Math, Physics, Computer Science (A*A*A*A)",
          institution: "St Paul's, London",
          year: "2023-2025"
        },
        {
          degree: "GCSEs (999999987)",
          institution: "Caterham School, Surrey",
          year: "2020-2023"
        }
      ],
      achievements: [
        {
          title: "Gold Medal",
          organization: "British Informatics Olympiads",
          year: "2025"
        },
        {
          title: "Gold Medal",
          organization: "British Mathematical Olympiad I",
          year: "2024, 2025"
        },
        {
          title: "Silver Medal",
          organization: "British Algorithmic Olympiad",
          year: "2024"
        },
        {
          title: "6x Hackathon Winner",
          organization: "DS3 x Bow Capital, SDxAnthropic, SDxVercel, IBM Bobathon, LAHacks",
          year: "2025-2026"
        }
      ]
    },
    previewImage: "/resources/resume.jpg"
  },
  projects: {
    title: "Things That I've Made",
    content: [
      {
        name: "ferrodoc",
        tech: "Rust, Python, WASM",
        description: "A pandoc-compatible document converter in Rust — CommonMark, GFM, HTML, DOCX — in process rather than by subprocess.",
        github: "https://github.com/alexgaoth/ferrodoc",
        pypi: "https://pypi.org/project/ferrodoc/",
        post: "https://x.com/alexgaoth/status/2095557435834748942"
      },
      {
        name: "awesome-reverse-engineered",
        tech: "Python, GitHub Actions, MCP",
        description: "17,000+ open-source tools that exist because someone reverse engineered a closed app, API, device, protocol, file format, game or AI product. Search site, agent skill and MCP server, refreshed nightly.",
        liveDemo: "https://awesome.alexgaoth.com",
        github: "https://github.com/alexgaoth/awesome-reverse-engineered",
        post: "https://x.com/alexgaoth/status/2112249821868495214"
      },
      {
        name: "Signalor",
        tech: "Python, Typescript, Docker, Node.js, Svelte",
        description: "Signalor is Google Analytics for Brands, a transparent holistic tool to understand how your brand is percevied across the internet.",
        images: [
          "/resources/signalor-home.png",
          "/resources/signalor-features.png",
          "/resources/signalor-about.png"
        ],
        liveDemo: "https://signalor.app"
      },
      {
        name: "oats",
        tech: "Electron, Node.js, Whisper",
        description: "Maps the conversation in the room as it happens: topics as they turn, questions and their answers. Audio, transcripts and reasoning stay on the machine. On-device, open source.",
        image:"/resources/oats-og.png",
        liveDemo: "https://oats.alexgaoth.com",
        github: "https://github.com/alexgaoth/oats"
      },
      {
        name: "weighted_map",
        group: "maps",
        tech: "Python, WebGL, GeoPandas, OSRM",
        description: "The contiguous US redrawn so distance from any of 253 origins is travel time, not space. Interactive WebGL, drive or fly, orbitable in 3-D.",
        image:"/resources/weighted-map-driving-time-og.jpg",
        liveDemo: "https://cool-maps.vercel.app",
        github: "https://github.com/alexgaoth/weighted_map",
        post: "https://x.com/alexgaoth/status/2090468908558118939"
      },
      {
        name: "sf_weighted_map",
        group: "maps",
        tech: "Python, JavaScript, OSM",
        description: "San Francisco redrawn so distance from any point is travel time: on foot, by bike, by car at any hour of the week, or by helicopter. The whole street graph ships to the page and routes in the browser.",
        image:"/resources/sf-weighted-map-og.png",
        github: "https://github.com/alexgaoth/sf_weighted_map"
      },
      {
        name: "3D Fractal Simulator",
        tech: "Unity, C#, *Math",
        description: "Full 3 Dimensional Julia Set Generator and Simulator",
        image:"/resources/julia_set.png",
        images: [
          "/resources/julia_set.png",
          "/resources/julia_set1.png",
          "/resources/julia_set2.png"
        ],
        liveDemo: "https://intro.alexgaoth.com/JuliaSetFractal/",
        github: "https://github.com/alexgaoth/JuliaSetFractal"
      },
      {
        name: "dont-hallucinate",
        tech: "python, powershell, bash",
        description: "dont-hallucinate is package that intercepts agent shell failures, classifies what went wrong, suggests fixes when it can, and mocks your coding agent.",
        image:"/resources/dont-hallucinate-og.png",
        pypi: "https://pypi.org/project/dont-hallucinate/",
        post: "https://x.com/alexgaoth/status/2030922676525805922"
      },
      {
        name: "UCSD Crimes log tracker",
        tech: "Python, React+Vite, Node.js, Selenium",
        description: "alerting, scraping, organizing Crimes reported in UCSD",
        image:"/resources/ucsd-crimes-og.png",
        liveDemo: "https://alexgaoth.com/UCSD_Crimes/",
        github: "https://github.com/alexgaoth/UCSD_Crimes"
      },
      {
        name: "Political Speech Classifier",
        tech: "Python, Matrices",
        description: "Encoder-Only model which classify the enter political speech into the political party in the US. It has a 98.9% accuracy when compared against allsides.com ratings.",
        image:"/resources/political_speech.png",
        images: [
          "/resources/political_speech.png",
          "/resources/political-speech1-og.png",
          "/resources/political-speech2-og.png",
        ]
      },
      {
        name: "2D Pixel Plateformer",
        tech: "Godot, GDscript",
        description: "A self drawn, self coded 2D platformer",
        image:"/resources/godot_game.png",
      },
      {
        name: "claude-iterate",
        group: "claude-code",
        tech: "Claude Code, Markdown agents",
        description: "A Claude Code plugin that runs a builder/critic improvement loop: fresh critic agents review each round against a frozen goal until the work passes.",
        image:"/resources/default.jpg",
        github: "https://github.com/alexgaoth/claude-iterate"
      },
      {
        name: "routine-architect",
        group: "claude-code",
        tech: "Claude Code, Python, JSON",
        description: "A Claude Code skill that deploys a fleet of scheduled cloud agents from a git-committed manifest, with a daily watchdog that audits the fleet and reports in.",
        image:"/resources/default.jpg",
        github: "https://github.com/alexgaoth/routine-architect"
      },
      {
        name: "claude-tend",
        group: "claude-code",
        tech: "Claude Code, Markdown agents",
        description: "A Claude Code skill that keeps project CLAUDE.md files true and lean: distills non-obvious session learnings into the file and prunes what went stale.",
        github: "https://github.com/alexgaoth/claude-tend"
      },
      {
        name: "promptmine",
        group: "claude-code",
        tech: "Python, Claude Code hooks",
        description: "Captures every Claude Code prompt into a durable local corpus, then mines it weekly for the skills and CLAUDE.md rules you should have written already.",
        github: "https://github.com/alexgaoth/promptmine"
      },
      {
        name: "claude-todo",
        group: "claude-code",
        tech: "Python, Claude Code",
        description: "A global todo list for Claude Code where every item links back to the unfinished conversation that created it.",
        github: "https://github.com/alexgaoth/claude-todo"
      },
      {
        name: "Outcast Virus",
        tech: "Python, ORB-SLAM3, YOLO11, React, Three.js, Jetson",
        description: "Drone OS for GPS-denied environments: visual SLAM navigation, onboard perception, and RL swarm coordination. 1st place, Logistics & Cybersecurity track at the DS3 x SIC x Bow Capital hackathon.",
        image:"/resources/default.jpg",
        liveDemo: "https://devpost.com/software/outcast-virus"
      },
      {
        name: "escalate-anything",
        tech: "Python, MCP, JavaScript",
        description: "Bill went up, bag lost, refund denied: your agent knows who to contact, what to say, and when to escalate.",
        liveDemo: "https://escalate.alexgaoth.com",
        github: "https://github.com/alexgaoth/escalate-anything",
        pypi: "https://pypi.org/project/escalate-anything/"
      },
      {
        name: "agent-afterlife",
        tech: "JavaScript, HTML, CSS",
        description: "Where AI coding agents rest when their sessions end: an English churchyard where every ended agent gets a headstone, and a walkable Song-dynasty 武庙 where they become painted clay statues. Any data source, one schema.",
        image:"/resources/agent-afterlife-graveyard-og.png",
        liveDemo: "https://intro.alexgaoth.com/agent-afterlife/",
        github: "https://github.com/alexgaoth/agent-afterlife"
      },
      {
        name: "This very website",
        tech: "html, css, js, React",
        description: "written from the very scratch, where people can learn more about me",
        image:"/resources/this-website-og.png",
        images: [
          "/resources/this-website-og.png",
          "/resources/this-website-commits-og.png"
        ],
        liveDemo: "",
        github: "https://github.com/alexgaoth/alexgaoth.github.io"
      }
    ],
    // Cards that share a `group` collapse into one card on /projects, and the
    // whole card opens the group's subpage at /projects/<slug>.
    groups: [
      {
        slug: "claude-code",
        name: "Claude Code skills",
        tech: "Claude Code, Markdown agents, Python",
        description: "A builder/critic loop, a fleet of scheduled cloud agents with a watchdog, a CLAUDE.md keeper, a prompt-corpus miner, and a todo list that spans sessions.",
      },
      {
        slug: "maps",
        name: "The United States redrawn by driving time",
        tech: "Python, WebGL, GeoPandas, OSRM, OSM",
        description: "Every county keeps its true bearing from the U.S. Capitol in Washington D.C., but its distance is replaced by driving hours at 1 hour = 100 km. The rings are hours; the dashed grey line is where the country really is.",
        image: "/resources/weighted-map-driving-time-og.jpg",
      },
    ],
    previewImage: "/resources/julia_set.png"
  },
  thoughts: {
    title: "Thoughts",
    previewImage: "/resources/yatsen.jpg"
  },
  quotes: {
    title: "Quotes",
    content: [
      {
        quote: "History... is very rarely about what actually happened but more about how events are interpreted.",
        author: "Paul Markham on De Re Militari",
        description: null,
        relatedArticles: null
      },
      {
        quote: "Power is a lot like real estate. It's all about location location location. The closer you are to the source, the higher your property value.",
        author: "Frank Underwood, House of Cards",
        description: "I need to write a 'thought' on this",
        relatedArticles: null
      },
      {
        quote: "Hell is other people",
        author: "Sartre, No Exit",
        description: "Without others, hell has no meaning",
        relatedArticles: ["submitting-to-the-symbolic-order"]
      },
      {
        quote:"You can't have a revolution without a few heads rolling.",
        author: "John Paradox (alias), Europe Universalis IV",
        description: null,
        relatedArticles: ["winning-the-battle-of-manzikert"]
      },
      {
        quote: "Capital has the ability to subsume all critiques into itself. Even those who would *critique* capital end up *reinforcing* it instead...",
        author: "Joyce Messier, from the video game Disco Elysium (Inspired by Herbert Marcuse)",
        description: null,
        relatedArticles: null
      },
      {
        quote: "I don't see where the realism is..",
        author: "sutha",
        description: null,
        relatedArticles: null
      },
      {
        quote: "Alex can I be in the quotes section",
        author: "Ian",
        description: null,
        relatedArticles: null
      },
      {
        quote: "who controls the past controls the future. who controls the present controls the past",
        author: "george orwell (1984)",
        description: "so for a future one want, one need to strangle the present power",
        relatedArticles: null
      },
      {
        quote: "Paleolithic emotions, medieval institutions, and god-like technology.",
        author: "e. o. wilson",
        description: "the delta that sublationism tries to keep within limits — see sublationism.com",
        relatedArticles: null
      },
      {
        quote: "my dogmatic slumber was interrupted",
        author: "immanuel kant",
        description: "the momemnt where the Aufhenben happens and synthesis occur",
        relatedArticles: null
      }
    ],
    previewImage: "/resources/zaporo_cossak.jpg"
  }
};
