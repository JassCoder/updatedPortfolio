export const STORAGE_KEY = 'jas.reviewed-cv.v1';
export const SECTION_LABELS = { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', certifications: 'Certifications', languages: 'Languages', other: 'Other details' };
const headings = new Map([
 ['summary','summary'], ['about','summary'], ['experience','experience'], ['education','education'], ['top skills','skills'], ['skills','skills'], ['certifications','certifications'], ['licenses & certifications','certifications'], ['licenses and certifications','certifications'], ['languages','languages'], ['contact','other'], ['honors-awards','other'], ['honors & awards','other'], ['publications','other'], ['projects','other'], ['volunteering','other']
]);
export function pageText(items, width = 612) {
 const words = items.filter(i => typeof i.str === 'string' && i.str.trim()).map(i => ({ text:i.str.trim(), x:i.transform[4], y:i.transform[5], width:i.width || 0 }));
 const split = width * .34;
 // LinkedIn's sidebar starts near the left edge; main-column text starts after a substantial gutter.
 const left = words.filter(w => w.x < split), right = words.filter(w => w.x >= split);
 const columns = left.length > 3 && right.length > 3 && left.some(w => w.x < width*.12) && right.some(w => w.x > width*.35) && !left.some(w => w.x+w.width > split+20) ? [right,left] : [words];
 return columns.map(column => {
  const rows=[];
  for(const word of column.sort((a,b)=>b.y-a.y || a.x-b.x)) {
   let row=rows.find(r=>Math.abs(r.y-word.y)<3);
   if(!row){row={y:word.y,words:[]};rows.push(row);} row.words.push(word);
  }
  return rows.map(row=>row.words.sort((a,b)=>a.x-b.x).map(w=>w.text).join(' ')).join('\n');
 }).join('\n\n');
}
export function parseCV(sourceText) {
 const sections=Object.fromEntries(Object.keys(SECTION_LABELS).map(key=>[key,'']));
 let section='other'; const before=[]; let foundHeading=false;
 for(const raw of sourceText.split(/\r?\n/)) {
  const line=raw.trim(); if(!line || /^Page \d+ of \d+$/i.test(line)) continue;
  const heading=headings.get(line.toLowerCase().replace(/:$/,''));
  if(heading){section=heading; foundHeading=true;continue;}
  sections[section]+=(sections[section]?'\n':'')+line;
  if(!foundHeading) before.push(line);
 }
 // A PDF may start with sidebar contact details. Leave uncertain identity fields for review.
 const candidate=before.filter(line=>!/@|https?:|www\.|linkedin|\+?\d[\d ()-]{6,}/i.test(line));
 return { version:1, name:candidate[0] || '', headline:candidate[1] || '', location:candidate[2] || '', sections, sourceText };
}
export function validCV(value) {
 return value && value.version===1 && ['name','headline','location','sourceText'].every(k=>typeof value[k]==='string') && value.sections && Object.keys(SECTION_LABELS).every(k=>typeof value.sections[k]==='string');
}
