import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RebalanceItem, CASH_SYMBOL } from './types';

/**
 * Rebalance the portfolio
 */
@Injectable()
export class RebalanceService {
  constructor(private _httpClient: HttpClient) {}

  /**
   * The rebalance cycle spends the remaining cash trying to correct the allocation with the biggest weight difference
   * To find the "perfect" allocations we would need to run an algorithm to solve the Knapsack math problem
   * See more here: https://en.wikipedia.org/wiki/Knapsack_problem
   */
  public rebalance(items: RebalanceItem[]) {
    let result: RebalanceItem[];

    // Portfolio market value
    const marketValue = items
      .map((i) => i.lastPrice * i.qtt)
      .reduce((a, b) => a + b);

    let remainingCash = marketValue - this._getMarketValueAfterRebalance(items);
    const smallestInstrumentPrice = Math.min(...items.map((i) => i.lastPrice));

    while (remainingCash > smallestInstrumentPrice) {
      // Finds the portfolio allocation with the biggest difference between the model portfolio weight
      // and the current weight with a price smaller than the remaining cash
      result = this._calculatePortfolioWeight(items);
      const symbolsICanBuy = result
        // Calculates the weight diff
        .map((i) => ({
          diff: i.portfolioWeight - i.result.weight,
          symbol: i.symbol,
          lastPrice: i.lastPrice,
        }))
        // Filter by the ones we can buy
        .filter((i) => i.lastPrice < remainingCash)
        // Sorts the array from descending order by weight difference
        .sort((a, b) => (a.diff - b.diff ? -1 : 1));
      const symbolToBuy = symbolsICanBuy[0];

      // Increases by one the quantity of the instrument with the biggest weight difference
      result = items.map((i) => ({
        ...i,
        result: {
          ...i.result,
          qtt:
            i.symbol === symbolToBuy.symbol ? i.result.qtt + 1 : i.result.qtt,
        },
      }));

      // Recalculates the remaining cash
      remainingCash = marketValue - this._getMarketValueAfterRebalance(result);
    }

    // Adds the remaining cash to the cash instrument
    result = items.map((i) => ({
      ...i,
      result: {
        ...i.result,
        qtt:
          i.symbol === CASH_SYMBOL
            ? i.result.qtt + remainingCash
            : i.result.qtt,
      },
    }));

    // Recalculates the allocations weight and return the final portfolio
    this._calculatePortfolioWeight(items);
  }

  private _getMarketValueAfterRebalance(items: RebalanceItem[]): number {
    return items
      .map((i) => i.result.qtt * i.lastPrice)
      .reduce((a, b) => a + b, 0);
  }

  private _calculatePortfolioWeight(items: RebalanceItem[]) {
    const marketValue = this._getMarketValueAfterRebalance(items);

    return items.map((i) => ({
      ...i,
      result: {
        ...i.result,
        weight: i.result.qtt * i.lastPrice,
      },
    }));
  }
}

// /**
//  * An instrument
//  *
//  * @export
//  * @interface IInstrument
//  */
// export interface IInstrument {
//     symbol: string;
//     name: string;
//     price: number;
//     currency: string;
//   }

//   /**
//    * An allocation
//    *
//    * @export
//    * @interface IAllocation
//    */
//   export interface IAllocation {
//     quantity?: number;
//     weight?: number;
//     instrument: IInstrument;
//   }

//   /**
//    * Snapshot return from the yahoo-finance module,
//    * See: https://github.com/pilwon/node-yahoo-finance
//    *
//    * @interface ISnapshot
//    */
//   interface ISnapshot {
//     symbol: string;
//     name: string;
//     lastTradePriceOnly: string;
//   }

//   export class PortfolioRebalance {
//     public static usdCashInstrument = {
//       currency: "USD",
//       name: "USD/USD",
//       price: 1,
//       symbol: "USD=X",
//     } as IInstrument;

//     /**
//      * Gets an instrument from yahoo finance API or an empty object
//      *
//      * @param {string} symbol
//      * @returns {Promise<IInstrument>}
//      *
//      * @memberOf PortfolioRebalance
//      */
//     public static getInstrument(symbol: string): Promise<IInstrument> {
//       const yahooFinance = require("yahoo-finance");

//       return yahooFinance.snapshot({
//         fields: ["s", "n", "l1"],
//         symbol,
//       }).then((snapshot: ISnapshot) => {
//         if (snapshot.name && snapshot.lastTradePriceOnly && snapshot.symbol) {
//           return {
//             currency: this.usdCashInstrument.currency,
//             name: snapshot.name,
//             price: parseFloat(snapshot.lastTradePriceOnly),
//             symbol: snapshot.symbol,
//           } as IInstrument;
//         } else {
//           return undefined;
//         }
//       });
//     }

