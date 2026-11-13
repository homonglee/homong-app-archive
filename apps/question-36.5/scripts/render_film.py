from PIL import Image, ImageDraw, ImageFont
import math, subprocess
from pathlib import Path
W,H,FPS,SECONDS=1280,720,24,18
out=Path(__file__).resolve().parents[1]/'assets'
serif='/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
sans='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
fonts={s:ImageFont.truetype(serif,s) for s in [35,48,62,74,140]}
fsmall=ImageFont.truetype(sans,17); fmid=ImageFont.truetype(sans,21)
# Original type-driven animation using the book's visual palette.
base=Image.new('RGB',(W,H)); pix=base.load()
for y in range(H):
 t=y/H
 c=tuple(int(a*(1-t)+b*t) for a,b in zip((177,217,234),(234,238,234)))
 for x in range(W):pix[x,y]=c
scenes=[('답은 점점','빨라지고 있습니다.','ANSWERS / 01'),('그 답의 근거를','물어본 적 있나요?','EVIDENCE / 02'),('그리고, 당신의 마음은','어떤가요?','CONNECTION / 03'),('질문의 온도','36.5도','A NOVEL BY HOMONG')]
cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'question-film.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
def centered(d,text,y,font,color):
 box=d.textbbox((0,0),text,font=font);d.text(((W-(box[2]-box[0]))/2,y),text,font=font,fill=color)
for frame in range(FPS*SECONDS):
 t=frame/FPS;im=base.copy();d=ImageDraw.Draw(im)
 # Rolling silhouettes echo the two shapes on the actual cover.
 for layer,color,offset,amp in [(0,'#f08074',475,58),(1,'#b81750',520,80),(2,'#07516b',550,62)]:
  pts=[]
  for x in range(0,W+8,8):
   wave=math.sin(x/W*math.pi*1.8+t*.22+layer*1.55)*amp+math.sin(x/W*math.pi*3+t*.12)*18
   if layer==1: wave-=x/W*60
   if layer==2: wave+=x/W*60
   pts.append((x,offset+wave))
  d.polygon(pts+[(W,H),(0,H)],fill=color)
 # Tiny orbiting sun and fine orbital rings.
 cx=1060+math.sin(t*.3)*10;cy=150+math.cos(t*.3)*14
 d.ellipse((cx-70,cy-70,cx+70,cy+70),outline='#8fb8c8',width=1)
 d.ellipse((cx-48,cy-48,cx+48,cy+48),outline='#a0c2cf',width=1)
 dx=cx+70*math.cos(t*.32);dy=cy+70*math.sin(t*.32)
 d.ellipse((dx-6,dy-6,dx+6,dy+6),fill='#bc1650')
 d.text((55,35),'THE TEMPERATURE OF QUESTIONS',font=fsmall,fill='#235464')
 d.text((1095,35),'36.5°C',font=fmid,fill='#b81750')
 # Each type scene moves upward gently and dissolves at the cut.
 index=min(int(t/4.5),3);local=t-index*4.5
 alpha=min(1,local/.65,(4.5-local)/.55)
 alpha=max(0,alpha)
 type_layer=Image.new('RGBA',(W,H));td=ImageDraw.Draw(type_layer)
 dy=(1-min(local/1.2,1))**2*22
 a,b,label=scenes[index]
 centered(td,label,125+dy,fsmall,(20,60,73,int(210*alpha)))
 centered(td,a,186+dy,fonts[48 if index<3 else 48],(20,60,73,int(255*alpha)))
 centered(td,b,263+dy,fonts[62 if index<3 else 74],(186,21,81,int(255*alpha)))
 if index==3:centered(td,'이용호(호몽) 장편소설 · 부크크',374+dy,fmid,(20,60,73,int(255*alpha)))
 else:centered(td,'질문 · 근거 · 신뢰',382+dy,fsmall,(20,60,73,int(180*alpha)))
 im=Image.alpha_composite(im.convert('RGBA'),type_layer).convert('RGB');d=ImageDraw.Draw(im)
 d.line((55,676,1225,676),fill='#b2c6cf',width=1)
 d.line((55,676,55+1170*t/SECONDS,676),fill='#f3dedf',width=2)
 if frame==FPS*15:im.save(out/'film-poster.jpg',quality=93)
 p.stdin.write(im.tobytes())
p.stdin.close();assert p.wait()==0
print('Rendered',SECONDS,'seconds at',FPS,'fps;', (out/'question-film.mp4').stat().st_size,'bytes')
