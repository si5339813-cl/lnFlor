const DB_URL='./plants.json';let plants=[],currentScreen='home',currentPlant=null,identifyPool=[],identifyStep=0,quizIndex=0,quizScore=0,quizCurrent=null;
const $=id=>document.getElementById(id), saved=()=>JSON.parse(localStorage.getItem('flora_saved')||'[]'), setSaved=a=>localStorage.setItem('flora_saved',JSON.stringify(a));
function value(p,k){return (p[k]||'').trim()}function rare(p){return /краснокниж|кк рс|кк рф/i.test(value(p,'Категория базы'))}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function photo(p){
  const path=value(p,'image_path');
  if(path) return path.replace(/^images\//,'./images/');
  const name=value(p,'Русское название');
  const slug=name.toLowerCase().replace(/ё/g,'e').replace(/й/g,'y').replace(/ц/g,'ts').replace(/ч/g,'ch').replace(/ш/g,'sh').replace(/щ/g,'shch').replace(/ж/g,'zh').replace(/х/g,'kh').replace(/ю/g,'yu').replace(/я/g,'ya').replace(/э/g,'e').replace(/ъ|ь/g,'').replace(/а/g,'a').replace(/б/g,'b').replace(/в/g,'v').replace(/г/g,'g').replace(/д/g,'d').replace(/е/g,'e').replace(/з/g,'z').replace(/и/g,'i').replace(/к/g,'k').replace(/л/g,'l').replace(/м/g,'m').replace(/н/g,'n').replace(/о/g,'o').replace(/п/g,'p').replace(/р/g,'r').replace(/с/g,'s').replace(/т/g,'t').replace(/у/g,'u').replace(/ф/g,'f').replace(/ы/g,'y').replace(/\s+/g,'_').replace(/[^a-z0-9_\-]/g,'');
  return './images/'+slug+'.jpg';
}
function imageMarkup(p,detail=false){
  const src=photo(p);
  return src ? `<img loading="${detail?'eager':'lazy'}" src="${esc(src)}" alt="${esc(value(p,'Русское название'))}" onerror="this.onerror=null;this.style.display='none';this.parentElement.classList.add('image-missing');this.parentElement.insertAdjacentHTML('beforeend','<span class=&quot;image-fallback&quot;>🌿</span>')">` : '<span class="image-fallback">🌿</span>';
}
function go(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.navitem').forEach(x=>x.classList.toggle('selected',x.dataset.go===id));$('back').classList.toggle('hidden',id==='home');currentScreen=id;window.scrollTo(0,0);if(id==='catalog')renderCatalog();if(id==='collection')renderCollection();if(id==='identify')startIdentify();if(id==='quiz')startQuiz()}
function card(p){let im=photo(p);return `<article class="plant-card" data-id="${esc(p.id)}"><div class="plant-photo">${imageMarkup(p)}</div><div style="flex:1;min-width:0"><h3>${esc(value(p,'Русское название'))}</h3><div class="latin">${esc(value(p,'Латинское название'))}</div><span class="tag ${rare(p)?'rare':''}">${rare(p)?'Особо охраняемый вид':'Флора парка'}</span><p>${esc(value(p,'Цвет цветков/соцветия')||value(p,'Местообитание')||'Сведения уточняются')}</p></div><span>›</span></article>`}
function openPlant(id){currentPlant=plants.find(p=>p.id===String(id));if(!currentPlant)return;let p=currentPlant, fields=[['Семейство','Семейство'],['Охранный статус','Статус / примечание'],['Высота','Примерная высота'],['Форма листьев','Форма листьев'],['Расположение листьев','Расположение листьев'],['Цвет цветков','Цвет цветков/соцветия'],['Цветение / спороношение','Период цветения / спороношения'],['Плод / размножение','Тип плода / размножения'],['Местообитание','Местообитание'],['Зона парка','Зона парка'],['Освещённость','Освещённость']];
let im=photo(p);$('detailContent').innerHTML=`<p class="eyebrow">КАРТОЧКА ВИДА</p><div class="detail-photo">${imageMarkup(p,true)}</div><div class="detail-title"><h1>${esc(value(p,'Русское название'))}</h1><div class="latin">${esc(value(p,'Латинское название'))}</div><span class="tag ${rare(p)?'rare':''}">${rare(p)?'Краснокнижный вид — статус требует сверки':'Виды каталога'}</span></div><div class="detail-actions"><button class="primary" id="savePlant">${saved().includes(p.id)?'✓ В коллекции':'♡ Сохранить находку'}</button><button class="secondary" id="sharePlant">Поделиться</button></div><div class="detail-section"><h3>Описание и особенности</h3><p>${esc(value(p,'Описание / местообитание')||'Подробное описание уточняется.')}</p><p>${esc(value(p,'Жизненная форма'))}</p></div><div class="detail-section"><h3>Признаки для определения</h3>${fields.map(([label,key])=>value(p,key)?`<div class="fact"><span>${label}</span><b>${esc(value(p,key))}</b></div>`:'').join('')}</div><div class="detail-section"><h3>Важно для сохранения</h3><p>Наблюдайте растение, не срывая его. Данные о статусе и местах произрастания могут требовать уточнения специалистами парка.</p></div>`;
$('savePlant').onclick=()=>{let a=saved();if(a.includes(p.id))a=a.filter(x=>x!==p.id);else a.push(p.id);setSaved(a);openPlant(p.id)};$('sharePlant').onclick=()=>{if(navigator.share)navigator.share({title:value(p,'Русское название'),text:value(p,'Латинское название')});else alert(value(p,'Русское название')+' — '+value(p,'Латинское название'))};go('detail')}
function renderCatalog(){let q=($('search').value||'').toLowerCase(),cat=$('category').value,col=$('color').value,hab=$('habitat').value;let a=plants.filter(p=>(!q||(value(p,'Русское название')+' '+value(p,'Латинское название')+' '+value(p,'Семейство')).toLowerCase().includes(q))&&(!cat||(cat==='rare'?rare(p):!rare(p)))&&(!col||value(p,'Цвет цветков/соцветия')===col)&&(!hab||value(p,'Местообитание')===hab));$('plantList').innerHTML=a.length?a.map(card).join(''):'<div class="empty">Ничего не найдено. Попробуйте изменить фильтры.</div>';$('catalogCount').textContent=a.length+' из '+plants.length}
function renderCollection(){let a=plants.filter(p=>saved().includes(p.id));$('savedCount').textContent=a.length;$('rareCount').textContent=a.filter(rare).length;$('points').textContent=a.length*10;$('collectionList').innerHTML=a.length?a.map(card).join(''):'<div class="empty">Пока нет сохранённых видов.<br>Открывайте карточки и добавляйте находки в коллекцию.</div>'}
const qs=[
 {key:'Цвет цветков/соцветия',label:'Какого цвета цветок или соцветие?',a:'Белый',b:'Жёлтый',classify:p=>{let v=value(p,'Цвет цветков/соцветия').toLowerCase();if(/бел|светл/.test(v))return'a';if(/желт|жёлт/.test(v))return'b';if(/цветков нет|нет цвет/.test(v))return'other';return v?'other':'unknown'}},
 {key:'Форма листьев',label:'Какие листья у растения?',a:'Узкие / игольчатые',b:'Широкие / овальные',classify:p=>{let v=value(p,'Форма листьев').toLowerCase();if(/узк|иголь|нитевид|линейн|ланцет/.test(v))return'a';if(/широк|оваль|эллипс|округл|сердцевид/.test(v))return'b';return v?'other':'unknown'}},
 {key:'Местообитание',label:'Где растёт это растение?',a:'Открытое сухое место',b:'Лес / опушка',classify:p=>{let v=(value(p,'Местообитание')+' '+value(p,'Описание / местообитание')).toLowerCase();if(/сух|камен|склон|степ|пес|скал|луга|открыт/.test(v))return'a';if(/лес|опуш|тен|кустар|поляна/.test(v))return'b';return v.trim()?'other':'unknown'}},
 {key:'Примерная высота',label:'Какой высоты растение?',a:'Низкое — до 30 см',b:'Выше 30 см',classify:p=>{let v=value(p,'Примерная высота').toLowerCase();let n=(v.match(/\d+/g)||[]).map(Number);if(!n.length)return'unknown';if(Math.max(...n)<=30)return'a';if(Math.max(...n)>30)return'b';return'other'}},
 {key:'Период цветения / спороношения',label:'Когда вы заметили цветение?',a:'Весна — начало лета',b:'Середина — конец лета',classify:p=>{let v=value(p,'Период цветения / спороношения').toLowerCase();if(/май|июнь|весн/.test(v))return'a';if(/июль|август|сентябр/.test(v))return'b';return v?'other':'unknown'}},
 {key:'Потребность во влаге',label:'В каком месте по влажности растёт растение?',a:'Сухо',b:'Влажно / у воды',classify:p=>{let v=(value(p,'Потребность во влаге')+' '+value(p,'Местообитание')).toLowerCase();if(/сух|засуш|степ|камен/.test(v))return'a';if(/влаж|болот|берег|вод|сыр|пойм/.test(v))return'b';return v.trim()?'other':'unknown'}},
 {key:'Освещённость',label:'Сколько света в месте произрастания?',a:'Солнце / открытое место',b:'Полутень / тень',classify:p=>{let v=value(p,'Освещённость').toLowerCase();if(/солнеч|свет|открыт/.test(v))return'a';if(/тен|полутен/.test(v))return'b';return v?'other':'unknown'}},
 {key:'Жизненная форма',label:'На что похоже растение по форме?',a:'Трава',b:'Кустарник / дерево',classify:p=>{let v=value(p,'Жизненная форма').toLowerCase();if(/трав|папорот|хвощ|мох/.test(v))return'a';if(/кустар|дерев|куст/.test(v))return'b';return v?'other':'unknown'}},
 {key:'Тип листьев',label:'Как устроены листья?',a:'Один цельный лист',b:'Сложный / разделённый лист',classify:p=>{let v=(value(p,'Тип листьев')+' '+value(p,'Форма листьев')).toLowerCase();if(/цельн|простые|простой|оваль|эллипс/.test(v))return'a';if(/сложн|перист|рассеч|раздел|дол[и-я]/.test(v))return'b';return v.trim()?'other':'unknown'}},
 {key:'Расположение листьев',label:'Как листья расположены на стебле?',a:'По одному / очередно',b:'Парами / розеткой',classify:p=>{let v=value(p,'Расположение листьев').toLowerCase();if(/очеред|спирал/.test(v))return'a';if(/супрот|парами|мутов|розет/.test(v))return'b';return v?'other':'unknown'}},
 {key:'Тип цветка / соцветия',label:'Как расположены цветки?',a:'Один крупный цветок',b:'Несколько мелких цветков',classify:p=>{let v=value(p,'Тип цветка / соцветия').toLowerCase();if(/одиноч|один круп/.test(v))return'a';if(/соцвет|корзин|кисть|метел|колос|зонтик|мелк/.test(v))return'b';return v?'other':'unknown'}},
 {key:'Тип плода / размножения',label:'Что заметно у растения после цветения?',a:'Коробочка / стручок',b:'Орехи / ягоды / семена',classify:p=>{let v=value(p,'Тип плода / размножения').toLowerCase();if(/коробоч|струч/.test(v))return'a';if(/ореш|ягод|семян|семянк|плод|спор/.test(v))return'b';return v?'other':'unknown'}}
];
let identifyScores=new Map(),identifyAnswers=[];
function startIdentify(){identifyPool=[...plants];identifyScores=new Map(plants.map(p=>[p.id,0]));identifyAnswers=[];identifyStep=0;$('identifyResults').innerHTML='';$('skipQuestion').classList.remove('hidden');renderQuestion()}
function renderQuestion(){
 if(identifyStep>=qs.length){showCandidates();return}
 const q=qs[identifyStep];
 $('stepLabel').textContent=`ВОПРОС ${identifyStep+1} ИЗ ${qs.length}`;
 $('question').textContent=q.label;
 $('progressBar').style.width=(identifyStep/qs.length*100)+'%';
 $('answers').innerHTML=[['a',q.a],['b',q.b],['other','Другой вариант'],['unknown','Не знаю / сомневаюсь']].map(([v,label])=>`<button class="answer" data-answer="${v}">${label}</button>`).join('');
 $('answers').querySelectorAll('button').forEach(b=>b.onclick=()=>answerIdentify(b.dataset.answer));
 $('skipQuestion').textContent='Не знаю / сомневаюсь';
}
function answerIdentify(answer){
 const q=qs[identifyStep];
 identifyAnswers.push(answer);
 if(answer!=='unknown'){
  plants.forEach(p=>{let cls=q.classify(p);let score=identifyScores.get(p.id)||0;if(answer==='other'){if(cls==='other')score+=1;}else if(cls===answer)score+=3;else if(cls==='other')score+=0.25;identifyScores.set(p.id,score)});
 }
 identifyStep++;
 // Keep every criterion in play; always rank all plants so sparse/inconsistent source values never empty the result set.
 identifyPool=plants.slice().sort((a,b)=>(identifyScores.get(b.id)||0)-(identifyScores.get(a.id)||0));
 renderQuestion();
}
function showCandidates(){
 const ranked=plants.slice().sort((a,b)=>(identifyScores.get(b.id)||0)-(identifyScores.get(a.id)||0));
 $('progressBar').style.width='100%';$('stepLabel').textContent='РЕЗУЛЬТАТ ПОИСКА';
 $('question').textContent='Наиболее подходящие варианты';
 $('answers').innerHTML='';
 $('skipQuestion').classList.add('hidden');
 const scoreTop=ranked.length?(identifyScores.get(ranked[0].id)||0):0;
 const intro=`<p class="result-note">Готово! Мы сравнили ваши ответы с признаками растений. Начните с первых вариантов — это наиболее близкие совпадения.</p>`;
 $('identifyResults').innerHTML=intro+(ranked.length?ranked.slice(0,8).map(p=>`<div class="ranked-plant">${card(p)}<span class="match-score">${Math.round((identifyScores.get(p.id)||0)/Math.max(1,identifyAnswers.filter(x=>x!=='unknown').length*3)*100)}% совпадений</span></div>`).join(''):'<div class="empty">Каталог пока пуст.</div>')+'<button class="secondary full" id="restart">Начать заново</button>';
 $('restart').onclick=startIdentify;
}
function startQuiz(){quizIndex=0;quizScore=0;makeQuiz()}
function makeQuiz(){if(quizIndex>=5){$('quizStep').textContent='ИТОГ';$('quizQuestion').textContent=`Вы набрали ${quizScore} из 5 баллов`; $('quizAnswers').innerHTML='<p>Продолжайте знакомиться с флорой парка и берегите растения.</p>';$('quizFeedback').textContent='';$('quizNext').classList.add('hidden');return}let p=plants[(quizIndex*7+3)%plants.length];quizCurrent=p;$('quizStep').textContent='ВОПРОС '+(quizIndex+1)+' ИЗ 5';$('quizQuestion').textContent=`Как называется растение «${value(p,'Латинское название')}»?`;$('quizFeedback').textContent='';$('quizNext').classList.add('hidden');let choices=[p,...plants.filter(x=>x.id!==p.id).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);$('quizAnswers').innerHTML=choices.map(x=>`<button class="answer" data-id="${x.id}">${esc(value(x,'Русское название'))}</button>`).join('');$('quizAnswers').querySelectorAll('button').forEach(b=>b.onclick=()=>{if($('quizAnswers').dataset.done)return;$('quizAnswers').dataset.done='1';let ok=b.dataset.id===p.id;if(ok)quizScore++;$('quizFeedback').textContent=ok?'Верно! Отличная работа.':'Правильный ответ: '+value(p,'Русское название');$('quizNext').classList.remove('hidden')})}
$('quizNext').onclick=()=>{quizIndex++;$('quizAnswers').dataset.done='';makeQuiz()};
document.addEventListener('click',e=>{let nav=e.target.closest('[data-go]');if(nav)go(nav.dataset.go);let c=e.target.closest('.plant-card');if(c)openPlant(c.dataset.id)});
$('back').onclick=()=>go('home');$('savedTop').onclick=()=>go('collection');['search','category','color','habitat'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',renderCatalog));$('skipQuestion').onclick=()=>answerIdentify('unknown');
async function init(){try{let r=await fetch(DB_URL);plants=await r.json()}catch(e){$('app').innerHTML='<p>Не удалось загрузить базу растений. Откройте проект через локальный сервер.</p>';return}plants=plants.map((p,i)=>({...p,id:String(p.id||i+1)}));$('total').textContent=plants.length;let colors=[...new Set(plants.map(p=>value(p,'Цвет цветков/соцветия')).filter(Boolean))].sort(),habitats=[...new Set(plants.map(p=>value(p,'Местообитание')).filter(Boolean))].sort();colors.forEach(v=>$('color').add(new Option(v,v)));habitats.forEach(v=>$('habitat').add(new Option(v,v)));renderCatalog();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
init();