//     /**
//      * Calculates the allocations for a specific market value
//      * @todo return a proper error for each guard clause
//      *
//      * @param {IAllocation[]} modelPortfolio
//      * @param {number} targetAmount
//      * @returns {IAllocation[]}
//      *
//      * @memberOf PortfolioRebalance
//      */
//     public static rebalance(modelPortfolio: IAllocation[], marketValue: number): IAllocation[] {
//       // There is no portfolio if the market value is 0 or any allocation weight is above 1
//       if (!this._passesGuardClauses(modelPortfolio, marketValue)) {
//         // Todo return a proper error for each guard clause
//         return [];
//       }

//       // Clone the allocations array so it does not change the original object
//       const allocations = JSON.parse(JSON.stringify(modelPortfolio)) as IAllocation[];

//       // Calculates the portfolio perfect quantities and rounds it bottom
//       allocations
//         .forEach((a) => a.quantity = Math.floor(marketValue * a.weight / a.instrument.price));

//       // The rebalance cycle spends the remaining cash trying to correct the allocation with the biggest weight difference
//       // To find the "perfect" allocations we would need to run an algorithm to solve the Knapsack math problem
//       // See more here: https://en.wikipedia.org/wiki/Knapsack_problem

//       let remainingCash = marketValue - this._getPortfolioMarketValue(allocations);
//       const smallestInstrumentPrice = Math.min(...allocations.map((a) => a.instrument.price));

//       while (remainingCash > smallestInstrumentPrice) {
//         // Finds the portfolio allocation with the biggest difference between the model portfolio weight
//         // and the current weight with a price smaller than the remaining cash
//         const currentPortfolioWeight = this._calculatePortfolioWeight(allocations);
//         const weightDifference: Array<{ symbol: string, weightDifference: number }> = currentPortfolioWeight
//           .map((ca) => allocations
//             // Matches the current allocations symbols with the model portfolio ones
//             .filter((a) => a.instrument.symbol === ca.instrument.symbol)
//             // Checks there is enough cash to buy this instrument
//             .filter((a) => a.instrument.price <= remainingCash)
//             // Returns an array with the symbol and the weight difference
//             .map((a) => ({
//               symbol: a.instrument.symbol,
//               weightDifference: Math.abs(ca.weight - a.weight),
//             })))
//           // Flattens the array (map of map created an array of arrays)
//           .reduce((a, b) => a.concat(b), [])
//           // Sorts the array from descending order by weight difference
//           .sort((a, b) => a.weightDifference - b.weightDifference ? -1 : 1);

//         // Increases by one the quantity of the instrument with the biggest weight difference
//         allocations
//           .filter((a) => a.instrument.symbol === weightDifference[0].symbol)
//           .forEach((a) => a.quantity++);

//         // Recalculates the remaining cash
//         remainingCash = marketValue - this._getPortfolioMarketValue(allocations);
//       }

//       // Adds the remaining cash to the USD instrument or creates one if it does not exists in the portfolio
//       const cashAllocation = allocations
//         .filter((a) => a.instrument.symbol === this.usdCashInstrument.symbol);
//       if (cashAllocation.length === 0) {
//         allocations.push({
//           instrument: this.usdCashInstrument,
//           quantity: remainingCash,
//         });
//       } else {
//         cashAllocation[0].quantity += remainingCash;
//       }

//       // Recalculates the allocations weight and return the final portfolio
//       const finalPortfolio = this._calculatePortfolioWeight(allocations);
//       return finalPortfolio;
//     }

//     private static _getPortfolioMarketValue(allocations: IAllocation[]): number {
//       // Calculates the portfolio market value
//       return allocations
//         .map((a) => a.instrument.price * a.quantity)
//         .reduce((a, b) => a + b, 0);
//     }

//     private static _calculatePortfolioWeight(portfolio: IAllocation[]): IAllocation[] {
//       // Deep copy allocations so it does not change the original object
//       const allocations = JSON.parse(JSON.stringify(portfolio)) as IAllocation[];

//       // Calculates the portfolio market value
//       const pMarketValue = this._getPortfolioMarketValue(allocations);

//       // Calculates the allocations weight
//       allocations
//         .forEach((a) => a.weight = a.instrument.price * a.quantity / pMarketValue);

//       return allocations;
//     }

