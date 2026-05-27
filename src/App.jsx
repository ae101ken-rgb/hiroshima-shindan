import { useState, useEffect } from "react";

const STEPS = ["start", "q1", "q2", "q3", "q4", "result"];

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&family=DM+Serif+Display:ital@0;1&display=swap');`;

// Data
const RENT = {
  single:   { tokyo: 104000, hiroshima: 56000 },
  couple:   { tokyo: 107000, hiroshima: 74000 },
  family1:  { tokyo: 154000, hiroshima: 87000 },
  family2:  { tokyo: 180000, hiroshima: 100000 },
};
const COMMUTE_COST = { tokyo: 12000, hiroshima: 6000 };
const FOOD = { tokyo: 60000, hiroshima: 45000 };
const CHILDCARE = { tokyo: 30000, hiroshima: 30000 };
const COMMUTE_MIN = { tokyo: 48, hiroshima: 30 };

function calcSavings(family, hasKid) {
  const rent = RENT[family] || RENT.single;
  const rentDiff = rent.tokyo - rent.hiroshima;
  const commuteDiff = COMMUTE_COST.tokyo - COMMUTE_COST.hiroshima;
  const foodDiff = FOOD.tokyo - FOOD.hiroshima;
  const childDiff = hasKid ? CHILDCARE.tokyo - CHILDCARE.hiroshima : 0;
  const monthly = rentDiff + commuteDiff + foodDiff + childDiff;
  return {
    rent: rentDiff,
    commute: commuteDiff,
    food: foodDiff,
    child: childDiff,
    monthly,
    yearly: monthly * 12,
    ten: monthly * 12 * 10,
    commuteMins: (COMMUTE_MIN.tokyo - COMMUTE_MIN.hiroshima) * 2 * 250,
  };
}

const fmt = (n) => n.toLocaleString();

