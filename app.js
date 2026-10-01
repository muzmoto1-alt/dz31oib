const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const days = ["Пн","Вт","Ср","Чт","Пт","Сб"];
const schedule = {
"Пн":[["09:45–11:20","Разговор о важном",""],["11:50–13:25","Физическая культура","Лапленков М.А."],["13:35–15:10","Базы данных","Лапленков М.А."],["15:40–17:15","Психология общения","Каврелищвили Л.Н."],["17:25–19:00","Базы данных","Лапленков М.А."]],
"Вт":[["13:35–15:10","Инженерно-технические средства физической защиты объектов информатизации","Арсаков Е.В."],["15:40–17:15","Сети и системы передачи информации","Арсаков Е.В."],["17:25–19:00","Иностранный язык группа профессиональной деятельности","Попова Е.Д."]],
"Ср":[["11:50–13:25","Технические средства информатизации","Поляков А.В."],["13:35–15:10","Эксплуатация компьютерных сетей","Поляков А.В."],["15:40–17:15","Инженерно-технические средства физической защиты объектов информатизации","Арсаков Е.В."]],
"Чт":[["13:35–15:10","Инженерно-технические средства физической защиты объектов информатизации","Арсаков Е.В."],["15:40–17:15","Технические средства информатизации","Поляков А.В."],["17:25–19:00","Эксплуатация компьютерных сетей","Поляков А.В."]],
"Пт":[["09:45–11:20","Сети и системы передачи информации","Арсаков Е.В."],["11:50–13:25","Инженерно-технические средства физической защиты объектов информатизации","Арсаков Е.В."],["13:35–15:10","Основы информационной безопасности","Кожанов А.Г."],["15:40–17:15","Основы информационной безопасности","Кожанов А.Г."]],
"Сб":[["09:45–11:20","Основы алгоритмизации и программирования","Лапленков М.А."],["11:50–13:25","Основы алгоритмизации и программирования","Лапленков М.А."]],
"Вс":[]
};
const allSubjects=[...new Set(Object.values(schedule).flat().map(x=>x[1]))];
const key="dz31oib_tasks_v1";
let tasks=JSON.parse(localStorage.getItem(key)||"[]");
let filter="all", selectedDay=days[0];

const $=id=>document.getElementById(id);
function save(){localStorage.setItem(key,JSON.stringify(tasks));render();}
function dateOnly(d){return new Date(d+"T00:00:00")}
function fmt(d){return dateOnly(d).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}
function iso(d){return d.toISOString().slice(0,10)}
function tomorrow(){let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);return iso(d)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function filesHtml(files){return files?.length?`<div class="file-list">${files.map(f=>`<span class="file-chip">📎 ${escapeHtml(f.name)}</span>`).join("")}</div>`:""}

function taskCard(t){
 const late=!t.done && t.due<iso(new Date());
 return `<article class="task-card ${t.done?"done":""}">
  <div class="task-top"><div class="task-subject">${escapeHtml(t.subject)}</div><div class="task-date">${escapeHtml(fmt(t.due))}</div></div>
  <div style="margin-top:7px"><span class="badge ${late?"late":""}">${t.done?"Выполнено":late?"Просрочено":"К сдаче"}</span></div>
  <div class="task-text">${escapeHtml(t.text)}</div>${filesHtml(t.files)}
  <div class="task-actions">
   <button onclick="toggleDone('${t.id}')">${t.done?"↩ Вернуть":"✓ Выполнено"}</button>
   <button onclick="editTask('${t.id}')">✎ Изменить</button>
   <button class="danger" onclick="removeTask('${t.id}')">Удалить</button>
  </div>
 </article>`;
}
function render(){
 const tom=tomorrow(), td=tasks.filter(t=>t.due===tom&&!t.done);
 $("tomorrowCount").textContent=`${td.length} ${td.length===1?"задание":td.length>=2&&td.length<=4?"задания":"заданий"}`;
 $("tomorrowList").innerHTML=td.map(taskCard).join("");
 $("emptyTomorrow").classList.toggle("hidden",td.length>0);

 let list=tasks.filter(t=>filter==="all"||filter==="active"&&!t.done||filter==="done"&&t.done)
  .sort((a,b)=>a.due.localeCompare(b.due));
 $("allTasks").innerHTML=list.map(taskCard).join("");
 $("emptyTasks").classList.toggle("hidden",list.length>0);

 $("daySchedule").innerHTML=(schedule[selectedDay]||[]).map(x=>`<div class="schedule-card"><div class="schedule-time">${x[0]}</div><div class="schedule-subject">${escapeHtml(x[1])}</div>${x[2]?`<div class="schedule-teacher">${escapeHtml(x[2])}</div>`:""}</div>`).join("") || `<div class="empty"><div class="empty-icon">☕</div><b>Занятий нет</b><span>Свободный день.</span></div>`;
 document.querySelectorAll(".day-tab").forEach(b=>b.classList.toggle("active",b.dataset.day===selectedDay));
}
function openModal(id=null){
 $("modal").classList.add("open"); $("editId").value=id||"";
 $("modalTitle").textContent=id?"Изменить ДЗ":"Новое ДЗ"; $("attached").innerHTML="";
 $("subject").innerHTML=allSubjects.map(s=>`<option>${escapeHtml(s)}</option>`).join("");
 if(id){let t=tasks.find(x=>x.id===id); $("subject").value=t.subject;$("due").value=t.due;$("text").value=t.text;$("attached").innerHTML=filesHtml(t.files)}
 else {$("due").value=tomorrow();$("text").value="";$("files").value=""}
}
function closeModal(){$("modal").classList.remove("open")}
window.toggleDone=id=>{let t=tasks.find(x=>x.id===id);t.done=!t.done;save()}
window.removeTask=id=>{if(confirm("Удалить это задание?")){tasks=tasks.filter(x=>x.id!==id);save()}}
window.editTask=id=>openModal(id);

$("taskForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const id=$("editId").value;
 const old=id?tasks.find(t=>t.id===id):null;
 const chosen=[...$("files").files];
 const fileData=[];
 for(const f of chosen){
   if(f.size>5*1024*1024){alert(`Файл «${f.name}» больше 5 МБ.`);return}
   fileData.push({name:f.name,size:f.size,type:f.type,data:await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})});
 }
 const item={id:id||crypto.randomUUID(),subject:$("subject").value,due:$("due").value,text:$("text").value.trim(),files:fileData.length?fileData:(old?.files||[]),done:old?.done||false};
 if(id) tasks=tasks.map(t=>t.id===id?item:t); else tasks.push(item);
 closeModal();save();
});
$("closeModal").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("addBtn").onclick=()=>openModal();$("addTop").onclick=()=>openModal();
document.querySelectorAll(".nav[data-screen]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(b.dataset.screen).classList.add("active");});
$("dayTabs").innerHTML=days.map(d=>`<button class="day-tab" data-day="${d}">${d}</button>`).join("");
document.querySelectorAll(".day-tab").forEach(b=>b.onclick=()=>{selectedDay=b.dataset.day;render()});
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});
$("themeBtn").onclick=()=>document.body.classList.toggle("dark");
if(tg?.initDataUnsafe?.user){$("tgUser").textContent=`Привет, ${tg.initDataUnsafe.user.first_name||""}!`}

render();
