// Einheitliche Symbole auf allen Geräten (eigene WW2-Zeichnungen, eingebettet)
const EMOJI_IMG={"🎯": "assets/symbole/symbol-01.svg", "⚔": "assets/symbole/symbol-02.svg", "✈": "assets/symbole/symbol-03.svg", "📋": "assets/symbole/symbol-04.svg", "🌲": "assets/symbole/symbol-05.svg", "🌾": "assets/symbole/symbol-06.svg", "🎲": "assets/symbole/symbol-07.svg", "🏖": "assets/symbole/symbol-08.svg", "🏚": "assets/symbole/symbol-09.svg", "🏠": "assets/symbole/symbol-10.svg", "🐄": "assets/symbole/symbol-11.svg", "💧": "assets/symbole/symbol-12.svg", "📏": "assets/symbole/symbol-13.svg", "📜": "assets/symbole/symbol-14.svg", "🗺": "assets/symbole/symbol-15.svg", "🗼": "assets/symbole/symbol-16.svg", "🚂": "assets/symbole/symbol-17.svg", "🛣": "assets/symbole/symbol-18.svg", "🧱": "assets/symbole/symbol-19.svg", "⚓": "assets/symbole/symbol-20.svg", "⚙": "assets/symbole/symbol-21.svg", "⛏": "assets/symbole/symbol-22.svg", "⛪": "assets/symbole/symbol-23.svg", "⬆": "assets/symbole/symbol-24.svg", "⬇": "assets/symbole/symbol-25.svg"};
const EMOJI_RE=new RegExp('('+Object.keys(EMOJI_IMG).join('|')+')\uFE0F?','gu');
function emojify(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
    const p=n.parentNode; if(!p||/^(SCRIPT|STYLE|TITLE|TEXTAREA|OPTION)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
    EMOJI_RE.lastIndex=0; return EMOJI_RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP; }});
  const list=[]; while(w.nextNode()) list.push(w.currentNode);
  for(const n of list){
    const frag=document.createDocumentFragment(); let last=0, m; const t=n.nodeValue; EMOJI_RE.lastIndex=0;
    while((m=EMOJI_RE.exec(t))){
      if(m.index>last) frag.appendChild(document.createTextNode(t.slice(last,m.index)));
      const img=document.createElement('img'); img.className='emj'; img.alt=m[1]; img.draggable=false; img.src=EMOJI_IMG[m[1]];
      frag.appendChild(img); last=m.index+m[0].length;
    }
    if(last<t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(frag,n);
  }
}
emojify(document.body);
new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes){
  if(n.nodeType===1) emojify(n); else if(n.nodeType===3 && n.parentNode) emojify(n.parentNode); } })
  .observe(document.body,{childList:true,subtree:true});
