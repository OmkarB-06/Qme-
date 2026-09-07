// ===================== APP STATE =====================
// ===================== DOM HELPERS =====================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
let DATA = { levels: {}, attempts: [] };

let currentView = 'dashboard';
let activeLevel = null;
let testQuestions = [];
let userAnswers = [];
let currentQIndex = 0;
let timeLeft = 15 * 60;
let timerInterval = null;
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
let lastResult = null;
