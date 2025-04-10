import React, { useEffect, useRef, useState } from 'react';
import duck from './assets/duck.png';
import hunter from './assets/hunter.png';
import background from './assets/background.png';

const GameScreen = () => {
  const [coefficient, setCoefficient] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [started, setStarted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [bet, setBet] = useState(1000);
  const [cashedOut, setCashedOut] = useState(false);
  const [wonAmount, setWonAmount] = useState(null);
  const [fixedCoefficient, setFixedCoefficient] = useState(null);
  const [shotFired, setShotFired] = useState(false);
  const [history, setHistory] = useState([]);
  const [roundId, setRoundId] = useState(Math.floor(Math.random() * 1000) + 100);
  const [placedBet, setPlacedBet] = useState(false);

  const [duckX, setDuckX] = useState(0);
  const [duckY, setDuckY] = useState(40);

  const intervalRef = useRef(null);
  const crashPointRef = useRef(1 + Math.random() * 3 + 0.5);

  useEffect(() => {
    if (!isWaiting) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStart();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaiting]);

useEffect(() => {
  if (wonAmount && fixedCoefficient) {
    const timeout = setTimeout(() => {
      setWonAmount(null);
      setFixedCoefficient(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }
}, [wonAmount, fixedCoefficient]);

  useEffect(() => {
    if (!started) return;

    let time = 0;

    intervalRef.current = setInterval(() => {
      setCoefficient(prev => {
        const next = +(prev + 0.01 * Math.pow(prev, 1.05)).toFixed(2);

        setDuckX(x => Math.min(x + 0.5, 100));
        setDuckY(() => 40 + 10 * Math.sin(time / 10));
        time += 1;

        if (next >= crashPointRef.current) {
          clearInterval(intervalRef.current);
          setCrashed(true);
          setShotFired(true);

          setHistory(prev => {
            const newHistory = [...prev, next.toFixed(2)];
            return newHistory.slice(-5);
          });

          setTimeout(() => setShotFired(false), 300);
          setDuckY(100);

          setTimeout(() => {
            setStarted(false);
            setIsWaiting(true);
            setCashedOut(false);
            setPlacedBet(false);
            setRoundId(Math.floor(Math.random() * 1000) + 100);
          }, 3000);
        }

        return next;
      });
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [started]);

  const handleStart = () => {
    setStarted(true);
    setIsWaiting(false);
    setCrashed(false);
    setCashedOut(false);
    setWonAmount(null);
    setShotFired(false);
    setCoefficient(1.0);
    crashPointRef.current = 1 + Math.random() * 3 + 0.5;
    setDuckX(0);
    setDuckY(40);
  };

  const handleCashOut = () => {
  if (!crashed && !cashedOut && placedBet) {
    setCashedOut(true);
    const fixed = +coefficient.toFixed(2);
    const winnings = +(bet * fixed).toFixed(0);
    setWonAmount(winnings);
    setFixedCoefficient(fixed);
  }
};

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <img src={background} alt="background" className="absolute w-full h-full object-cover z-0" />

      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {history.slice().reverse().map((coef, idx) => {
          const value = parseFloat(coef);
          const color =
            value < 1.5 ? 'bg-red-500' : value < 3 ? 'bg-yellow-400' : 'bg-green-500';
          return (
            <div
              key={idx}
              className={`px-3 py-1 rounded-full text-white text-sm font-bold ${color}`}
            >
              {coef}x
            </div>
          );
        })}
      </div>

      <div className="absolute top-10 w-full text-center text-white font-bold text-2xl p-4 z-10 bg-black/70">
        DUCK HUNT
      </div>

      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 text-center z-20">
        {started && (
          <div className="text-5xl font-bold text-red-600 drop-shadow-lg">
            {coefficient.toFixed(2)}x
          </div>
        )}
      </div>

      <img
        src={duck}
        alt="duck"
        className="absolute w-28 z-10 transition-all duration-75"
        style={{ left: `${duckX}%`, top: `${duckY}%` }}
      />

      {shotFired && (
        <div className="absolute bottom-28 right-24 w-16 h-16 bg-yellow-400 rounded-full blur-xl opacity-70 animate-ping z-20" />
      )}

      <img src={hunter} alt="hunter" className="absolute w-36 bottom-0 right-4 z-10" />

      <div className="absolute bottom-2 w-full text-center text-white font-medium z-10 bg-black/60">
        Round ID {roundId}
      </div>

      {isWaiting && (
        <div className="absolute bottom-16 left-4 w-[220px] z-20">
          <div className="w-full px-4 py-4 rounded-xl shadow-lg bg-white/90 border border-gray-300">
            <div className="text-center font-bold mb-2 text-gray-800">
              Раунд начнётся через {countdown} сек
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  className="bg-gray-200 px-3 py-1 rounded text-lg"
                  onClick={() => setBet(b => Math.max(b - 100, 0))}
                >−</button>
                <input
                  type="number"
                  value={bet}
                  onChange={e => setBet(Number(e.target.value))}
                  className="w-24 text-center border rounded px-2 py-1"
                />
                <button
                  className="bg-gray-200 px-3 py-1 rounded text-lg"
                  onClick={() => setBet(b => b + 100)}
                >+</button>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {[50, 100, 500].map(v => (
                  <button
                    key={v}
                    onClick={() => setBet(b => b + v)}
                    className="bg-purple-100 px-3 py-1 rounded text-sm font-semibold"
                  >+{v}</button>
                ))}
              </div>
              {!placedBet ? (
                <button
                  onClick={() => setPlacedBet(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow"
                >СТАВКА</button>
              ) : (
                <div className="text-green-600 font-bold">Ставка принята!</div>
              )}
            </div>
          </div>
        </div>
      )}

                 {started && placedBet && (
        <div className="absolute bottom-16 left-4 w-[220px] z-20">
          <div className="w-full px-4 py-4 rounded-xl shadow-lg bg-green-100 border border-green-400 text-center">
            <div className="text-3xl font-bold text-green-700">
              {cashedOut && fixedCoefficient
                ? `${(bet * fixedCoefficient).toFixed(0)}₽`
                : `${(bet * coefficient).toFixed(0)}₽`}
            </div>
            {!cashedOut && (
              <button
                onClick={handleCashOut}
                disabled={crashed}
                className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition"
              >
                Забрать
              </button>
            )}
          </div>
        </div>
      )}
      {wonAmount && fixedCoefficient && (
  <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow-lg text-center text-black font-semibold z-30">
    <div>
      Вы успели забрать <span className="text-green-600">{fixedCoefficient.toFixed(2)}x</span>
    </div>
    <div>
      Ваш выигрыш: <span className="text-purple-600">{wonAmount}₽</span>
    </div>
  </div>
)}
    </div>
  );
};

export default GameScreen;