/**
 * EcoTrack AI — Carbon Footprint Calculator Logic
 * Consolidates the carbon calculations using standard emission factors.
 * Works as a UMD module for both browser and Node.js testing.
 */
"use strict";

const CarbonCalculator = {
  /**
   * Standard emission factors used for calculation.
   * @type {Object}
   */
  factors: {
    transport: {
      car: 0.21,      // kg CO2 per km
      public: 0.06,   // kg CO2 per km
      bike: 0.00      // kg CO2 per km
    },
    electricity: 0.45, // kg CO2 per kWh
    gas: {
      low: 0.2,        // tCO2 / year
      med: 0.5,        // tCO2 / year
      high: 0.9        // tCO2 / year
    },
    diet: {
      veg: 0.9,        // tCO2 / year
      mixed: 1.7,      // tCO2 / year
      meat: 2.5        // tCO2 / year
    },
    shop: {
      rare: 0.2,       // tCO2 / year
      occasional: 0.5, // tCO2 / year
      frequent: 1.0    // tCO2 / year
    },
    flights: {
      none: 0.0,       // tCO2 / year
      few: 0.9,        // tCO2 / year (1-2 flights/yr)
      many: 2.8        // tCO2 / year (3+ flights/yr)
    },
    waste: {
      full: 0.1,       // tCO2 / year (Full recycling)
      partial: 0.3,    // tCO2 / year (Some recycling)
      none: 0.6        // tCO2 / year (No recycling)
    }
  },

  /**
   * Safe value parsing to guarantee numeric outcomes and prevent NaN or negative anomalies.
   * @param {*} val 
   * @param {number} fallback 
   * @returns {number}
   */
  _safeNum(val, fallback = 0) {
    const parsed = Number(val);
    if (isNaN(parsed) || parsed < 0) {
      return fallback;
    }
    return parsed;
  },

  /**
   * Calculates the annual carbon footprint in tonnes of CO2 (tCO2/yr)
   * @param {Object} inputs 
   * @returns {number} Rounded to 1 decimal place
   */
  calculateScore(inputs) {
    if (!inputs || typeof inputs !== 'object') {
      return 0.0;
    }

    try {
      const mode = inputs.mode;
      const km = this._safeNum(inputs.km, 20);
      const kwh = this._safeNum(inputs.kwh, 250);
      const gas = inputs.gas;
      const diet = inputs.diet;
      const shop = inputs.shop;
      const flights = inputs.flights;
      const waste = inputs.waste;

      // Transport: daily km -> annual km * factor -> tonnes
      const modeFactor = this.factors.transport[mode] !== undefined ? this.factors.transport[mode] : this.factors.transport.car;
      const transportVal = (km * 365 * modeFactor) / 1000;

      // Home Energy: monthly kWh -> annual kWh * factor -> tonnes
      const energyVal = (kwh * 12 * this.factors.electricity) / 1000;

      // Gas Additions
      const gasVal = this.factors.gas[gas] !== undefined ? this.factors.gas[gas] : this.factors.gas.med;

      // Diet Additions
      const dietVal = this.factors.diet[diet] !== undefined ? this.factors.diet[diet] : this.factors.diet.mixed;

      // Shopping Additions
      const shopVal = this.factors.shop[shop] !== undefined ? this.factors.shop[shop] : this.factors.shop.occasional;

      // Flights Additions
      const flightsVal = this.factors.flights[flights] !== undefined ? this.factors.flights[flights] : this.factors.flights.none;

      // Waste/Recycling Additions
      const wasteVal = this.factors.waste[waste] !== undefined ? this.factors.waste[waste] : this.factors.waste.partial;

      const total = transportVal + energyVal + gasVal + dietVal + shopVal + flightsVal + wasteVal;
      return parseFloat(total.toFixed(1));
    } catch (e) {
      return 0.0;
    }
  },

  /**
   * Calculates the breakdown of emission sources in tonnes of CO2 (tCO2/yr)
   * @param {Object} inputs 
   * @returns {Object}
   */
  calculateBreakdown(inputs) {
    if (!inputs || typeof inputs !== 'object') {
      return { transport: 0, energy: 0, food: 0, shopping: 0 };
    }

    try {
      const mode = inputs.mode;
      const km = this._safeNum(inputs.km, 20);
      const kwh = this._safeNum(inputs.kwh, 250);
      const gas = inputs.gas;
      const diet = inputs.diet;
      const shop = inputs.shop;
      const flights = inputs.flights;
      const waste = inputs.waste;

      const modeFactor = this.factors.transport[mode] !== undefined ? this.factors.transport[mode] : this.factors.transport.car;
      const transport = parseFloat(((km * 365 * modeFactor) / 1000).toFixed(2));

      const electricityVal = (kwh * 12 * this.factors.electricity) / 1000;
      const gasVal = this.factors.gas[gas] !== undefined ? this.factors.gas[gas] : this.factors.gas.med;
      const energy = parseFloat((electricityVal + gasVal).toFixed(2));

      const food = this.factors.diet[diet] !== undefined ? this.factors.diet[diet] : this.factors.diet.mixed;
      
      const shoppingVal = this.factors.shop[shop] !== undefined ? this.factors.shop[shop] : this.factors.shop.occasional;
      const flightsVal = this.factors.flights[flights] !== undefined ? this.factors.flights[flights] : this.factors.flights.none;
      const wasteVal = this.factors.waste[waste] !== undefined ? this.factors.waste[waste] : this.factors.waste.partial;
      const shopping = parseFloat((shoppingVal + flightsVal + wasteVal).toFixed(2));

      return { transport, energy, food, shopping };
    } catch (e) {
      return { transport: 0, energy: 0, food: 0, shopping: 0 };
    }
  },

  /**
   * Returns a letter grade based on annual carbon score
   * @param {number} score 
   * @returns {string}
   */
  getGrade(score) {
    const cleanScore = this._safeNum(score, 0);
    if (cleanScore < 3.0) return 'A+';
    if (cleanScore < 4.5) return 'A';
    if (cleanScore < 6.0) return 'B+';
    if (cleanScore < 8.0) return 'B';
    if (cleanScore < 10.0) return 'C+';
    if (cleanScore < 13.0) return 'C';
    return 'D';
  }
};

// Export pattern for both CommonJS (Node.js/Jest) and browser contexts
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CarbonCalculator;
} else {
  window.CarbonCalculator = CarbonCalculator;
}
