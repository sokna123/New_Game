const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const N=20,S=cv.width/N;
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best');
const ov=document.getElementById('ov'),ovTitle=document.getElementById('ovTitle'),ovMsg=document.getElementById('ovMsg'),startBtn=document.getElementById('start');
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
let snake,dir,next,food,score,best=0,timer,running=false,paused=false;
try{best=+localStorage.getItem('snake-best')||0}catch(e){}
bestEl.textContent=best;

function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function placeFood(){
  do{food=[Math.floor(Math.random()*N),Math.floor(Math.random()*N)]}
  while(snake.some(s=>s[0]===food[0]&&s[1]===food[1]));
}
function reset(){
  snake=[[10,10],[9,10],[8,10]];dir=DIRS.right;next=dir;score=0;scoreEl.textContent=0;placeFood();
}
function speed(){return Math.max(60,140-score*4)}
function loop(){
  timer=setTimeout(()=>{step();if(running&&!paused)loop()},speed());
}
function start(){
  reset();running=true;paused=false;ov.classList.add('hide');draw();clearTimeout(timer);loop();
}
function step(){
  dir=next;
  const h=[snake[0][0]+dir[0],snake[0][1]+dir[1]];
  const hitWall=h[0]<0||h[1]<0||h[0]>=N||h[1]>=N;
  const hitSelf=snake.some(s=>s[0]===h[0]&&s[1]===h[1]);
  if(hitWall||hitSelf)return gameOver();
  snake.unshift(h);
  if(h[0]===food[0]&&h[1]===food[1]){
    score++;scoreEl.textContent=score;placeFood();
  }else snake.pop();
  draw();
}
function gameOver(){
  running=false;clearTimeout(timer);
  if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('snake-best',best)}catch(e){}}
  ovTitle.textContent='Game over';ovMsg.textContent='Score: '+score;startBtn.textContent='Play again';
  ov.classList.remove('hide');
}
function setDir(name){
  const d=DIRS[name];
  if(!d||!running)return;
  if(d[0]===-dir[0]&&d[1]===-dir[1])return; // no reversing
  next=d;
}
function togglePause(){
  if(!running)return;
  paused=!paused;
  if(paused){clearTimeout(timer);ovTitle.textContent='Paused';ovMsg.textContent='Press space to continue.';startBtn.style.display='none';ov.classList.remove('hide')}
  else{ov.classList.add('hide');startBtn.style.display='';loop()}
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle=css('--food');
  ctx.beginPath();ctx.arc(food[0]*S+S/2,food[1]*S+S/2,S*0.38,0,Math.PI*2);ctx.fill();
  snake.forEach((s,i)=>{
    ctx.fillStyle=i===0?css('--head'):css('--snake');
    ctx.beginPath();ctx.roundRect(s[0]*S+1,s[1]*S+1,S-2,S-2,5);ctx.fill();
  });
}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  const map={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
  if(map[k]){e.preventDefault();setDir(map[k])}
  else if(k===' '){e.preventDefault();running?togglePause():start()}
});
document.querySelectorAll('.pad button').forEach(b=>b.addEventListener('click',()=>setDir(b.dataset.d)));
startBtn.addEventListener('click',start);
let tx,ty;
cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
cv.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
  setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
});
reset();draw();