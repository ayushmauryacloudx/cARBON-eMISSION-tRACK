"use strict";

const CarbonCalculator = require('../calculator-logic');

describe('CarbonCalculator Core Calculations', () => {

  test('factors verification', () => {
    expect(CarbonCalculator.factors.transport.car).toBe(0.21);
    expect(CarbonCalculator.factors.transport.public).toBe(0.06);
    expect(CarbonCalculator.factors.transport.bike).toBe(0.00);
    expect(CarbonCalculator.factors.electricity).toBe(0.45);
    expect(CarbonCalculator.factors.gas.low).toBe(0.2);
    expect(CarbonCalculator.factors.gas.med).toBe(0.5);
    expect(CarbonCalculator.factors.gas.high).toBe(0.9);
    expect(CarbonCalculator.factors.diet.veg).toBe(0.9);
    expect(CarbonCalculator.factors.diet.mixed).toBe(1.7);
    expect(CarbonCalculator.factors.diet.meat).toBe(2.5);
    expect(CarbonCalculator.factors.shop.rare).toBe(0.2);
    expect(CarbonCalculator.factors.shop.occasional).toBe(0.5);
    expect(CarbonCalculator.factors.shop.frequent).toBe(1.0);
    expect(CarbonCalculator.factors.flights.none).toBe(0.0);
    expect(CarbonCalculator.factors.flights.few).toBe(0.9);
    expect(CarbonCalculator.factors.flights.many).toBe(2.8);
    expect(CarbonCalculator.factors.waste.full).toBe(0.1);
    expect(CarbonCalculator.factors.waste.partial).toBe(0.3);
    expect(CarbonCalculator.factors.waste.none).toBe(0.6);
  });

  test('standard score calculation', () => {
    const inputs = {
      mode: 'car',
      km: 20,
      kwh: 250,
      gas: 'med',
      diet: 'mixed',
      shop: 'occasional',
      flights: 'none',
      waste: 'partial'
    };
    // transport = 20 * 365 * 0.21 / 1000 = 1.533
    // energy = (250 * 12 * 0.45 / 1000) = 1.35 + 0.5 = 1.85
    // diet = 1.7
    // shop = 0.5
    // flights = 0.0
    // waste = 0.3
    // total = 1.533 + 1.85 + 1.7 + 0.5 + 0.3 = 5.883 -> 5.9
    expect(CarbonCalculator.calculateScore(inputs)).toBe(5.9);
  });

  test('zero inputs edge case', () => {
    const inputs = {
      mode: 'bike',
      km: 0,
      kwh: 0,
      gas: 'low',
      diet: 'veg',
      shop: 'rare',
      flights: 'none',
      waste: 'full'
    };
    // transport = 0
    // energy = 0 + 0.2 = 0.2
    // diet = 0.9
    // shop = 0.2
    // flights = 0.0
    // waste = 0.1
    // total = 1.4
    expect(CarbonCalculator.calculateScore(inputs)).toBe(1.4);
  });

  test('highest options configuration', () => {
    const inputs = {
      mode: 'car',
      km: 100,
      kwh: 1000,
      gas: 'high',
      diet: 'meat',
      shop: 'frequent',
      flights: 'many',
      waste: 'none'
    };
    // transport = 100 * 365 * 0.21 / 1000 = 7.665
    // energy = (1000 * 12 * 0.45 / 1000) + 0.9 = 5.4 + 0.9 = 6.3
    // diet = 2.5
    // shop = 1.0
    // flights = 2.8
    // waste = 0.6
    // total = 7.665 + 6.3 + 2.5 + 1.0 + 2.8 + 0.6 = 20.865 -> 20.9
    expect(CarbonCalculator.calculateScore(inputs)).toBe(20.9);
  });

});

describe('CarbonCalculator Robustness & Error Handling', () => {

  test('null and empty inputs object handling', () => {
    expect(CarbonCalculator.calculateScore(null)).toBe(0.0);
    expect(CarbonCalculator.calculateScore(undefined)).toBe(0.0);
    expect(CarbonCalculator.calculateScore({})).toBe(5.9); // defaults: km=20, kwh=250, gas=med, diet=mixed, shop=occasional, flights=none, waste=partial
  });

  test('invalid and negative numeric values handling', () => {
    const inputs = {
      mode: 'car',
      km: -50, // Should fallback/clamp
      kwh: -200, // Should fallback/clamp
      gas: 'med',
      diet: 'mixed',
      shop: 'occasional',
      flights: 'none',
      waste: 'partial'
    };
    // if clamped/fallback is applied: km fallback = 20, kwh fallback = 250 -> score should be 5.9
    expect(CarbonCalculator.calculateScore(inputs)).toBe(5.9);
  });

  test('non-numeric input types handling', () => {
    const inputs = {
      mode: 'car',
      km: 'abc', // NaN -> should fallback to 20
      kwh: 'xyz', // NaN -> should fallback to 250
      gas: 'med',
      diet: 'mixed',
      shop: 'occasional',
      flights: 'none',
      waste: 'partial'
    };
    expect(CarbonCalculator.calculateScore(inputs)).toBe(5.9);
  });

  test('unknown category options fallbacks', () => {
    const inputs = {
      mode: 'spaceship', // Unknown -> fallback to car (0.21)
      km: 20,
      kwh: 250,
      gas: 'nuclear', // Unknown -> fallback to med (0.5)
      diet: 'pescatarian', // Unknown -> fallback to mixed (1.7)
      shop: 'digital-only', // Unknown -> fallback to occasional (0.5)
      flights: 'space-shuttle', // Unknown -> fallback to none (0.0)
      waste: 'incinerator', // Unknown -> fallback to partial (0.3)
    };
    expect(CarbonCalculator.calculateScore(inputs)).toBe(5.9);
  });

  test('breakdown method error handling', () => {
    expect(CarbonCalculator.calculateBreakdown(null)).toEqual({ transport: 0, energy: 0, food: 0, shopping: 0 });
    expect(CarbonCalculator.calculateBreakdown(undefined)).toEqual({ transport: 0, energy: 0, food: 0, shopping: 0 });
  });

  test('grade calculation edge conditions', () => {
    expect(CarbonCalculator.getGrade(2.9)).toBe('A+');
    expect(CarbonCalculator.getGrade(3.0)).toBe('A');
    expect(CarbonCalculator.getGrade(4.4)).toBe('A');
    expect(CarbonCalculator.getGrade(4.5)).toBe('B+');
    expect(CarbonCalculator.getGrade(5.9)).toBe('B+');
    expect(CarbonCalculator.getGrade(6.0)).toBe('B');
    expect(CarbonCalculator.getGrade(7.9)).toBe('B');
    expect(CarbonCalculator.getGrade(8.0)).toBe('C+');
    expect(CarbonCalculator.getGrade(9.9)).toBe('C+');
    expect(CarbonCalculator.getGrade(10.0)).toBe('C');
    expect(CarbonCalculator.getGrade(12.9)).toBe('C');
    expect(CarbonCalculator.getGrade(13.0)).toBe('D');
    expect(CarbonCalculator.getGrade(-10)).toBe('A+'); // negative clamped to 0 -> A+
  });

});
