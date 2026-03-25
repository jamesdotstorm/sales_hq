'use client';

import { useMemo } from 'react';

const QUOTES = [
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { text: "Make a customer, not a sale.", author: "Katherine Barchetti" },
  { text: "The secret to success is to know something nobody else knows.", author: "Aristotle Onassis" },
  { text: "Move fast. Speed is one of your most important competitive advantages.", author: "Sam Altman" },
  { text: "Sales are contingent upon the attitude of the salesman — not the attitude of the prospect.", author: "W. Clement Stone" },
  { text: "It's not about having the right opportunities. It's about handling the opportunities right.", author: "Mark Hunter" },
  { text: "You don't close a sale, you open a relationship if you want to build a long-term business.", author: "Patricia Fripp" },
  { text: "Approach each customer with the idea of helping them solve a problem, not selling them a product.", author: "Brian Tracy" },
  { text: "The best sales questions have your expertise wrapped into them.", author: "Jill Konrath" },
  { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas Edison" },
  { text: "Timid salespeople have skinny kids.", author: "Zig Ziglar" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Do what you do so well that they will want to see it again and bring their friends.", author: "Walt Disney" },
  { text: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.", author: "Zig Ziglar" },
  { text: "The difference between a successful person and others is not a lack of strength but a lack of will.", author: "Vince Lombardi" },
  { text: "Pretend that every single person you meet has a sign around their neck that says, 'Make me feel important.'", author: "Mary Kay Ash" },
  { text: "Winners are not people who never fail, but people who never quit.", author: "Edwin Louis Cole" },
  { text: "If you are not taking care of your customer, your competitor will.", author: "Bob Hooey" },
  { text: "The goal is not to sell, the goal is to be trusted.", author: "Unknown" },
];

interface Props {
  dark: boolean;
}

export default function DailyQuote({ dark }: Props) {
  const quote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <div className={`px-5 py-3 border-b ${dark ? 'border-white/5' : 'border-gray-100'}`}>
      <p className={`text-xs italic leading-relaxed ${dark ? 'text-white/35' : 'text-gray-400'}`}>
        "{quote.text}"
      </p>
      <p className={`text-xs mt-1 font-medium ${dark ? 'text-white/20' : 'text-gray-300'}`}>
        — {quote.author}
      </p>
    </div>
  );
}
