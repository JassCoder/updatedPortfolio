import { STORAGE_KEY, SECTION_LABELS, validCV } from './cv-parser.mjs';
try {
 const cv=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
 if(validCV(cv)){
  const root=document.getElementById('saved-cv-content');
  const identity=document.createElement('h3');identity.textContent=cv.name;root.append(identity);
  for(const text of [cv.headline,cv.location]){if(text){const p=document.createElement('p');p.textContent=text;root.append(p);}}
  for(const [key,label] of Object.entries(SECTION_LABELS)){
   if(!cv.sections[key])continue;
   const article=document.createElement('article'),heading=document.createElement('h3'),body=document.createElement('p');heading.textContent=label;body.textContent=cv.sections[key];article.append(heading,body);root.append(article);
  }
  document.getElementById('saved-cv').hidden=false;
 }
}catch{/* Local previews are optional when browser storage is unavailable. */}