export default function App() {
  const [step, setStep] = useState("start");
  const [answers, setAnswers] = useState({ family: "single", income: "400", job: "office", hasKid: false });
  const [visible, setVisible] = useState(false);
  const [countVal, setCountVal] = useState(0);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [step]);

  const savings = calcSavings(answers.family, answers.hasKid);

  useEffect(() => {
    if (step === "result") {
      let start = 0;
      const end = savings.yearly;
      const duration = 1800;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) { setCountVal(end); clearInterval(timer); }
        else setCountVal(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [step]);

  const go = (s) => setStep(s);
  const set = (k, v) => setAnswers(p => ({ ...p, [k]: v }));

  return (
    <div className="app">
      <style>{FONT + styles}</style>
      <div className={`screen ${visible ? "in" : "out"}`}>
        {step === "start" && <Start onNext={() => go("q1")} />}
        {step === "q1" && <Q1 answers={answers} set={set} onNext={() => go("q2")} />}
        {step === "q2" && <Q2 answers={answers} set={set} onNext={() => go("q3")} />}
        {step === "q3" && <Q3 answers={answers} set={set} onNext={() => go("q4")} />}
        {step === "q4" && <Q4 answers={answers} set={set} onNext={() => go("result")} />}
        {step === "result" && <Result savings={savings} answers={answers} countVal={countVal} onRetry={() => { setCountVal(0); go("start"); }} />}
      </div>
    </div>
  );
}

function Start({ onNext }) {
  return (
    <div className="page start-page">
      <div className="start-badge">はたフル × 広島県</div>
      <h1 className="start-title">
        <span className="red">広島</span>に帰ったら<br />
        人生、いくら<br />
        豊かになる？
      </h1>
      <p className="start-sub">東京と広島の生活コストを<br />あなたの条件で比較します</p>
      <div className="start-tags">
        <span className="tag">🏠 家賃</span>
        <span className="tag">🚃 通勤</span>
        <span className="tag">🍽️ 食費</span>
        <span className="tag">👶 子育て</span>
        <span className="tag">⏰ 時間</span>
      </div>
      <button className="btn-primary" onClick={onNext}>診断スタート →</button>
      <p className="start-note">所要時間：約1分</p>
    </div>
  );
}

function Q1({ answers, set, onNext }) {
  const opts = [
    { v: "single", label: "独身" },
    { v: "couple", label: "夫婦（子なし）" },
    { v: "family1", label: "夫婦＋子1人" },
    { v: "family2", label: "夫婦＋子2人以上" },
  ];
  return (
    <div className="page q-page">
      <div className="q-num">Q1 / 4</div>
      <h2 className="q-title">家族構成を<br />教えてください</h2>
      <div className="opts">
        {opts.map(o => (
          <button key={o.v} className={`opt ${answers.family === o.v ? "active" : ""}`}
            onClick={() => set("family", o.v)}>{o.label}</button>
        ))}
      </div>
      <button className="btn-primary" onClick={onNext} disabled={!answers.family}>次へ →</button>
    </div>
  );
}

function Q2({ answers, set, onNext }) {
  const opts = [
    { v: "300", label: "〜300万円" },
    { v: "400", label: "300〜500万円" },
    { v: "600", label: "500〜700万円" },
    { v: "800", label: "700万円以上" },
  ];
  return (
    <div className="page q-page">
      <div className="q-num">Q2 / 4</div>
      <h2 className="q-title">現在の年収を<br />教えてください</h2>
      <div className="opts">
        {opts.map(o => (
          <button key={o.v} className={`opt ${answers.income === o.v ? "active" : ""}`}
            onClick={() => set("income", o.v)}>{o.label}</button>
        ))}
      </div>
      <button className="btn-primary" onClick={onNext} disabled={!answers.income}>次へ →</button>
    </div>
  );
}

function Q3({ answers, set, onNext }) {
  const opts = [
    { v: "office", label: "会社員（オフィス勤務）" },
    { v: "remote", label: "会社員（リモート可）" },
    { v: "creative", label: "クリエイティブ・IT系" },
    { v: "other", label: "その他・自営業" },
  ];
  return (
    <div className="page q-page">
      <div className="q-num">Q3 / 4</div>
      <h2 className="q-title">職種・働き方を<br />教えてください</h2>
      <div className="opts">
        {opts.map(o => (
          <button key={o.v} className={`opt ${answers.job === o.v ? "active" : ""}`}
            onClick={() => set("job", o.v)}>{o.label}</button>
        ))}
      </div>
      <button className="btn-primary" onClick={onNext} disabled={!answers.job}>次へ →</button>
    </div>
  );
}

function Q4({ answers, set, onNext }) {
  return (
    <div className="page q-page">
      <div className="q-num">Q4 / 4</div>
      <h2 className="q-title">子育て中、または<br />予定はありますか？</h2>
      <div className="opts">
        <button className={`opt ${answers.hasKid ? "active" : ""}`} onClick={() => set("hasKid", true)}>
          はい（または予定あり）
        </button>
        <button className={`opt ${!answers.hasKid ? "active" : ""}`} onClick={() => set("hasKid", false)}>
          いいえ
        </button>
      </div>
      <button className="btn-primary" onClick={onNext}>診断結果を見る →</button>
    </div>
  );
}

function Result({ savings, answers, countVal, onRetry }) {
  const familyLabel = { single:"独身", couple:"夫婦", family1:"夫婦＋子1人", family2:"夫婦＋子2人以上" };
  const items = [
    { label: "家賃の差額", val: savings.rent, icon: "🏠" },
    { label: "通勤費の差額", val: savings.commute, icon: "🚃" },
    { label: "食費の差額", val: savings.food, icon: "🍽️" },
    ...(savings.child > 0 ? [{ label: "子育て費用の差額", val: savings.child, icon: "👶" }] : []),
  ];

  const verdict = savings.yearly >= 1500000 ? "大幅に豊かに" :
                  savings.yearly >= 800000  ? "かなり豊かに" : "豊かに";

  return (
    <div className="page result-page">
      <div className="result-tag">{familyLabel[answers.family]} の場合</div>
      <p className="result-lead">広島に移住すると</p>
      <div className="result-amount">
        年間<span className="count-num">¥{fmt(countVal)}</span>
        <span className="result-unit">節約できます</span>
      </div>
      <p className="result-verdict">生活が<strong>{verdict}</strong>なります</p>

      <div className="breakdown">
        {items.map(it => (
          <div key={it.label} className="b-row">
            <span className="b-icon">{it.icon}</span>
            <span className="b-label">{it.label}</span>
            <span className="b-val">月 +¥{fmt(it.val)}</span>
          </div>
        ))}
      </div>

      <div className="bonus-cards">
        <div className="bonus-card red">
          <div className="bonus-num">¥{fmt(savings.ten)}</div>
          <div className="bonus-label">10年間の累計差額</div>
        </div>
        <div className="bonus-card dark">
          <div className="bonus-num">{fmt(savings.commuteMins)}分</div>
          <div className="bonus-label">年間で取り戻せる通勤時間</div>
        </div>
      </div>

      <div className="cta-box">
        <p className="cta-title">広島で働く選択肢、<br />話を聞いてみませんか？</p>
        <p className="cta-sub">マツダ・広島銀行・積水ハウスなど<br />広島の主要企業が東京に来ます</p>
        <div className="cta-event">📅 2025年8月　麻布にて開催予定</div>
      </div>

      <button className="btn-secondary" onClick={onRetry}>もう一度診断する</button>
    </div>
  );
}

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  font-family: 'Zen Kaku Gothic New', sans-serif;
  background: #0D0D0D;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.screen {
  width: 100%;
  max-width: 420px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.screen.in  { opacity: 1; transform: translateY(0); }
.screen.out { opacity: 0; transform: translateY(12px); }

.page {
  background: #111;
  border-radius: 20px;
  padding: 36px 28px;
  border: 1px solid #222;
  position: relative;
  overflow: hidden;
}
.page::before {
  content: '';
  position: absolute;
  top: -80px; right: -80px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(200,16,46,0.15) 0%, transparent 70%);
  pointer-events: none;
}

