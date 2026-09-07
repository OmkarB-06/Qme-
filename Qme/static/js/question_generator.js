// ===================== QUESTION GENERATOR =====================

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

function levelTier(level) {
  return Math.min(4, Math.ceil(level / 5));
}

function levelName(level) {
  const tier = levelTier(level);
  return ['Foundations', 'Building Speed', 'Advanced Reasoning', 'Placement-Ready'][tier - 1];
}

// Use the 15 curated questions already stored for each level.
// This fixes the old buildTest() references to undefined LOGICAL_POOL/CODE_POOL.
function buildTest(level) {
    const questions = QUESTION_POOL[level];

    if (!questions || questions.length < 15) {
        console.error("Questions not found for Level " + level);
        return [];
    }

    return shuffle(
        questions.map(q => ({
            category: q.cat,
            qtext: q.qtext,
            code: q.code || null,
            lang: q.lang || null,
            opts: q.opts.slice(),
            correctIndex: q.correctIndex
        }))
    );
}