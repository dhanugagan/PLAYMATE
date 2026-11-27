export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hints?: string[];
  level: 1 | 2 | 3;
  categoryTag?: string;
}

export interface TrueFalseItem {
  statement: string;
  answer: boolean;
  explanation: string;
  level: 1 | 2 | 3;
}

export interface GuessAnswerItem {
  answer: string;
  options: string[];
  clues: [string, string, string];
  explanation: string;
  level: 1 | 2 | 3;
}

export interface PictureQuizItem {
  visualId: 'taj' | 'rocket' | 'dna' | 'compass' | 'piano' | 'cactus' | 'lighthouse' | 'pyramid' | 'microscope';
  label: string;
  options: string[];
  correctIndex: number;
  category: string;
  level: 1 | 2 | 3;
}

export const QUIZ_BANKS: Record<number, QuizQuestion[]> = {
  1: [
    { prompt: 'Which planet in our solar system has the most prominent ring system?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctIndex: 1, explanation: 'Saturn’s rings span over 280,000 km and are made primarily of water ice and rock.', level: 1 },
    { prompt: 'What is the capital city of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctIndex: 2, explanation: 'Canberra was chosen in 1908 as a compromise between Sydney and Melbourne.', level: 1 },
    { prompt: 'Which instrument measures atmospheric pressure?', options: ['Thermometer', 'Barometer', 'Hygrometer', 'Anemometer'], correctIndex: 1, explanation: 'A barometer measures air pressure and helps forecast weather changes.', level: 1 },
    { prompt: 'Who wrote the classic play "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correctIndex: 1, explanation: 'Shakespeare wrote Romeo and Juliet around 1595 in London.', level: 2 },
    { prompt: 'Which river is the longest river in South America?', options: ['Orinoco', 'Amazon', 'Paraná', 'São Francisco'], correctIndex: 1, explanation: 'The Amazon River carries more water than any other river on Earth.', level: 2 },
    { prompt: 'In what year did the Apollo 11 mission land humans on the Moon?', options: ['1965', '1969', '1972', '1975'], correctIndex: 1, explanation: 'Neil Armstrong and Buzz Aldrin stepped onto the Moon on July 20, 1969.', level: 2 },
    { prompt: 'Which element has the chemical symbol "W"?', options: ['Tungsten', 'Wolframite', 'Vanadium', 'Bismuth'], correctIndex: 0, explanation: 'Tungsten’s symbol W comes from its German/Latin mineral name, Wolfram.', level: 3 },
    { prompt: 'Which country gifted the Statue of Liberty to the United States?', options: ['Spain', 'United Kingdom', 'France', 'Italy'], correctIndex: 2, explanation: 'France gifted the copper statue, designed by Frédéric Auguste Bartholdi, in 1886.', level: 3 },
    { prompt: 'Which ocean trench is the deepest known point on Earth?', options: ['Tonga Trench', 'Java Trench', 'Mariana Trench', 'Puerto Rico Trench'], correctIndex: 2, explanation: 'Challenger Deep in the Mariana Trench reaches nearly 11,000 meters deep.', level: 3 },
  ],
  2: [
    { prompt: 'What gas do plants primarily absorb from the atmosphere for photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'], correctIndex: 2, explanation: 'Plants convert carbon dioxide and water into glucose using sunlight.', level: 1 },
    { prompt: 'What is the boiling point of pure water at standard sea-level pressure?', options: ['90°C', '100°C', '110°C', '120°C'], correctIndex: 1, explanation: 'At 1 atmosphere of pressure, water boils at 100°C (212°F).', level: 1 },
    { prompt: 'Which part of the human cell is known as its powerhouse?', options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi body'], correctIndex: 2, explanation: 'Mitochondria generate most of the cell’s supply of ATP energy.', level: 1 },
    { prompt: 'What force keeps planets orbiting around the Sun?', options: ['Magnetism', 'Gravity', 'Friction', 'Nuclear force'], correctIndex: 1, explanation: 'Gravitational attraction between the Sun and each planet governs orbital motion.', level: 2 },
    { prompt: 'Which blood cells carry oxygen from the lungs to body tissues?', options: ['White blood cells', 'Platelets', 'Red blood cells', 'Plasma cells'], correctIndex: 2, explanation: 'Red blood cells contain hemoglobin, which binds and transports oxygen.', level: 2 },
    { prompt: 'What is the pH value of a neutral solution like pure water at 25°C?', options: ['0', '5', '7', '14'], correctIndex: 2, explanation: 'The pH scale runs 0–14, with 7 being perfectly neutral.', level: 2 },
    { prompt: 'Approximately how fast does light travel in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '3,000 km/s'], correctIndex: 0, explanation: 'Light travels at 299,792 kilometers per second in a vacuum.', level: 3 },
    { prompt: 'Which subatomic particle carries a negative electrical charge?', options: ['Proton', 'Neutron', 'Electron', 'Photon'], correctIndex: 2, explanation: 'Electrons carry a -1 elementary charge outside the atomic nucleus.', level: 3 },
    { prompt: 'What phenomenon bends light as it passes from air into water?', options: ['Diffraction', 'Refraction', 'Reflection', 'Polarization'], correctIndex: 1, explanation: 'Refraction occurs because light changes speed when entering a denser medium.', level: 3 },
  ],
  4: [
    { prompt: 'Which ancient civilization built the pyramids of Giza?', options: ['Mesopotamian', 'Egyptian', 'Roman', 'Mayan'], correctIndex: 1, explanation: 'Ancient Egyptians constructed the Great Pyramid of Giza around 2560 BCE.', level: 1 },
    { prompt: 'Who was the first Prime Minister of independent India?', options: ['Mahatma Gandhi', 'Sardar Patel', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad'], correctIndex: 2, explanation: 'Jawaharlal Nehru took office as India’s first Prime Minister in August 1947.', level: 1 },
    { prompt: 'Which ancient Indus Valley city was famous for its advanced drainage and Great Bath?', options: ['Mohenjo-daro', 'Pataliputra', 'Varanasi', 'Ujjain'], correctIndex: 0, explanation: 'Mohenjo-daro featured grid-planned streets and brick-lined sanitation.', level: 1 },
    { prompt: 'In which year did the Indian Constitution come into effect (Republic Day)?', options: ['1947', '1948', '1950', '1952'], correctIndex: 2, explanation: 'India adopted its Constitution on January 26, 1950.', level: 2 },
    { prompt: 'The Renaissance cultural movement began in which European country?', options: ['France', 'Italy', 'Germany', 'England'], correctIndex: 1, explanation: 'The Renaissance blossomed in Florence, Italy during the 14th century.', level: 2 },
    { prompt: 'Who invented the movable-type printing press in Europe around 1440?', options: ['Leonardo da Vinci', 'Johannes Gutenberg', 'Galileo Galilei', 'Isaac Newton'], correctIndex: 1, explanation: 'Gutenberg’s printing press revolutionized literacy and scientific sharing.', level: 2 },
    { prompt: 'Which Mauryan emperor spread messages of peace via rock and pillar edicts?', options: ['Chandragupta', 'Bindusara', 'Ashoka', 'Samudragupta'], correctIndex: 2, explanation: 'Emperor Ashoka promoted dharma and non-violence across his empire.', level: 3 },
    { prompt: 'The Silk Road primarily connected East Asia with which region?', options: ['Mediterranean & Middle East', 'South America', 'Arctic Circle', 'Australia'], correctIndex: 0, explanation: 'The Silk Road carried silk, spices, paper, and ideas across Eurasia.', level: 3 },
    { prompt: 'Which 1215 English charter established that even the monarch is subject to law?', options: ['Treaty of Versailles', 'Magna Carta', 'Bill of Rights', 'Domesday Book'], correctIndex: 1, explanation: 'King John sealed Magna Carta at Runnymede in 1215.', level: 3 },
  ],
  5: [
    { prompt: 'What does "CPU" stand for in computing?', options: ['Central Processing Unit', 'Core Program Utility', 'Computer Power Unit', 'Central Packet User'], correctIndex: 0, explanation: 'The CPU executes instructions that make up computer programs.', level: 1 },
    { prompt: 'Which number system uses only the digits 0 and 1?', options: ['Decimal', 'Octal', 'Binary', 'Hexadecimal'], correctIndex: 2, explanation: 'Digital logic relies on binary (base-2) states: 0 and 1.', level: 1 },
    { prompt: 'Which protocol secures web traffic with encryption (shown by the lock icon)?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correctIndex: 2, explanation: 'HTTPS wraps HTTP inside TLS encryption to protect data in transit.', level: 1 },
    { prompt: 'What data structure follows the Last-In, First-Out (LIFO) principle?', options: ['Queue', 'Stack', 'Linked List', 'Hash Table'], correctIndex: 1, explanation: 'A Stack pushes and pops items from the top—Last-In, First-Out.', level: 2 },
    { prompt: 'Which language runs natively inside web browsers alongside HTML and CSS?', options: ['Python', 'JavaScript', 'C++', 'Rust'], correctIndex: 1, explanation: 'JavaScript powers interactive client-side behavior in every browser.', level: 2 },
    { prompt: 'In relational databases, what does SQL stand for?', options: ['Structured Query Language', 'System Quality Link', 'Sequential Queue Logic', 'Simple Quick Lookup'], correctIndex: 0, explanation: 'SQL is used to query, insert, update, and manage relational tables.', level: 2 },
    { prompt: 'What is the average time complexity of binary search on a sorted array of N items?', options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'], correctIndex: 1, explanation: 'Binary search halves the remaining search space on every comparison.', level: 3 },
    { prompt: 'Which architectural component translates human-readable domain names into IP addresses?', options: ['DHCP', 'DNS', 'NAT', 'ARP'], correctIndex: 1, explanation: 'DNS (Domain Name System) acts as the internet’s address directory.', level: 3 },
    { prompt: 'In machine learning, what is "overfitting"?', options: ['Undertraining a model', 'Memorizing training noise and failing to generalize', 'Compressing weights', 'Increasing batch size'], correctIndex: 1, explanation: 'Overfitting occurs when a model fits training quirks instead of true patterns.', level: 3 },
  ],
  21: [
    { prompt: 'Choose the closest synonym for "Ephemeral":', options: ['Eternal', 'Short-lived', 'Massive', 'Fragile'], correctIndex: 1, explanation: 'Ephemeral describes something lasting for only a very brief time.', level: 1 },
    { prompt: 'Choose the antonym for "Benevolent":', options: ['Generous', 'Kind', 'Malevolent', 'Cheerful'], correctIndex: 2, explanation: 'Benevolent means well-meaning and kind; malevolent means wishing harm.', level: 1 },
    { prompt: 'What does the word "Resilient" mean?', options: ['Easily broken', 'Able to recover quickly from difficulties', 'Silent and shy', 'Overly cautious'], correctIndex: 1, explanation: 'Resilience is the capacity to bounce back from setbacks.', level: 1 },
    { prompt: 'Pick the word that best completes: "Her explanation was so ___ that everyone understood immediately."', options: ['Ambiguous', 'Lucid', 'Verbose', 'Cryptic'], correctIndex: 1, explanation: 'Lucid means expressed clearly and easy to understand.', level: 2 },
    { prompt: 'Choose the closest synonym for "Pragmatic":', options: ['Idealistic', 'Practical', 'Reckless', 'Stubborn'], correctIndex: 1, explanation: 'A pragmatic person deals with situations sensibly and practically.', level: 2 },
    { prompt: 'Choose the antonym for "Scarce":', options: ['Rare', 'Limited', 'Abundant', 'Hollow'], correctIndex: 2, explanation: 'Abundant means existing in plentiful quantities—the opposite of scarce.', level: 2 },
    { prompt: 'What does "Ubiquitous" mean?', options: ['Hidden underground', 'Present or found everywhere', 'Ancient and forgotten', 'Strictly forbidden'], correctIndex: 1, explanation: 'Smartphones have become ubiquitous in modern daily life.', level: 3 },
    { prompt: 'Choose the synonym for "Mitigate":', options: ['Worsen', 'Alleviate', 'Accelerate', 'Ignore'], correctIndex: 1, explanation: 'To mitigate is to make something less severe, harmful, or painful.', level: 3 },
    { prompt: 'What does "Eloquent" describe?', options: ['Fluent and persuasive speaking or writing', 'Extreme fatigue', 'Secretive plotting', 'Rigid symmetry'], correctIndex: 0, explanation: 'Eloquent speech moves listeners with clarity and grace.', level: 3 },
  ],
  43: [
    { prompt: 'Choose the grammatically correct sentence:', options: ['She don’t like rainy Mondays.', 'She doesn’t likes rainy Mondays.', 'She doesn’t like rainy Mondays.', 'She not liking rainy Mondays.'], correctIndex: 2, explanation: 'Third-person singular uses "doesn’t" + base verb ("like").', level: 1 },
    { prompt: 'Fill the blank: "We arrived ___ the airport twenty minutes early."', options: ['at', 'on', 'into', 'by'], correctIndex: 0, explanation: 'Use "arrive at" for specific buildings, stations, or airports.', level: 1 },
    { prompt: 'Choose the right article: "He waited for ___ hour before the train arrived."', options: ['a', 'an', 'the', 'no article'], correctIndex: 1, explanation: '"Hour" begins with a silent h and vowel sound, so it takes "an".', level: 1 },
    { prompt: 'Pick the correct tense: "By the time we reached the hall, the concert ___."', options: ['already starts', 'had already started', 'has already start', 'will already started'], correctIndex: 1, explanation: 'Past perfect ("had started") shows an action completed before another past event.', level: 2 },
    { prompt: 'Identify the correct sentence:', options: ['Neither of the answers are right.', 'Neither of the answers is right.', 'Neither of the answer is right.', 'Neither answers is right.'], correctIndex: 1, explanation: '"Neither of [plural noun]" takes a singular verb ("is").', level: 2 },
    { prompt: 'Fill the blank: "The team divided the prize ___ its five members."', options: ['between', 'among', 'beside', 'across'], correctIndex: 1, explanation: 'Use "among" when distributing across three or more individuals.', level: 2 },
    { prompt: 'Choose the right form: "If I ___ earlier, I would have caught the ferry."', options: ['left', 'had left', 'would leave', 'have left'], correctIndex: 1, explanation: 'Third conditional hypothetical past events use "If + past perfect".', level: 3 },
    { prompt: 'Spot the correct parallel structure:', options: ['She likes hiking, swimming, and to cycle.', 'She likes to hike, swimming, and cycling.', 'She likes hiking, swimming, and cycling.', 'She likes hike, swim, and cycling.'], correctIndex: 2, explanation: 'Parallel lists keep all items in the same grammatical form (-ing gerunds).', level: 3 },
    { prompt: 'Choose the correct pronoun: "Between you and ___, this puzzle is clever."', options: ['I', 'me', 'myself', 'mine'], correctIndex: 1, explanation: 'Prepositions like "between" require the object pronoun ("me").', level: 3 },
  ],
  45: [
    { prompt: 'You receive ₹10,000 monthly allowance/stipend. Which rule is a classic healthy budgeting baseline?', options: ['Spend 100% immediately', '50% Needs / 30% Wants / 20% Savings', 'Save 0% until age 40', 'Borrow for daily snacks'], correctIndex: 1, explanation: 'The 50/30/20 framework balances essentials, enjoyment, and consistent savings.', level: 1 },
    { prompt: 'What is an Emergency Fund primarily meant for?', options: ['Buying concert tickets', 'Unexpected medical or urgent expenses', 'Impulsive flash sales', 'Gaming skins'], correctIndex: 1, explanation: 'An emergency fund protects you from debt during sudden unexpected costs.', level: 1 },
    { prompt: 'Why is Compound Interest called powerful for savers?', options: ['You earn interest only once', 'You earn interest on both principal and past interest', 'Banks charge zero fees', 'Prices always drop'], correctIndex: 1, explanation: 'Compounding snowballs growth over time as interest itself earns interest.', level: 1 },
    { prompt: 'If inflation is 6% per year and cash under a mattress earns 0%, what happens to purchasing power?', options: ['It increases by 6%', 'It stays identical', 'It buys less over time', 'It doubles'], correctIndex: 2, explanation: 'Inflation reduces what each unit of idle cash can purchase.', level: 2 },
    { prompt: 'Which option typically carries the HIGHEST interest cost if unpaid past due date?', options: ['Savings account', 'Credit card revolving balance', 'Government savings bond', 'Fixed deposit'], correctIndex: 1, explanation: 'Unpaid credit card balances often carry 24%–42% APR interest.', level: 2 },
    { prompt: 'Why should investors diversify across different assets instead of putting 100% in one stock?', options: ['To pay more fees', 'To reduce the risk of a single failure wiping out savings', 'Because banks require it', 'To guarantee instant millions'], correctIndex: 1, explanation: 'Diversification spreads risk so one downturn does not sink your entire portfolio.', level: 2 },
    { prompt: 'Before signing up for a "Zero-Cost EMI" offer, what should a smart buyer check?', options: ['Only the box color', 'Processing fees, hidden markups, and total payable amount', 'Nothing at all', 'Social media likes'], correctIndex: 1, explanation: 'Checking total cost and processing fees prevents paying hidden interest.', level: 3 },
    { prompt: 'Roughly how long does it take money to double at 8% annual compound return (Rule of 72)?', options: ['3 years', '9 years', '18 years', '36 years'], correctIndex: 1, explanation: 'The Rule of 72 estimates doubling time: 72 ÷ 8 = 9 years.', level: 3 },
    { prompt: 'Which habit best protects your digital banking accounts?', options: ['Sharing OTPs with callers', 'Using strong unique passwords + two-factor authentication', 'Using "123456" everywhere', 'Clicking unknown prize links'], correctIndex: 1, explanation: 'Never share OTPs; unique passwords and 2FA block unauthorized access.', level: 3 },
  ],
};

export const TRUE_FALSE_BANK: TrueFalseItem[] = [
  { statement: 'Honey never spoils when sealed in an airtight jar—edible honey has been found in ancient tombs.', answer: true, explanation: 'Low moisture and natural acidity prevent bacteria from growing in pure honey.', level: 1 },
  { statement: 'Lightning never strikes the same place twice.', answer: false, explanation: 'Tall structures like the Empire State Building are struck dozens of times every year.', level: 1 },
  { statement: 'Octopuses have three hearts and blue copper-based blood.', answer: true, explanation: 'Two hearts pump blood to the gills and one pumps it to the rest of the body.', level: 1 },
  { statement: 'A day on Venus is longer than a year on Venus.', answer: true, explanation: 'Venus rotates very slowly—one rotation takes 243 Earth days, while its orbit takes 225.', level: 2 },
  { statement: 'Goldfish only have a 3-second memory span.', answer: false, explanation: 'Studies prove goldfish can remember tasks and feeding routines for months.', level: 2 },
  { statement: 'Mount Everest is the tallest mountain measured from Earth’s center to its peak.', answer: false, explanation: 'Because Earth bulges at the equator, Mount Chimborazo in Ecuador is farthest from Earth’s center.', level: 2 },
  { statement: 'Bananas are botanically classified as berries, while strawberries are not.', answer: true, explanation: 'Botanically, bananas develop from a single ovary and qualify as berries.', level: 3 },
  { statement: 'Sound travels faster in air than in steel.', answer: false, explanation: 'Sound travels over 15 times faster in solid steel because particles are tightly packed.', level: 3 },
  { statement: 'The Great Wall of China is easily visible to the naked eye from the Moon.', answer: false, explanation: 'Astronauts confirmed the wall is far too narrow to see without magnification from lunar orbit.', level: 3 },
];

export const GUESS_ANSWER_BANK: GuessAnswerItem[] = [
  {
    answer: 'Compass',
    options: ['Sundial', 'Compass', 'Telescope', 'Astrolabe'],
    clues: [
      'I never run on batteries, yet travelers relied on me for centuries.',
      'I contain a magnetized needle that aligns with Earth’s field.',
      'I always point toward magnetic North.',
    ],
    explanation: 'Invented in ancient China, the magnetic compass revolutionized ocean navigation.',
    level: 1,
  },
  {
    answer: 'Photosynthesis',
    options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Evaporation'],
    clues: [
      'I am a biochemical process powered by photons.',
      'Green chlorophyll molecules play the starring role inside leaves.',
      'I turn sunlight, water, and CO₂ into sugar and oxygen.',
    ],
    explanation: 'Photosynthesis sustains nearly all food chains and produces Earth’s atmospheric oxygen.',
    level: 2,
  },
  {
    answer: 'C. V. Raman',
    options: ['Homi Bhabha', 'C. V. Raman', 'Satyendra Bose', 'A. P. J. Abdul Kalam'],
    clues: [
      'I won the 1930 Nobel Prize in Physics.',
      'My curiosity was sparked by the deep blue color of the Mediterranean Sea.',
      'I discovered the inelastic scattering of light named after me.',
    ],
    explanation: 'Sir Chandrasekhara Venkata Raman discovered the Raman Effect in 1928.',
    level: 3,
  },
  {
    answer: 'Fibonacci Sequence',
    options: ['Prime Sieve', 'Fibonacci Sequence', 'Pascal Triangle', 'Binary Tree'],
    clues: [
      'Sunflower seeds and pinecones often spiral according to my numbers.',
      'I start with 0, 1, 1, 2, 3, 5, 8...',
      'Each new number equals the sum of the two preceding numbers.',
    ],
    explanation: 'The Fibonacci sequence approaches the Golden Ratio (~1.618) as terms grow.',
    level: 2,
  },
];

export const PICTURE_QUIZ_BANK: PictureQuizItem[] = [
  { visualId: 'taj', label: 'Taj Mahal', options: ['Red Fort', 'Taj Mahal', 'Hawa Mahal', 'Lotus Temple'], correctIndex: 1, category: 'Landmark', level: 1 },
  { visualId: 'rocket', label: 'Space Rocket', options: ['Submarine', 'Space Rocket', 'Windmill', 'Bullet Train'], correctIndex: 1, category: 'Science', level: 1 },
  { visualId: 'dna', label: 'DNA Double Helix', options: ['DNA Double Helix', 'Suspension Bridge', 'Sound Wave', 'Spiral Staircase'], correctIndex: 0, category: 'Biology', level: 2 },
  { visualId: 'lighthouse', label: 'Lighthouse', options: ['Radio Tower', 'Lighthouse', 'Clock Tower', 'Periscope'], correctIndex: 1, category: 'Architecture', level: 2 },
  { visualId: 'microscope', label: 'Microscope', options: ['Telescope', 'Microscope', 'Sewing Machine', 'Projector'], correctIndex: 1, category: 'Lab Tool', level: 3 },
  { visualId: 'pyramid', label: 'Great Pyramid', options: ['Mayan Ziggurat', 'Great Pyramid', 'Parthenon', 'Colosseum'], correctIndex: 1, category: 'History', level: 3 },
];

export const WORD_BANK = {
  Easy: ['PLANET', 'ROCKET', 'PUZZLE', 'BRIDGE', 'GUITAR', 'FOREST', 'GARDEN', 'FRIEND', 'SILVER', 'STREAM'],
  Medium: ['ALGORITHM', 'COMPASS', 'GALAXY', 'HARMONY', 'LANTERN', 'MYSTERY', 'HORIZON', 'SPECTRUM', 'SYMPHONY'],
  Hard: ['LABYRINTH', 'CHRONICLE', 'EQUILIBRIUM', 'CATALYST', 'PARADIGM', 'PENDULUM', 'TELESCOPE', 'MOMENTUM'],
};

export const FIVE_LETTER_WORDS = [
  'BRAIN', 'SPARK', 'CHESS', 'QUEST', 'SOLAR', 'LIGHT', 'TRACE', 'CROWN', 'GLOBE', 'PIANO', 'SWIFT', 'CRAFT',
];

export const EMOJI_STORIES = [
  { emojis: '🦁 👑 🌅', answer: 'The Lion King', options: ['The Lion King', 'Jungle Book', 'Madagascar', 'Tarzan'], hint: 'Classic animated movie about Simba', category: 'Movie', level: 1 },
  { emojis: '🪔 ✨ 🎆 🏠', answer: 'Diwali Festival', options: ['Holi', 'Diwali Festival', 'Onam', 'Eid'], hint: 'Festival of Lights celebrated with diyas', category: 'Festival', level: 1 },
  { emojis: '🚀 👨‍🚀 🌕 🇮🇳', answer: 'Chandrayaan Mission', options: ['Apollo 13', 'Chandrayaan Mission', 'Mars Rover', 'Voyager'], hint: 'India’s lunar exploration milestone', category: 'Science', level: 2 },
  { emojis: '🍎 ⬇️ 👨‍🔬 💡', answer: 'Law of Gravity', options: ['Law of Gravity', 'Baking Pie', 'Orchard Harvest', 'Optics'], hint: 'Newton’s famous apple inspiration', category: 'Science', level: 2 },
  { emojis: '⏰ 🐦 🐛', answer: 'Early Bird Catches the Worm', options: ['Time Flies', 'Early Bird Catches the Worm', 'Night Owl', 'Slow and Steady'], hint: 'Classic proverb about starting early', category: 'Proverb', level: 3 },
  { emojis: '🏏 🏆 🇮🇳 💙', answer: 'Cricket World Cup Victory', options: ['Olympic Relay', 'Cricket World Cup Victory', 'Chess Olympiad', 'Badminton Open'], hint: 'Major blue-jersey championship moment', category: 'Sports', level: 3 },
];

export const CHARADES_DECK = [
  { word: 'Riding a Rollercoaster', category: 'Adventure' },
  { word: 'Playing Cricket Bowler', category: 'Sports' },
  { word: 'Astronaut Floating in Space', category: 'Profession' },
  { word: 'Chef Flipping Pancakes', category: 'Everyday' },
  { word: 'Photographer Taking Wildlife Shots', category: 'Profession' },
  { word: 'Elephant Drinking Water', category: 'Animals' },
  { word: 'Wizard Casting a Spell', category: 'Movies' },
  { word: 'Scuba Diver Seeing a Shark', category: 'Adventure' },
];

export const SOUND_CLIPS = [
  { id: 'bird', label: 'Morning Songbird', options: ['Morning Songbird', 'Steam Train', 'Alarm Siren', 'Ticking Clock'] },
  { id: 'siren', label: 'Emergency Siren', options: ['Piano Chord', 'Emergency Siren', 'Croaking Frog', 'Laser Beam'] },
  { id: 'piano', label: 'Grand Piano Arpeggio', options: ['Grand Piano Arpeggio', 'Train Horn', 'Telephone Bell', 'Songbird'] },
  { id: 'clock', label: 'Ticking Clock', options: ['Laser Beam', 'Ticking Clock', 'Emergency Siren', 'Croaking Frog'] },
  { id: 'laser', label: 'Arcade Laser Zap', options: ['Arcade Laser Zap', 'Piano Chord', 'Morning Songbird', 'Train Horn'] },
  { id: 'frog', label: 'Pond Frog Croak', options: ['Telephone Bell', 'Pond Frog Croak', 'Ticking Clock', 'Piano Chord'] },
  { id: 'train', label: 'Express Train Horn', options: ['Express Train Horn', 'Arcade Laser Zap', 'Songbird', 'Clock'] },
];

export const CODING_CHALLENGES = [
  {
    title: 'Sum of Even Numbers',
    language: 'JavaScript',
    prompt: 'Arrange the lines in the exact order to return the sum of all even numbers in array `nums`.',
    lines: [
      'let total = 0;',
      'for (const n of nums) {',
      '  if (n % 2 === 0) total += n;',
      '}',
      'return total;',
    ],
    testCase: 'Input: [1, 2, 3, 4, 6] → Expected Output: 12',
  },
  {
    title: 'Reverse a String',
    language: 'Python',
    prompt: 'Order the steps to reverse string `s` without using slice `[::-1]`.',
    lines: [
      'result = ""',
      'for ch in s:',
      '  result = ch + result',
      'return result',
    ],
    testCase: 'Input: "PLAY" → Expected Output: "YALP"',
  },
  {
    title: 'Find Maximum Value',
    language: 'JavaScript',
    prompt: 'Order the statements to find the largest number in a non-empty array `arr`.',
    lines: [
      'let best = arr[0];',
      'for (let i = 1; i < arr.length; i++) {',
      '  if (arr[i] > best) best = arr[i];',
      '}',
      'return best;',
    ],
    testCase: 'Input: [7, 2, 19, 4] → Expected Output: 19',
  },
];

export const DEBUGGING_CHALLENGES = [
  {
    title: 'Off-By-One Loop Bug',
    language: 'JavaScript',
    buggyLines: [
      'function countPass(scores) {',
      '  let count = 0;',
      '  for (let i = 0; i <= scores.length; i++) {',
      '    if (scores[i] >= 50) count++;',
      '  }',
      '  return count;',
      '}',
    ],
    bugLineIndex: 2,
    fixOptions: [
      'for (let i = 0; i < scores.length; i++) {',
      'for (let i = 1; i <= scores.length; i++) {',
      'if (scores[i] > 50) count++;',
    ],
    correctFixIndex: 0,
    explanation: 'Arrays are 0-indexed, so `i <= scores.length` reads `undefined` past the end. Use `i < scores.length`.',
  },
  {
    title: 'Assignment Instead of Comparison',
    language: 'Python',
    buggyLines: [
      'def is_winner(score):',
      '  if score = 100:',
      '    return "Gold"',
      '  return "Silver"',
    ],
    bugLineIndex: 1,
    fixOptions: [
      '  if score == 100:',
      '  if score := 100:',
      '  return "Gold"',
    ],
    correctFixIndex: 0,
    explanation: 'A single `=` assigns a value; `==` compares equality.',
  },
  {
    title: 'Missing Base Case in Recursion',
    language: 'JavaScript',
    buggyLines: [
      'function factorial(n) {',
      '  return n * factorial(n - 1);',
      '}',
    ],
    bugLineIndex: 1,
    fixOptions: [
      '  if (n <= 1) return 1; return n * factorial(n - 1);',
      '  return n + factorial(n - 1);',
      '  return n * factorial(n + 1);',
    ],
    correctFixIndex: 0,
    explanation: 'Without a base case (`n <= 1`), recursion loops infinitely until stack overflow.',
  },
];

export const LOGIC_RIDDLES = [
  {
    question: 'Three friends—Aarav, Diya, and Kabir—each have one pet: a cat, a dog, or a parrot. Aarav is allergic to fur. Diya’s pet barks. Who owns the cat?',
    clues: ['Aarav cannot own a furry pet (cat or dog).', 'Diya’s pet barks, so Diya owns the dog.', 'Only one person remains for the cat.'],
    options: ['Aarav', 'Diya', 'Kabir'],
    correctIndex: 2,
    explanation: 'Aarav has the parrot (no fur), Diya has the dog (barks), leaving Kabir with the cat.',
  },
  {
    question: 'In a sprint race, you overtake the runner who is currently in 2nd place. What position are you in now?',
    clues: ['Consider who was ahead of you.', 'You took the spot of the 2nd-place runner.', 'The 1st-place runner is still ahead.'],
    options: ['1st Place', '2nd Place', '3rd Place'],
    correctIndex: 1,
    explanation: 'When you pass the person in 2nd place, you step into 2nd place—not 1st!',
  },
  {
    question: 'A clock shows 3:15. What is the exact angle between the hour hand and the minute hand?',
    clues: ['At 3:15, the minute hand points directly at 3 (90°).', 'The hour hand moves 0.5° every minute past 3.', '15 minutes × 0.5° = ?'],
    options: ['0°', '7.5°', '15°'],
    correctIndex: 1,
    explanation: 'While the minute hand is at 90°, the hour hand has crept 15 × 0.5° = 7.5° past the 3.',
  },
];

export const GEOGRAPHY_CHALLENGES = [
  { prompt: 'Tap South America on the world map!', targetRegion: 'south_america', hint: 'Home to the Amazon Rainforest & Andes' },
  { prompt: 'Tap India on the world map!', targetRegion: 'india', hint: 'South Asian peninsula bordered by the Himalayas' },
  { prompt: 'Tap Africa on the world map!', targetRegion: 'africa', hint: 'Continent crossed by both the Equator and Sahara' },
  { prompt: 'Tap Europe on the world map!', targetRegion: 'europe', hint: 'North of the Mediterranean Sea' },
  { prompt: 'Tap Australia / Oceania on the world map!', targetRegion: 'oceania', hint: 'Southern hemisphere island continent' },
  { prompt: 'Tap North America on the world map!', targetRegion: 'north_america', hint: 'Contains Canada, USA & Mexico' },
];

export const MYSTERY_CASES = [
  {
    title: 'The Missing Golden Trophy',
    briefing: 'Minutes before the PLAYMATE School Assembly, the Golden Quiz Trophy vanished from Room 12. Three suspects were spotted nearby.',
    clues: [
      'Footprints in chalk dust lead from the trophy shelf straight to the Science Lab sink.',
      'A sticky note near the podium reads in shift+1 cipher: "MBCSBUPSZ" (Shift each letter back 1!).',
      'Witness log: The janitor was locked outside; the Drama Captain never left the stage.',
    ],
    cipherPrompt: 'Decode "MBCSBUPSZ" by shifting each letter 1 step BACK in the alphabet:',
    cipherAnswer: 'LABRATORY',
    cipherAccepted: ['LABRATORY', 'LABORATORY'],
    suspects: ['Chef Arjun (Cafeteria)', 'Meera (Chemistry Club Lead)', 'Rohan (Drama Captain)'],
    culpritIndex: 1,
    explanation: 'Shifting M-B-C-S-B-U-P-S-Z back 1 letter gives L-A-B-R-A-T-O-R-Y, matching the chalk footprints to the Science Lab—where Meera hid it for a prank!',
  },
];
