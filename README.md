# Honda Reverse Engineering
Supporting tools for reverse engineering the infotainment & climate control system on an 8th Gen Honda Accord. Device used to capture data were a Saleae Logic Pro 8

## Tasks
- [x] Find connectors used in dash (JAE MX34 series)
- [x] Build breakout board
- [x] Capture data between Climate System <-> Main Dash LCD
- [x] Reverse engineer & understand the signal (TL;DR a few bytes that control the 7-segment display directly)
- [ ] Capture volume control data (comes from a different MCU / signal wire)

### Climate
Data got exported to `full-range.csv` and then turned into 10-byte packets. I recorded a video along side the logic capture to know when the temperature setpoints changed and what their values were. I then removed duplicate lines in the data (the packet signal repeats every 40ms) and ended up with the data in this [Google Doc](https://docs.google.com/spreadsheets/d/1FpKDPLKMCnJ9wi3bUpDE3ozBxJAb5knNdP2zbHa9ohQ/edit?usp=sharing) which I can compare alongside my known temp setpoints.

<img width="305" alt="image" src="https://github.com/pastudan/honda-reveng/assets/1296162/e31e0c9b-0121-487c-bece-f2a7cdec0596">
