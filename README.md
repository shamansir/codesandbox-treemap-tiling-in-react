# Stock market with geometric shapes

The initial idea:

- try to refresh my React + TS skills, at least with the help of Claude;
- imagine what could be the auction / stock market with geometric shapes;
- refresh how the `TreeMap` algorithm works by shows stocks in real time;

(for a better understanding if it works correctly I've kept the company names for the lots / stocks in the end, but added geometric shapes as their icons)

# The rules

- There are several *accounts* that can make bids on the lots (geometric shapes or company stocks) in the auction;
- All the lots have minimum price at the start;
- *Three lots* are chosen randomly from the list of all possible lots;
- Bidding starts;
- There is the *time limit* for bidding on any of these three lots, which is now *one minute*;
- The highest bid wins and becomes minimum price for this lot for the next bid `+2%`;
- No bids during the minute — nothing is bought;
- When the minute intended for bidding elapsed, there are three seconds of freeze time, so no bidding allowed;
- When freeze time ends, the *new three lots* are chosen randomly and the process repeats;
- If one of the already bought lots appears again in the list of possible lots, it is required to pay `+2%` more than the previous highest bid;