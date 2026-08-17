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
const LOGICAL_POOL = {
  1:[
    {qtext:"Pointing to a boy, Ravi said, 'He is the son of my mother's only son.' How is the boy related to Ravi?", opts:["His son","His brother","His nephew","His cousin"], correctIndex:0},
    {qtext:"If 'A' is coded as 1, 'B' as 2, and so on, what does the word 'CAB' become?", opts:["3-1-2","2-1-3","3-2-1","1-2-3"], correctIndex:0},
    {qtext:"Find the odd one out: Circle, Square, Triangle, Sphere", opts:["Sphere","Circle","Square","Triangle"], correctIndex:0},
    {qtext:"Priya is Rohan's sister. Rohan is Meera's father. How is Priya related to Meera?", opts:["Aunt","Mother","Grandmother","Cousin"], correctIndex:0},
    {qtext:"Complete the analogy: Pen is to Write as Knife is to ___", opts:["Cut","Sharp","Kitchen","Metal"], correctIndex:0},
    {qtext:"If South-East becomes North, North-East becomes West, what does South become?", opts:["North-West","East","West","North-East"], correctIndex:0},
    {qtext:"Which number should replace the question mark: 2, 4, 8, 16, ?", opts:["32","24","30","20"], correctIndex:0},
    {qtext:"All roses are flowers. Some flowers fade quickly. Which conclusion is valid?", opts:["Some roses may fade quickly is not certain","All roses fade quickly","No roses fade quickly","All flowers are roses"], correctIndex:0},
    {qtext:"In a code, 'RAIN' is written as 'SBJO'. How is 'SNOW' written?", opts:["TOPX","TPOX","TOXP","SNPX"], correctIndex:0},
    {qtext:"A is taller than B. C is shorter than B. Who is the shortest?", opts:["C","A","B","Cannot be determined"], correctIndex:0}
  ],
  2:[
    {qtext:"Pointing to a photograph, Anu said, 'She is the daughter of my grandfather's only son.' If Anu has no siblings, who is in the photograph?", opts:["Anu herself","Anu's mother","Anu's aunt","Anu's cousin"], correctIndex:0},
    {qtext:"In a certain code, 'MONEY' is written as 'NPOFZ'. How is 'SAVER' written in that code?", opts:["TBWFS","TBWFR","SBWFS","TBVFS"], correctIndex:0},
    {qtext:"Five friends P, Q, R, S, T are sitting in a row. P is to the left of Q. R is to the right of S. Q is left of R. If S is at the left end, who sits at the extreme right?", opts:["R","T","Q","P"], correctIndex:0},
    {qtext:"Statements: All engineers are logical. Some logical people are calm. Conclusion: Some engineers are calm.", opts:["Cannot be determined from the given statements","Definitely true","Definitely false","Statements are contradictory"], correctIndex:0},
    {qtext:"A man walks 5 km North, then 3 km East, then 5 km South. How far is he from the starting point?", opts:["3 km","8 km","5 km","13 km"], correctIndex:0},
    {qtext:"Find the missing number: 3, 9, 27, 81, ?", opts:["243","162","324","729"], correctIndex:0},
    {qtext:"If 'TEACHER' is coded as 'UFBDIFS', what is the code for 'STUDENT'?", opts:["TUVEFOU","TVUEFOU","TUVDFOU","SUVEFOU"], correctIndex:0},
    {qtext:"In a family, X is the father of Y. Y is the sister of Z. Z is the son of W. How is W related to X?", opts:["Wife","Sister","Mother","Daughter"], correctIndex:0},
    {qtext:"Which figure completes the pattern: 1, 4, 9, 16, 25, ?", opts:["36","30","32","49"], correctIndex:0},
    {qtext:"Six people are seated around a circular table. A sits opposite D. B sits to the immediate right of A. Who sits to the immediate left of D?", opts:["The person opposite B","A","C","Cannot be determined without more information"], correctIndex:0}
  ],
  3:[
    {qtext:"Pointing to a man, a woman says, 'His mother is the only daughter of my mother.' How is the woman related to the man?", opts:["Mother","Aunt","Sister","Grandmother"], correctIndex:0},
    {qtext:"In a row of 40 students, Rahul is 12th from the left. If he is moved 5 places to the right, what is his position from the right end?", opts:["23rd","22nd","24rd","21st"], correctIndex:0},
    {qtext:"Statement: 'All keys are locks. No lock is a door.' Conclusion I: No key is a door. Conclusion II: Some locks are keys.", opts:["Both conclusions follow","Only conclusion I follows","Only conclusion II follows","Neither follows"], correctIndex:0},
    {qtext:"A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?", opts:["Uncle","Father","Brother","Grandfather"], correctIndex:0},
    {qtext:"In a coding system, 'COMPUTER' is written as 'RFUVQNPC' reversed and shifted by one letter. What is the underlying transformation? Given 'DESIGN' becomes 'EFTJHO' using the shift, decode 'IFMMP'.", opts:["HELLO","HELLP","GELLO","HELLN"], correctIndex:0},
    {qtext:"Find the next term: 2, 6, 12, 20, 30, ?", opts:["42","40","44","36"], correctIndex:0},
    {qtext:"Seven boxes are stacked. Box C is directly above Box F. Box F is two positions below Box A. If Box A is at the top, and there are 2 boxes between A and F, which position is C in from the top?", opts:["4th","3rd","5th","6th"], correctIndex:0},
    {qtext:"P is Q's father. Q is R's sister. S is R's husband. How is P related to S?", opts:["Father-in-law","Uncle","Brother-in-law","Grandfather"], correctIndex:0},
    {qtext:"Statement: 'Some doctors are teachers. All teachers are readers.' Conclusion: Some doctors are readers.", opts:["Definitely true","Definitely false","Cannot be determined","Contradictory"], correctIndex:0},
    {qtext:"A cube is painted red on all faces and cut into 27 equal smaller cubes. How many small cubes have exactly one face painted?", opts:["6","8","12","1"], correctIndex:0}
  ],
  4:[
    {qtext:"In a certain code, 'FRIENDSHIP' is written such that each letter is replaced by the letter three positions ahead in the alphabet. How is 'BOND' written in this code?", opts:["ERQG","EQRG","DRQG","ERGQ"], correctIndex:0},
    {qtext:"Eight people A–H sit around a circular table facing the centre. A sits third to the right of B. C sits second to the left of A. D sits opposite C. If E sits immediately left of D, who sits immediately right of B?", opts:["Cannot be determined without further clues","C","A","E"], correctIndex:0},
    {qtext:"Statements: 'All chips are circuits. No circuit is a battery. Some batteries are cells.' Conclusion I: No chip is a battery. Conclusion II: Some cells are not circuits.", opts:["Only conclusion I follows","Only conclusion II follows","Both follow","Neither follows"], correctIndex:0},
    {qtext:"A is the son of B's father's only daughter's husband. How is A related to B, if B is male?", opts:["A is B's son","A is B's nephew","A is B's brother","A is B's father"], correctIndex:0},
    {qtext:"A cube of side 4 units is painted on all faces and cut into unit cubes. How many unit cubes have no face painted?", opts:["8","4","6","12"], correctIndex:0},
    {qtext:"In a family gathering, P is Q's mother's brother's wife. How is P related to Q?", opts:["Aunt","Mother","Grandmother","Sister-in-law"], correctIndex:0},
    {qtext:"Find the next term in the series: 5, 11, 23, 47, 95, ?", opts:["191","189","193","187"], correctIndex:0},
    {qtext:"Six students score marks such that A > B, C > D, B > E, D > A, F is the lowest. Who scored the highest?", opts:["C","A","D","B"], correctIndex:0},
    {qtext:"Statement: 'No mobile is a laptop. All laptops are computers.' Conclusion: Some computers are not mobiles.", opts:["Definitely true","Definitely false","Cannot be determined","Contradictory statements"], correctIndex:0},
    {qtext:"A is North of B. C is East of B. D is South of C, at the same distance as A is North of B. What is the direction of D with respect to A?", opts:["South-East","North-East","South-West","East"], correctIndex:0}
  ]
};

