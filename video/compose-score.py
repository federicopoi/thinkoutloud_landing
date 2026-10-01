"""Original, deterministic atmospheric cinematic score for the 18-second product film.
Run with Python + NumPy; no samples or third-party music are used.
"""
from pathlib import Path
import wave
import numpy as np

SR = 48000
DURATION = 18
rng = np.random.default_rng(20261001)
mix = np.zeros((SR * DURATION, 2), dtype=np.float64)

def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)

def add(signal, start, pan=0):
    offset = round(start * SR)
    if offset >= len(mix):
        return
    signal = signal[:len(mix)-offset]
    mix[offset:offset+len(signal), 0] += signal * np.sqrt((1-pan)/2)
    mix[offset:offset+len(signal), 1] += signal * np.sqrt((1+pan)/2)

def tone(note, length, kind):
    t = np.arange(round(length*SR))/SR
    f = hz(note)
    if kind == 'pad':
        # Slowly moving, softly bowed harmonics with a wide stereo ensemble.
        s = sum(np.sin(2*np.pi*f*(1+detune)*t + .12*np.sin(2*np.pi*.3*t))
                for detune in [-.002, 0, .002])/3
        s += .22*np.sin(2*np.pi*f*2*t) + .08*np.sin(2*np.pi*f*3*t)
        env = np.minimum(t/.8, 1)*np.minimum((length-t)/1.2, 1)
    else:
        s = np.sin(2*np.pi*f*t) + .28*np.sin(2*np.pi*f*2*t)
        env = (1-np.exp(-t*100))*np.exp(-t*3.8)*np.minimum((length-t)/.15, 1)
    return s * np.maximum(env, 0)

# A new D minor → G minor → B-flat → suspended A → D minor progression.
# Warm, spacious harmony returns to the first score’s cinematic character.
chords = [(0, [50,57,62,65]), (3.6, [43,55,58,62]),
          (7.2, [46,53,58,65]), (10.8, [45,57,62,64]), (14.4, [38,50,57,62,65])]
for start, notes in chords:
    length = min(5, DURATION-start)
    intensity = .07 if start == 0 else .09
    for i, note in enumerate(notes):
        add(tone(note, length, 'pad')*intensity, start, (i/(len(notes)-1)-.5)*1.3)
    add(tone(notes[0]-12, length, 'pad')*.12, start)

# A restrained rising pulse builds during the laptop reveal and demonstration.
for i, start in enumerate(np.arange(1.8, 14.4, .3)):
    notes = next(notes for at, notes in reversed(chords) if at <= start)
    pattern = [1, 2, 3, 2, 1, 3, 2, 1]
    note = notes[pattern[i % 8]] + (12 if i % 8 == 5 else 0)
    amp = .027 + .038 * (start-1.8)/12.6
    pluck = tone(note, 1.6, 'pluck')*amp
    add(pluck, start, -.4 if i%2 else .4)
    add(pluck*.28, start+.45, .4 if i%2 else -.4)

# Low cinematic toms, with gentle brushed impacts instead of sharp cymbals.
for start in [3.6, 6, 7.2, 8.4, 9.6, 10.8, 12, 12.6, 13.2, 14.4]:
    t = np.arange(round(1.4*SR))/SR
    phase = 2*np.pi*(48*t + 32*.06*(1-np.exp(-t/.06)))
    drum = np.sin(phase)*np.exp(-t*6)*(1-np.exp(-t*400))
    add(drum*(.11 if start<10 else .16), start)
for start in [3.6, 10.8, 14.4]:
    t = np.arange(2*SR)/SR
    noise = rng.normal(0, 1, len(t))
    # Smooth the noise to remove harsh high frequencies.
    noise = np.convolve(noise, np.ones(24)/24, mode='same')
    add(noise*np.exp(-t*2.5)*.1, start, .15)

# A spacious upper melody blooms above the pulse; no clap or hi-hat beat.
for start, note in [(3.6,74), (5.4,70), (7.2,77), (9,74), (10.8,76), (12.6,74), (14.4,77)]:
    add(tone(note, min(3.6, DURATION-start), 'pad')*.028, start, .2)

# Short stereo room tail. All reverb derives from the original instruments.
dry = mix.copy()
for delay, gain in [(.11,.16),(.23,.12),(.37,.09),(.53,.065),(.79,.045)]:
    n = round(delay*SR)
    mix[n:] += dry[:-n, ::-1]*gain

t = np.arange(len(mix))/SR
fade = np.minimum(t/.5,1)*np.minimum((DURATION-t)/1.5,1)
mix *= np.maximum(fade,0)[:,None]
mix *= .82/max(np.max(np.abs(mix)), .001)
output = Path(__file__).resolve().parents[1]/'public/audio/think-out-loud-score.wav'
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as file:
    file.setnchannels(2)
    file.setsampwidth(2)
    file.setframerate(SR)
    file.writeframes((mix*32767).astype('<i2').tobytes())
print(f'Original score: {output} (18s, stereo, 48kHz)')
