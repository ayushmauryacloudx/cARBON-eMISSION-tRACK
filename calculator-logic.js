/**
 * EcoTrack AI — Carbon Footprint Calculator Logic
 * Consolidates the carbon calculations using standard emission factors.
 * Works as a UMD module for both browser and Node.js testing.
 */
const CarbonCalculator = {
  // Standard emission factors
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
   * Calculates the annual carbon footprint in tonnes of CO2 (tCO2/yr)
   * @param {Object} inputs 
   * @returns {number} Rounded to 1 decimal place
   */
  calculateScore(inputs) {
    const { mode, km, kwh, gas, diet, shop, flights, waste } = inputs;

    // Transport: daily km -> annual km * factor -> tonnes
    const modeFactor = this.factors.transport[mode] !== undefined ? this.factors.transport[mode] : this.factors.transport.car;
    const transportVal = (Number(km || 0) * 365 * modeFactor) / 1000;

    // Home Energy: monthly kWh -> annual kWh * factor -> tonnes
    const energyVal = (Number(kwh || 0) * 12 * this.factors.electricity) / 1000;

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
  },

  /**
   * Calculates the breakdown of emission sources in tonnes of CO2 (tCO2/yr)
   * Useful for visual charts.
   */
  calculateBreakdown(inputs) {
    const { mode, km, kwh, gas, diet, shop, flights, waste } = inputs;

    const modeFactor = this.factors.transport[mode] !== undefined ? this.factors.transport[mode] : this.factors.transport.car;
    const transport = parseFloat(((Number(km || 0) * 365 * modeFactor) / 1000).toFixed(2));

    const electricityVal = (Number(kwh || 0) * 12 * this.factors.electricity) / 1000;
    const gasVal = this.factors.gas[gas] !== undefined ? this.factors.gas[gas] : this.factors.gas.med;
    const energy = parseFloat((electricityVal + gasVal).toFixed(2));

    const food = this.factors.diet[diet] !== undefined ? this.factors.diet[diet] : this.factors.diet.mixed;
    
    const shoppingVal = this.factors.shop[shop] !== undefined ? this.factors.shop[shop] : this.factors.shop.occasional;
    const flightsVal = this.factors.flights[flights] !== undefined ? this.factors.flights[flights] : this.factors.flights.none;
    const wasteVal = this.factors.waste[waste] !== undefined ? this.factors.waste[waste] : this.factors.waste.partial;
    const shopping = parseFloat((shoppingVal + flightsVal + wasteVal).toFixed(2));

    return { transport, energy, food, shopping };
  },

  /**
   * Returns a letter grade based on annual carbon score
   */
  getGrade(score) {
    if (score < 3.0) return 'A+';
    if (score < 4.5) return 'A';
    if (score < 6.0) return 'B+';
    if (score < 8.0) return 'B';
    if (score < 10.0) return 'C+';
    if (score < 13.0) return 'C';
    return 'D';
  }
};

// Export pattern for both CommonJS (Node.js/Jest) and browser contexts
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CarbonCalculator;
} else {
  window.CarbonCalculator = CarbonCalculator;
}
