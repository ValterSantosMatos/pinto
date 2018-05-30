import { Component, Output, EventEmitter, Input } from '@angular/core';
import { RebalanceItem, RebalanceResult, CASH_SYMBOL } from './types';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[rebalance-row]',
  template: `
    <td [ngClass]="{'p-0': !isCashRow}">
      <span *ngIf="isCashRow">Cash</span>
      <input *ngIf="!isCashRow" type="text" [(ngModel)]="item.symbol" (keyup)="itemChanged()" class="form-control" placeholder="symbol">
    </td>
    <td class="p-0">
      <input type="number"
        [(ngModel)]="item.qtt" (keyup)="itemChanged()" class="form-control" [placeholder]="(isCashRow ? 'amount' : 'qtt')">
    </td>
    <td class="p-0">
      <input type="number" [(ngModel)]="item.portfolioWeight"(keyup)="itemChanged()" class="form-control" placeholder="weight">
    </td>
    <td [ngClass]="{'p-0': !isCashRow}">
      <span *ngIf="isCashRow">-</span>
      <input *ngIf="!isCashRow" type="number" [(ngModel)]="item.lastPrice"(keyup)="itemChanged()" class="form-control" placeholder="price">
    </td>
    <td>
      <span *ngIf="!item?.result?.weight">-</span>
      <span *ngIf="item?.result?.weight">{{ item.result.weight | percent }}</span>
    </td>
    <td>
      <span *ngIf="!item?.result?.diff">-</span>
      <span *ngIf="item?.result?.diff">{{ item.result.diff | number }}</span>
    </td>
    <td>
      <button *ngIf="!isCashRow"
        (click)="removeItem()" style="border: 0;" type="button" class="btn btn-sm btn-outline-danger float-right">Remove</button>
    </td>
  `,
})
export class RebalanceRowComponent {
  @Output() remove: EventEmitter<RebalanceItem> = new EventEmitter();
  @Output() itemChange: EventEmitter<RebalanceItem> = new EventEmitter();
  @Input() item: RebalanceItem;

  get isCashRow() {
    return this.item.symbol === CASH_SYMBOL;
  }

  /**
   * Removes the current item (row)
   */
  removeItem() {
    this.remove.emit(this.item);
  }

  /**
   * Issues a new event when the item changed
   */
  itemChanged() {
    this.itemChange.emit(this.item);
  }
}
