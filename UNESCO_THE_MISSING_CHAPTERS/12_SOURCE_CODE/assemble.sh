#!/usr/bin/env bash
# Assemble the 60 s film from the 8 rendered sequences, master audio, export + QC.
set -euo pipefail
cd "$(dirname "$0")/.."
S=09_EDITING/sequences
OUT=11_FINAL_EXPORTS
QC=10_QUALITY_CONTROL
mkdir -p $OUT $QC 09_EDITING/individual_sequences

# 1) audio master: EBU R128 -16 LUFS, true peak -1.5 dBTP (online delivery)
ffmpeg -y -loglevel error -i 08_AUDIO/mix_premaster.wav \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:60,apad=whole_dur=60" -ar 48000 -c:a pcm_s24le 08_AUDIO/mix_master.wav

# 2) picture: 0.5 s dissolves at the nominal boundaries -> exactly 1440 frames
ffmpeg -y -loglevel error \
  -i $S/seq1.mp4 -i $S/seq2.mp4 -i $S/seq3.mp4 -i $S/seq4.mp4 -i $S/seq5.mp4 -i $S/seq6.mp4 -i $S/seq7.mp4 -i $S/seq8.mp4 \
  -i 08_AUDIO/mix_master.wav \
  -filter_complex "\
[0:v][1:v]xfade=transition=fade:duration=0.5:offset=8[a];\
[a][2:v]xfade=transition=fade:duration=0.5:offset=15[b];\
[b][3:v]xfade=transition=fade:duration=0.5:offset=22[c];\
[c][4:v]xfade=transition=fade:duration=0.5:offset=29[d];\
[d][5:v]xfade=transition=fade:duration=0.5:offset=36[e];\
[e][6:v]xfade=transition=fade:duration=0.5:offset=43[f];\
[f][7:v]xfade=transition=fade:duration=0.5:offset=50,trim=end_frame=1440,setpts=PTS-STARTPTS,format=yuv420p[v]" \
  -map "[v]" -map 8:a -c:v libx264 -preset slow -crf 16 -profile:v high -level 5.1 -r 24 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart \
  -c:a aac -b:a 320k -ar 48000 -t 60 $OUT/UNESCO_THE_MISSING_CHAPTERS_FINAL_4K.mp4

# 3) 1080p review version
ffmpeg -y -loglevel error -i $OUT/UNESCO_THE_MISSING_CHAPTERS_FINAL_4K.mp4 -vf "scale=1920:1080:flags=lanczos" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -r 24 -movflags +faststart -c:a aac -b:a 256k \
  $OUT/UNESCO_THE_MISSING_CHAPTERS_REVIEW_1080P.mp4

# 4) eight individual sequences, cut from the master at their nominal in/out points
starts=(0 8 15 22 29 36 43 50); durs=(8 7 7 7 7 7 7 10)
names=(01_THE_INCOMPLETE_BOOK 02_THE_DISCOVERY 03_CH1_FIRST_STEPS 04_CH2_TAKING_CARE 05_CH3_LEARNING_TO_SHARE 06_CH4_DISCOVERING_THE_WORLD 07_CH5_CREATING_TOGETHER 08_EVERY_CHAPTER_COUNTS)
for i in 0 1 2 3 4 5 6 7; do
  ffmpeg -y -loglevel error -ss ${starts[$i]} -i $OUT/UNESCO_THE_MISSING_CHAPTERS_FINAL_4K.mp4 -t ${durs[$i]} \
    -c:v libx264 -preset medium -crf 17 -c:a aac -b:a 256k 09_EDITING/individual_sequences/SEQ${names[$i]}.mp4
done

# 5) contact sheet (1 frame / second)
ffmpeg -y -loglevel error -i $OUT/UNESCO_THE_MISSING_CHAPTERS_REVIEW_1080P.mp4 \
  -vf "fps=1,scale=384:216,tile=6x10:padding=4:color=black" -frames:v 1 $QC/contact_sheet_final.jpg
echo done