//     private static _passesGuardClauses(modelPortfolio: IAllocation[], marketValue: number) {
//       if (
//         // Checks if the market value is positive
//         marketValue === 0 ||
//         // Checks if the individual allocations weights are between 0 and 1 and if the
//         !modelPortfolio.every((a) => a.weight >= 0 && a.weight <= 1) ||
//         // Checks if the portfolio weight is bellow 0
//         modelPortfolio.map((a) => a.weight).reduce((a, b) => a + b, 0) > 1
//       ) {
//         return false;
//       }

//       // Checks if there are repeated symbols
//       const Set = require("es6-set");
//       const portfolioSymbols = modelPortfolio
//         .map((a) => a.instrument.symbol);
//       if ((new Set(portfolioSymbols)).size !== portfolioSymbols.length) {
//         return false;
//       }

//       return true;
//     }
//   }
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// import * as chai from "chai";

// import { IAllocation, IInstrument, PortfolioRebalance } from "../src/portfolio-rebalance";

// describe("Portfolio rebalance module", () => {
//   const appleInstrument = {
//     currency: "USD",
//     name: "Apple Inc.",
//     price: 143.34,
//     symbol: "AAPL",
//   } as IInstrument;
//   const googleInstrument = {
//     currency: "USD",
//     name: "Alphabet Inc.",
//     price: 842.10,
//     symbol: "GOOGL",
//   } as IInstrument;

//   describe("getInstrument()", () => {
//     (it as any)("should get the instrument with price from a symbol", () => {
//       // Apple stock symbol

//       return PortfolioRebalance.getInstrument(appleInstrument.symbol)
//         .then((instrument: IInstrument) => {
//           // Confirms we received the apple stock
//           chai.expect(instrument.symbol).to.equal(appleInstrument.symbol);
//           chai.expect(instrument.name).to.equal(appleInstrument.name);
//           chai.expect(instrument.currency).to.equal(appleInstrument.currency);
//           chai.expect(instrument.price).to.not.equal(undefined);
//         });
//       // Increase the timeout since we are making an API call
//     }).timeout(5000);

//     (it as any)("should return an empty instrument if it fails", () => {
//       const symbol = ".";

//       return PortfolioRebalance.getInstrument(symbol)
//         .then((instrument: IInstrument) => {
//           // Confirms we received the apple stock
//           chai.expect(instrument).to.be.equal(undefined);
//         });
//       // Increase the timeout since we are making an API call
//     }).timeout(5000);
//   });

//   describe("rebalance()", () => {

//     it("should return an empty portfolio if no market value is provided", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.2 },
//         { instrument: appleInstrument, weight: 0.8 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 0);
//       chai.expect(rebalancePortfolio).to.be.deep.equal([]);
//     });

//     it("should return an empty portfolio if allocations weights are bigger than 1", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.1 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.2 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.8 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 100);
//       chai.expect(rebalancePortfolio).to.be.deep.equal([]);
//     });

//     it("should return an empty portfolio if any allocation weights are bigger than 1", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 1.2 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.2 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.8 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 100);
//       chai.expect(rebalancePortfolio).to.be.deep.equal([]);
//     });

//     it("should return an empty portfolio if any allocation weights are smaller than 0", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: -0.2 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.2 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 1 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 100);
//       chai.expect(rebalancePortfolio).to.be.deep.equal([]);
//     });

//     it("should return an empty portfolio if there are duplicate instruments", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.5 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.5 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 100);
//       chai.expect(rebalancePortfolio).to.be.deep.equal([]);
//     });

//     it("should create an empty portfolio if there are duplicate instruments", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.5 },
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.5 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 100);
//       chai.expect(rebalancePortfolio).to.be.deep.equal([]);
//     });

//     it("should add the cash instrument to a portfolio with remaining cash", () => {
//       const portfolio = [
//         { instrument: appleInstrument, weight: 0.5 },
//         { instrument: googleInstrument, weight: 0.5 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 5000);
//       chai.expect(rebalancePortfolio.length).to.be.equal(3);
//     });

//     it("should rebalance a portfolio :)", () => {
//       const portfolio = [
//         { instrument: PortfolioRebalance.usdCashInstrument, weight: 0.2 },
//         { instrument: appleInstrument, weight: 0.3 },
//         { instrument: googleInstrument, weight: 0.5 }];

//       const rebalancePortfolio = PortfolioRebalance.rebalance(portfolio, 500000);
//       chai.expect(rebalancePortfolio[0].weight).to.be.equal(0.20160952000000001);
//       chai.expect(rebalancePortfolio[1].weight).to.be.equal(0.29986728);
//       chai.expect(rebalancePortfolio[2].weight).to.be.equal(0.4985232);
//     });
//   });
// });