/* START */
.start-page { text-align: center; }
.start-badge {
  display: inline-block;
  background: #C8102E;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 28px;
}
.start-title {
  font-family: 'Zen Kaku Gothic New', sans-serif;
  font-size: 34px;
  font-weight: 900;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 20px;
}
.start-title .red { color: #C8102E; }
.start-sub {
  color: #888;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 24px;
}
.start-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}
.tag {
  background: #1A1A1A;
  border: 1px solid #2A2A2A;
  color: #aaa;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 20px;
}
.start-note { color: #555; font-size: 12px; margin-top: 12px; }

/* Q PAGES */
.q-page { }
.q-num {
  font-size: 12px;
  color: #C8102E;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}
.q-title {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 28px;
}
.opts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}
.opt {
  background: #1A1A1A;
  border: 1.5px solid #2A2A2A;
  color: #ccc;
  padding: 14px 18px;
  border-radius: 10px;
  font-family: 'Zen Kaku Gothic New', sans-serif;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}
.opt:hover { border-color: #555; color: #fff; }
.opt.active {
  background: #1C0509;
  border-color: #C8102E;
  color: #fff;
  font-weight: 700;
}

/* BUTTONS */
.btn-primary {
  width: 100%;
  background: #C8102E;
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-family: 'Zen Kaku Gothic New', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; transform: none; }

.btn-secondary {
  width: 100%;
  background: transparent;
  color: #666;
  border: 1px solid #2A2A2A;
  padding: 13px;
  border-radius: 10px;
  font-family: 'Zen Kaku Gothic New', sans-serif;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.15s;
}
.btn-secondary:hover { color: #aaa; border-color: #444; }

/* RESULT */
.result-page { }
.result-tag {
  display: inline-block;
  background: #1A1A1A;
  border: 1px solid #333;
  color: #888;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.result-lead {
  color: #888;
  font-size: 14px;
  margin-bottom: 6px;
}
.result-amount {
  margin-bottom: 8px;
  line-height: 1.1;
}
.result-amount > span:first-child { color: #aaa; font-size: 16px; font-weight: 700; }
.count-num {
  display: block;
  font-size: 44px;
  font-weight: 900;
  color: #C8102E;
  letter-spacing: -0.02em;
}
.result-unit {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}
.result-verdict {
  color: #aaa;
  font-size: 15px;
  margin-bottom: 28px;
}
.result-verdict strong { color: #fff; }

.breakdown {
  background: #161616;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.b-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.b-icon { font-size: 18px; width: 28px; text-align: center; }
.b-label { flex: 1; color: #888; font-size: 13px; }
.b-val { color: #4CAF50; font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }

.bonus-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}
.bonus-card {
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
}
.bonus-card.red { background: #1C0509; border: 1px solid #C8102E33; }
.bonus-card.dark { background: #161616; border: 1px solid #2A2A2A; }
.bonus-num {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}
.bonus-card.red .bonus-num { color: #C8102E; }
.bonus-label { font-size: 10px; color: #666; line-height: 1.4; }

.cta-box {
  background: linear-gradient(135deg, #1C0509, #110006);
  border: 1px solid #C8102E44;
  border-radius: 14px;
  padding: 22px;
  text-align: center;
  margin-bottom: 16px;
}
.cta-title {
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.5;
  margin-bottom: 10px;
}
.cta-sub {
  color: #888;
  font-size: 12px;
  line-height: 1.7;
  margin-bottom: 12px;
}
.cta-event {
  display: inline-block;
  background: #C8102E;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 20px;
}
`;
