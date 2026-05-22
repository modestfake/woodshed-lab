# Note playback is synthesized (Karplus-Strong), not sampled

Clicking a fret or playing a box produces sound via Karplus-Strong plucked-string
synthesis plus a neck-pickup-style lowpass, generated in the Web Audio API at
runtime. We avoided a sampled-instrument library to keep the app dependency- and
asset-free and instantly playable. Trade-off: it's a synthesized approximation, not a
recorded guitar — swap in samples later if realism becomes a goal.
