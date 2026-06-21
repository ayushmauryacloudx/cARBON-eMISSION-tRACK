const CarbonCalculator = require('../calculator-logic');

describe('CarbonCalculator Logic Tests', () => {
  
  test('factors definition', () => {
    expect(CarbonCalculator.factors.transport.car).toBe(0.21);
    expect(CarbonCalculator.factors.electricity).toBe(0.45);
  });

  test('zero emissions scenario', () => {
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
    // transport = 0, electricity = 0, gas = 0.2, diet = 0.9, shop = 0.2, flights = 0, waste = 0.1
    // total = 1.4 tonnes
    const score = CarbonCalculator.calculateScore(inputs);
    expect(score).toBe(1.4);
  });

  test('standard high emissions scenario', () => {
    const inputs = {
      mode: 'car',
      km: 50,
      kwh: 500,
      gas: 'high',
      diet: 'meat',
      shop: 'frequent',
      flights: 'many',
      waste: 'none'
    };
    // transport = 50 * 365 * 0.21 / 1000 = 3.8325
    // electricity = 500 * 12 * 0.45 / 1000 = 2.7
    // gas = 0.9
    // diet = 2.5
    // shop = 1.0
    // flights = 2.8
    // waste = 0.6
    // total = 3.8325 + 2.7 + 0.9 + 2.5 + 1.0 + 2.8 + 0.6 = 14.3325 -> 14.3
    const score = CarbonCalculator.calculateScore(inputs);
    expect(score).toBe(14.3);
  });

  test('breakdown calculations', () => {
    const inputs = {
      mode: 'public',
      km: 30,
      kwh: 200,
      gas: 'med',
      diet: 'mixed',
      shop: 'occasional',
      flights: 'few',
      waste: 'partial'
    };
    // transport = 30 * 365 * 0.06 / 1000 = 0.657 -> 0.66
    // energy = (200 * 12 * 0.45 / 1000) + 0.5 = 1.08 + 0.5 = 1.58
    // food = 1.7
    // shopping + flights + waste = 0.5 + 0.9 + 0.3 = 1.7
    const breakdown = CarbonCalculator.calculateBreakdown(inputs);
    expect(breakdown.transport).toBe(0.66);
    expect(breakdown.energy).toBe(1.58);
    expect(breakdown.food).toBe(1.70);
    expect(breakdown.shopping).toBe(1.70);
  });

  test('grading logic', () => {
    expect(CarbonCalculator.getGrade(2.5)).toBe('A+');
    expect(CarbonCalculator.getGrade(4.0)).toBe('A');
    expect(CarbonCalculator.getGrade(5.5)).toBe('B+');
    expect(CarbonCalculator.getGrade(7.0)).toBe('B');
    expect(CarbonCalculator.getGrade(9.0)).toBe('C+');
    expect(CarbonCalculator.getGrade(12.0)).toBe('C');
    expect(CarbonCalculator.getGrade(15.0)).toBe('D');
  });

});
