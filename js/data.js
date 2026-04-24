const months = [
  {
    name: "M1", fullName: "Month 1", label: "Launch",
    theme: "Introduce yourself & establish your niche identity",
    focus: ["Account launch", "Intro content", "First impressions"],
    weeks: [
      {
        label: "Week 1 — who are you?",
        posts: [
          { day: "Mon", pl: "both",  title: "Account intro post",        desc: "Who you are, what you read, why horror/thriller. Pin this." },
          { day: "Wed", pl: "ig",    title: "Shelfie reveal",             desc: "Your horror/thriller shelf or stack. Dark moody aesthetic." },
          { day: "Fri", pl: "tt",    title: "'Books that broke me' reel", desc: "Fast cuts of 5 covers + trending audio. Great first hook." },
          { day: "Sat", pl: "ig",    title: "Author spotlight post",      desc: "Deep-dive on a favourite horror author to cap the week." }
        ],
        stories: [
          { title: "Meet me story",        desc: "Slides: name, top 3 horror reads, your reading vibe. Use polls." },
          { title: "'This or that' horror", desc: "Supernatural vs psychological — tap to vote. Easy engagement." }
        ]
      },
      {
        label: "Week 2 — your taste",
        posts: [
          { day: "Mon", pl: "tt",   title: "All-time fave horror book",    desc: "Why it scared you, personal story. Vulnerability = follows." },
          { day: "Wed", pl: "ig",   title: "5-star thriller flat lay",      desc: "Favourite thriller with moodboard props. Use #thrillerbooks." },
          { day: "Fri", pl: "both", title: "Hot take poll",                 desc: "'Stephen King is overrated — agree or disagree?' Drives comments." },
          { day: "Sun", pl: "tt",   title: "'Books that kept me up' reel",  desc: "Weekend traffic is high on TikTok. Fast cuts, trending audio." }
        ],
        stories: [
          { title: "Rating reveal story", desc: "Slide by slide: each book from this week's flat lay, with your star rating." },
          { title: "Question box",        desc: "'Ask me anything about horror books' — feed answers all week." }
        ]
      },
      {
        label: "Week 3 — series & sagas",
        posts: [
          { day: "Mon", pl: "tt",   title: "Saga starter rec",            desc: "'Start here if you're new to horror sagas' — ranked list reel." },
          { day: "Wed", pl: "ig",   title: "Saga series aesthetic",        desc: "All books in a series laid out. Great shareable format." },
          { day: "Fri", pl: "both", title: "Currently reading check-in",   desc: "Where you are in a book + a creepy quote teaser." },
          { day: "Sat", pl: "ig",   title: "Reading nook setup",           desc: "Your physical reading spot styled for horror vibes. Very saveable." }
        ],
        stories: [
          { title: "Reading progress bar", desc: "Use the poll sticker as a 'progress bar' for your current read. Update daily." },
          { title: "Saga reading order",   desc: "Swipe-through guide: how to read a series in order. Save-worthy." }
        ]
      },
      {
        label: "Week 4 — community",
        posts: [
          { day: "Mon", pl: "tt",   title: "'Tag someone' reel",           desc: "'Tag a friend who'd survive a horror novel' — viral mechanic." },
          { day: "Wed", pl: "ig",   title: "Month 1 wrap-up carousel",     desc: "What you read, what scared you, what's next. Recap carousel." },
          { day: "Fri", pl: "both", title: "Reading challenge tease",       desc: "Announce your Month 2 reading theme to build anticipation." },
          { day: "Sun", pl: "tt",   title: "Week in books reel",            desc: "Quick round-up of everything you read this month. Montage format." }
        ],
        stories: [
          { title: "Month 1 stats story",           desc: "Pages read, books finished, average rating — show your numbers." },
          { title: "'What should I read next?' poll", desc: "Give followers 2 options and let them decide Month 2's first read." }
        ]
      }
    ]
  },
  {
    name: "M2", fullName: "Month 2", label: "Consistency",
    theme: "Build a posting rhythm & start engaging with the community",
    focus: ["Engagement loops", "Comment bait", "Community building"],
    weeks: [
      {
        label: "Week 1 — sub-genre deep dive",
        posts: [
          { day: "Mon", pl: "tt",   title: "Psychological vs supernatural",  desc: "'What's scarier?' debate reel. Two-sided arguments perform well." },
          { day: "Wed", pl: "ig",   title: "Sub-genre guide carousel",        desc: "Psychological / supernatural / slasher / cosmic — what is each?" },
          { day: "Fri", pl: "both", title: "Sub-genre poll",                  desc: "Let followers vote on what you should read next." },
          { day: "Sun", pl: "ig",   title: "Moody aesthetic post",            desc: "Dark flat lay matching the sub-genre you're currently reading." }
        ],
        stories: [
          { title: "Sub-genre quiz",      desc: "'Which horror sub-genre are you?' — quiz format with emoji sliders." },
          { title: "Behind the shelfie",  desc: "Time-lapse or BTS of setting up your aesthetic book photo." }
        ]
      },
      {
        label: "Week 2 — author spotlight",
        posts: [
          { day: "Mon", pl: "tt",   title: "Stephen King starter guide",    desc: "'Where to start with King' is evergreen and highly searchable." },
          { day: "Wed", pl: "ig",   title: "Author aesthetic post",          desc: "Books by one author styled together. Clean, shareable visual." },
          { day: "Fri", pl: "tt",   title: "'Underrated authors' reel",      desc: "5 horror authors who deserve more hype." },
          { day: "Sat", pl: "ig",   title: "Author biography carousel",      desc: "Key facts, best books, reading order for the spotlighted author." }
        ],
        stories: [
          { title: "Author trivia",    desc: "Drop 3 facts about the author — followers guess who it is before the reveal." },
          { title: "Reading update",   desc: "Where are you in their book? Quote from the page you're on right now." }
        ]
      },
      {
        label: "Week 3 — reaction content",
        posts: [
          { day: "Mon", pl: "tt",   title: "Live reading reaction",           desc: "Film yourself reacting to a shocking plot twist. Raw = relatable." },
          { day: "Wed", pl: "ig",   title: "Quote card post",                  desc: "Creepy / iconic quote from current read as a styled graphic." },
          { day: "Fri", pl: "both", title: "'Did NOT see that coming' post",   desc: "Spoiler-free shock reactions. Gets curious comments." },
          { day: "Sun", pl: "tt",   title: "Reactions round-up reel",          desc: "Week's most memorable book moments stitched together." }
        ],
        stories: [
          { title: "Spoiler vault story", desc: "'DM me if you've read it — I need to talk about THAT ending.'" },
          { title: "Emoji rating",        desc: "Rate the book's twist with emojis only. Followers guess which book." }
        ]
      },
      {
        label: "Week 4 — lists & rankings",
        posts: [
          { day: "Mon", pl: "tt",   title: "Thriller ranking reel",         desc: "Tier-list format: S/A/B/C — very watchable, drives debate." },
          { day: "Wed", pl: "ig",   title: "'Books by vibe' carousel",       desc: "Moody autumn read / can't sleep / airplane thriller — grouped recs." },
          { day: "Fri", pl: "both", title: "Month 2 reading recap",          desc: "Stats: pages read, books finished, star ratings summary." },
          { day: "Sat", pl: "ig",   title: "Reader recs post",               desc: "Spotlight books your followers recommended this month." }
        ],
        stories: [
          { title: "Live tier list",        desc: "Drop covers into S/A/B tiers in real time. Followers watch and react via DM." },
          { title: "Month wrap countdown",  desc: "5 slides counting down your top 5 of the month, one reveal per slide." }
        ]
      }
    ]
  },
  {
    name: "M3", fullName: "Month 3", label: "Growth",
    theme: "Double down on what's working & chase algorithmic reach",
    focus: ["Trending audio", "Collab bait", "Series content"],
    weeks: [
      {
        label: "Week 1 — trending formats",
        posts: [
          { day: "Mon", pl: "tt",   title: "'POV you picked up X' reel",   desc: "POV format is huge on BookTok. Hook viewers in 2 seconds." },
          { day: "Wed", pl: "ig",   title: "Book aesthetic vs reality",     desc: "Pinterest cover vs your messy read copy. Relatable comedy." },
          { day: "Fri", pl: "tt",   title: "Trending sound + book recs",    desc: "Overlay trending audio with book cover transitions." },
          { day: "Sat", pl: "ig",   title: "Follower milestone post",       desc: "Celebrate reaching a follower count. Gratitude converts lurkers." }
        ],
        stories: [
          { title: "'Guess the book' story", desc: "Read out clues one by one — followers DM their guesses." },
          { title: "Format poll",            desc: "'What do you want more of?' — reels / carousels / shelfies / reactions." }
        ]
      },
      {
        label: "Week 2 — saga deep dive",
        posts: [
          { day: "Mon", pl: "both", title: "Saga reading order guide",        desc: "'How to read the X universe' — high-value pinnable content." },
          { day: "Wed", pl: "tt",   title: "Series finale reaction",          desc: "Emotional wrap-up of finishing a saga. Very shareable." },
          { day: "Fri", pl: "ig",   title: "Saga aesthetic flat lay",         desc: "All saga books + thematic props. Pin as a series anchor post." },
          { day: "Sun", pl: "tt",   title: "'Should you start this saga?' reel", desc: "Pros, cons, length, commitment — honest overview." }
        ],
        stories: [
          { title: "Saga countdown",    desc: "'X books left in this series' — daily update sticker countdown." },
          { title: "Fan theories poll", desc: "Drop a theory about the saga — followers vote true / false." }
        ]
      },
      {
        label: "Week 3 — collab & duet bait",
        posts: [
          { day: "Mon", pl: "tt",   title: "'Finish this sentence' reel",    desc: "'The horror book that changed me was ___' — duet magnet." },
          { day: "Wed", pl: "ig",   title: "'Books we both love' post",       desc: "Call out a fellow Bookstagrammer. Cross-promo reach." },
          { day: "Fri", pl: "both", title: "Readathon announcement",          desc: "Set a challenge: '5 thrillers in 2 weeks' — drives follow for updates." },
          { day: "Sat", pl: "tt",   title: "Collab duet response reel",       desc: "Respond to a community duet or stitch. Shows you engage back." }
        ],
        stories: [
          { title: "Readathon sign-up story", desc: "'Comment SIGN ME UP' under this story to join the readathon." },
          { title: "Collab shoutout",         desc: "Highlight a fellow horror/thriller account. Community love builds loyalty." }
        ]
      },
      {
        label: "Week 4 — milestone & recap",
        posts: [
          { day: "Mon", pl: "both", title: "3-month stats post",          desc: "Followers, books read, most popular post. Transparency builds trust." },
          { day: "Wed", pl: "tt",   title: "'My horror journey so far' reel", desc: "Montage of content, growth reflections. Emotional = shareable." },
          { day: "Fri", pl: "ig",   title: "Q&A answers carousel",        desc: "Answer follower questions in a carousel. Builds community warmth." },
          { day: "Sun", pl: "both", title: "Month 4 teaser",              desc: "Tease your next theme — builds anticipation over the weekend." }
        ],
        stories: [
          { title: "3-month anniversary", desc: "Celebrate with a 'swipe to see my first post vs now' story arc." },
          { title: "Ask me anything",     desc: "Open question box — answer throughout the day as a story series." }
        ]
      }
    ]
  },
  {
    name: "M4", fullName: "Month 4", label: "Themes",
    theme: "Lean into seasonal themes & cross-genre horror",
    focus: ["Seasonal content", "Cross-genre", "Atmosphere"],
    weeks: [
      {
        label: "Week 1 — horror sub-niches",
        posts: [
          { day: "Mon", pl: "tt",   title: "Cosy horror reel",              desc: "Horror that feels weirdly comforting — growing micro-trend." },
          { day: "Wed", pl: "ig",   title: "Gothic vs folk horror",          desc: "Aesthetic comparison carousel. Highly shareable visual format." },
          { day: "Fri", pl: "both", title: "'If you like X film, read Y'",   desc: "Cross-media hooks pull in non-book audiences from TikTok." },
          { day: "Sat", pl: "ig",   title: "Cosy horror aesthetic post",     desc: "Candles, blankets, atmospheric covers — cosy but creepy vibes." }
        ],
        stories: [
          { title: "Horror sub-niche quiz",  desc: "'Which horror sub-niche are you?' — 4-question tap-through quiz." },
          { title: "Film → book bridge",     desc: "Poll: 'Have you seen [film]?' then swipe → 'Then read this.'" }
        ]
      },
      {
        label: "Week 2 — thriller sub-genres",
        posts: [
          { day: "Mon", pl: "tt",   title: "Legal thriller starter reel",    desc: "'Never read legal thrillers? Start here.' Searchable niche." },
          { day: "Wed", pl: "ig",   title: "Domestic thriller aesthetic",    desc: "Books like Gone Girl styled together. Still evergreen content." },
          { day: "Fri", pl: "both", title: "'Thriller bingo' post",          desc: "Tropes bingo card — followers screenshot and share their results." },
          { day: "Sun", pl: "tt",   title: "'Domestic thriller tropes' reel", desc: "Unreliable narrator, dark secrets, suburban horror — rated and ranked." }
        ],
        stories: [
          { title: "Bingo card story", desc: "'Screenshot this and mark off what you've read' — massive saves." },
          { title: "Trope vote",       desc: "'Which thriller trope never gets old?' — multiple choice poll." }
        ]
      },
      {
        label: "Week 3 — emotional content",
        posts: [
          { day: "Mon", pl: "tt",   title: "'Books that made me cry AND scared me'", desc: "Emotional horror is underserved. Taps two audiences." },
          { day: "Wed", pl: "ig",   title: "Most impactful read so far",              desc: "Personal essay-style caption on the book that moved you most." },
          { day: "Fri", pl: "both", title: "Favourite villain deep-dive",             desc: "Literary villain analysis — builds credibility and sparks debate." },
          { day: "Sat", pl: "ig",   title: "Emotional horror flat lay",               desc: "Books that hit differently — styled with emotional, raw aesthetic." }
        ],
        stories: [
          { title: "Villain poll bracket",         desc: "'Who's the best horror villain?' — tournament bracket over 2 days." },
          { title: "'Rate your book hangover'",    desc: "1–10 slider sticker — 'How emotionally destroyed are you right now?'" }
        ]
      },
      {
        label: "Week 4 — seasonal pivot",
        posts: [
          { day: "Mon", pl: "tt",   title: "Summer horror recs reel",     desc: "'What to read at the beach that will ruin the beach.' Fun hook." },
          { day: "Wed", pl: "ig",   title: "Reading setup photo",          desc: "Your reading nook styled for the season. Very saveable." },
          { day: "Fri", pl: "both", title: "Month 4 wrap-up",              desc: "Books read, highlights, tease of a big Month 5 series read." },
          { day: "Sun", pl: "tt",   title: "'Underrated summer horror' reel", desc: "Books that don't get the beach-read love they deserve." }
        ],
        stories: [
          { title: "Summer reading list",    desc: "Swipe through your planned summer TBR with aesthetics per book." },
          { title: "'Ruin the beach' poll",  desc: "Vote on which horror book would make you most paranoid at the beach." }
        ]
      }
    ]
  },
  {
    name: "M5", fullName: "Month 5", label: "Deep Dives",
    theme: "Long-form analysis & series completions that build authority",
    focus: ["Authority content", "Series completion", "Analysis"],
    weeks: [
      {
        label: "Week 1 — author universe",
        posts: [
          { day: "Mon", pl: "tt",   title: "King universe map reel",      desc: "How King's books connect — huge engagement from die-hard fans." },
          { day: "Wed", pl: "ig",   title: "Author universe carousel",     desc: "Visual map of connected books. Highly shareable, saveable." },
          { day: "Fri", pl: "both", title: "'Where to start' poll",        desc: "Followers vote on which author universe you tackle next." },
          { day: "Sat", pl: "tt",   title: "Hidden connections reel",      desc: "Easter eggs and references between books in a universe. Niche gold." }
        ],
        stories: [
          { title: "Universe map story",              desc: "Breakdown of connected books in swipe format — one link per slide." },
          { title: "'Have you read all of them?' quiz", desc: "Checklist poll — followers tick off which books they've read." }
        ]
      },
      {
        label: "Week 2 — book vs adaptation",
        posts: [
          { day: "Mon", pl: "tt",   title: "Book vs film comparison reel", desc: "'They ruined / nailed this adaptation.' Very watchable debate." },
          { day: "Wed", pl: "ig",   title: "Book vs show carousel",        desc: "What changed, what stayed, was it worth it?" },
          { day: "Fri", pl: "both", title: "Adaptation hot take",          desc: "Controversial opinion on a famous adaptation. Drives comments." },
          { day: "Sun", pl: "ig",   title: "'Best adaptation' bracket",    desc: "Poll your followers to find the community's favourite." }
        ],
        stories: [
          { title: "'Book or show?' live vote",    desc: "Real-time results as followers vote on the best adaptation." },
          { title: "Behind-the-scenes casting",    desc: "'Who would YOU cast in this horror adaptation?' — open DM question." }
        ]
      },
      {
        label: "Week 3 — reading challenge",
        posts: [
          { day: "Mon", pl: "both", title: "Readathon update",                   desc: "Mid-challenge check-in. Books so far, what's next, how are you feeling?" },
          { day: "Wed", pl: "tt",   title: "'Reading 5 books in 5 days' vlog",   desc: "Day-by-day updates edited into one reel. High-value content." },
          { day: "Fri", pl: "ig",   title: "Challenge wrap-up post",             desc: "All 5 books, star ratings, which was scariest. Great carousel." },
          { day: "Sat", pl: "both", title: "Community readathon spotlight",      desc: "Highlight followers who joined your challenge. Builds loyalty." }
        ],
        stories: [
          { title: "Daily readathon update", desc: "Short daily story: pages read today, favourite moment, current mood." },
          { title: "Progress countdown",     desc: "Countdown sticker: 'X books to go.' Update each morning." }
        ]
      },
      {
        label: "Week 4 — recommendations engine",
        posts: [
          { day: "Mon", pl: "tt",   title: "'Tell me your fave film' reel",   desc: "Match followers to a horror book based on their film taste." },
          { day: "Wed", pl: "ig",   title: "Personalised rec carousel",        desc: "'If you liked [genre], read [book]' — 8 pairings. Very saveable." },
          { day: "Fri", pl: "both", title: "Month 5 stats & milestone",        desc: "Celebrate a follower milestone. Gratitude content converts lurkers." },
          { day: "Sun", pl: "tt",   title: "Reader-recommended reel",          desc: "Books your followers told you to read this month — honest reviews." }
        ],
        stories: [
          { title: "Film → book matcher", desc: "'Tell me your favourite horror film and I'll DM you a book rec.'" },
          { title: "Rec of the day",      desc: "One book rec per day this week — quick story, not a full post." }
        ]
      }
    ]
  },
  {
    name: "M6", fullName: "Month 6", label: "Midpoint",
    theme: "Review your best content & plan the second half strategically",
    focus: ["Best-of content", "Strategy review", "Audience Q&A"],
    weeks: [
      {
        label: "Week 1 — best of so far",
        posts: [
          { day: "Mon", pl: "both", title: "Top 5 posts compilation",     desc: "Reshare best-performing content with a 'then vs now' spin." },
          { day: "Wed", pl: "ig",   title: "Top 5 books read so far",     desc: "Half-year reading wrap-up. Great anchor carousel to pin." },
          { day: "Fri", pl: "tt",   title: "Half-year reading reel",      desc: "Montage of every book you've read. Satisfying, shareable." },
          { day: "Sat", pl: "ig",   title: "Half-year aesthetic gallery", desc: "Your best 6 photos in a styled grid — great for new visitors." }
        ],
        stories: [
          { title: "'Then vs now' story arc",   desc: "Side-by-side: your first post vs your best post this month." },
          { title: "Half-year reading stats",   desc: "Pages, books, genres, most-read author — infographic-style slides." }
        ]
      },
      {
        label: "Week 2 — audience deep dive",
        posts: [
          { day: "Mon", pl: "both", title: "Follower Q&A",                    desc: "Answer questions from your community. Deep engagement format." },
          { day: "Wed", pl: "ig",   title: "'You recommended, I read' post",  desc: "Read a follower rec and review it. Creates loyalty." },
          { day: "Fri", pl: "tt",   title: "'Your taste in horror' quiz reel", desc: "'Comment your answer and I'll tell you what to read next.'" },
          { day: "Sun", pl: "ig",   title: "Community shoutout post",          desc: "Feature 5 horror/thriller accounts your followers should follow." }
        ],
        stories: [
          { title: "Q&A answer series",          desc: "Batch-answer question box submissions across 10+ story slides." },
          { title: "'Rate your recommendation'", desc: "Followers vote 1–5 on the book you read based on their suggestion." }
        ]
      },
      {
        label: "Week 3 — controversial week",
        posts: [
          { day: "Mon", pl: "tt",   title: "Most overrated horror book reel",  desc: "Brave take = massive comment section." },
          { day: "Wed", pl: "ig",   title: "Unpopular opinions carousel",       desc: "5 horror/thriller takes your followers might disagree with." },
          { day: "Fri", pl: "both", title: "'Fight me on this' poll",           desc: "Put your hottest take to a vote. Algorithm loves comment velocity." },
          { day: "Sat", pl: "tt",   title: "Debate response reel",              desc: "React to the most interesting comments from your hot take posts." }
        ],
        stories: [
          { title: "'Agree or disagree?' series", desc: "One unpopular opinion per story slide — followers tap yes/no." },
          { title: "Comment reaction story",      desc: "Screenshot the most interesting debate comments and react live." }
        ]
      },
      {
        label: "Week 4 — second half planning",
        posts: [
          { day: "Mon", pl: "both", title: "Autumn reading list reveal",        desc: "Tease your Autumn/October reading list. Builds anticipation." },
          { day: "Wed", pl: "tt",   title: "'My TBR is out of control' reel",  desc: "Show your to-be-read pile. Relatable, funny, highly commentable." },
          { day: "Fri", pl: "ig",   title: "6-month celebration post",          desc: "Milestone, gratitude, what's coming in months 7–10." },
          { day: "Sun", pl: "both", title: "'What do you want more of?' post",  desc: "Let followers shape your second half. Community = ownership." }
        ],
        stories: [
          { title: "TBR pile reveal",    desc: "'Rate my TBR' — show each book, followers vote keep/remove." },
          { title: "Autumn teaser",      desc: "Spooky aesthetic slides teasing October content — build the hype early." }
        ]
      }
    ]
  },
  {
    name: "M7", fullName: "Month 7", label: "Autumn Prep",
    theme: "Build towards spooky season — your biggest opportunity of the year",
    focus: ["Autumn aesthetic", "Spooky season tease", "TBR reveals"],
    weeks: [
      {
        label: "Week 1 — autumn aesthetics",
        posts: [
          { day: "Mon", pl: "ig",   title: "Autumn reading setup",        desc: "First seasonal shelfie. Candles, leaves, dark covers." },
          { day: "Wed", pl: "tt",   title: "'Best autumn horror' reel",   desc: "Books that feel made for the season. Cosy-spooky genre is huge." },
          { day: "Fri", pl: "both", title: "Autumn TBR announcement",     desc: "Your full October reading list. High-save, high-share format." },
          { day: "Sat", pl: "ig",   title: "Autumn aesthetic mood board", desc: "Visual collage of the colour palette and props you'll use all season." }
        ],
        stories: [
          { title: "Autumn setup BTS", desc: "Behind the scenes of setting up your seasonal reading corner." },
          { title: "TBR poll",         desc: "Show two books — followers vote which you read first in October." }
        ]
      },
      {
        label: "Week 2 — classic horror",
        posts: [
          { day: "Mon", pl: "tt",   title: "Classic horror starter reel",     desc: "Shelley, Stoker, Poe — 'start here if you want the roots.'" },
          { day: "Wed", pl: "ig",   title: "Classic vs modern horror",        desc: "How the genre evolved. Great educational carousel format." },
          { day: "Fri", pl: "both", title: "'Have you read the classics?' poll", desc: "Simple poll tells you your audience's taste profile." },
          { day: "Sun", pl: "ig",   title: "Classics aesthetic flat lay",     desc: "Aged covers, candlelight, quill — maximalist gothic styling." }
        ],
        stories: [
          { title: "'Old or new horror?' debate", desc: "Followers defend their era. Classic horror defenders vs modern fans." },
          { title: "Classic horror quote game",   desc: "Drop a quote — followers guess the book. Winner gets a shoutout." }
        ]
      },
      {
        label: "Week 3 — anticipation building",
        posts: [
          { day: "Mon", pl: "tt",   title: "October reading challenge reveal", desc: "Announce your personal Spooktober challenge with rules." },
          { day: "Wed", pl: "ig",   title: "Horror sub-genre bingo card",      desc: "Followers save this to use all October. Massive save metric." },
          { day: "Fri", pl: "both", title: "'Are you doing Spooktober?' post", desc: "Find your community of Spooktober readers." },
          { day: "Sat", pl: "tt",   title: "Spooktober prep reel",             desc: "How you're physically prepping: snacks, candles, stack — full ritual." }
        ],
        stories: [
          { title: "Spooktober sign-up",    desc: "'Comment your username to join the challenge' — visible community." },
          { title: "Bingo card preview",    desc: "Swipe through each bingo square with a book recommendation for each." }
        ]
      },
      {
        label: "Week 4 — countdown begins",
        posts: [
          { day: "Mon", pl: "both", title: "October countdown post",             desc: "'X days until Spooktober — are you ready?' Hype-building." },
          { day: "Wed", pl: "tt",   title: "'Books for every type of scared' reel", desc: "Scared of clowns? Scared of the dark? Personalised rec hooks." },
          { day: "Fri", pl: "ig",   title: "Mood board for October",             desc: "Visual preview of the aesthetic you're going for this Spooktober." },
          { day: "Sun", pl: "both", title: "'Last book before October' post",    desc: "What you're finishing before the challenge begins. Transition moment." }
        ],
        stories: [
          { title: "Daily countdown story", desc: "One story per day: '7 days until Spooktober' with a scare teaser." },
          { title: "Fear poll series",      desc: "'What scares you most?' — different category each day this week." }
        ]
      }
    ]
  },
  {
    name: "M8 \u2620", fullName: "Month 8 \u2014 October", label: "SPOOKTOBER",
    theme: "Your PEAK month — max posting, max engagement, maximum reach",
    focus: ["Daily posting", "Halloween content", "Viral formats"],
    weeks: [
      {
        label: "Week 1 — Spooktober opens",
        posts: [
          { day: "Day 1", pl: "both", title: "Spooktober Day 1 kick-off",  desc: "Book #1 reveal. Set the tone — your most atmospheric post of the month." },
          { day: "Day 3", pl: "tt",   title: "Spooktober reel update",     desc: "Days 1–3 in 60 seconds. Fast-paced, energy is everything this month." },
          { day: "Day 5", pl: "ig",   title: "Mid-week shelfie",           desc: "Your reading setup with October 1 atmosphere — peak aesthetic month." },
          { day: "Day 7", pl: "both", title: "Week 1 recap",               desc: "7 days in — how scared are you? Books so far, mini ratings." }
        ],
        stories: [
          { title: "Daily Spooktober update",    desc: "Every single day this month: pages read, current mood, creepiest moment." },
          { title: "'Scare-o-meter' daily poll", desc: "Slide 1–10 — how scared are you today? One story per day." }
        ]
      },
      {
        label: "Week 2 — scare levels",
        posts: [
          { day: "Mon", pl: "tt",   title: "Scare-o-meter reel",               desc: "Rate books from 1–10 on how scared you were. Very watchable." },
          { day: "Wed", pl: "ig",   title: "Week 1 Spooktober recap",           desc: "7 books, 7 covers, mini ratings. Carousel format." },
          { day: "Fri", pl: "both", title: "'Scariest book I've ever read' reveal", desc: "Save this for mid-October peak traffic." },
          { day: "Sat", pl: "tt",   title: "'Mid-Spooktober check-in' reel",   desc: "Are you surviving the challenge? Personal and funny update." }
        ],
        stories: [
          { title: "Scare ranking story",  desc: "All books so far ranked scariest → least scary. Followers can DM to debate." },
          { title: "Reading ritual story", desc: "Your October reading ritual: time, snacks, lighting. Inspires others." }
        ]
      },
      {
        label: "Week 3 — themed content",
        posts: [
          { day: "Mon", pl: "tt",   title: "Gothic horror theme week reel",   desc: "5 Gothic horror recs. Daily themed series = subscribers come back." },
          { day: "Wed", pl: "ig",   title: "Gothic aesthetic photo shoot",     desc: "Dark academia, candles, velvet — maximum Spooktober aesthetic." },
          { day: "Fri", pl: "both", title: "Halloween costume as book character", desc: "Dress as a horror character, reveal the book." },
          { day: "Sat", pl: "ig",   title: "Midpoint book stack photo",        desc: "All October reads so far in one epic stack. Peak visual content." }
        ],
        stories: [
          { title: "Costume reveal story",  desc: "'Guess which horror character I am' — reveal after 20 replies." },
          { title: "Gothic vibes inspo slides", desc: "Aesthetic references for gothic horror: films, art, music that matches." }
        ]
      },
      {
        label: "Week 4 — Halloween week",
        posts: [
          { day: "Mon",  pl: "both", title: "'Last minute Halloween read' reel", desc: "Books you can finish in one sitting before Halloween." },
          { day: "Wed",  pl: "ig",   title: "Halloween shelfie",                 desc: "Your most decorated, maximalist horror shelfie of the year." },
          { day: "Fri",  pl: "tt",   title: "Spooktober final round-up",         desc: "All books read. Stats. Scariest. Most disappointing. Best." },
          { day: "Sat",  pl: "both", title: "Halloween day special post",        desc: "On October 31st — your personal horror ritual and book rec for the night." }
        ],
        stories: [
          { title: "Halloween countdown stories", desc: "'X hours until Halloween' — daily story leading to October 31st." },
          { title: "Final Spooktober wrap",       desc: "Last story of the month: emotional sign-off, thank your followers." }
        ]
      }
    ]
  },
  {
    name: "M9", fullName: "Month 9", label: "Post-Peak",
    theme: "Ride the October follower wave with quality content",
    focus: ["New followers", "Evergreen content", "Recap season"],
    weeks: [
      {
        label: "Week 1 — new follower onboarding",
        posts: [
          { day: "Mon", pl: "both", title: "'Welcome to my page' intro repost", desc: "Repost your Month 1 intro for all the October new followers." },
          { day: "Wed", pl: "ig",   title: "Best of Spooktober carousel",        desc: "Top 5 books from October for anyone who missed the daily posts." },
          { day: "Fri", pl: "tt",   title: "Post-October book hangover reel",    desc: "'Nothing hits the same after Spooktober.' Funny, relatable." },
          { day: "Sun", pl: "ig",   title: "'Start here' pinned post update",    desc: "Refresh your pinned intro post with your October growth milestone." }
        ],
        stories: [
          { title: "'Welcome new followers' story", desc: "Introduce yourself again — your name, niche, and what they can expect." },
          { title: "October highlights reel",       desc: "Best story moments from Spooktober compiled into a single story recap." }
        ]
      },
      {
        label: "Week 2 — thriller pivot",
        posts: [
          { day: "Mon", pl: "tt",   title: "'Best thrillers for winter' reel",   desc: "Pivot toward thriller for seasonal variety. Dark, twisty." },
          { day: "Wed", pl: "ig",   title: "Winter thriller aesthetic",           desc: "Dark nights, plot twists, hot drinks. New seasonal visual language." },
          { day: "Fri", pl: "both", title: "Thriller vs horror: what's the diff?", desc: "Educational post — great for new followers from October." },
          { day: "Sat", pl: "tt",   title: "'Thriller recs based on your mood' reel", desc: "'Feeling anxious? Try X. Feeling dark? Try Y.'" }
        ],
        stories: [
          { title: "'Thriller or horror?' quiz", desc: "'I'll guess which you prefer based on 3 questions' — tap through." },
          { title: "Winter reading setup",       desc: "Transitioning your reading corner from spooky to cosy-dark for winter." }
        ]
      },
      {
        label: "Week 3 — awards & lists season",
        posts: [
          { day: "Mon", pl: "tt",   title: "Horror/thriller awards season reel", desc: "React to annual genre awards and best-of lists. Timely content." },
          { day: "Wed", pl: "ig",   title: "'Most anticipated' carousel",         desc: "Books coming out soon that you're hyped for. Great for pre-orders." },
          { day: "Fri", pl: "both", title: "End of year TBR preview",             desc: "What you plan to read before December 31. Builds accountability." },
          { day: "Sun", pl: "ig",   title: "Industry round-up carousel",          desc: "Publishing news, upcoming adaptations, genre trends — authority content." }
        ],
        stories: [
          { title: "Awards reaction story",                      desc: "React to genre award nominations in real time — hot takes welcome." },
          { title: "'Which upcoming book are you most excited for?'", desc: "Give 4 options — followers pick and comment why." }
        ]
      },
      {
        label: "Week 4 — engagement push",
        posts: [
          { day: "Mon", pl: "tt",   title: "'Guess the book' reel",         desc: "Read plot clues aloud — followers guess in comments. Addictive." },
          { day: "Wed", pl: "ig",   title: "'This or that' horror edition",  desc: "Two books, followers pick one. Simple, high-engagement format." },
          { day: "Fri", pl: "both", title: "Month 9 wrap + year countdown",  desc: "'X books left to read this year.' Creates urgency and community." },
          { day: "Sat", pl: "tt",   title: "Community faves round-up reel",  desc: "Books your followers recommended this month — honest takes." }
        ],
        stories: [
          { title: "'Guess the book' story edition", desc: "Text clue on slide 1, cover reveal on slide 2. Fast, addictive format." },
          { title: "Year countdown story",           desc: "'X days left of the year' — how many books can you fit in?" }
        ]
      }
    ]
  },
  {
    name: "M10", fullName: "Month 10", label: "Year-End",
    theme: "Wind down with best-of lists and community celebration",
    focus: ["Best-of lists", "Reading stats", "Gratitude content"],
    weeks: [
      {
        label: "Week 1 — annual lists",
        posts: [
          { day: "Mon", pl: "tt",   title: "'My top 10 of the year' reel",   desc: "Start revealing annual rankings. Teaser format builds suspense." },
          { day: "Wed", pl: "ig",   title: "Book of the year contenders",     desc: "Your shortlist carousel — followers vote in comments." },
          { day: "Fri", pl: "both", title: "Biggest reading disappointments", desc: "Books that didn't live up to hype. Controversy = engagement." },
          { day: "Sat", pl: "ig",   title: "Year-end aesthetic gallery",      desc: "Your 10 best photos of the year in one collage post." }
        ],
        stories: [
          { title: "'Top 10 countdown' story arc", desc: "Reveal #10 down to #1 across 10 story slides — one per day." },
          { title: "'Agree with my ranking?'",     desc: "Followers vote agree/disagree on each pick in your top 10." }
        ]
      },
      {
        label: "Week 2 — stats & data",
        posts: [
          { day: "Mon", pl: "both", title: "Reading stats post",             desc: "Total pages, books, average rating, longest book. Infographic format." },
          { day: "Wed", pl: "tt",   title: "'Reading wrapped' reel",         desc: "Spotify Wrapped style — your reading year in numbers." },
          { day: "Fri", pl: "ig",   title: "Author stats breakdown",         desc: "Which authors did you read most? Genre breakdown chart." },
          { day: "Sat", pl: "both", title: "'Your stats vs mine' collab post", desc: "Challenge followers to share their own reading year stats." }
        ],
        stories: [
          { title: "'Reading wrapped' story version", desc: "Swipe through your stats one number at a time — each slide a reveal." },
          { title: "Followers share their stats",     desc: "Reshare follower 'reading wrapped' stories to your story. Community warmth." }
        ]
      },
      {
        label: "Week 3 — community awards",
        posts: [
          { day: "Mon", pl: "both", title: "'Follower book of the year' poll", desc: "Crowd-sourced award — followers vote. Huge engagement." },
          { day: "Wed", pl: "ig",   title: "'Thank you' community post",       desc: "Genuine gratitude to your followers with milestone celebration." },
          { day: "Fri", pl: "tt",   title: "Community fave reveal",            desc: "Announce the winning book your followers voted for." },
          { day: "Sat", pl: "ig",   title: "'Follower of the year' shoutout",  desc: "Feature your most engaged, supportive community member." }
        ],
        stories: [
          { title: "Live voting story",  desc: "'Your votes are coming in!' — update followers on the award results hourly." },
          { title: "Gratitude series",   desc: "10 story slides, each thanking a specific follower or community moment." }
        ]
      },
      {
        label: "Week 4 — new year setup",
        posts: [
          { day: "Mon", pl: "tt",   title: "2027 most anticipated reveals",         desc: "Books you're most excited to read next year. Pre-hype content." },
          { day: "Wed", pl: "ig",   title: "New year TBR pile photo",               desc: "Your physical TBR pile for next year. Always a crowd-pleaser." },
          { day: "Fri", pl: "both", title: "Year-end sign-off post",                desc: "Personal reflection. What horror/thriller gave you this year." },
          { day: "Sat", pl: "both", title: "'New year reading resolution' post",    desc: "Your one reading goal for next year — invite followers to share theirs." }
        ],
        stories: [
          { title: "TBR pile reveal story", desc: "Swipe through every book on next year's TBR with a hype rating for each." },
          { title: "New year message story", desc: "Personal, heartfelt sign-off — voice note or video for real connection." }
        ]
      }
    ]
  }
];
