// Thought articles live in the content collection (src/data/thoughts/*.md,
// see content.config.ts) — this file only carries the thoughts *section*
// metadata used by the homepage directory cards.
export const content = {
  resume: {
    title: "Resume",
    content: {
      experience: [
        {
          role: "Software & DevOps Intern",
          company: "IBM, San Jose",
          period: "May 2026 - September 2026",
          description: "Worked all the entire AIOps team for WatsonX Assistant for Z. Designed from the ground up multitude FINN features, as part of the Q2 and Q3 release of 2026."
        },
        {
          role: "Founder and CTO",
          company: "Signalor",
          period: "September 2025 - September 2026",
          description: "Founded with Mathieu Fuller, Signalor indexes all public sentiment and turn them into valuable insights. We take unquatifiable data into quatifiable justification."
        },
        {
          role: "Software & DevOps Intern",
          company: "Climind, San Francisco",
          period: "May 2024 - August 2025",
          description: "Built and deployed a web crawler that collected ESG reporting data and bond information, producing over 100,000 tokens to enhance Climind's language model training. Contributed to the improvement of Climind's LLM by supporting data quality, model performance, and workflow optimization. Applied DevOps practices: Containerization (docker), CI/CD pipeline to ensure efficient and reliable development processes."
        },
        {
          role: "Lead Developer and Marketing Director",
          company: "Radians, London",
          period: "August 2023 - April 2024",
          description: "Designed and deployed a full-stack website using React, Node.js, and MongoDB, providing an online presence for the company's physical product. Implemented a customer support system by integrating email workflows (Gmail/SMTP) and a call chain (VoIP), improving response times and client engagement. Directed marketing initiatives, including social media campaigns and digital outreach, to promote the product and grow visibility."
        }
      ],
      skills: [
        { name: "React", href: "https://en.wikipedia.org/wiki/React_(software)" },
        { name: "JavaScript", href: "https://en.wikipedia.org/wiki/JavaScript" },
        { name: "TypeScript", href: "https://en.wikipedia.org/wiki/TypeScript" },
        { name: "HTML", href: "https://en.wikipedia.org/wiki/HTML" },
        { name: "CSS", href: "https://en.wikipedia.org/wiki/CSS" },
        { name: "Node.js", href: "https://en.wikipedia.org/wiki/Node.js" },
        { name: "Svelte", href: "https://en.wikipedia.org/wiki/Svelte" },
        { name: "Flask", href: "https://en.wikipedia.org/wiki/Flask_(web_framework)" },
        { name: "Python", href: "https://en.wikipedia.org/wiki/Python_(programming_language)" },
        { name: "Rust", href: "https://en.wikipedia.org/wiki/Rust_(programming_language)" },
        { name: "MySQL", href: "https://en.wikipedia.org/wiki/MySQL" },
        { name: "MongoDB", href: "https://en.wikipedia.org/wiki/MongoDB" },
        { name: "Docker", href: "https://en.wikipedia.org/wiki/Docker_(software)" },
        { name: "CI/CD", href: "https://en.wikipedia.org/wiki/CI/CD" },
        { name: "C#", href: "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)" },
        { name: "Unity", href: "https://en.wikipedia.org/wiki/Unity_(game_engine)" },
        { name: "Godot", href: "https://en.wikipedia.org/wiki/Godot_(game_engine)" },
        { name: "Bash", href: "https://en.wikipedia.org/wiki/Bash_(Unix_shell)" },
        { name: "PowerShell", href: "https://en.wikipedia.org/wiki/PowerShell" }
      ],
      languages: [
        "English (Native)",
        "Chinese (Native)",
        "Tamil (Learning)"
      ],
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
          year: "2024"
        }
      ]
    },
    previewImage: "/resources/resume.jpg"
  },
  projects: {
    title: "Things That I've Made",
    content: [
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
        liveDemo: "https://alexgaoth.com/JuliaSetFractal/",
        github: "https://github.com/alexgaoth/JuliaSetFractal"
      },
      {
        name: "Signalor",
        tech: "Python, Typescript, Docker, Node.js, Svelte",
        description: "Signalor is Google Analytics for Brands, a transparent holistic tool to understand how your brand is percevied across the internet.",
        images: [
          "/resources/signalor.png",
          "/resources/signalor1.png",
          "/resources/signalor2.png",
          "/resources/signalor3.png"
        ],
        liveDemo: "https://signalor.app"
      },
            {
        name: "dont-hallucinate",
        tech: "python, powershell, bash",
        description: "dont-hallucinate is package that intercepts agent shell failures, classifies what went wrong, suggests fixes when it can, and mocks your coding agent.",
        image:"/resources/dont_hallucinate.png",
        liveDemo: "https://x.com/alexgaoth/status/2030922676525805922/",
        pypi: "https://pypi.org/project/dont-hallucinate/"
      },
      {
        name: "UCSD Crimes log tracker",
        tech: "Python, React+Vite, Node.js, Selenium",
        description: "alerting, scraping, organizing Crimes reported in UCSD",
        image:"/resources/ucsd_crimes.png",
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
          "/resources/political_speech1.png",
          "/resources/political_speech2.png",
        ]
      },
      {
        name: "2D Pixel Plateformer",
        tech: "Godot, GDscript",
        description: "A self drawn, self coded 2D platformer",
        image:"/resources/godot_game.png",
      },
      {
        name: "This very website",
        tech: "html, css, js, React",
        description: "written from the very scratch, where people can learn more about me",
        image:"/resources/this_website.png",
        images: [
          "/resources/this_website.png",
          "/resources/journey2.png"
        ],
        liveDemo: "",
        github: "https://github.com/alexgaoth/alexgaoth.github.io"
      }
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
      }
    ],
    previewImage: "/resources/zaporo_cossak.jpg"
  }
};
