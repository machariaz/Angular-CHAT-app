import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';

interface AuctionItem {
  id: string;
  name: string;
  description: string;
  image: string;
  currentBid: number;
  highestBid: number;
  highestBidder: string;
}

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit, OnDestroy {
  items: AuctionItem[] = [];
  winningItem: AuctionItem | null = null;
  timeLeft: number = 3600; // Timer set to 3600 seconds (1 hour)
  timerInterval: any;
  bids: { [key: string]: any[] } = {}; // To store bids for each item
  bidsSubscription: Subscription | null = null;
  errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadItems();
      this.startTimer();
      this.setupRealTimeUpdates();
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred while initializing the auction.';
    }
  }

  ngOnDestroy(): void {
    if (this.bidsSubscription) {
      this.bidsSubscription.unsubscribe();
    }
  }

  async loadItems(): Promise<void> {
    try {
      this.items = await this.supabaseService.getItems();

      for (const item of this.items) {
        this.bids[item.id] = await this.supabaseService.getBids(item.id);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred while loading items.';
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.endAuction();
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  setupRealTimeUpdates(): void {
    this.bidsSubscription = this.supabaseService.getBidsObservable().subscribe({
      next: bid => {
        if (!this.bids[bid.item_id]) {
          this.bids[bid.item_id] = [];
        }
        this.bids[bid.item_id].push(bid);
        this.checkWinningItem();
      },
      error: err => {
        this.errorMessage = 'Error with real-time updates. Please try again later.';
        console.error('Real-time updates error:', err);
      }
    });
  }

  async placeBid(item: AuctionItem): Promise<void> {
    if (this.timeLeft > 0 && item.currentBid > item.highestBid) {
      try {
        item.highestBid = item.currentBid;
        item.highestBidder = 'User'; // Replace with actual user identification

        await this.supabaseService.addBid(item.id, item.currentBid, 'User'); // Replace 'User' with actual user info

        // Update local bids
        if (!this.bids[item.id]) {
          this.bids[item.id] = [];
        }
        this.bids[item.id].push({
          item_id: item.id,
          bid_amount: item.currentBid,
          bidder: 'User' // Replace 'User' with actual user info
        });

        this.checkWinningItem();
      } catch (error: any) {
        this.errorMessage = error.message || 'Unable to place bid. Please try again later.';
      }
    }
  }

  checkWinningItem(): void {
    this.winningItem = this.items.reduce((prev, current) => {
      return prev.highestBid > current.highestBid ? prev : current;
    }, this.items[0]);
  }

  endAuction(): void {
    alert('Auction ended!');
    this.checkWinningItem();
  }

  get formattedTime(): string {
    const hours = Math.floor(this.timeLeft / 3600);
    const minutes = Math.floor((this.timeLeft % 3600) / 60);
    const seconds = this.timeLeft % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
