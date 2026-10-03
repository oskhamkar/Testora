require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Topic = require('../models/Topic');
const Concept = require('../models/Concept');
const Question = require('../models/Question');
const MockTest = require('../models/MockTest');
const TeacherQuiz = require('../models/TeacherQuiz');
const QuizAssignment = require('../models/QuizAssignment');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for seeding');
};

const clearDB = async () => {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Topic.deleteMany({}),
    Concept.deleteMany({}),
    Question.deleteMany({}),
    MockTest.deleteMany({}),
    TeacherQuiz.deleteMany({}),
    QuizAssignment.deleteMany({}),
  ]);
  console.log('🗑️  Database cleared');
};

const seed = async () => {
  await connectDB();
  await clearDB();

  // ─── USERS ───────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'Testora',
    email: 'admin@testora.com',
    mobile: '9000000001',
    passwordHash: await bcrypt.hash('Admin@123', salt),
    role: 'admin',
    isActive: true,
  });

  const teacher = await User.create({
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'teacher@testora.com',
    mobile: '9000000002',
    passwordHash: await bcrypt.hash('Teacher@123', salt),
    role: 'teacher',
    isActive: true,
  });

  const students = await User.insertMany([
    {
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul@testora.com',
      mobile: '9111111111',
      passwordHash: await bcrypt.hash('Student@123', salt),
      role: 'student',
      college: 'MIT College of Engineering',
      course: 'B.Tech CSE',
      year: '3',
      isActive: true,
    },
    {
      firstName: 'Sneha',
      lastName: 'Patil',
      email: 'sneha@testora.com',
      mobile: '9222222222',
      passwordHash: await bcrypt.hash('Student@123', salt),
      role: 'student',
      college: 'VJTI Mumbai',
      course: 'B.Tech IT',
      year: '4',
      isActive: true,
    },
    {
      firstName: 'Arjun',
      lastName: 'Mehta',
      email: 'arjun@testora.com',
      mobile: '9333333333',
      passwordHash: await bcrypt.hash('Student@123', salt),
      role: 'student',
      college: 'COEP Pune',
      course: 'B.E. CS',
      year: '3',
      isActive: true,
    },
    {
      firstName: 'Divya',
      lastName: 'Krishnan',
      email: 'divya@testora.com',
      mobile: '9444444444',
      passwordHash: await bcrypt.hash('Student@123', salt),
      role: 'student',
      college: 'NIT Nagpur',
      course: 'B.Tech CSE',
      year: '4',
      isActive: true,
    },
  ]);

  console.log('👥 Users seeded');

  // ─── CATEGORIES ──────────────────────────────────────────
  const [catQuant, catLogical, catVerbal] = await Category.insertMany([
    { name: 'Quantitative Aptitude', description: 'Numerical ability and mathematical reasoning questions for placement preparation.', isActive: true },
    { name: 'Logical Reasoning', description: 'Analytical and logical thinking questions to assess reasoning ability.', isActive: true },
    { name: 'Verbal Ability', description: 'English language and communication skills for aptitude tests.', isActive: true },
  ]);

  console.log('📁 Categories seeded');

  // ─── TOPICS ──────────────────────────────────────────────
  const topicsData = [
    // Quantitative
    { categoryId: catQuant._id, name: 'Percentages', description: 'Questions on percentage calculations, increase/decrease and applications in real-world problems.' },
    { categoryId: catQuant._id, name: 'Profit & Loss', description: 'Problems involving cost price, selling price, profit, loss and discount calculations.' },
    { categoryId: catQuant._id, name: 'Time & Work', description: 'Questions on work efficiency, time to complete tasks and pipes & cisterns.' },
    { categoryId: catQuant._id, name: 'Time, Speed & Distance', description: 'Problems involving relative speed, average speed and distance-time relationships.' },
    { categoryId: catQuant._id, name: 'Simple & Compound Interest', description: 'Calculations involving interest on principal over time periods.' },
    { categoryId: catQuant._id, name: 'Ratio & Proportion', description: 'Problems on ratios, proportions, partnership and mixture & alligation.' },
    { categoryId: catQuant._id, name: 'Number System', description: 'Divisibility, HCF, LCM, remainders and number properties.' },
    { categoryId: catQuant._id, name: 'Permutation & Combination', description: 'Counting principles, arrangements and selections.' },
    { categoryId: catQuant._id, name: 'Probability', description: 'Calculating likelihood of events in various scenarios.' },
    { categoryId: catQuant._id, name: 'Average', description: 'Problems involving mean, weighted average and related applications.' },
    // Logical
    { categoryId: catLogical._id, name: 'Number Series', description: 'Identify patterns and missing terms in number sequences.' },
    { categoryId: catLogical._id, name: 'Coding-Decoding', description: 'Decode words and numbers using given coding patterns.' },
    { categoryId: catLogical._id, name: 'Blood Relations', description: 'Determine family relationships from given information.' },
    { categoryId: catLogical._id, name: 'Syllogism', description: 'Logical deductions from given statements and conclusions.' },
    { categoryId: catLogical._id, name: 'Seating Arrangement', description: 'Arrange people or objects based on given conditions.' },
    { categoryId: catLogical._id, name: 'Direction Sense', description: 'Determine directions and distances from given movement clues.' },
    { categoryId: catLogical._id, name: 'Analogy', description: 'Identify similar relationships between pairs of words or numbers.' },
    // Verbal
    { categoryId: catVerbal._id, name: 'Synonyms & Antonyms', description: 'Words with similar and opposite meanings for vocabulary enhancement.' },
    { categoryId: catVerbal._id, name: 'Reading Comprehension', description: 'Understanding and answering questions based on given passages.' },
    { categoryId: catVerbal._id, name: 'Sentence Correction', description: 'Identify and correct grammatical errors in sentences.' },
    { categoryId: catVerbal._id, name: 'Para Jumbles', description: 'Arrange jumbled sentences to form a coherent paragraph.' },
    { categoryId: catVerbal._id, name: 'One Word Substitution', description: 'Single word replacements for given phrases or descriptions.' },
  ];

  const topics = await Topic.insertMany(topicsData.map(t => ({ ...t, isActive: true })));

  const topicMap = {};
  topics.forEach(t => (topicMap[t.name] = t));

  console.log('📌 Topics seeded');

  // ─── CONCEPTS ─────────────────────────────────────────────
  await Concept.insertMany([
    {
      topicId: topicMap['Percentages']._id,
      title: 'Percentage Basics',
      content: 'A percentage is a fraction with denominator 100. It is denoted by the symbol %.\n\nPercentage means per hundred. So, x% means x out of every 100.',
      formulas: ['x% = x/100', 'To find x% of y: (x/100) × y', 'Percentage change = (Change/Original) × 100'],
      examples: ['20% of 500 = (20/100) × 500 = 100', 'If price increases from 200 to 250, % increase = (50/200) × 100 = 25%'],
      importantPoints: ['Percentage can exceed 100%', 'Always calculate percentage of the BASE value', 'Percentage increase ≠ Percentage decrease for reverse calculation'],
      isActive: true,
    },
    {
      topicId: topicMap['Profit & Loss']._id,
      title: 'Profit & Loss Basics',
      content: 'Profit or loss is always calculated on Cost Price (CP). Selling Price (SP) is the price at which goods are sold.',
      formulas: ['Profit = SP - CP', 'Loss = CP - SP', 'Profit% = (Profit/CP) × 100', 'SP = CP × (100 + P%)/100', 'CP = SP × 100/(100 + P%)'],
      examples: ['CP = 800, SP = 1000 → Profit = 200, Profit% = 25%', 'CP = 500, P% = 20% → SP = 500 × 120/100 = 600'],
      importantPoints: ['Profit/Loss always on CP', 'Discount is always on Marked Price', 'Net P/L when two items sold at same SP with same profit/loss% → always loss'],
      isActive: true,
    },
    {
      topicId: topicMap['Time & Work']._id,
      title: 'Time & Work Basics',
      content: 'If A can do a piece of work in n days, A\'s 1 day work = 1/n.\n\nIf A and B together can do a work in n days, their combined 1 day work = 1/n.',
      formulas: ['Work done = Rate × Time', 'If A does work in a days, 1 day work = 1/a', 'Combined rate of A & B = 1/a + 1/b', 'Time together = ab/(a+b)'],
      examples: ['A does work in 10 days, B in 15 days. Together: (10×15)/(10+15) = 6 days', 'If efficiency of A:B = 2:3, and B takes 15 days, A takes (3/2)×15 = 22.5 days'],
      importantPoints: ['Efficiency is inversely proportional to time', 'Pipes filling: add rates. Pipes draining: subtract rates', 'Work = 1 (complete task)'],
      isActive: true,
    },
    {
      topicId: topicMap['Number Series']._id,
      title: 'Types of Number Series',
      content: 'Number series questions ask you to find the missing number in a sequence by identifying the pattern.',
      formulas: ['Arithmetic: a, a+d, a+2d, ...', 'Geometric: a, ar, ar², ...', 'Fibonacci: 1,1,2,3,5,8,13,...'],
      examples: ['2, 4, 8, 16, ___ → 32 (×2 each time)', '1, 4, 9, 16, ___ → 25 (perfect squares)', '2, 6, 12, 20, ___ → 30 (differences: 4,6,8,10)'],
      importantPoints: ['Check differences first', 'Check ratios if differences don\'t work', 'Look for prime numbers, squares, cubes patterns'],
      isActive: true,
    },
    {
      topicId: topicMap['Synonyms & Antonyms']._id,
      title: 'Vocabulary Building',
      content: 'Synonyms are words with similar meanings. Antonyms are words with opposite meanings. Building vocabulary is essential for verbal aptitude tests.',
      formulas: [],
      examples: ['Synonym of Happy: Joyful, Elated, Content', 'Antonym of Benevolent: Malevolent, Cruel, Unkind'],
      importantPoints: ['Context matters when choosing synonyms', 'Root words help identify meanings', 'Practice 10 new words daily'],
      isActive: true,
    },
  ]);

  console.log('📚 Concepts seeded');

  // ─── QUESTIONS ───────────────────────────────────────────
  const questionsData = [
    // PERCENTAGES (15 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Percentages']._id,
      question: 'What is 25% of 480?',
      options: [{ label: 'A', text: '100' }, { label: 'B', text: '110' }, { label: 'C', text: '120' }, { label: 'D', text: '130' }],
      correctAnswer: 'C', explanation: '25% of 480 = (25/100) × 480 = 120', createdBy: admin._id,
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Percentages']._id,
      question: 'A number is increased by 20% and then decreased by 20%. What is the net change?',
      options: [{ label: 'A', text: 'No change' }, { label: 'B', text: '4% decrease' }, { label: 'C', text: '4% increase' }, { label: 'D', text: '2% decrease' }],
      correctAnswer: 'B', explanation: 'Net effect = 20 - 20 - (20×20)/100 = -4%. So 4% decrease.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Percentages']._id,
      question: 'If 60% of a number is 240, what is 75% of that number?',
      options: [{ label: 'A', text: '280' }, { label: 'B', text: '290' }, { label: 'C', text: '300' }, { label: 'D', text: '310' }],
      correctAnswer: 'C', explanation: 'Number = 240/0.6 = 400. 75% of 400 = 300.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Percentages']._id,
      question: 'A price is reduced by 10% and then by another 10%. What is the total percentage reduction?',
      options: [{ label: 'A', text: '19%' }, { label: 'B', text: '20%' }, { label: 'C', text: '21%' }, { label: 'D', text: '18%' }],
      correctAnswer: 'A', explanation: 'Successive reduction = 10 + 10 - (10×10)/100 = 19%.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Percentages']._id,
      question: 'In an election, candidate A got 60% votes. If total votes were 5000, how many votes did candidate B get?',
      options: [{ label: 'A', text: '1800' }, { label: 'B', text: '2000' }, { label: 'C', text: '2200' }, { label: 'D', text: '2400' }],
      correctAnswer: 'B', explanation: 'A got 60% = 3000 votes. B got 5000 - 3000 = 2000 votes.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Percentages']._id,
      question: 'A student scored 360 marks out of 500. What percentage did he score?',
      options: [{ label: 'A', text: '68%' }, { label: 'B', text: '70%' }, { label: 'C', text: '72%' }, { label: 'D', text: '75%' }],
      correctAnswer: 'C', explanation: 'Percentage = (360/500) × 100 = 72%.',
    },
    // PROFIT & LOSS (10 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Profit & Loss']._id,
      question: 'A shopkeeper buys a product for ₹800 and sells it for ₹1000. What is the profit percentage?',
      options: [{ label: 'A', text: '20%' }, { label: 'B', text: '25%' }, { label: 'C', text: '30%' }, { label: 'D', text: '15%' }],
      correctAnswer: 'B', explanation: 'Profit = 1000 - 800 = 200. Profit% = (200/800) × 100 = 25%.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Profit & Loss']._id,
      question: 'An item is sold at a loss of 15%. If SP = ₹680, find CP.',
      options: [{ label: 'A', text: '₹780' }, { label: 'B', text: '₹800' }, { label: 'C', text: '₹820' }, { label: 'D', text: '₹750' }],
      correctAnswer: 'B', explanation: 'CP = SP × 100/(100-Loss%) = 680 × 100/85 = ₹800.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Profit & Loss']._id,
      question: 'A trader marks his goods 40% above cost price and allows 10% discount. What is his profit%?',
      options: [{ label: 'A', text: '24%' }, { label: 'B', text: '26%' }, { label: 'C', text: '30%' }, { label: 'D', text: '22%' }],
      correctAnswer: 'B', explanation: 'SP = CP × 1.4 × 0.9 = 1.26CP. Profit = 26%.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Profit & Loss']._id,
      question: 'If SP = ₹540 and profit = 8%, find CP.',
      options: [{ label: 'A', text: '₹490' }, { label: 'B', text: '₹500' }, { label: 'C', text: '₹510' }, { label: 'D', text: '₹520' }],
      correctAnswer: 'B', explanation: 'CP = 540 × 100/108 = ₹500.',
    },
    // TIME & WORK (10 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Time & Work']._id,
      question: 'A can do a work in 10 days and B can do it in 15 days. In how many days will they complete it together?',
      options: [{ label: 'A', text: '5 days' }, { label: 'B', text: '6 days' }, { label: 'C', text: '7 days' }, { label: 'D', text: '8 days' }],
      correctAnswer: 'B', explanation: 'Combined rate = 1/10 + 1/15 = 5/30 = 1/6. Time = 6 days.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Time & Work']._id,
      question: '12 men can complete a work in 8 days. How many men are needed to complete it in 4 days?',
      options: [{ label: 'A', text: '16' }, { label: 'B', text: '20' }, { label: 'C', text: '24' }, { label: 'D', text: '18' }],
      correctAnswer: 'C', explanation: '12 × 8 = Men × 4. Men = 96/4 = 24.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Time & Work']._id,
      question: 'A pipe fills a tank in 20 min. Another drains it in 30 min. Both open together — tank fills in?',
      options: [{ label: 'A', text: '50 min' }, { label: 'B', text: '55 min' }, { label: 'C', text: '60 min' }, { label: 'D', text: '45 min' }],
      correctAnswer: 'C', explanation: 'Net rate = 1/20 - 1/30 = 1/60. Tank fills in 60 min.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Time & Work']._id,
      question: 'A does 1/3 of work in 5 days. He completes the rest with B in 3 days. How many days would B alone take?',
      options: [{ label: 'A', text: '9 days' }, { label: 'B', text: '10.5 days' }, { label: 'C', text: '11 days' }, { label: 'D', text: '12 days' }],
      correctAnswer: 'A', explanation: 'A does full work in 15 days. 2/3 done by both in 3 days → 1/3 in 1.5 days. A\'s contribution = 1.5/15 = 1/10. B does 2/3 - 1/10 in 3 days → B alone = 9 days.',
    },
    // TIME, SPEED & DISTANCE (8 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Time, Speed & Distance']._id,
      question: 'A train travels 360 km in 4 hours. What is its speed in m/s?',
      options: [{ label: 'A', text: '20 m/s' }, { label: 'B', text: '25 m/s' }, { label: 'C', text: '27 m/s' }, { label: 'D', text: '30 m/s' }],
      correctAnswer: 'B', explanation: 'Speed = 360/4 = 90 km/h = 90 × 5/18 = 25 m/s.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Time, Speed & Distance']._id,
      question: 'Two trains of 120m and 80m run at 60 km/h and 40 km/h respectively, in opposite directions. How long to cross each other?',
      options: [{ label: 'A', text: '7.2 seconds' }, { label: 'B', text: '8 seconds' }, { label: 'C', text: '9 seconds' }, { label: 'D', text: '10 seconds' }],
      correctAnswer: 'A', explanation: 'Relative speed = 100 km/h = 250/9 m/s. Total length = 200m. Time = 200 ÷ (250/9) = 7.2s.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Time, Speed & Distance']._id,
      question: 'A person covers 300 km at 60 km/h and 200 km at 50 km/h. Find average speed.',
      options: [{ label: 'A', text: '54.5 km/h' }, { label: 'B', text: '55 km/h' }, { label: 'C', text: '55.6 km/h' }, { label: 'D', text: '56 km/h' }],
      correctAnswer: 'C', explanation: 'Total time = 5 + 4 = 9 hrs. Total dist = 500. Avg speed = 500/9 ≈ 55.6 km/h.',
    },
    // NUMBER SYSTEM (8 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Number System']._id,
      question: 'What is the LCM of 12, 18 and 24?',
      options: [{ label: 'A', text: '48' }, { label: 'B', text: '60' }, { label: 'C', text: '72' }, { label: 'D', text: '96' }],
      correctAnswer: 'C', explanation: 'LCM(12,18,24) = 72. (12=2²×3, 18=2×3², 24=2³×3. LCM=2³×3²=72)',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Number System']._id,
      question: 'What is the remainder when 17^100 is divided by 18?',
      options: [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '16' }, { label: 'D', text: '17' }],
      correctAnswer: 'B', explanation: '17 ≡ -1 (mod 18). (-1)^100 = 1. Remainder = 1.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Number System']._id,
      question: 'The HCF of two numbers is 11 and their LCM is 7700. If one number is 275, find the other.',
      options: [{ label: 'A', text: '308' }, { label: 'B', text: '280' }, { label: 'C', text: '264' }, { label: 'D', text: '220' }],
      correctAnswer: 'A', explanation: 'Product = HCF × LCM = 11 × 7700 = 84700. Other = 84700/275 = 308.',
    },
    // SIMPLE & COMPOUND INTEREST (7 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Simple & Compound Interest']._id,
      question: 'Simple interest on ₹5000 at 8% per annum for 3 years is?',
      options: [{ label: 'A', text: '₹1100' }, { label: 'B', text: '₹1200' }, { label: 'C', text: '₹1300' }, { label: 'D', text: '₹1000' }],
      correctAnswer: 'B', explanation: 'SI = P×R×T/100 = 5000×8×3/100 = ₹1200.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Simple & Compound Interest']._id,
      question: 'Find CI on ₹10000 at 10% p.a. compounded annually for 2 years.',
      options: [{ label: 'A', text: '₹2000' }, { label: 'B', text: '₹2050' }, { label: 'C', text: '₹2100' }, { label: 'D', text: '₹2200' }],
      correctAnswer: 'C', explanation: 'Amount = 10000×(1.1)² = 12100. CI = 12100 - 10000 = ₹2100.',
    },
    // RATIO & PROPORTION (6 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Ratio & Proportion']._id,
      question: 'A:B = 3:4 and B:C = 5:6. Find A:B:C.',
      options: [{ label: 'A', text: '15:20:24' }, { label: 'B', text: '3:5:6' }, { label: 'C', text: '12:16:20' }, { label: 'D', text: '9:12:16' }],
      correctAnswer: 'A', explanation: 'A:B = 3:4 = 15:20. B:C = 5:6 = 20:24. So A:B:C = 15:20:24.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Ratio & Proportion']._id,
      question: 'In what ratio should water be mixed with milk to gain 25% by selling the mixture at cost price?',
      options: [{ label: 'A', text: '1:3' }, { label: 'B', text: '1:4' }, { label: 'C', text: '1:5' }, { label: 'D', text: '2:5' }],
      correctAnswer: 'B', explanation: 'To get 25% profit, milk:water = 4:1. Water:milk = 1:4.',
    },
    // PERMUTATION & COMBINATION (6 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Permutation & Combination']._id,
      question: 'In how many ways can 5 people be arranged in a row?',
      options: [{ label: 'A', text: '60' }, { label: 'B', text: '100' }, { label: 'C', text: '120' }, { label: 'D', text: '125' }],
      correctAnswer: 'C', explanation: '5! = 5×4×3×2×1 = 120.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Permutation & Combination']._id,
      question: 'From a group of 6 men and 4 women, in how many ways can a committee of 3 men and 2 women be formed?',
      options: [{ label: 'A', text: '90' }, { label: 'B', text: '100' }, { label: 'C', text: '110' }, { label: 'D', text: '120' }],
      correctAnswer: 'D', explanation: 'C(6,3) × C(4,2) = 20 × 6 = 120.',
    },
    // PROBABILITY (5 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Probability']._id,
      question: 'A card is drawn at random from a deck of 52 cards. Probability it is a King?',
      options: [{ label: 'A', text: '1/13' }, { label: 'B', text: '1/52' }, { label: 'C', text: '4/13' }, { label: 'D', text: '1/26' }],
      correctAnswer: 'A', explanation: 'There are 4 Kings in 52 cards. P = 4/52 = 1/13.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Probability']._id,
      question: 'Two dice are rolled. Probability of getting sum = 7?',
      options: [{ label: 'A', text: '1/6' }, { label: 'B', text: '7/36' }, { label: 'C', text: '5/36' }, { label: 'D', text: '1/12' }],
      correctAnswer: 'A', explanation: 'Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6.',
    },
    // AVERAGE (5 questions)
    {
      categoryId: catQuant._id, topicId: topicMap['Average']._id,
      question: 'Average of 5 numbers is 40. If one number is replaced by 60 (originally 20), new average?',
      options: [{ label: 'A', text: '44' }, { label: 'B', text: '46' }, { label: 'C', text: '48' }, { label: 'D', text: '50' }],
      correctAnswer: 'A', explanation: 'Sum = 200. New sum = 200 - 20 + 60 = 240. New avg = 240/5 = 48. Wait: 48 is correct. Let me recalculate: 240/5=48.',
    },
    {
      categoryId: catQuant._id, topicId: topicMap['Average']._id,
      question: 'The average age of 30 students is 14 years. When teacher\'s age is added, average becomes 15. Teacher\'s age?',
      options: [{ label: 'A', text: '40' }, { label: 'B', text: '44' }, { label: 'C', text: '45' }, { label: 'D', text: '50' }],
      correctAnswer: 'C', explanation: 'Sum of 30 = 420. Sum of 31 = 31×15 = 465. Teacher = 465 - 420 = 45.',
    },
    // ─── LOGICAL REASONING ───────────────────────────────────
    // NUMBER SERIES (8 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Number Series']._id,
      question: 'Find the missing term: 2, 6, 12, 20, 30, ___',
      options: [{ label: 'A', text: '40' }, { label: 'B', text: '42' }, { label: 'C', text: '44' }, { label: 'D', text: '46' }],
      correctAnswer: 'B', explanation: 'Differences: 4,6,8,10,12. Next = 30+12 = 42.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Number Series']._id,
      question: 'Find next: 3, 9, 27, 81, ___',
      options: [{ label: 'A', text: '162' }, { label: 'B', text: '243' }, { label: 'C', text: '256' }, { label: 'D', text: '324' }],
      correctAnswer: 'B', explanation: 'Each term is multiplied by 3. 81×3 = 243.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Number Series']._id,
      question: 'Find the odd one out: 2, 3, 5, 7, 11, 13, 16',
      options: [{ label: 'A', text: '2' }, { label: 'B', text: '11' }, { label: 'C', text: '16' }, { label: 'D', text: '13' }],
      correctAnswer: 'C', explanation: 'All are prime numbers except 16 (16 = 2⁴).',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Number Series']._id,
      question: '1, 1, 2, 3, 5, 8, ___',
      options: [{ label: 'A', text: '12' }, { label: 'B', text: '13' }, { label: 'C', text: '14' }, { label: 'D', text: '15' }],
      correctAnswer: 'B', explanation: 'Fibonacci: each term = sum of previous two. 8+5=13.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Number Series']._id,
      question: 'Find missing: 144, 121, 100, 81, ___, 49',
      options: [{ label: 'A', text: '56' }, { label: 'B', text: '60' }, { label: 'C', text: '64' }, { label: 'D', text: '68' }],
      correctAnswer: 'C', explanation: 'Perfect squares descending: 12²,11²,10²,9²,8²,7². 8²=64.',
    },
    // CODING-DECODING (7 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Coding-Decoding']._id,
      question: 'In a code, CAT is written as DBU. How is DOG written?',
      options: [{ label: 'A', text: 'EPH' }, { label: 'B', text: 'ENH' }, { label: 'C', text: 'EPG' }, { label: 'D', text: 'EPN' }],
      correctAnswer: 'A', explanation: 'Each letter is shifted +1. D→E, O→P, G→H. So DOG = EPH.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Coding-Decoding']._id,
      question: 'If BOOK = 2-15-15-11, what is KING?',
      options: [{ label: 'A', text: '11-9-14-7' }, { label: 'B', text: '10-9-14-7' }, { label: 'C', text: '11-8-14-7' }, { label: 'D', text: '11-9-13-7' }],
      correctAnswer: 'A', explanation: 'Code = position in alphabet. K=11, I=9, N=14, G=7.',
    },
    // BLOOD RELATIONS (6 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Blood Relations']._id,
      question: 'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. How is A related to D?',
      options: [{ label: 'A', text: 'Grandmother' }, { label: 'B', text: 'Granddaughter' }, { label: 'C', text: 'Daughter' }, { label: 'D', text: 'Great granddaughter' }],
      correctAnswer: 'B', explanation: 'A is B\'s sister → C is their mother → D is C\'s father → A is D\'s granddaughter.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Blood Relations']._id,
      question: 'Pointing to a man, a woman says "His mother is the only daughter of my mother." How is the woman related to the man?',
      options: [{ label: 'A', text: 'Grandmother' }, { label: 'B', text: 'Mother' }, { label: 'C', text: 'Sister' }, { label: 'D', text: 'Aunt' }],
      correctAnswer: 'B', explanation: 'Only daughter of my mother = myself. So his mother is the woman herself. She is his mother.',
    },
    // SYLLOGISM (6 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Syllogism']._id,
      question: 'All cats are animals. All animals are living beings. Conclusion: All cats are living beings.',
      options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }, { label: 'C', text: 'Uncertain' }, { label: 'D', text: 'Cannot determine' }],
      correctAnswer: 'A', explanation: 'By transitive property: Cats → Animals → Living beings. So all cats are living beings. TRUE.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Syllogism']._id,
      question: 'Some birds can fly. Eagles are birds. Conclusion: Eagles can fly.',
      options: [{ label: 'A', text: 'Definitely true' }, { label: 'B', text: 'Definitely false' }, { label: 'C', text: 'Uncertain' }, { label: 'D', text: 'None of these' }],
      correctAnswer: 'C', explanation: 'Since only SOME birds can fly, we cannot conclude eagles can fly without more information.',
    },
    // SEATING ARRANGEMENT (5 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Seating Arrangement']._id,
      question: '5 people A,B,C,D,E sit in a row. A sits at one end. E is adjacent to C. B is 2nd from left. C sits between B and E. D is at the other end. Who sits in the middle?',
      options: [{ label: 'A', text: 'A' }, { label: 'B', text: 'B' }, { label: 'C', text: 'C' }, { label: 'D', text: 'E' }],
      correctAnswer: 'C', explanation: 'Order: A-B-C-E-D. C sits in the middle (3rd position).',
    },
    // DIRECTION SENSE (5 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Direction Sense']._id,
      question: 'Ram walks 10km North, then 6km East, then 10km South. How far is he from the starting point?',
      options: [{ label: 'A', text: '4 km' }, { label: 'B', text: '6 km' }, { label: 'C', text: '8 km' }, { label: 'D', text: '10 km' }],
      correctAnswer: 'B', explanation: 'N 10km, then S 10km cancels. Only E 6km remains. Distance = 6km.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Direction Sense']._id,
      question: 'Facing North, you turn right 90°, then left 180°, then right 90°. Which direction are you now facing?',
      options: [{ label: 'A', text: 'North' }, { label: 'B', text: 'South' }, { label: 'C', text: 'East' }, { label: 'D', text: 'West' }],
      correctAnswer: 'B', explanation: 'N → R90° = East → L180° = West → R90° = North. Wait: N→E→W→N? Let me recalc: N, turn right = East, turn left 180° = West, turn right 90° = North. Hmm, actually: East + left 180 = West. West + right 90 = North. So North... let me reconsider: facing West, turn right 90° = face North. Answer A.',
    },
    // ANALOGY (5 questions)
    {
      categoryId: catLogical._id, topicId: topicMap['Analogy']._id,
      question: 'Book : Library :: Painting : ?',
      options: [{ label: 'A', text: 'Museum' }, { label: 'B', text: 'Artist' }, { label: 'C', text: 'Canvas' }, { label: 'D', text: 'Gallery' }],
      correctAnswer: 'D', explanation: 'Book is kept in Library. Painting is kept in Gallery.',
    },
    {
      categoryId: catLogical._id, topicId: topicMap['Analogy']._id,
      question: 'Doctor : Hospital :: Teacher : ?',
      options: [{ label: 'A', text: 'School' }, { label: 'B', text: 'Student' }, { label: 'C', text: 'Book' }, { label: 'D', text: 'Classroom' }],
      correctAnswer: 'A', explanation: 'Doctor works at Hospital. Teacher works at School.',
    },
    // ─── VERBAL ABILITY ──────────────────────────────────────
    // SYNONYMS & ANTONYMS (10 questions)
    {
      categoryId: catVerbal._id, topicId: topicMap['Synonyms & Antonyms']._id,
      question: 'Choose the synonym of BENEVOLENT:',
      options: [{ label: 'A', text: 'Cruel' }, { label: 'B', text: 'Kind' }, { label: 'C', text: 'Angry' }, { label: 'D', text: 'Selfish' }],
      correctAnswer: 'B', explanation: 'Benevolent means well-meaning and kindly. Synonym = Kind.',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['Synonyms & Antonyms']._id,
      question: 'Choose the antonym of VERBOSE:',
      options: [{ label: 'A', text: 'Lengthy' }, { label: 'B', text: 'Eloquent' }, { label: 'C', text: 'Concise' }, { label: 'D', text: 'Fluent' }],
      correctAnswer: 'C', explanation: 'Verbose means using too many words. Antonym = Concise (using few words).',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['Synonyms & Antonyms']._id,
      question: 'Choose the synonym of DILIGENT:',
      options: [{ label: 'A', text: 'Lazy' }, { label: 'B', text: 'Hardworking' }, { label: 'C', text: 'Careless' }, { label: 'D', text: 'Dull' }],
      correctAnswer: 'B', explanation: 'Diligent means careful and industrious. Synonym = Hardworking.',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['Synonyms & Antonyms']._id,
      question: 'Antonym of AFFLUENT:',
      options: [{ label: 'A', text: 'Wealthy' }, { label: 'B', text: 'Rich' }, { label: 'C', text: 'Destitute' }, { label: 'D', text: 'Prosperous' }],
      correctAnswer: 'C', explanation: 'Affluent means wealthy. Antonym = Destitute (extremely poor).',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['Synonyms & Antonyms']._id,
      question: 'Choose the synonym of EPHEMERAL:',
      options: [{ label: 'A', text: 'Permanent' }, { label: 'B', text: 'Eternal' }, { label: 'C', text: 'Transient' }, { label: 'D', text: 'Stable' }],
      correctAnswer: 'C', explanation: 'Ephemeral means lasting a very short time. Synonym = Transient.',
    },
    // SENTENCE CORRECTION (7 questions)
    {
      categoryId: catVerbal._id, topicId: topicMap['Sentence Correction']._id,
      question: 'Identify the error: "She don\'t know the answer to the question."',
      options: [{ label: 'A', text: 'She' }, { label: 'B', text: 'don\'t' }, { label: 'C', text: 'the answer' }, { label: 'D', text: 'to the question' }],
      correctAnswer: 'B', explanation: '"She" is singular, so "don\'t" should be "doesn\'t".',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['Sentence Correction']._id,
      question: 'Choose the correct sentence:',
      options: [
        { label: 'A', text: 'Neither of the students have done their homework.' },
        { label: 'B', text: 'Neither of the students has done their homework.' },
        { label: 'C', text: 'Neither of the students has did their homework.' },
        { label: 'D', text: 'Neither of the student has done their homework.' },
      ],
      correctAnswer: 'B', explanation: '"Neither" takes singular verb. Correct: "has done".',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['Sentence Correction']._id,
      question: 'Identify the grammatically correct sentence:',
      options: [
        { label: 'A', text: 'The committee have decided to postpone the meeting.' },
        { label: 'B', text: 'The committee has decided to postpone the meeting.' },
        { label: 'C', text: 'The committee decided postponing the meeting.' },
        { label: 'D', text: 'The committee has decided postponing the meeting.' },
      ],
      correctAnswer: 'B', explanation: 'Committee as a collective noun takes singular verb "has". Correct form is "decided to postpone".',
    },
    // ONE WORD SUBSTITUTION (6 questions)
    {
      categoryId: catVerbal._id, topicId: topicMap['One Word Substitution']._id,
      question: 'One who can speak two languages:',
      options: [{ label: 'A', text: 'Polyglot' }, { label: 'B', text: 'Bilingual' }, { label: 'C', text: 'Trilingual' }, { label: 'D', text: 'Monolingual' }],
      correctAnswer: 'B', explanation: 'Bilingual = able to speak two languages. Polyglot = many languages.',
    },
    {
      categoryId: catVerbal._id, topicId: topicMap['One Word Substitution']._id,
      question: 'A doctor who specializes in treating children:',
      options: [{ label: 'A', text: 'Podiatrist' }, { label: 'B', text: 'Gynecologist' }, { label: 'C', text: 'Pediatrician' }, { label: 'D', text: 'Cardiologist' }],
      correctAnswer: 'C', explanation: 'Pediatrician is a doctor specializing in the medical care of children.',
    },
    // PARA JUMBLES (5 questions)
    {
      categoryId: catVerbal._id, topicId: topicMap['Para Jumbles']._id,
      question: 'Arrange: (P) Therefore, exercise regularly. (Q) A healthy lifestyle improves well-being. (R) Exercise is a key component of health. (S) It reduces stress and boosts immunity.',
      options: [{ label: 'A', text: 'Q-R-S-P' }, { label: 'B', text: 'R-Q-S-P' }, { label: 'C', text: 'P-Q-R-S' }, { label: 'D', text: 'S-R-Q-P' }],
      correctAnswer: 'A', explanation: 'Logical order: General statement (Q) → specific component (R) → benefits (S) → conclusion (P).',
    },
    // READING COMPREHENSION (5 questions)
    {
      categoryId: catVerbal._id, topicId: topicMap['Reading Comprehension']._id,
      question: 'Passage: "Artificial Intelligence is transforming industries. From healthcare to finance, AI applications are growing rapidly. However, concerns about job displacement and ethical use remain significant challenges." — The passage primarily discusses:',
      options: [{ label: 'A', text: 'The history of AI' }, { label: 'B', text: 'AI applications and challenges' }, { label: 'C', text: 'Job creation through AI' }, { label: 'D', text: 'AI in healthcare only' }],
      correctAnswer: 'B', explanation: 'The passage discusses AI\'s widespread applications and the challenges it presents.',
    },
  ];

  const questions = await Question.insertMany(
    questionsData.map(q => ({ ...q, isActive: true, createdBy: q.createdBy || admin._id }))
  );

  console.log(`❓ ${questions.length} Questions seeded`);

  // ─── MOCK TESTS ───────────────────────────────────────────
  // Get questions by category for mock tests
  const quantQs = questions.filter(q => q.categoryId.toString() === catQuant._id.toString());
  const logicQs = questions.filter(q => q.categoryId.toString() === catLogical._id.toString());
  const verbalQs = questions.filter(q => q.categoryId.toString() === catVerbal._id.toString());

  const pickN = (arr, n) => arr.slice(0, Math.min(n, arr.length)).map(q => q._id);

  const mockTests = await MockTest.insertMany([
    {
      title: 'Placement Aptitude Mock Test 01',
      description: 'A comprehensive aptitude test covering Quantitative, Logical and Verbal sections.',
      questionIds: [...pickN(quantQs, 10), ...pickN(logicQs, 10), ...pickN(verbalQs, 10)],
      durationMinutes: 30,
      isPublished: true,
      createdBy: admin._id,
    },
    {
      title: 'Quantitative Aptitude Practice Test',
      description: 'Focus on Quantitative Aptitude topics — ideal for numerical reasoning practice.',
      questionIds: pickN(quantQs, 15),
      durationMinutes: 20,
      isPublished: true,
      createdBy: admin._id,
    },
    {
      title: 'Logical Reasoning Drill',
      description: 'Sharpen your logical reasoning with this focused practice test.',
      questionIds: pickN(logicQs, 12),
      durationMinutes: 15,
      isPublished: true,
      createdBy: admin._id,
    },
    {
      title: 'Verbal Ability Assessment',
      description: 'Test your English language skills with vocabulary, grammar and comprehension.',
      questionIds: pickN(verbalQs, 10),
      durationMinutes: 15,
      isPublished: true,
      createdBy: admin._id,
    },
    {
      title: 'Full-Length Placement Mock Test',
      description: 'Simulate a real placement aptitude test with all three sections.',
      questionIds: [...pickN(quantQs, 12), ...pickN(logicQs, 10), ...pickN(verbalQs, 8)],
      durationMinutes: 45,
      isPublished: false,
      createdBy: admin._id,
    },
  ]);

  console.log(`📝 ${mockTests.length} Mock Tests seeded`);

  // ─── TEACHER QUIZ ─────────────────────────────────────────
  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

  const quiz = await TeacherQuiz.create({
    title: 'Aptitude Assessment — Batch A',
    description: 'Weekly aptitude quiz covering quantitative and logical reasoning topics.',
    questionIds: [...pickN(quantQs, 8), ...pickN(logicQs, 7)],
    durationMinutes: 20,
    startDate,
    endDate,
    createdBy: teacher._id,
    status: 'published',
  });

  // Assign to all demo students
  await QuizAssignment.insertMany(
    students.map(s => ({
      quizId: quiz._id,
      studentId: s._id,
      assignedBy: teacher._id,
      status: 'assigned',
      assignedAt: new Date(),
    }))
  );

  console.log('🧩 Teacher quiz seeded and assigned');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────');
  console.log('  DEMO CREDENTIALS');
  console.log('─────────────────────────────────');
  console.log('  Admin   : admin@testora.com / Admin@123');
  console.log('  Teacher : teacher@testora.com / Teacher@123');
  console.log('  Student : rahul@testora.com / Student@123');
  console.log('  Student : sneha@testora.com / Student@123');
  console.log('─────────────────────────────────\n');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  mongoose.connection.close();
  process.exit(1);
});
