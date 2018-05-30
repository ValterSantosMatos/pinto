import { Component, OnInit } from '@angular/core';
import { RebalanceItem, CASH_SYMBOL } from './types';

@Component({
  selector: 'app-root',
  template: `
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <a class="navbar-brand" href="#">rebalance</a>
  </nav>

  <div class="container my-4">
    <div class="row align-items-center">
      <div class="col"><h3>Portfolio rebalancer</h3></div>
    </div>

    <div class="row align-items-center justify-content-between">
      <div class="col-6">
        Set your model portfolio weights and see the magic!
      </div>
      <div class="col-6">
      <button type="button" class="btn btn-sm btn-outline-info float-right ml-3">Know more</button>
        <button type="button" class="btn btn-sm btn-outline-secondary float-right ml-3">Load</button>
        <button type="button" class="btn btn-sm btn-outline-primary float-right">Save</button>
      </div>
    </div>
  </div>

  <div class="container">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Symbol</th>
          <th scope="col">Qtt</th>
          <th scope="col">Modal Portfolio Weight</th>
          <th scope="col">Last Price</th>
          <th scope="col">Current Weight</th>
          <th scope="col">Diff</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <!-- Show all the portfolio -->
        <ng-template ngFor let-i="index" let-item [ngForOf]="items">
          <tr rebalance-row [item]="item" (itemChange)="itemChanged($event)" (remove)="remove(i, $event)">
        </ng-template>

        <!-- Add a new item on the row -->
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <button (click)="addNewItem()" style="border: 0;" type="button" class="btn btn-sm btn-outline-primary float-right">Add</button>
          </td>
        <tr>
      </tbody>
    </table>
  </div>
  `,
})
export class AppComponent implements OnInit {
  items: RebalanceItem[];
  _cashItem: RebalanceItem = {
    symbol: CASH_SYMBOL,
    qtt: null,
    lastPrice: 1,
    weight: null,
    portfolioWeight: null,
  };

  /**
   * Inits the page
   * @todo check if there is a portfolio stored locally
   */
  ngOnInit() {
    this.items = [this._cashItem, this._getEmptyItem()];
  }
  /**
   * Adds a new item to the table
   */
  addNewItem() {
    this.items.push(this._getEmptyItem());
  }
  /**
   * Removes an item
   */
  remove(index: number, _item: RebalanceItem) {
    this.items.splice(index, 1);
  }
  /**
   * An item has been changed, need to re-issue a rebalance call
   */
  itemChanged(_item: RebalanceItem) {
    // Check if all the items are filled so we can calculate the weight
    if (false === this.items.some((i) => i.symbol == null || i.qtt == null)) {
      // Portfolio market value
      const marketValue = this.items
        .map((i) => i.lastPrice * i.qtt)
        .reduce((a, b) => a + b);

      // Fills in the items weight
      this.items.forEach((i) => (i.weight = i.lastPrice * i.qtt / marketValue));
    } else {
      return;
    }

    // Check if all the items have the portfolio filled
    if (this.items.some((i) => i.portfolioWeight == null)) {
      // Rebalance
    }
  }

  /**
   * Factory to generate new empty items
   */
  _getEmptyItem(): RebalanceItem {
    return {
      symbol: null,
      qtt: null,
      lastPrice: null,
      portfolioWeight: null,
      weight: null,
    } as RebalanceItem;
  }
}