// ---- Curated coding pool (C++ / Java / Python) tier 1-4 ----
const CODE_POOL = {
  1:[
    {lang:'C++', qtext:"A food-delivery app stores each order's total bill. What is the output of this C++ snippet?", code:`int bill = 250;\nint discount = 50;\ncout << bill - discount;`, opts:["200","250","50","300"], correctIndex:0},
    {lang:'Java', qtext:"A library system counts books. What does this Java code print?", code:`int books = 12;\nbooks = books + 3;\nSystem.out.println(books);`, opts:["15","12","3","9"], correctIndex:0},
    {lang:'Python', qtext:"An e-commerce cart adds item prices. What is printed?", code:`price = [100, 250, 150]\nprint(sum(price))`, opts:["500","400","250","150"], correctIndex:0},
    {lang:'C++', qtext:"A student attendance tracker uses booleans. What is the output?", code:`bool present = true;\ncout << (present && false);`, opts:["0","1","true","false"], correctIndex:0},
    {lang:'Java', qtext:"A ride-hailing app checks fare eligibility. What is printed?", code:`int distance = 8;\nif (distance > 5) {\n  System.out.println(\"Surcharge\");\n} else {\n  System.out.println(\"Normal\");\n}`, opts:["Surcharge","Normal","8","Error"], correctIndex:0},
    {lang:'Python', qtext:"A weather app converts Celsius to Fahrenheit. What is printed?", code:`c = 20\nf = c * 9/5 + 32\nprint(f)`, opts:["68.0","20.0","36.0","52.0"], correctIndex:0},
    {lang:'C++', qtext:"An inventory system loops through stock counts. What is the output?", code:`for (int i = 1; i <= 3; i++) {\n  cout << i << \" \";\n}`, opts:["1 2 3","0 1 2","1 2 3 4","3 2 1"], correctIndex:0},
    {lang:'Java', qtext:"A quiz app tallies scores using an array. What is printed?", code:`int[] scores = {5, 8, 2};\nSystem.out.println(scores.length);`, opts:["3","2","8","5"], correctIndex:0},
    {lang:'Python', qtext:"A to-do list app removes a completed task. What is printed?", code:`tasks = [\"email\", \"call\", \"meet\"]\ntasks.remove(\"call\")\nprint(tasks)`, opts:["['email', 'meet']","['email', 'call']","['call', 'meet']","['email', 'call', 'meet']"], correctIndex:0},
    {lang:'C++', qtext:"A parking app calculates fee per hour. What is the output?", code:`int hours = 4;\nint rate = 20;\ncout << hours * rate;`, opts:["80","24","20","4"], correctIndex:0},
    {lang:'Java', qtext:"A messaging app checks string length for SMS limits. What is printed?", code:`String msg = \"Hello\";\nSystem.out.println(msg.length());`, opts:["5","4","6","Hello"], correctIndex:0},
    {lang:'Python', qtext:"A survey app counts 'yes' votes. What is printed?", code:`votes = [\"yes\", \"no\", \"yes\", \"yes\"]\nprint(votes.count(\"yes\"))`, opts:["3","2","4","1"], correctIndex:0}
  ],
  2:[
    {lang:'C++', qtext:"A banking app validates a withdrawal against balance. What does this print?", code:`int balance = 500;\nint withdraw = 700;\nif (withdraw <= balance)\n  cout << \"Approved\";\nelse\n  cout << \"Declined\";`, opts:["Declined","Approved","500","700"], correctIndex:0},
    {lang:'Java', qtext:"A leaderboard app sorts scores ascending. What is printed?", code:`int[] arr = {40, 10, 30};\nArrays.sort(arr);\nSystem.out.println(arr[0]);`, opts:["10","40","30","0"], correctIndex:0},
    {lang:'Python', qtext:"A password checker counts digits in input. What is printed?", code:`pwd = \"abc123\"\ndigits = sum(c.isdigit() for c in pwd)\nprint(digits)`, opts:["3","6","4","0"], correctIndex:0},
    {lang:'C++', qtext:"A traffic-light simulator uses a switch statement. What is the output?", code:`int state = 2;\nswitch(state){\n  case 1: cout << \"Red\"; break;\n  case 2: cout << \"Yellow\"; break;\n  default: cout << \"Green\";\n}`, opts:["Yellow","Red","Green","2"], correctIndex:0},
    {lang:'Java', qtext:"A gym app computes BMI category. What is printed?", code:`double bmi = 27.5;\nif (bmi < 18.5) System.out.println(\"Under\");\nelse if (bmi < 25) System.out.println(\"Normal\");\nelse System.out.println(\"Over\");`, opts:["Over","Normal","Under","27.5"], correctIndex:0},
    {lang:'Python', qtext:"A recipe app scales ingredient amounts using a function. What is printed?", code:`def scale(amount, factor):\n    return amount * factor\nprint(scale(2, 3))`, opts:["6","5","2","3"], correctIndex:0},
    {lang:'C++', qtext:"A vending machine app uses a while loop to dispense coins. What is the output?", code:`int change = 30, coins = 0;\nwhile (change >= 10) {\n  change -= 10;\n  coins++;\n}\ncout << coins;`, opts:["3","30","0","10"], correctIndex:0},
    {lang:'Java', qtext:"A student portal removes duplicate roll numbers using a Set. What is printed?", code:`Set<Integer> ids = new HashSet<>();\nids.add(1); ids.add(2); ids.add(1);\nSystem.out.println(ids.size());`, opts:["2","3","1","0"], correctIndex:0},
    {lang:'Python', qtext:"A chat app filters short messages using a list comprehension. What is printed?", code:`msgs = [\"hi\", \"hello there\", \"ok\", \"see you soon\"]\nlong = [m for m in msgs if len(m) > 5]\nprint(len(long))`, opts:["2","3","4","1"], correctIndex:0},
    {lang:'C++', qtext:"A file-sharing app uses recursion to compute folder depth. What is the output?", code:`int depth(int n){\n  if(n==0) return 0;\n  return 1 + depth(n-1);\n}\ncout << depth(4);`, opts:["4","0","3","5"], correctIndex:0},
    {lang:'Java', qtext:"An attendance app calculates percentage using integer division. What is printed?", code:`int present = 18, total = 20;\ndouble pct = (double) present / total * 100;\nSystem.out.println(pct);`, opts:["90.0","0.9","18.0","90"], correctIndex:0},
    {lang:'Python', qtext:"A stock-tracker app uses a dictionary for prices. What is printed?", code:`prices = {\"AAPL\": 180, \"TSLA\": 250}\nprices[\"AAPL\"] += 20\nprint(prices[\"AAPL\"])`, opts:["200","180","20","250"], correctIndex:0}
  ],
  3:[
    {lang:'C++', qtext:"A ride-sharing app matches drivers using a stack for the nearest-added driver. What is the output?", code:`stack<int> s;\ns.push(1); s.push(2); s.push(3);\ns.pop();\ncout << s.top();`, opts:["2","3","1","0"], correctIndex:0},
    {lang:'Java', qtext:"A hospital queue system uses a Queue (FIFO) for patients. What is printed?", code:`Queue<String> q = new LinkedList<>();\nq.add(\"P1\"); q.add(\"P2\"); q.add(\"P3\");\nSystem.out.println(q.poll());`, opts:["P1","P3","P2","null"], correctIndex:0},
    {lang:'Python', qtext:"A social-media app deduplicates followers using set operations. What is printed?", code:`a = {\"u1\", \"u2\", \"u3\"}\nb = {\"u2\", \"u3\", \"u4\"}\nprint(len(a & b))`, opts:["2","3","4","1"], correctIndex:0},
    {lang:'C++', qtext:"A search feature in an app uses binary search on sorted product IDs. What does this find?", code:`int arr[] = {2,4,6,8,10,12};\nint lo=0, hi=5, target=8, mid;\nwhile(lo<=hi){\n  mid=(lo+hi)/2;\n  if(arr[mid]==target){ cout<<mid; break; }\n  else if(arr[mid]<target) lo=mid+1;\n  else hi=mid-1;\n}`, opts:["3","2","4","8"], correctIndex:0},
    {lang:'Java', qtext:"A payroll system computes total salary using recursion for a bonus series. What is printed?", code:`static int bonus(int n){\n  if(n<=1) return n;\n  return bonus(n-1) + bonus(n-2);\n}\n// call bonus(6)\nSystem.out.println(bonus(6));`, opts:["8","5","13","6"], correctIndex:0},
    {lang:'Python', qtext:"A caching layer for a news app uses an LRU-style dict with manual eviction. What is printed?", code:`cache = {}\ndef add(key, val, limit=2):\n    if len(cache) >= limit:\n        oldest = next(iter(cache))\n        del cache[oldest]\n    cache[key] = val\nadd(\"a\",1); add(\"b\",2); add(\"c\",3)\nprint(list(cache.keys()))`, opts:["['b', 'c']","['a', 'b']","['a', 'b', 'c']","['c']"], correctIndex:0},
    {lang:'C++', qtext:"An e-commerce app groups orders by linked list traversal. What is the output?", code:`struct Node{int val; Node* next;};\nNode a{1,nullptr}, b{2,nullptr}, c{3,nullptr};\na.next=&b; b.next=&c;\nNode* cur=&a; int sum=0;\nwhile(cur!=nullptr){ sum+=cur->val; cur=cur->next; }\ncout << sum;`, opts:["6","3","5","0"], correctIndex:0},
    {lang:'Java', qtext:"An analytics dashboard sorts events using a custom Comparator. What is printed first after sorting ascending by time?", code:`int[] times = {930, 845, 1100};\nArrays.sort(times);\nSystem.out.println(times[0]);`, opts:["845","930","1100","0"], correctIndex:0},
    {lang:'Python', qtext:"A booking app validates overlapping time slots. What is printed?", code:`def overlaps(a_start,a_end,b_start,b_end):\n    return a_start < b_end and b_start < a_end\nprint(overlaps(9,11,10,12))`, opts:["True","False","None","Error"], correctIndex:0},
    {lang:'C++', qtext:"A matrix-based image filter for a photo app sums a 2x2 block. What is the output?", code:`int m[2][2] = {{1,2},{3,4}};\nint sum=0;\nfor(int i=0;i<2;i++)\n  for(int j=0;j<2;j++)\n    sum += m[i][j];\ncout << sum;`, opts:["10","6","4","9"], correctIndex:0},
    {lang:'Java', qtext:"A form validator app uses regex to check an email pattern loosely. What is printed?", code:`String email = \"user@test.com\";\nSystem.out.println(email.contains(\"@\") && email.contains(\".\"));`, opts:["true","false","user@test.com","Error"], correctIndex:0},
    {lang:'Python', qtext:"A fitness app computes running streaks using itertools-style logic. What is printed?", code:`days = [1,1,0,1,1,1,0]\nbest, cur = 0,0\nfor d in days:\n    cur = cur+1 if d==1 else 0\n    best = max(best,cur)\nprint(best)`, opts:["3","4","2","7"], correctIndex:0}
  ],
  4:[
    {lang:'C++', qtext:"A route-planning app finds shortest paths conceptually with Dijkstra-like relaxation on 3 nodes. Given edges A→B=4, A→C=1, C→B=1, what is the shortest A→B distance printed?", code:`int AB=4, AC=1, CB=1;\nint viaC = AC+CB;\ncout << min(AB, viaC);`, opts:["2","4","1","5"], correctIndex:0},
    {lang:'Java', qtext:"A code-review bot counts balanced brackets in a snippet using a Stack. Is '([{}])' balanced?", code:`String s = \"([{}])\";\nStack<Character> st = new Stack<>();\nboolean ok = true;\nfor(char c: s.toCharArray()){\n  if(\"([{\".indexOf(c)>=0) st.push(c);\n  else {\n    if(st.isEmpty()) { ok=false; break; }\n    char top = st.pop();\n    if((c==')'&&top!='(')||(c==']'&&top!='[')||(c=='}'&&top!='{')) { ok=false; break; }\n  }\n}\nSystem.out.println(ok && st.isEmpty());`, opts:["true","false","Error","null"], correctIndex:0},
    {lang:'Python', qtext:"A recommendation engine computes a simple similarity score via dot product. What is printed?", code:`u1 = [1,0,1,1]\nu2 = [1,1,0,1]\nscore = sum(a*b for a,b in zip(u1,u2))\nprint(score)`, opts:["2","3","4","1"], correctIndex:0},
    {lang:'C++', qtext:"A memory allocator simulation for a game engine uses pointer arithmetic. What is printed?", code:`int arr[5] = {10,20,30,40,50};\nint* p = arr + 2;\ncout << *p;`, opts:["30","20","10","3"], correctIndex:0},
    {lang:'Java', qtext:"A distributed-systems mock uses a HashMap to count word frequency in server logs. What is printed?", code:`String[] logs = {\"ERROR\",\"INFO\",\"ERROR\",\"WARN\",\"ERROR\"};\nMap<String,Integer> freq = new HashMap<>();\nfor(String s: logs) freq.merge(s,1,Integer::sum);\nSystem.out.println(freq.get(\"ERROR\"));`, opts:["3","2","1","5"], correctIndex:0},
    {lang:'Python', qtext:"A financial app computes compound interest recursively for a loan tracker. What is printed (rounded)?", code:`def compound(p, r, t):\n    if t == 0: return p\n    return compound(p*(1+r), r, t-1)\nprint(round(compound(1000, 0.1, 3)))`, opts:["1331","1300","1100","1000"], correctIndex:0},
    {lang:'C++', qtext:"A graph-based friend-suggestion feature counts mutual connections via adjacency sets. What is printed?", code:`set<int> a = {2,3,4};\nset<int> b = {3,4,5};\nint common=0;\nfor(int x: a) if(b.count(x)) common++;\ncout << common;`, opts:["2","3","1","0"], correctIndex:0},
    {lang:'Java', qtext:"A concurrency-safe counter for an analytics service uses synchronized increments. What is the final count printed after 100 increments run sequentially?", code:`class Counter{ int c=0; synchronized void inc(){ c++; } }\nCounter counter = new Counter();\nfor(int i=0;i<100;i++) counter.inc();\nSystem.out.println(counter.c);`, opts:["100","0","99","101"], correctIndex:0},
    {lang:'Python', qtext:"A/B testing service computes a p-value threshold decision using a simple rule. What is printed?", code:`p_value = 0.03\nalpha = 0.05\nsignificant = p_value < alpha\nprint(\"Reject H0\" if significant else \"Fail to reject H0\")`, opts:["Reject H0","Fail to reject H0","0.03","Error"], correctIndex:0},
    {lang:'C++', qtext:"A route-optimization app for delivery drones computes minimum spanning cost conceptually between 3 hubs with edges 5, 9, 3. What is the minimum total to connect all three (sum of two smallest)?", code:`int e1=5, e2=9, e3=3;\nint arr[3] = {e1,e2,e3};\nsort(arr, arr+3);\ncout << arr[0]+arr[1];`, opts:["8","14","12","9"], correctIndex:0},
    {lang:'Java', qtext:"A rate-limiter for an API gateway uses a sliding counter. Given 12 requests allowed per 3 checks of 4 each, what is printed?", code:`int limit = 12;\nint used = 4+4+4;\nSystem.out.println(used <= limit);`, opts:["true","false","12","Error"], correctIndex:0},
    {lang:'Python', qtext:"A search-ranking service applies a simple weighted score. What is printed?", code:`relevance = 0.7\nfreshness = 0.5\nscore = relevance*0.6 + freshness*0.4\nprint(round(score,2))`, opts:["0.62","0.6","0.7","0.5"], correctIndex:0}
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
