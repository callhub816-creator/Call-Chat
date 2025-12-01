import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

const SavingsCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(200);
  const [years, setYears] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(7);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let currentTotal = initialAmount;
    const months = years * 12;
    const monthlyRate = interestRate / 100 / 12;

    for (let i = 0; i < months; i++) {
      currentTotal = (currentTotal + monthlyContribution) * (1 + monthlyRate);
    }
    setTotal(currentTotal);
  }, [initialAmount, monthlyContribution, years, interestRate]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mt-8">
      <h3 className="text-2xl font-bold text-brand-blue mb-6 flex items-center">
        <DollarSign className="mr-2 text-brand-green" /> Savings Projection Calculator
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Deposit</label>
            <input 
              type="number" 
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Contribution</label>
            <input 
              type="number" 
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Growth Period (Years): {years}</label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-brand-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Interest Rate (%): {interestRate}</label>
            <input 
              type="range" 
              min="1" 
              max="15"
              step="0.5" 
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-brand-green"
            />
          </div>
        </div>

        <div className="bg-brand-blue bg-opacity-5 p-6 rounded-lg flex flex-col justify-center items-center text-center">
          <p className="text-slate-600 mb-2 font-medium">In {years} years, you could have:</p>
          <div className="text-4xl sm:text-5xl font-extrabold text-brand-green mb-2">
            ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-slate-500">
            *Based on monthly compounding at {interestRate}% annual return.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsCalculator;
