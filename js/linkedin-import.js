import { STORAGE_KEY, SECTION_LABELS, pageText, parseCV, validCV } from './cv-parser.mjs';
const $ = id=>document.getElementById(id);
const editor=$('cv-editor'), status=$('import-status');
let sourceText='', busy=false;
for(const [key,label] of Object.entries(SECTION_LABELS)) {
 const field=document.createElement('label');field.className='cv-field';field.textContent=label;
 const input=document.createElement('textarea');input.id='cv-'+key;input.rows=key==='experience'?8:4;field.append(input);$('cv-sections').append(field);
}
function say(message){status.textContent=message;}
function populate(cv){for(const key of ['name','headline','location']) $('cv-'+key).value=cv[key];for(const key of Object.keys(SECTION_LABELS)) $('cv-'+key).value=cv.sections[key];sourceText=cv.sourceText;$('source-text').value=sourceText;editor.hidden=false;}
function collect(){return {version:1,name:$('cv-name').value.trim(),headline:$('cv-headline').value.trim(),location:$('cv-location').value.trim(),sections:Object.fromEntries(Object.keys(SECTION_LABELS).map(key=>[key,$('cv-'+key).value.trim()])),sourceText:$('source-text').value,savedAt:new Date().toISOString()};}
try {const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(validCV(saved)){populate(saved);say('Your previously saved CV is ready to review. Saved only in this browser.');}}catch{say('Browser storage is unavailable. You can still import, review, and download your CV.');}
$('pdf-file').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file || busy)return;
 if(!/\.pdf$/i.test(file.name)){say('Choose a PDF file exported from LinkedIn.');event.target.value='';return;}
 if(file.size>15*1024*1024){say('This file is too large. Choose a PDF smaller than 15 MB.');event.target.value='';return;}
 busy=true;event.target.disabled=true;$('reparse').disabled=true;let task,doc;
 try{
  say('Opening PDF in your browser…');
  const pdfjs=await import('./vendor/pdfjs/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
  task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true});
  doc=await task.promise;if(doc.numPages>50)throw new Error('PAGE_LIMIT');
  const pages=[];
  for(let pageNumber=1;pageNumber<=doc.numPages;pageNumber++){
   say(`Reading page ${pageNumber} of ${doc.numPages}…`);
   const page=await doc.getPage(pageNumber);const content=await page.getTextContent();pages.push(pageText(content.items,page.getViewport({scale:1}).width));page.cleanup();
  }
  sourceText=pages.join('\n\n');
  if(sourceText.replace(/\s/g,'').length<20)throw new Error('NO_TEXT');
  populate(parseCV(sourceText));say('PDF imported. Check every field below: column order and section detection can need corrections. Nothing has been saved yet.');editor.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(error){
  const messages={PasswordException:'This PDF is password protected. Export an unlocked copy and try again.',InvalidPDFException:'This PDF could not be read. Try exporting it again from LinkedIn.',PAGE_LIMIT:'Choose a PDF with 50 pages or fewer.',NO_TEXT:'No readable text was found. This may be a scanned PDF; use a text-based LinkedIn PDF export.'};
  say(messages[error.name]||messages[error.message]||'The PDF could not be imported. Try a fresh LinkedIn export in an up-to-date browser. Your previous review is still available.');
 }finally{try{if(doc)await doc.destroy();else if(task)await task.destroy();}catch{}busy=false;event.target.disabled=false;$('reparse').disabled=false;event.target.value='';}
});
$('reparse').addEventListener('click',()=>{populate(parseCV($('source-text').value));say('Sections rebuilt from source text. Review your fields before saving.');});
$('save-cv').addEventListener('click',()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(collect()));say('Reviewed CV saved in this browser. You can view it on About. Your public portfolio is unchanged.');}catch{say('The CV could not be saved in browser storage. Download the reviewed JSON to keep a copy.');}});
$('download-cv').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='reviewed-linkedin-cv.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Reviewed CV downloaded as JSON.');});
$('clear-cv').addEventListener('click',()=>{try{localStorage.removeItem(STORAGE_KEY);populate({name:'',headline:'',location:'',sections:Object.fromEntries(Object.keys(SECTION_LABELS).map(key=>[key,''])),sourceText:''});editor.hidden=true;say('Saved CV and current review cleared from this browser.');}catch{say('Browser storage could not be cleared. Check your browser storage settings.');}});
