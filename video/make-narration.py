"""Generate voice cues and a deterministic 24-second narration track.
Requires edge-tts and ffmpeg. Source speech stays in ignored artifacts/.
"""
import asyncio
import json
import subprocess
from pathlib import Path
import edge_tts

root = Path(__file__).resolve().parent.parent
config = json.loads((root / 'video/narration.json').read_text())
work = root / 'artifacts/film-v2/voice'
work.mkdir(parents=True, exist_ok=True)

async def main():
    for i, cue in enumerate(config['cues']):
        audio = work / f'{i:02d}.mp3'
        if not audio.exists():
            await edge_tts.Communicate(cue['text'], config['voice'], rate=config['rate']).save(str(audio))
        subprocess.run(['ffmpeg','-y','-v','error','-i',str(audio),'-af','silenceremove=start_periods=1:start_duration=0.01:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-48dB,areverse,loudnorm=I=-16:TP=-2:LRA=7','-ar','48000','-ac','2',str(work/f'{i:02d}.wav')],check=True)
    command=['ffmpeg','-y','-v','error']
    filters=[]
    for i,cue in enumerate(config['cues']):
        command+=['-i',str(work/f'{i:02d}.wav')]
        delay=round(cue['at']*1000)
        filters.append(f'[{i}:a]adelay={delay}|{delay}[v{i}]')
    filters.append(''.join(f'[v{i}]' for i in range(len(config['cues'])))+f'amix=inputs={len(config["cues"])}:normalize=0,apad,atrim=duration=24,alimiter=limit=0.9[out]')
    command+=['-filter_complex',';'.join(filters),'-map','[out]','-ar','48000','-ac','2',str(root/'public/audio/film-voice-v2.wav')]
    subprocess.run(command,check=True)
    for i,cue in enumerate(config['cues']):
        duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(work/f'{i:02d}.wav')],text=True))
        print(f'{cue["at"]:.2f}–{cue["at"]+duration:.2f}: {cue["text"]}')
        if i+1<len(config['cues']):
            assert cue['at']+duration < config['cues'][i+1]['at'], 'Voice cues overlap'
        else: assert cue['at']+duration<24, 'Outro speech exceeds the film'
asyncio.run(main())
