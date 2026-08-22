(function(){

/* ===================== STORAGE ===================== */
const STORE_KEY = 'climbiq-progress-v1';
let DATA = { levels: {}, attempts: [] }; // levels[n] = {bestPercent,bestCorrect,bestIncorrect,attempts,passed,lastDate}

async function loadData(){
  try{
    const res = await window.storage.get(STORE_KEY, false);
    if(res && res.value){ DATA = JSON.parse(res.value); }
  }catch(e){ /* no data yet */ }
  render();
}
async function saveData(){
  try{ await window.storage.set(STORE_KEY, JSON.stringify(DATA), false); }
  catch(e){ console.error('save failed', e); }
}

/* ===================== QUESTION GENERATION ===================== */
function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pick(arr,n){ return shuffle(arr).slice(0,n); }

function buildOptions(correctVal, distractors){
  const opts = shuffle([correctVal, ...distractors].map(String));
  const correctIndex = opts.indexOf(String(correctVal));
  return {opts, correctIndex};
}

// ---- Procedural quantitative aptitude ----
function genQuant(tier){
  const kind = pick(['percent','avg','profit','tsd','si','series'],1)[0];
  const scale = tier; // 1..4
  if(kind==='percent'){
    const total = rnd(50,80)*scale*2 + 100;
    const score = rnd(20, total-10);
    const pct = Math.round((score/total)*1000)/10;
    const d = [Math.round((pct+ rnd(3,8))*10)/10, Math.round((pct- rnd(3,8))*10)/10, Math.round((pct+ rnd(9,15))*10)/10];
    const {opts,correctIndex} = buildOptions(pct+'%', d.map(v=>v+'%'));
    return {cat:'Quantitative Aptitude', qtext:`A student scored ${score} marks out of ${total} in an aptitude test. What percentage did the student score? (rounded to 1 decimal)`, opts, correctIndex};
  }
  if(kind==='avg'){
    const n = 5;
    const nums = Array.from({length:n},()=>rnd(10*scale,40*scale));
    const sum = nums.reduce((a,b)=>a+b,0);
    const avg = Math.round((sum/n)*100)/100;
    const d=[Math.round((avg+rnd(2,6))*100)/100, Math.round((avg-rnd(2,6))*100)/100, Math.round((avg+rnd(7,12))*100)/100];
    const {opts,correctIndex} = buildOptions(avg, d);
    return {cat:'Quantitative Aptitude', qtext:`Find the average of these ${n} scores from a class test: ${nums.join(', ')}.`, opts, correctIndex};
  }
  if(kind==='profit'){
    const cp = rnd(200,500)*scale;
    const isProfit = Math.random()>0.5;
    const pct = rnd(5,30);
    const sp = isProfit ? Math.round(cp*(1+pct/100)) : Math.round(cp*(1-pct/100));
    const actualPct = Math.round(((sp-cp)/cp)*1000)/10;
    const label = actualPct>=0 ? `${actualPct}% profit` : `${Math.abs(actualPct)}% loss`;
    const d=[`${pct+3}% profit`, `${pct-2}% loss`, `${pct}% loss`].filter(x=>x!==label);
    const {opts,correctIndex} = buildOptions(label, d.slice(0,3));
    return {cat:'Quantitative Aptitude', qtext:`A campus store buys a calculator for ₹${cp} and sells it for ₹${sp}. What is the profit or loss percentage? (rounded to 1 decimal)`, opts, correctIndex};
  }
  if(kind==='tsd'){
    const speed = rnd(20,40)*scale+20;
    const time = rnd(2,6);
    const dist = speed*time;
    const {opts,correctIndex} = buildOptions(dist+' km', [dist+20+' km', dist-15+' km', dist+35+' km']);
    return {cat:'Quantitative Aptitude', qtext:`A college bus travels at a constant speed of ${speed} km/h for ${time} hours on a field trip. How much distance does it cover?`, opts, correctIndex};
  }
  if(kind==='si'){
    const p = rnd(1000,5000)*scale;
    const r = rnd(4,12);
    const t = rnd(1,5);
    const si = Math.round(p*r*t/100);
    const {opts,correctIndex} = buildOptions('₹'+si, ['₹'+(si+rnd(50,200)), '₹'+Math.max(0,si-rnd(50,200)), '₹'+(si+rnd(250,500))]);
    return {cat:'Quantitative Aptitude', qtext:`A student takes an education loan of ₹${p} at a simple interest rate of ${r}% per annum for ${t} year(s). What is the interest amount?`, opts, correctIndex};
  }
  // series
  const start = rnd(2,9)*scale;
  const diff = rnd(2,6)+scale;
  const series = [start, start+diff, start+2*diff, start+3*diff];
  const next = start+4*diff;
  const {opts,correctIndex} = buildOptions(next, [next+diff, next-diff, next+2*diff]);
  return {cat:'Quantitative Aptitude', qtext:`Find the next number in the series: ${series.join(', ')}, ?`, opts, correctIndex};
}

// ---- Curated logical / relationship pool (tier 1-4) ----
// Auto-generated from APTITUDE_TEST_QUESTION_LEVELS.docx
// Structure: QUESTION_POOL[level] = [ {cat, qtext, opts, correctIndex}, ... ]
// correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
const QUESTION_POOL = {
  1: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n2, 4, 8, 16, ?", opts:["20", "24", "32", "36"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, C, E, G, ?", opts:["H", "I", "J", "K"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"What is the position of M in the English alphabet?", opts:["11", "12", "13", "14"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the odd one out:", opts:["HTML", "CSS", "Python", "SQL"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"Rahul is 6th from the left and 5th from the right in a row. How many students are there in total?", opts:["10", "11", "12", "13"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next pair:\nAB, CD, EF, GH, ?", opts:["HI", "IJ", "JK", "KL"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\nint x = 5;\nprintf(\"%d\", x + 3);", opts:["5", "8", "15", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint a = 10;\nint b = 2;\ncout << a / b;", opts:["2", "5", "8", "20"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to create a hyperlink?", opts:["<link>", "<a>", "<href>", "<url>"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — Which property is used to change the text color?", opts:["font-color", "text-color", "color", "text-style"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 10\nif x > 5:\n    print(\"A\")\nelse:\n    print(\"B\")", opts:["A", "B", "10", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which command is used to retrieve data from a database?", opts:["INSERT", "UPDATE", "SELECT", "DELETE"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"JavaScript — What will be the output?\nlet x = 5;\nlet y = 2;\nconsole.log(x + y);", opts:["3", "7", "10", "52"], correctIndex:1},
    {cat:"🔢 BASIC APTITUDE", qtext:"What is 20% of 150?", opts:["20", "25", "30", "35"], correctIndex:2},
    {cat:"🔢 BASIC APTITUDE", qtext:"Medium — Data Science\nWhich Python library is commonly used for working with and analyzing tabular data?", opts:["NumPy", "Pandas", "Turtle", "Tkinter"], correctIndex:1}
  ],
  2: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n3, 6, 12, 24, ?", opts:["36", "42", "48", "50"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nB, D, G, K, ?", opts:["O", "P", "Q", "R"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"If A = 1, B = 2, C = 3, what is the value of:\nCAT = C + A + T", opts:["22", "24", "25", "26"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the odd one out:", opts:["2", "3", "5", "9"], correctIndex:3},
    {cat:"🧠 LOGICAL REASONING", qtext:"Priya is 8th from the left and 7th from the right. How many students are there in the row?", opts:["13", "14", "15", "16"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nZA, YB, XC, WD, ?", opts:["VE", "VC", "UE", "WE"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 10;\n    if (x > 5)\n        printf(\"Yes\");\n    else\n        printf(\"No\");\n    return 0;\n}", opts:["Yes", "No", "10", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 7;\ncout << x % 3;", opts:["1", "2", "3", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 5;\nx++;\nSystem.out.println(x);", opts:["4", "5", "6", "Error"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which attribute is used to provide the destination URL of a hyperlink?", opts:["src", "href", "link", "url"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What is the problem with this code?\np {\n    color blue;\n}", opts:["Nothing is wrong", "Missing : after color", "Missing ; after p", "blue is not a valid color"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 5\nfor i in range(1, 4):\n    x += i\nprint(x)", opts:["8", "9", "10", "11"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query correctly selects all columns from a table named students?", opts:["SELECT students;", "SELECT ALL FROM students;", "SELECT * FROM students;", "GET * FROM students;"], correctIndex:2},
    {cat:"🧩 MIXED LOGIC & TECHNICAL", qtext:"JavaScript — What will be the output?\nlet x = 10;\nif (x % 2 === 0) {\n    console.log(\"Even\");\n} else {\n    console.log(\"Odd\");\n}", opts:["Odd", "Even", "10", "Error"], correctIndex:1},
    {cat:"🧩 MIXED LOGIC & TECHNICAL", qtext:"🟡 Medium — Data Science\nYou have a dataset containing students' names, marks, and attendance. Which Python library is most commonly used to organize and analyze this type of tabular data?", opts:["Pandas", "Turtle", "Tkinter", "Pygame"], correctIndex:0}
  ],
  3: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n5, 10, 20, 40, ?", opts:["60", "70", "80", "90"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nC, F, J, O, ?", opts:["T", "U", "V", "W"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the English alphabet is written in reverse order, what is the 5th letter from the left?", opts:["V", "W", "X", "Y"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing term:\n1, 4, 9, 16, ?, 36", opts:["20", "24", "25", "30"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a row, Amit is 9th from the left and 6th from the right. How many people are there in total?", opts:["13", "14", "15", "16"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next pair:\nAZ, BY, CX, DW, ?", opts:["EV", "EU", "FV", "EW"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 4;\n    printf(\"%d\", x * x);\n    return 0;\n}", opts:["8", "16", "44", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint a = 5;\nint b = 3;\ncout << a + b * 2;", opts:["16", "11", "13", "10"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 10;\nif (x < 5) {\n    System.out.println(\"Small\");\n} else {\n    System.out.println(\"Large\");\n}", opts:["Small", "Large", "10", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"JavaScript — What will be the output?\nlet x = 3;\nx = x + 2;\nconsole.log(x);", opts:["3", "5", "6", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(3):\n    x = x * 2\nprint(x)", opts:["2", "4", "6", "8"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to insert an image?", opts:["<image>", "<img>", "<src>", "<picture>"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Database — Which of the following is used to uniquely identify each record in a table?", opts:["Foreign Key", "Primary Key", "Duplicate Key", "Index"], correctIndex:1},
    {cat:"🟡 MEDIUM / MIXED QUESTIONS", qtext:"CSS — What will this selector target?\n.box p {\n    color: red;\n}", opts:["All elements with class box", "All <p> elements inside an element with class box", "All elements with class p", "Only the first <p> element"], correctIndex:1},
    {cat:"🟡 MEDIUM / MIXED QUESTIONS", qtext:"🟡 Programming Logic — What will be the output?\nx = 5\nif x > 3:\n    x = x * 2\nprint(x - 1)", opts:["4", "5", "9", "10"], correctIndex:2}
  ],
  4: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n3, 7, 15, 31, ?", opts:["47", "55", "63", "64"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, D, H, M, ?", opts:["R", "S", "T", "U"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"What is the position of Q from the right side of the English alphabet?", opts:["8", "9", "10", "11"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the odd one out:", opts:["ACE", "BDF", "CEG", "DEH"], correctIndex:3},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a row of students, Riya is 7th from the left and 10th from the right. How many students are there?", opts:["15", "16", "17", "18"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing letter:\nA, D, G, J, ?, P", opts:["K", "L", "M", "N"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 5;\n    x += 3;\n    printf(\"%d\", x);\n    return 0;\n}", opts:["5", "8", "15", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 10;\nif (x > 5)\n    cout << x - 2;\nelse\n    cout << x + 2;", opts:["8", "10", "12", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — Find the error:\nint x = 10\nSystem.out.println(x);", opts:["No error", "Missing ; after 10", "println is wrong", "int cannot be used"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — What will be displayed?\n<h2>Hello</h2>\n<p>Welcome</p>", opts:["Only Hello", "Only Welcome", "Hello and Welcome", "Error"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — Which selector targets an element with id=\"header\"?", opts:[".header", "#header", "*header", "header."], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nsum = 0\nfor i in range(1, 4):\n    sum = sum + i\nprint(sum)", opts:["3", "5", "6", "10"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Database / SQL — Which command is used to add a new record to a table?", opts:["ADD", "INSERT", "UPDATE", "CREATE"], correctIndex:1},
    {cat:"🟡 MEDIUM QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nfor (let i = 1; i <= 3; i++) {\n    x += i;\n}\nconsole.log(x);", opts:["8", "10", "11", "14"], correctIndex:2},
    {cat:"🟡 MEDIUM QUESTIONS", qtext:"🟡 Data Science — Which statement is correct?", opts:["Data Science is only used for creating websites.", "Data Science involves collecting, analyzing, and interpreting data.", "Data Science and databases are exactly the same thing.", "Data Science does not use programming."], correctIndex:1}
  ],
  5: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n2, 6, 12, 20, 30, ?", opts:["36", "40", "42", "44"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nZ, W, S, N, ?", opts:["H", "I", "G", "F"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the letters of the English alphabet are numbered from A = 1 to Z = 26, what is the value of:\nDOG = D + O + G", opts:["24", "25", "26", "27"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the odd one out:", opts:["8", "27", "64", "100"], correctIndex:3},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a row, Neha is 12th from the left and 9th from the right. How many people are there in the row?", opts:["19", "20", "21", "22"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the series:\nAB, DE, GH, JK, ?", opts:["LM", "MN", "NO", "OP"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 10;\n    if (x % 2 == 0)\n        printf(\"Even\");\n    else\n        printf(\"Odd\");\n    return 0;\n}", opts:["Even", "Odd", "10", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint a = 10;\nint b = 4;\ncout << a % b;", opts:["1", "2", "2.5", "0"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 3;\nfor(int i = 0; i < 3; i++) {\n    x += 2;\n}\nSystem.out.println(x);", opts:["5", "7", "9", "11"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to create an ordered list?", opts:["<ul>", "<ol>", "<li>", "<list>"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What will this selector target?\n.menu > p {\n    color: blue;\n}", opts:["All <p> elements anywhere inside .menu", "Only <p> elements that are direct children of .menu", "The .menu element only", "All elements with class p"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 10\nfor i in range(2):\n    x = x - 3\nprint(x)", opts:["4", "7", "10", "16"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Database / SQL — What is the purpose of a FOREIGN KEY?", opts:["To uniquely identify every record in the same table", "To connect or establish a relationship between tables", "To delete duplicate records", "To sort the data automatically"], correctIndex:1},
    {cat:"🟠 MEDIUM QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 2;\nfor (let i = 1; i <= 3; i++) {\n    x = x * i;\n}\nconsole.log(x);", opts:["6", "8", "12", "16"], correctIndex:2},
    {cat:"🟠 MEDIUM QUESTIONS", qtext:"🟠 Data Science — You have a dataset with some missing values. Which of the following is a common way to handle missing data?", opts:["Ignore the dataset completely", "Delete or fill the missing values depending on the situation", "Convert all values into text", "Duplicate all rows"], correctIndex:1}
  ],
  6: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n4, 9, 16, 25, 36, ?", opts:["42", "47", "49", "64"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, C, F, J, O, ?", opts:["S", "T", "U", "V"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If A = 1, B = 2, ..., Z = 26, what is the value of:\nCODE = C + O + D + E", opts:["25", "26", "27", "28"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing term:\n3, 8, 15, 24, 35, ?", opts:["46", "48", "50", "52"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a row of students, Aman is 15th from the left and 8th from the right. How many students are there?", opts:["21", "22", "23", "24"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nACE, BDF, CEG, ?", opts:["DFH", "DEG", "EGI", "DEF"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 5;\n    if (x > 3 && x < 10)\n        printf(\"Yes\");\n    else\n        printf(\"No\");\n    return 0;\n}", opts:["Yes", "No", "5", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 5;\ncout << x++ + 2;", opts:["5", "6", "7", "8"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint sum = 0;\nfor (int i = 1; i <= 4; i++) {\n    sum += i;\n}\nSystem.out.println(sum);", opts:["6", "8", "10", "12"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to create a table row?", opts:["<td>", "<th>", "<tr>", "<table>"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — Which selector targets all <p> elements inside an element with class content?", opts:[".content", "p.content", ".content p", "#content p"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 0\nfor i in range(1, 5):\n    x += i\nprint(x)", opts:["9", "10", "11", "15"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Database / SQL — What will this query do?\nSELECT * FROM students\nWHERE marks > 50;", opts:["Deletes students with marks below 50", "Displays students with marks greater than 50", "Updates marks to 50", "Counts all students"], correctIndex:1},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 10;\nif (x > 5 && x < 15) {\n    x = x + 5;\n}\nconsole.log(x);", opts:["10", "15", "20", "Error"], correctIndex:1},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"🟠 Programming Logic — What will be the output?\nx = 1\nfor i in range(1, 4):\n    x = x * i + 1\nprint(x)", opts:["6", "8", "10", "16"], correctIndex:2}
  ],
  7: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n1, 4, 9, 16, 25, ?", opts:["30", "36", "42", "49"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nD, G, K, P, ?", opts:["T", "U", "V", "W"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the English alphabet is written in reverse order, what is the 10th letter from the left?", opts:["P", "Q", "R", "S"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n2, 6, 12, 20, ?, 42", opts:["28", "30", "32", "36"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person is facing North. They turn right, then right again, and then left. Which direction are they facing now?", opts:["North", "South", "East", "West"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nABZ, BCY, CDX, DEW, ?", opts:["EFV", "EFW", "FEV", "EFU"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 10;\n    if (x % 3 == 1)\n        printf(\"Yes\");\n    else\n        printf(\"No\");\n    return 0;\n}", opts:["Yes", "No", "10", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 3;\nint y = 4;\ncout << x * y + 2;", opts:["12", "14", "18", "20"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 1;\nwhile (x < 5) {\n    x++;\n}\nSystem.out.println(x);", opts:["4", "5", "6", "Infinite loop"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to create a dropdown list?", opts:["<input>", "<option>", "<select>", "<list>"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\ndiv.box", opts:["All <div> elements", "All elements with class box", "Only <div> elements with class box", "An element with ID box"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 2\nfor i in range(3):\n    x = x * 2 + 1\nprint(x)", opts:["15", "17", "18", "23"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query is used to update the marks of a student?", opts:["CHANGE students SET marks = 90;", "UPDATE students SET marks = 90;", "MODIFY students marks = 90;", "INSERT students marks = 90;"], correctIndex:1},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nfor (let i = 0; i < 3; i++) {\n    x += i;\n}\nconsole.log(x);", opts:["5", "6", "8", "11"], correctIndex:2},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"🟠 Programming Logic — What will be the output?\nx = 10\nif x > 5:\n    if x % 2 == 0:\n        x = x / 2\n    else:\n        x = x + 1\nprint(x)", opts:["5", "5.0", "10", "11"], correctIndex:1}
  ],
  8: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n7, 14, 28, 56, ?", opts:["84", "98", "112", "120"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nE, I, N, T, ?", opts:["A", "B", "C", "D"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"What is the position of H from the right side of the English alphabet?", opts:["18", "19", "20", "21"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n5, 11, 23, 47, ?", opts:["71", "94", "95", "96"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person walks 10 m North, then turns right and walks 5 m, then turns right again. Which direction is the person facing?", opts:["North", "South", "East", "West"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nAZ, CX, EV, GT, ?", opts:["IR", "HS", "JQ", "KP"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 8;\n    if (x > 5)\n        x = x - 3;\n    printf(\"%d\", x);\n    return 0;\n}", opts:["3", "5", "8", "11"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 5;\nfor (int i = 1; i <= 3; i++) {\n    x += i;\n}\ncout << x;", opts:["8", "9", "11", "14"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 10;\nif (x >= 10) {\n    System.out.println(\"Pass\");\n} else {\n    System.out.println(\"Fail\");\n}", opts:["Pass", "Fail", "10", "Error"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to create a table header cell?", opts:["<td>", "<tr>", "<th>", "<thead>"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — Which property is used to add space inside an element's border?", opts:["margin", "padding", "spacing", "border-space"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 0\nfor i in range(1, 4):\n    x += i * 2\nprint(x)", opts:["6", "10", "12", "14"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query will display only the name and marks columns from the students table?", opts:["SELECT name, marks FROM students;", "SELECT students(name, marks);", "GET name, marks FROM students;", "SHOW name, marks FROM students;"], correctIndex:0},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 1;\nfor (let i = 1; i <= 4; i++) {\n    x = x + i;\n}\nconsole.log(x);", opts:["10", "11", "12", "15"], correctIndex:1},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"🟠 Database + Programming Logic\nConsider the following SQL query:\nSELECT * FROM students\nWHERE marks >= 40 AND marks <= 80;\nWhat does it do?", opts:["Displays students with marks below 40", "Displays students with marks above 80", "Displays students with marks from 40 to 80, including both", "Deletes students with marks between 40 and 80"], correctIndex:2}
  ],
  9: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n2, 5, 10, 17, 26, ?", opts:["35", "36", "37", "38"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, D, I, P, ?", opts:["W", "X", "Y", "Z"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the English alphabet is written in reverse order, what is the 8th letter from the left?", opts:["R", "S", "T", "U"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n3, 7, 15, 31, ?, 127", opts:["47", "55", "63", "64"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Rahul is facing East. He turns left, then right, and then right again. Which direction is he facing now?", opts:["North", "South", "East", "West"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nAB, CE, FH, ?", opts:["IK", "IL", "JL", "JM"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 10;\n    if (x > 5)\n        x = x / 2;\n    printf(\"%d\", x);\n    return 0;\n}", opts:["2", "5", "10", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 1;\nfor (int i = 1; i <= 4; i++) {\n    x *= 2;\n}\ncout << x;", opts:["8", "12", "16", "32"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 5;\nif (x % 2 == 0) {\n    System.out.println(\"Even\");\n} else {\n    System.out.println(\"Odd\");\n}", opts:["Even", "Odd", "5", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which attribute is used to provide alternative text for an image?", opts:["src", "href", "alt", "title"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What will this selector target?\n#menu .item", opts:["An element with ID menu and class item", "All elements with class item inside the element with ID menu", "Only the first element with class item", "All elements with ID item"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(1, 4):\n    x = x + i * 2\nprint(x)", opts:["7", "11", "13", "15"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Database / SQL — Which SQL command is used to remove a table completely?", opts:["DELETE", "REMOVE", "DROP", "TRUNCATE"], correctIndex:2},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nlet y = \"5\";\nconsole.log(x == y);", opts:["true", "false", "Error", "55"], correctIndex:0},
    {cat:"🟠 MEDIUM / TRICKY QUESTIONS", qtext:"🟠 Data Science / Programming Logic\nYou have the following Python list:\nnumbers = [10, 20, 30, 40]\nWhat is the value of:\nnumbers[2]", opts:["10", "20", "30", "40"], correctIndex:2}
  ],
  10: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n4, 7, 12, 19, 28, ?", opts:["35", "37", "39", "41"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nB, E, I, N, ?", opts:["R", "S", "T", "U"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"What is the position of the letter K from the right side of the English alphabet?", opts:["15", "16", "17", "18"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n2, 3, 6, 15, 42, ?", opts:["84", "105", "126", "135"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person is facing South. They turn left, then right, then left again. Which direction are they facing now?", opts:["North", "South", "East", "West"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nZA, XC, VE, TG, ?", opts:["RI", "SH", "QI", "RJ"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 3;\n    for (int i = 1; i <= 3; i++) {\n        x += i;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["6", "8", "9", "10"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 10;\nif (x > 5 && x < 15)\n    cout << x % 4;\nelse\n    cout << x;", opts:["1", "2", "4", "10"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 2;\nfor (int i = 1; i <= 3; i++) {\n    x = x * 2;\n}\nSystem.out.println(x);", opts:["8", "12", "16", "24"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — What is the purpose of the <form> tag?", opts:["To display an image", "To create a table", "To collect user input", "To add a hyperlink"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What will this selector target?\np.highlight", opts:["All <p> elements", "All elements with class highlight", "Only <p> elements with class highlight", "An element with ID highlight"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(1, 4):\n    x = x * 2 + i\nprint(x)", opts:["14", "17", "18", "19"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — What will this query do?\nSELECT COUNT(*) FROM students;", opts:["Displays all student records", "Counts the total number of records in students", "Deletes duplicate students", "Adds a new student"], correctIndex:1},
    {cat:"🟠 TRICKY / MEDIUM QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 10;\nfor (let i = 0; i < 3; i++) {\n    x -= i;\n}\nconsole.log(x);", opts:["5", "6", "7", "10"], correctIndex:2},
    {cat:"🟠 TRICKY / MEDIUM QUESTIONS", qtext:"🟠 Data Science — What will be the output?\nimport pandas as pd\ndata = [10, 20, 30]\nprint(len(data))", opts:["2", "3", "30", "Error"], correctIndex:1}
  ],
  11: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n3, 8, 18, 38, 78, ?", opts:["118", "138", "158", "160"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, B, D, G, K, ?", opts:["O", "P", "Q", "R"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the alphabet is written in reverse order, what is the 12th letter from the right?", opts:["K", "L", "M", "N"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n1, 2, 6, 24, 120, ?", opts:["240", "360", "720", "840"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Pointing to a woman, Rahul says:\n\"She is the daughter of my mother's only son.\"\nHow is the woman related to Rahul?", opts:["Sister", "Daughter", "Niece", "Mother"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nACE, EGI, IKL, ?", opts:["MNO", "NOP", "MOQ", "PQR"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 5;\n    printf(\"%d \", x++);\n    printf(\"%d\", ++x);\n    return 0;\n}", opts:["5 6", "5 7", "6 7", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 2;\nfor (int i = 1; i <= 3; i++) {\n    x = x * 2 + i;\n}\ncout << x;", opts:["18", "19", "21", "23"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 5;\nint y = 10;\nif (x < y && y > 5) {\n    x = x + y;\n}\nSystem.out.println(x);", opts:["5", "10", "15", "Error"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which attribute is used to specify the URL where form data should be sent?", opts:["method", "action", "target", "src"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\ndiv > p.highlight", opts:["All <p> elements inside any <div>", "Direct child <p> elements of a <div> that have class highlight", "All elements with class highlight", "All <div> elements with class highlight"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 0\nfor i in range(1, 5):\n    if i % 2 == 0:\n        x += i\n    else:\n        x -= i\nprint(x)", opts:["-2", "0", "2", "4"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query returns the second highest salary from the employees table?", opts:["SELECT MAX(salary) FROM employees;", "SELECT MIN(salary) FROM employees;", "SELECT MAX(salary) FROM employees;\nWHERE salary < (SELECT MAX(salary) FROM employees);", "SELECT salary FROM employees;"], correctIndex:2},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nconsole.log(x === \"5\");", opts:["true", "false", "5", "Error"], correctIndex:1},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"🔴 Data Science / Python\nWhat will be the output?\ndata = [10, 20, 30, 40, 50]\nresult = [x for x in data if x > 25]\nprint(len(result))", opts:["2", "3", "4", "5"], correctIndex:1}
  ],
  12: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n2, 6, 18, 54, ?", opts:["108", "126", "162", "216"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nC, G, L, R, ?", opts:["W", "X", "Y", "Z"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If A = 1, B = 2, ..., Z = 26, what is the value of:\nBAD = B + A + D", opts:["6", "7", "8", "9"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n5, 10, 30, 120, 600, ?", opts:["1200", "1800", "2400", "3600"], correctIndex:3},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person walks 5 m North, then turns right and walks 5 m, then turns left and walks 10 m. Which direction is the person facing?", opts:["North", "South", "East", "West"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a certain code, CAT is written as DBU. How will DOG be written?", opts:["EPH", "DPH", "EOG", "FPH"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 10;\n    while (x > 5) {\n        x -= 2;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["4", "5", "6", "Infinite loop"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 1;\nfor (int i = 1; i <= 4; i++) {\n    x = x + i;\n}\ncout << x;", opts:["10", "11", "12", "15"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 10;\nswitch (x) {\n    case 5:\n        System.out.println(\"Five\");\n        break;\n    case 10:\n        System.out.println(\"Ten\");\n        break;\n    default:\n        System.out.println(\"Other\");\n}", opts:["Five", "Ten", "Other", "Error"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which element is semantically best for the main content of a webpage?", opts:["<div>", "<main>", "<span>", "<section>"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What will this selector target?\n.container > .item", opts:["All elements with class item anywhere on the page", ".container elements with class item", "Elements with class item that are direct children of .container", "All child elements inside .container"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 0\nfor i in range(1, 5):\n    if i % 2 == 0:\n        x += i\n    else:\n        x += 1\nprint(x)", opts:["6", "7", "8", "10"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query finds duplicate values in the email column?", opts:["SELECT email FROM users;", "SELECT DISTINCT email FROM users;", "SELECT email\n     FROM users\n     GROUP BY email\n     HAVING COUNT(*) > 1;", "DELETE FROM users WHERE email;"], correctIndex:2},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 1;\nfor (let i = 0; i < 3; i++) {\n    x = x * 2;\n}\nconsole.log(x + 1);", opts:["7", "8", "9", "10"], correctIndex:2},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"🔴 Data Science / Python\nWhat will be the output?\ndata = [2, 4, 6, 8, 10]\nresult = [x / 2 for x in data if x >= 6]\nprint(result)", opts:["[2, 3, 4]", "[3.0, 4.0, 5.0]", "[6, 8, 10]", "[3, 4, 5]"], correctIndex:1}
  ],
  13: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n1, 3, 7, 15, 31, ?", opts:["47", "55", "63", "64"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, D, H, M, S, ?", opts:["X", "Y", "Z", "W"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the English alphabet is written in reverse order, which letter is 7th from the left?", opts:["S", "T", "U", "V"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n2, 5, 12, 27, 58, ?", opts:["119", "120", "121", "122"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Pointing to a boy, Riya says:\n\"He is the son of the only daughter of my mother.\"\nHow is the boy related to Riya?", opts:["Brother", "Son", "Nephew", "Cousin"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nAZ, BY, CX, DW, ?", opts:["EU", "EV", "FV", "EW"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 3;\n    for (int i = 1; i <= 3; i++) {\n        x = x * 2;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["12", "18", "24", "48"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 10;\nfor (int i = 1; i <= 3; i++) {\n    x -= i;\n}\ncout << x;", opts:["4", "5", "6", "7"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 5;\nif (x > 3) {\n    if (x < 10) {\n        x = x * 2;\n    }\n}\nSystem.out.println(x);", opts:["5", "7", "10", "Error"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which attribute makes a form field mandatory before submission?", opts:["validate", "required", "mandatory", "checked"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\n#container p:first-child", opts:["The first <p> element anywhere on the page", "Every first <p> inside #container", "A <p> that is the first child of its parent and is inside #container", "Only the #container element"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(1, 5):\n    if i % 2 == 0:\n        x *= i\n    else:\n        x += i\nprint(x)", opts:["16", "20", "24", "28"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query returns departments having more than 5 employees?", opts:["SELECT department\nFROM employees\nWHERE COUNT(*) > 5;", "SELECT department\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5;", "SELECT department\nFROM employees\nORDER BY COUNT(*) > 5;", "SELECT COUNT(department) > 5 FROM employees;"], correctIndex:1},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nlet y = x++;\nconsole.log(x + y);", opts:["10", "11", "12", "Error"], correctIndex:1},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"🔴 Data Science / Python\nWhat will be the output?\ndata = [1, 2, 3, 4, 5, 6]\nresult = [x * x for x in data if x % 2 == 0]\nprint(result)", opts:["[1, 4, 9, 16, 25, 36]", "[4, 16, 36]", "[2, 4, 6]", "[1, 9, 25]"], correctIndex:1}
  ],
  14: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n4, 10, 22, 46, 94, ?", opts:["180", "188", "190", "192"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nZ, V, Q, K, ?", opts:["C", "D", "E", "F"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"If A = 1, B = 2, ..., Z = 26, what is the value of:\nJAVA = J + A + V + A", opts:["32", "34", "36", "38"], correctIndex:3},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n2, 6, 15, 31, 56, ?", opts:["82", "87", "92", "97"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Pointing to a girl, Amit says:\n\"She is the daughter of my father's only son.\"\nHow is the girl related to Amit?", opts:["Sister", "Daughter", "Niece", "Cousin"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nABC, DEF, GHI, ?", opts:["JKL", "KLM", "JKM", "LMN"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 1;\n    for (int i = 1; i <= 4; i++) {\n        x = x + i;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["10", "11", "12", "15"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 2;\nfor (int i = 1; i <= 3; i++) {\n    x = x * i + 1;\n}\ncout << x;", opts:["11", "13", "16", "18"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 0;\nfor (int i = 1; i <= 5; i++) {\n    if (i % 2 == 0)\n        x += i;\n    else\n        x -= i;\n}\nSystem.out.println(x);", opts:["-3", "-2", "2", "3"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which tag is used to embed JavaScript directly inside an HTML document?", opts:["<js>", "<javascript>", "<script>", "<code>"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\nul li:first-child", opts:["The first <ul> on the page", "Every <li> that is the first child of its parent inside a <ul>", "The first <li> anywhere on the page", "All <li> elements inside <ul>"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 2\nfor i in range(1, 4):\n    x = x * i + i\nprint(x)", opts:["18", "21", "24", "27"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — What will this query return?\nSELECT department, COUNT(*)\nFROM employees\nGROUP BY department\nORDER BY COUNT(*) DESC;", opts:["Employees sorted alphabetically by department", "The number of employees in each department, from highest count to lowest", "Only departments with more than one employee", "The total number of employees only"], correctIndex:1},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 3;\nlet y = ++x;\nconsole.log(x * y);", opts:["9", "12", "16", "Error"], correctIndex:2},
    {cat:"🔴 HARD / TRICKY QUESTIONS", qtext:"🔴 Data Science / Python\nWhat will be the output?\ndata = [1, 2, 3, 4, 5]\nresult = [x * 2 for x in data if x % 2 != 0]\nprint(result)", opts:["[1, 3, 5]", "[2, 4, 6]", "[2, 6, 10]", "[4, 8]"], correctIndex:2}
  ],
  15: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n2, 7, 22, 67, 202, ?", opts:["404", "505", "607", "612"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nB, F, K, Q, ?", opts:["V", "W", "X", "Y"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the English alphabet is written in reverse order, which letter is 15th from the left?", opts:["K", "L", "M", "N"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n3, 6, 18, 72, 360, ?", opts:["1080", "1800", "2160", "2520"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Pointing to a woman, Raj says:\n\"She is the wife of the only son of my grandfather.\"\nHow is the woman related to Raj?", opts:["Mother", "Sister", "Aunt", "Grandmother"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"Complete the letter series:\nAY, BV, CS, DP, ?", opts:["EM", "EN", "FO", "GL"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 2;\n    for (int i = 1; i <= 4; i++) {\n        x = x + i * 2;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["18", "20", "22", "24"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 1;\nfor (int i = 1; i <= 3; i++) {\n    x = x * 2 + i;\n}\ncout << x;", opts:["15", "17", "19", "21"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 1;\nfor (int i = 1; i <= 4; i++) {\n    x += i;\n    if (x > 5) {\n        break;\n    }\n}\nSystem.out.println(x);", opts:["4", "5", "7", "11"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which attribute is used to provide a unique identifier to an HTML element?", opts:["class", "name", "id", "key"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\n.card:hover", opts:["All elements with class card", "A .card element when the mouse pointer is over it", "The first .card element only", "All child elements inside .card"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(1, 5):\n    if i % 2 == 0:\n        x += i\n    else:\n        x *= i\nprint(x)", opts:["15", "19", "21", "25"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — What is the purpose of this query?\nSELECT name, marks\nFROM students\nORDER BY marks DESC\nLIMIT 3;", opts:["Displays the lowest 3 marks", "Displays the first 3 students alphabetically", "Displays the top 3 students based on marks", "Counts the top 3 students"], correctIndex:2},
    {cat:"🔴 ADVANCED / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 2;\nlet y = 3;\nx += y * 2;\nconsole.log(x);", opts:["5", "7", "8", "10"], correctIndex:2},
    {cat:"🔴 ADVANCED / TRICKY QUESTIONS", qtext:"🔴 Data Science / Python\nWhat will be the output?\ndata = [1, 2, 3, 4, 5]\nresult = [x ** 2 for x in data if x > 2]\nprint(sum(result))", opts:["25", "41", "50", "54"], correctIndex:2}
  ],
  16: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n1, 2, 6, 15, 31, 56, ?", opts:["82", "87", "92", "95"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, C, G, M, ?", opts:["S", "T", "U", "V"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If A = 1, B = 2, ..., Z = 26, what is the value of:\nCODE = C + O + D + E", opts:["25", "26", "27", "28"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n4, 9, 19, 39, 79, ?", opts:["119", "139", "159", "169"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person walks 10 m North, turns right and walks 5 m, turns right again and walks 10 m. Which direction is the person facing?", opts:["North", "South", "East", "West"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a certain code, if MANGO is written as NBOHP, how will APPLE be written?", opts:["BQQMF", "BPPMF", "BQQNF", "CPPMF"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 5;\n    for (int i = 1; i <= 3; i++) {\n        x = x + i * 2;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["11", "15", "17", "20"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 2;\nfor (int i = 1; i <= 3; i++) {\n    x = x * 2 + 1;\n}\ncout << x;", opts:["15", "17", "19", "21"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 0;\nfor (int i = 1; i <= 5; i++) {\n    if (i % 2 == 0)\n        x += i;\n    else\n        x -= i;\n}\nSystem.out.println(x);", opts:["-3", "-2", "2", "3"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — What is the main purpose of the alt attribute in an <img> tag?", opts:["To change the image size", "To provide alternative text if the image cannot be displayed", "To add a border to the image", "To create a hyperlink"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\n#menu > li.active", opts:["All <li> elements inside #menu", "Direct child <li> elements of #menu with class active", "All elements with ID menu and class active", "Every .active element on the page"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(1, 5):\n    x = x * 2 + i\nprint(x)", opts:["35", "41", "42", "46"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — What does this query return?\nSELECT department, AVG(salary)\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 50000;", opts:["Employees with salary greater than 50000", "Departments whose average salary is greater than 50000", "The highest salary from each department", "All departments and all salaries"], correctIndex:1},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nlet y = 2;\nconsole.log(x ** y + x % y);", opts:["25", "26", "27", "28"], correctIndex:1},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"🔥 Data Science / Python\nWhat will be the output?\ndata = [2, 3, 4, 5, 6]\nresult = [x ** 2 for x in data if x % 2 == 0]\nprint(sum(result))", opts:["40", "48", "56", "64"], correctIndex:2}
  ],
  18: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n2, 3, 5, 9, 17, ?", opts:["25", "29", "33", "35"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nA, E, J, P, ?", opts:["U", "V", "W", "X"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If the English alphabet is written in reverse order, which letter is 20th from the left?", opts:["F", "G", "H", "I"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n1, 4, 13, 40, 121, ?", opts:["242", "361", "364", "366"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person is facing West. They turn left, then right, then right again. Which direction are they facing now?", opts:["North", "South", "East", "West"], correctIndex:0},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a certain code, FISH is written as GJTI. How will BIRD be written?", opts:["CJSE", "CJRD", "BJSF", "DKSE"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 1;\n    for (int i = 1; i <= 4; i++) {\n        x = x * 2 + i;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["30", "31", "32", "35"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 20;\nfor (int i = 1; i <= 3; i++) {\n    x = x / 2 + i;\n}\ncout << x;", opts:["4", "5", "6", "7"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 1;\nfor (int i = 1; i <= 4; i++) {\n    x *= i;\n}\nSystem.out.println(x);", opts:["10", "16", "24", "32"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which HTML element is best used for independent, self-contained content such as a blog post?", opts:["<div>", "<section>", "<article>", "<aside>"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\n.container p:first-of-type", opts:["The first <p> on the webpage", "Every <p> that is the first <p> of its type inside its parent and within .container", "All <p> elements inside .container", "Only direct child <p> elements of .container"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 1\nfor i in range(1, 5):\n    x = x + i\n    if x > 5:\n        break;\nprint(x)", opts:["4", "5", "7", "11"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query finds the highest salary in each department?", opts:["SELECT MAX(salary)\nFROM employees;", "SELECT department, MAX(salary)\nFROM employees\nGROUP BY department;", "SELECT department, salary\nFROM employees\nORDER BY salary DESC;", "SELECT TOP salary FROM employees;"], correctIndex:1},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 3;\nlet y = 2;\nx *= y + 1;\nconsole.log(x);", opts:["6", "8", "9", "12"], correctIndex:2},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"🔥 Data Science / Python\nWhat will be the output?\ndata = [1, 2, 3, 4, 5, 6]\nresult = [x ** 2 for x in data if x % 2 != 0]\nprint(sum(result))", opts:["26", "35", "44", "56"], correctIndex:1}
  ],
  19: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n3, 7, 15, 31, 63, ?", opts:["95", "111", "127", "129"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nB, D, H, N, ?", opts:["T", "U", "V", "W"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"What is the position of M from the right side of the English alphabet?", opts:["12", "13", "14", "15"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n2, 5, 11, 23, 47, ?", opts:["71", "94", "95", "96"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person is facing North. They turn left, then turn left again, and finally turn right. Which direction are they facing?", opts:["North", "South", "East", "West"], correctIndex:3},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a certain code, GAME is written as HBNF. How will CODE be written?", opts:["DPEF", "DPDF", "CPED", "EPFG"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 2;\n    for (int i = 1; i <= 4; i++) {\n        x = x * 2 + 1;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["31", "47", "48", "63"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 3;\nfor (int i = 1; i <= 3; i++) {\n    x = x + i * i;\n}\ncout << x;", opts:["14", "15", "16", "17"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 10;\nfor (int i = 1; i <= 3; i++) {\n    x -= i;\n}\nSystem.out.println(x);", opts:["3", "4", "5", "6"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — Which element is used to associate a label with a form input?", opts:["<caption>", "<label>", "<legend>", "<span>"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\n.box + p", opts:["All <p> elements inside .box", "The first <p> immediately following an element with class box", "All elements with class box inside a <p>", "Every <p> on the page"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 0\nfor i in range(1, 6):\n    if i % 2 == 0:\n        x += i\n    else:\n        x += 1\nprint(x)", opts:["7", "8", "9", "10"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query correctly finds the third highest distinct salary?", opts:["SELECT MAX(salary) FROM employees;", "SELECT MIN(salary) FROM employees;", "SELECT DISTINCT salary\nFROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 2;", "SELECT salary FROM employees\nORDER BY salary;"], correctIndex:2},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 10;\nlet y = 3;\nconsole.log(x % y * 2 + y);", opts:["4", "5", "7", "9"], correctIndex:1},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"🔥 Data Science / Python\nWhat will be the output?\ndata = [1, 2, 3, 4, 5]\nresult = [x * 3 for x in data if x % 2 == 1]\nprint(sum(result))", opts:["18", "21", "27", "30"], correctIndex:2}
  ],
  20: [
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next number:\n1, 5, 17, 53, 161, ?", opts:["320", "483", "485", "489"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the next letter:\nC, F, J, O, ?", opts:["S", "T", "U", "V"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"If A = 1, B = 2, ..., Z = 26, what is the value of:\nDATA = D + A + T + A", opts:["24", "25", "26", "27"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"Find the missing number:\n3, 4, 8, 17, 33, 58, ?", opts:["94", "96", "94", "98"], correctIndex:1},
    {cat:"🧠 LOGICAL REASONING", qtext:"A person is facing East. They turn left, then left again, then right, and finally right. Which direction are they facing now?", opts:["North", "South", "East", "West"], correctIndex:2},
    {cat:"🧠 LOGICAL REASONING", qtext:"In a certain code, JAVA is written as KBWB. How will CODE be written?", opts:["DPEF", "DPDF", "CPED", "EPFG"], correctIndex:0},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C — What will be the output?\n#include <stdio.h>\nint main() {\n    int x = 1;\n    for (int i = 1; i <= 4; i++) {\n        x = x * 2 + i;\n    }\n    printf(\"%d\", x);\n    return 0;\n}", opts:["26", "30", "31", "35"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"C++ — What will be the output?\nint x = 2;\nfor (int i = 1; i <= 4; i++) {\n    x = x + i * 2;\n}\ncout << x;", opts:["18", "20", "22", "24"], correctIndex:2},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Java — What will be the output?\nint x = 1;\nfor (int i = 1; i <= 5; i++) {\n    if (i % 2 == 0)\n        x *= i;\n    else\n        x += i;\n}\nSystem.out.println(x);", opts:["17", "19", "21", "25"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"HTML — What is the difference between <div> and <span>?", opts:["<div> is inline and <span> is block", "<div> is block-level and <span> is inline", "Both are block-level elements", "Both are inline elements"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"CSS — What does this selector target?\n.container .item:nth-child(2)", opts:["The second .item on the page", "Every .item that is the second child of its parent and is inside .container", "The second child of .container only", "All .item elements inside .container"], correctIndex:1},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"Python — What will be the output?\nx = 2\nfor i in range(1, 5):\n    x = x * i + 1\nprint(x)", opts:["23", "29", "33", "41"], correctIndex:3},
    {cat:"💻 PROGRAMMING & TECHNICAL", qtext:"SQL — Which query correctly finds employees whose salary is greater than the average salary?", opts:["SELECT * FROM employees\nWHERE salary > AVG(salary);", "SELECT * FROM employees\nWHERE salary > (\n    SELECT AVG(salary) FROM employees);", "SELECT AVG(salary) FROM employees\nWHERE salary > salary;", "SELECT * FROM employees\nHAVING salary > AVG(salary);"], correctIndex:1},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"JavaScript — What will be the output?\nlet x = 5;\nlet y = 2;\nx = x++ + ++y;\nconsole.log(x + y);", opts:["12", "13", "14", "15"], correctIndex:2},
    {cat:"🔥 ADVANCED / TRICKY QUESTIONS", qtext:"🔥 Data Science / Python\nWhat will be the output?\ndata = [1, 2, 3, 4, 5, 6]\nresult = [x ** 2 for x in data if x % 2 == 0 and x > 2]\nprint(sum(result))", opts:["36", "40", "52", "56"], correctIndex:2}
  ]
};

function levelTier(level){ return Math.min(4, Math.ceil(level/5)); }
function levelName(level){
  const tier = levelTier(level);
  return ['Foundations','Building Speed','Advanced Reasoning','Placement-Ready'][tier-1];
}

function buildTest(level){
  const tier = levelTier(level);
  const questions = [];
  for(let i=0;i<5;i++){
    const q = genQuant(tier);
    questions.push({category:q.cat, qtext:q.qtext, code:null, lang:null, opts:q.opts, correctIndex:q.correctIndex});
  }
  const logicalPicks = pick(LOGICAL_POOL[tier], 5);
  logicalPicks.forEach(q=>{
    questions.push({category:'Logical Reasoning', qtext:q.qtext, code:null, lang:null, opts:q.opts.slice(), correctIndex:q.correctIndex});
  });
  const codePicks = pick(CODE_POOL[tier], 5);
  codePicks.forEach(q=>{
    questions.push({category:'Coding — '+q.lang, qtext:q.qtext, code:q.code, lang:q.lang, opts:q.opts.slice(), correctIndex:q.correctIndex});
  });
  return shuffle(questions);
}

/* ===================== APP STATE ===================== */
let currentView = 'dashboard';
let activeLevel = null;
let testQuestions = [];
let userAnswers = [];
let currentQIndex = 0;
let timeLeft = 15*60;
let timerInterval = null;
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
let lastResult = null;

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function showView(name){
  currentView = name;
  ['dashboard','trail','test','result','calendar'].forEach(v=>{
    $('#view-'+v).classList.toggle('hidden', v!==name);
  });
  $$('.nav button').forEach(b=> b.classList.toggle('active', b.dataset.view===name));
  if(name==='dashboard') renderDashboard();
  if(name==='trail') renderTrail();
  if(name==='calendar') renderCalendar();
}

$$('.nav button').forEach(b=>{
  b.addEventListener('click', ()=> showView(b.dataset.view));
});

/* ===================== DASHBOARD ===================== */
function renderDashboard(){
  let passed=0, tests=0, correct=0, incorrect=0;
  for(const k in DATA.levels){ if(DATA.levels[k].passed) passed++; }
  DATA.attempts.forEach(a=>{ tests++; correct+=a.correct; incorrect+=a.incorrect; });
  $('#stat-levels').textContent = passed+' / 20';
  $('#stat-tests').textContent = tests;
  $('#stat-correct').textContent = correct;
  $('#stat-incorrect').textContent = incorrect;

  const nextLevel = firstUnlockedIncomplete();
  $('#dash-msg').textContent = tests===0
    ? 'Start Level 1 to begin your aptitude trail.'
    : `You're currently on Level ${nextLevel}. Keep climbing!`;

  const recent = DATA.attempts.slice(-5).reverse();
  const box = $('#dash-recent');
  if(recent.length===0){
    box.innerHTML = '<div class="empty-state"><div class="big">🧗</div>No attempts yet — head to the Level Trail to take your first test.</div>';
  } else {
    box.innerHTML = '<div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;margin-bottom:10px;color:var(--text-muted);">Recent attempts</div>' +
      recent.map(a=> `<div class="day-attempt"><span>Level ${a.level} · ${a.date}</span><span style="color:${a.percent>=40?'var(--accent-teal)':'var(--accent-coral)'};font-weight:700;">${a.percent}% · ${a.grade}</span></div>`).join('');
  }
}

function firstUnlockedIncomplete(){
  for(let i=1;i<=20;i++){
    if(!DATA.levels[i] || !DATA.levels[i].passed) return i;
  }
  return 20;
}

/* ===================== TRAIL ===================== */
function isUnlocked(level){
  if(level===1) return true;
  return DATA.levels[level-1] && DATA.levels[level-1].passed;
}
function renderTrail(){
  const trail = $('#trail');
  trail.innerHTML = '<div class="trail-path"></div>';
  for(let lvl=1; lvl<=20; lvl++){
    const row = document.createElement('div');
    row.className = 'trail-row ' + (lvl%2===0 ? 'right':'left');
    const unlocked = isUnlocked(lvl);
    const info = DATA.levels[lvl];
    const passed = info && info.passed;
    const isCurrent = unlocked && !passed;
    const node = document.createElement('div');
    node.className = 'node ' + (passed ? 'passed' : (unlocked ? (isCurrent?'current':'') : 'locked'));
    const tierNames = ['','FOUND.','SPEED','ADVANCED','PRO'];
    node.innerHTML = `<span class="tier-tag">${tierNames[levelTier(lvl)]}</span><span class="num">${lvl}</span>` +
      (passed ? `<span class="stars">${'★'.repeat(starsFor(info.bestPercent))}${'☆'.repeat(3-starsFor(info.bestPercent))}</span>` : '');
    node.addEventListener('click', ()=>{ if(unlocked) openLevelOverlay(lvl); });
    const label = document.createElement('div');
    label.className = 'node-label';
    label.textContent = `Level ${lvl} · ${levelName(lvl)}`;
    if(lvl%2===0){ row.appendChild(node); row.appendChild(label); }
    else { row.appendChild(label); row.appendChild(node); }
    trail.appendChild(row);
  }
}
function starsFor(pct){ if(pct>=90) return 3; if(pct>=70) return 2; return 1; }

function openLevelOverlay(level){
  activeLevel = level;
  $('#ov-title').textContent = 'Level '+level;
  $('#ov-sub').textContent = levelName(level) + ' · ' + ['Quant, logical & coding basics','Faster pace, trickier logic','Multi-step reasoning & DSA basics','Placement-grade difficulty'][levelTier(level)-1];
  const info = DATA.levels[level];
  $('#ov-best').textContent = info ? `Best: ${info.bestPercent}% (${info.bestCorrect}/15)` : 'Best: —';
  $('#level-overlay').classList.remove('hidden');
}
$('#ov-cancel').addEventListener('click', ()=> $('#level-overlay').classList.add('hidden'));
$('#ov-start').addEventListener('click', ()=>{
  $('#level-overlay').classList.add('hidden');
  startTest(activeLevel);
});

/* ===================== TEST ===================== */
function startTest(level){
  activeLevel = level;
  testQuestions = buildTest(level);
  userAnswers = new Array(15).fill(null);
  currentQIndex = 0;
  timeLeft = 15*60;
  showView('test');
  $('#test-title').textContent = 'Level '+level+' — '+levelName(level);
  renderJumpgrid();
  renderQuestion();
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
  updateTimerDisplay();
}
function tick(){
  timeLeft--;
  if(timeLeft<=0){ clearInterval(timerInterval); timeLeft=0; finishTest(); }
  updateTimerDisplay();
}
function updateTimerDisplay(){
  const m = Math.floor(timeLeft/60), s = timeLeft%60;
  const el = $('#timer');
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.classList.toggle('low', timeLeft<=60);
}
function renderQuestion(){
  const q = testQuestions[currentQIndex];
  $('#test-sub').textContent = `Question ${currentQIndex+1} of 15`;
  $('#progress-fill').style.width = ((currentQIndex+1)/15*100)+'%';
  const card = $('#qcard');
  let html = `<div class="qmeta">${q.category}</div><div class="qtext">${q.qtext}</div>`;
  if(q.code){ html += `<pre>${escapeHtml(q.code)}</pre>`; }
  q.opts.forEach((opt,i)=>{
    const sel = userAnswers[currentQIndex]===i;
    html += `<div class="opt ${sel?'selected':''}" data-i="${i}"><div class="letter">${String.fromCharCode(65+i)}</div><div class="otext">${escapeHtml(opt)}</div></div>`;
  });
  card.innerHTML = html;
  card.querySelectorAll('.opt').forEach(el=>{
    el.addEventListener('click', ()=>{
      userAnswers[currentQIndex] = parseInt(el.dataset.i);
      renderQuestion();
      renderJumpgrid();
    });
  });
  $('#btn-prev').disabled = currentQIndex===0;
  $('#btn-prev').style.opacity = currentQIndex===0 ? .4 : 1;
}
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderJumpgrid(){
  const g = $('#jumpgrid');
  g.innerHTML='';
  for(let i=0;i<15;i++){
    const b = document.createElement('div');
    b.className = 'jbtn ' + (userAnswers[i]!==null?'answered':'') + (i===currentQIndex?' current':'');
    b.textContent = i+1;
    b.addEventListener('click', ()=>{ currentQIndex=i; renderQuestion(); renderJumpgrid(); });
    g.appendChild(b);
  }
}
$('#btn-prev').addEventListener('click', ()=>{ if(currentQIndex>0){ currentQIndex--; renderQuestion(); renderJumpgrid(); } });
$('#btn-next').addEventListener('click', ()=>{ if(currentQIndex<14){ currentQIndex++; renderQuestion(); renderJumpgrid(); } });
$('#btn-submit').addEventListener('click', ()=>{
  if(confirm('Submit the test now?')) finishTest();
});

async function finishTest(){
  if(timerInterval) clearInterval(timerInterval);
  let correct=0, incorrect=0, unattempted=0;
  const reviews=[];
  testQuestions.forEach((q,i)=>{
    const ans = userAnswers[i];
    if(ans===null){ unattempted++; }
    else if(ans===q.correctIndex){ correct++; }
    else { incorrect++; }
    reviews.push({q, ans});
  });
  const marks = correct;
  const percent = Math.round((correct/15)*1000)/10;
  const grade = gradeFor(percent);
  const passed = percent>=40;

  const today = new Date();
  const dateStr = today.toISOString().slice(0,10);
  DATA.attempts.push({level:activeLevel, date:dateStr, correct, incorrect, unattempted, percent, grade});
  const info = DATA.levels[activeLevel] || {bestPercent:0,bestCorrect:0,bestIncorrect:0,attempts:0,passed:false};
  info.attempts = (info.attempts||0)+1;
  info.lastDate = dateStr;
  if(percent >= (info.bestPercent||0)){
    info.bestPercent = percent;
    info.bestCorrect = correct;
    info.bestIncorrect = incorrect;
  }
  if(passed) info.passed = true;
  DATA.levels[activeLevel] = info;
  await saveData();

  lastResult = {correct, incorrect, unattempted, marks, percent, grade, passed, reviews};
  renderResult();
  showView('result');
}
function gradeFor(pct){
  if(pct>=90) return 'A+';
  if(pct>=75) return 'A';
  if(pct>=60) return 'B';
  if(pct>=40) return 'C';
  return 'F';
}
function renderResult(){
  const r = lastResult;
  $('#result-grade').textContent = r.grade;
  $('#result-grade').style.borderColor = r.passed ? 'var(--accent-teal)' : 'var(--accent-coral)';
  $('#result-grade').style.color = r.passed ? 'var(--accent-teal)' : 'var(--accent-coral)';
  $('#result-title').textContent = r.passed ? `Level ${activeLevel} cleared!` : `Level ${activeLevel} — not cleared yet`;
  $('#result-sub').textContent = r.passed ? (activeLevel<20 ? 'Level '+(activeLevel+1)+' is now unlocked.' : 'You have conquered the final level!') : 'Score 40% or higher to unlock the next level. Try again!';
  $('#r-correct').textContent = r.correct;
  $('#r-incorrect').textContent = r.incorrect;
  $('#r-unattempted').textContent = r.unattempted;
  $('#r-marks').textContent = r.marks+' / 15';
  $('#r-percent').textContent = r.percent+'%';
  $('#review-list').classList.add('hidden');
  $('#btn-review-toggle').textContent = 'Review Answers';
  const list = $('#review-list');
  list.innerHTML = r.reviews.map((item,idx)=>{
    const correctText = item.q.opts[item.q.correctIndex];
    const yourText = item.ans!==null ? item.q.opts[item.ans] : '— not answered —';
    const isRight = item.ans===item.q.correctIndex;
    return `<div class="review-item">
      <div class="qmeta" style="font-size:10.5px;color:var(--text-faint);text-transform:uppercase;margin-bottom:6px;">Q${idx+1} · ${item.q.category}</div>
      <div class="qtext">${escapeHtml(item.q.qtext)}</div>
      ${item.q.code?`<pre>${escapeHtml(item.q.code)}</pre>`:''}
      <div class="ans-line ${isRight?'correct':'wrong'}">Your answer: ${escapeHtml(yourText)}</div>
      ${!isRight?`<div class="ans-line correct">Correct answer: ${escapeHtml(correctText)}</div>`:''}
    </div>`;
  }).join('');
}
$('#btn-review-toggle').addEventListener('click', ()=>{
  const list = $('#review-list');
  const hidden = list.classList.toggle('hidden');
  $('#btn-review-toggle').textContent = hidden ? 'Review Answers' : 'Hide Review';
});
$('#btn-back-trail').addEventListener('click', ()=> showView('trail'));

/* ===================== CALENDAR ===================== */
function renderCalendar(){
  const dowRow = $('#cal-dow-row');
  dowRow.innerHTML = ['S','M','T','W','T','F','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  $('#cal-month-label').textContent = `${monthNames[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const grid = $('#cal-grid');
  grid.innerHTML='';
  for(let i=0;i<firstDay;i++){
    const c = document.createElement('div'); c.className='cal-cell empty'; grid.appendChild(c);
  }
  const todayStr = new Date().toISOString().slice(0,10);
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayAttempts = DATA.attempts.filter(a=>a.date===dateStr);
    const cell = document.createElement('div');
    cell.className = 'cal-cell' + (dayAttempts.length?' has-attempt':'') + (dateStr===todayStr?' today':'');
    const bestPct = dayAttempts.length ? Math.max(...dayAttempts.map(a=>a.percent)) : null;
    cell.innerHTML = `<span>${d}</span>` + (dayAttempts.length ? `<span class="dot" style="background:${bestPct>=40?'var(--accent-teal)':'var(--accent-coral)'};"></span>` : '');
    if(dayAttempts.length){
      cell.addEventListener('click', ()=> renderDayList(dateStr, dayAttempts));
    }
    grid.appendChild(cell);
  }
  $('#day-list').innerHTML='';
}
function renderDayList(dateStr, attempts){
  const box = $('#day-list');
  box.innerHTML = `<div style="font-family:'Space Grotesk',sans-serif;font-size:15px;margin:14px 0 10px;">${dateStr} — ${attempts.length} attempt(s)</div>` +
    attempts.map(a=> `<div class="day-attempt"><span>Level ${a.level} · ${a.correct} correct / ${a.incorrect} incorrect</span><span style="color:${a.percent>=40?'var(--accent-teal)':'var(--accent-coral)'};font-weight:700;">${a.percent}% · ${a.grade}</span></div>`).join('');
}
$('#cal-prev').addEventListener('click', ()=>{ calMonth--; if(calMonth<0){calMonth=11; calYear--;} renderCalendar(); });
$('#cal-next').addEventListener('click', ()=>{ calMonth++; if(calMonth>11){calMonth=0; calYear++;} renderCalendar(); });

/* ===================== INIT ===================== */
loadData();

})();
