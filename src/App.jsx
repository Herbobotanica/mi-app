import { api } from "./api.js";
import { useUI } from "./ui.jsx";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "herbo_v2";
const genId = () => Math.random().toString(36).slice(2, 9);
const fmt = (n, d = 2) => typeof n === "number" ? n.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const fmtARS = n => `$ ${fmt(n)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtF = s => s ? new Date(s + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const diasDesde = s => s ? Math.floor((Date.now() - new Date(s + "T12:00:00")) / 86400000) : null;
const getWeekRange = () => {
  const n = new Date(); const day = n.getDay();
  const mon = new Date(n); mon.setDate(n.getDate() - (day === 0 ? 6 : day - 1)); mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { start: mon, end: sun };
};

const DEMO = { 
  materias: [], 
  recetas: [], 
  produccion: [], 
  planes: [], 
  compras: [], 
  catalogo: [] 
};
function useMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}


function HerboLogo({ width = 100, color = "#ffffff" }) {
  return (
    <svg viewBox="0 0 239.27 78.82" width={width} height={width * (78.82 / 239.27)} fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M29.52,44.27h-16V77.66H0V1.05H13.5V33.39h16V1.05H43V77.66H29.52Z"/>
      <path d="M64.26,33.6H83.94V44.27H64.26V67.09H88.65V77.77H50.76V1.15H88.65V11.83H64.26Z"/>
      <path d="M116.57,45.32h-6.25V77.77H96.82V1.05h19.36q11,0,16.69,5t5.71,14.49V26q0,12.24-9.49,16.85l8.13,34.75H123Zm-6.25-10.68h5.51c3.25,0,5.61-.75,7.06-2.26s2.19-3.9,2.19-7.14v-4q0-5-2.19-7.24c-1.45-1.51-3.81-2.27-7.06-2.27h-5.51Z"/>
      <path d="M166.84,1.15q10.46,0,16,4.92t5.49,14.44v1.37q0,6.48-2.35,10.31a12.87,12.87,0,0,1-7.69,5.39v.21q6.27,1.66,9.1,6t2.83,12v2.62q0,9.53-5.71,14.44t-16.69,4.92H148V1.15ZM161.5,32.76h4.19q4.91,0,7-2.2t2.09-7.11V20.93q0-4.71-2-6.9t-6.44-2.2H161.5Zm0,34.33h5.86q4.92,0,7.12-2.26c1.46-1.5,2.2-3.9,2.2-7.2V53.42q0-5.14-2.31-7.56c-1.53-1.62-4.08-2.42-7.64-2.42H161.5Z"/>
      <path d="M239.27,19.36V59.45q0,9.1-5.81,14.24t-16,5.13q-10.16,0-15.91-5.13t-5.76-14.24V19.36q0-9.1,5.76-14.23T217.5,0q10.14,0,16,5.13T239.27,19.36Zm-29.94.13v40q0,8.7,8.17,8.7t8.27-8.7V19.49q0-4.3-2.1-6.56t-6.17-2.25a7.86,7.86,0,0,0-6.07,2.25Q209.33,15.18,209.33,19.49Z"/>
    </svg>
  );
}

const C = {
  bg:"#dedcd0", surface:"#f7f5ee", alt:"#e8e6dc", border:"#cbc8b5",
  sidebar:"#50645f", accent:"#c0ce5f", primary:"#50645f",
  text:"#2c2c20", muted:"#5c5c48", light:"#9a9882",
  danger:"#9e2010", dangerBg:"#faf0ee",
  warning:"#8a5a08", warningBg:"#faf0d8",
  success:"#4a6210", successBg:"#eef2cc",
  info:"#1a5080", infoBg:"#e4f0f8",
  terra:"#c5a06e", terraBg:"#f7edda",
  white:"#fefcf5",
};
const iSt = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, background:C.white, fontSize:14, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

const ESTADO_CFG = {
  por_hacer:  { label:"Por hacer",  color:"gray", dot:"#9a9882" },
  en_proceso: { label:"En proceso", color:"yellow", dot:"#c8880a" },
  producido:  { label:"Producido",  color:"green", dot:"#4a6210" },
};

const PRIORIDAD_CFG = {
  urgente: { label:"Urgente", dot:"#c0392b", bg:"#fdecea", color:"#c0392b" },
  atencion:{ label:"Atención", dot:"#d4a017", bg:"#fef9e4", color:"#9a6f00" },
  ok:      { label:"OK",      dot:"#4a6210", bg:"#eef2cc", color:"#4a6210" },
};

function PrioridadBtn({ valor, onChange }) {
  const cfg = PRIORIDAD_CFG[valor] || PRIORIDAD_CFG.ok;
  const ciclo = { urgente:"atencion", atencion:"ok", ok:"urgente" };
  return (
    <button onClick={()=>onChange(ciclo[valor]||"ok")} title="Cambiar prioridad" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,border:`1.5px solid ${cfg.dot}`,background:cfg.bg,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:cfg.color,whiteSpace:"nowrap"}}>
      <span style={{width:9,height:9,borderRadius:"50%",background:cfg.dot,flexShrink:0,boxShadow:`0 0 0 2px ${cfg.bg}, 0 0 0 3px ${cfg.dot}`}}/>
      {cfg.label}
    </button>
  );
}

function Btn({ children, onClick, variant="primary", size="md", disabled, full }) {
  const base = {
    display:"inline-flex", alignItems:"center", gap:6,
    border:"none", cursor:disabled?"not-allowed":"pointer",
    borderRadius:8, fontFamily:"inherit", fontWeight:600,
    opacity:disabled?0.45:1, whiteSpace:"nowrap", transition:"opacity .12s",
    ...(full?{width:"100%",justifyContent:"center"}:{}),
    ...(size==="sm"?{fontSize:12,padding:"5px 11px"}:{fontSize:14,padding:"9px 18px"}),
    ...(variant==="primary"?{background:C.primary,color:"#fff"}
      :variant==="danger"?{background:C.danger,color:"#fff"}
      :variant==="success"?{background:C.success,color:"#fff"}
      :variant==="info"?{background:C.info,color:"#fff"}
      :variant==="ghost"?{background:"transparent",color:C.muted,border:`1.5px solid ${C.border}`}
      :{background:C.alt,color:C.text,border:`1.5px solid ${C.border}`}),
  };
  return <button style={base} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Badge({ text, color="gray" }) {
  const m = {
    green:{bg:C.successBg,color:C.success}, yellow:{bg:C.warningBg,color:C.warning},
    red:{bg:C.dangerBg,color:C.danger}, gray:{bg:C.alt,color:C.muted},
    terra:{bg:C.terraBg,color:C.terra}, info:{bg:C.infoBg,color:C.info},
    lime:{bg:"#eef2cc",color:"#4a6210"},
  };
  const col = m[color] || m.gray;
  return <span style={{...col, fontSize:11, fontFamily:"monospace", fontWeight:700, padding:"3px 9px", borderRadius:20, whiteSpace:"nowrap", display:"inline-block"}}>{text}</span>;
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.por_hacer;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:20,
      ...(estado==="producido"?{background:C.successBg,color:C.success}
        :estado==="en_proceso"?{background:C.warningBg,color:C.warning}
        :{background:C.alt,color:C.muted})}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.dot,flexShrink:0}}/>
      {cfg.label}
    </span>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",color:C.muted,marginBottom:5}}>
        {label}{required && <span style={{color:C.danger}}> *</span>}
      </label>
      {children}
    </div>
  );
}
const TI = ({label,required,...p}) => <Field label={label} required={required}><input style={iSt} {...p}/></Field>;
const NI = ({label,required,...p}) => <Field label={label} required={required}><input type="number" style={iSt} {...p}/></Field>;
const SI = ({label,options,required,...p}) => <Field label={label} required={required}><select style={{...iSt,cursor:"pointer"}} {...p}><option value="">— seleccionar —</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>;
const TAI = ({label,required,...p}) => <Field label={label} required={required}><textarea style={{...iSt,resize:"vertical",minHeight:64}} {...p}/></Field>;

function Modal({ title, children, onClose, width=520 }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:0}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,borderRadius:"16px",width:"100%",maxWidth:width,maxHeight:"92vh",overflow:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{padding:"16px 20px 14px",borderBottom:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:C.surface,zIndex:1}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.text,margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:20,lineHeight:1,padding:"2px 6px",borderRadius:6}}>✕</button>
        </div>
        <div style={{padding:"20px"}}>{children}</div>
      </div>
    </div>
  );
}

function PH({ title, sub, action }) {
  return (
    <div style={{padding:"18px 18px 14px",borderBottom:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface,flexShrink:0,flexWrap:"wrap",gap:10}}>
      <div>
        <h1 style={{fontSize:20,fontWeight:800,color:C.text,margin:0,letterSpacing:-0.3}}>{title}</h1>
        {sub && <p style={{fontSize:12,color:C.muted,margin:"2px 0 0"}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Empty({ icon, text }) {
  return <div style={{textAlign:"center",padding:"40px 20px",color:C.light,fontSize:13}}><div style={{fontSize:30,marginBottom:8}}>{icon}</div>{text}</div>;
}

const TH = ({children,style:s={}}) => <th style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,borderBottom:`1.5px solid ${C.border}`,background:C.alt,whiteSpace:"nowrap",...s}}>{children}</th>;
const TD = ({children,mono,bold,color,style:s={}}) => <td style={{padding:"9px 12px",fontSize:13,fontFamily:mono?"monospace":"inherit",fontWeight:bold?600:400,color:color||C.text,borderBottom:`1px solid ${C.border}`,...s}}>{children}</td>;

function MCard({ children, style: s = {} }) {
  return <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,...s}}>{children}</div>;
}

function PrecioForm({ materia, onSave, onClose }) {
  const [modo,setModo] = useState("pct");
  const [pct,setPct] = useState("");
  const [pDir,setPDir] = useState(materia.precio);
  const pN = modo==="pct" ? (pct!==""?+(materia.precio*(1+Number(pct)/100)).toFixed(4):null) : pDir;
  const d = diasDesde(materia.fechaCosto);
  const tSt = a => ({flex:1,padding:"9px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:a?700:400,background:a?C.primary:C.alt,color:a?"#fff":C.muted,borderRadius:a?7:0});
  return (
    <Modal title="Actualizar precio" onClose={onClose} width={460}>
      <div style={{background:C.alt,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>{materia.nombre}</div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"monospace"}}>{fmtARS(materia.precio)} <span style={{fontSize:13,color:C.light}}>/ {materia.unidad}</span></div>
        {d!==null&&<div style={{fontSize:12,color:d>60?C.warning:C.light,marginTop:3}}>Actualizado hace {d} días ({fmtF(materia.fechaCosto)}){d>60?" ⚠":""}</div>}
      </div>
      <div style={{display:"flex",gap:4,background:C.alt,borderRadius:10,padding:4,marginBottom:16}}>
        <button style={tSt(modo==="pct")} onClick={()=>setModo("pct")}>% Aumento</button>
        <button style={tSt(modo==="dir")} onClick={()=>setModo("dir")}>Precio directo</button>
      </div>
      {modo==="pct"?(
        <div>
          <Field label="Porcentaje de aumento (%)">
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <input type="number" min={0} step={0.1} value={pct} onChange={e=>setPct(e.target.value)} style={{...iSt,flex:1,minWidth:80}} placeholder="Ej: 15"/>
              {[10,15,20,30,50].map(v=><button key={v} onClick={()=>setPct(v)} style={{padding:"9px 10px",border:`1.5px solid ${pct==v?C.primary:C.border}`,borderRadius:8,background:pct==v?C.primary:C.alt,color:pct==v?"#fff":C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>+{v}%</button>)}
            </div>
          </Field>
          {pN!==null&&<div style={{background:C.successBg,borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:12,color:C.success,marginBottom:2}}>Precio nuevo</div><div style={{fontSize:22,fontWeight:800,color:C.success,fontFamily:"monospace"}}>{fmtARS(pN)} <span style={{fontSize:13}}>/ {materia.unidad}</span></div><div style={{fontSize:12,color:C.success,marginTop:2}}>+ {fmtARS(pN-materia.precio)}</div></div>}
        </div>
      ):(
        <div>
          <NI label={`Precio nuevo ($ / ${materia.unidad})`} required value={pDir} min={0} step={0.01} onChange={e=>setPDir(Number(e.target.value))}/>
          {pDir!==materia.precio&&<div style={{background:pDir>materia.precio?C.successBg:C.warningBg,borderRadius:10,padding:"10px 14px"}}><span style={{fontSize:12,color:pDir>materia.precio?C.success:C.warning,fontFamily:"monospace",fontWeight:600}}>{pDir>materia.precio?"▲":"▼"} {fmt(Math.abs((pDir-materia.precio)/materia.precio*100),1)}% vs actual</span></div>}
        </div>
      )}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="success" disabled={pN===null||pN<=0} onClick={()=>{const n=pN;if(!n||n<=0)return;onSave({...materia,precio:n,fechaCosto:todayStr()});}}>Guardar precio</Btn>
      </div>
    </Modal>
  );
}

function Dashboard({ data, stockValue, lowStock, catalogoMap, setSection }) {
  const { end } = getWeekRange();
  const planSemana = data.planes.filter(p => { if(p.estado==="producido") return false; return new Date(p.fechaEntrega+"T12:00:00") <= end; }).sort((a,b)=>a.fechaEntrega.localeCompare(b.fechaEntrega));
  const comprasPend = data.compras.filter(c=>!c.completado);
  const preciosViejos = data.materias.filter(m=>{const d=diasDesde(m.fechaCosto);return d!==null&&d>60;});
  const recentProd = data.produccion.slice(0,4);
  const stats = [
    {label:"Valor del stock",val:fmtARS(stockValue),sub:`${data.materias.length} insumos`,color:C.primary},
    {label:"Por producir",val:data.planes.filter(p=>p.estado!=="producido").length,sub:"items por producir",color:C.info},
    {label:"Stock bajo mínimo",val:lowStock.length,sub:"alertas",color:lowStock.length>0?C.danger:C.success},
    {label:"Precios > 60 días",val:preciosViejos.length,sub:"para revisar",color:preciosViejos.length>0?C.warning:C.success},
  ];
  const Widget = ({title,btn,btnAct,children}) => (
    <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</span>
        {btn&&<button onClick={btnAct} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontFamily:"inherit",fontWeight:600}}>{btn}</button>}
      </div>
      {children}
    </div>
  );
  return (
    <div style={{flex:1,overflow:"auto"}}>
      <PH title="Dashboard" sub={new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>
      <div style={{padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
          {stats.map(s=>(
            <div key={s.label} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:5}}>{s.label}</div>
              <div style={{fontSize:24,fontWeight:800,color:s.color,letterSpacing:-0.5}}>{s.val}</div>
              <div style={{fontSize:11,color:C.light,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
          <Widget title="📋 Esta semana" btn="Ver plan →" btnAct={()=>setSection("plan")}>
            {planSemana.length===0?<Empty icon="✓" text="Sin órdenes para esta semana"/>:
              planSemana.map(p=>{
                const vencido=new Date(p.fechaEntrega+"T12:00:00")<new Date()&&p.estado!=="producido";
                return(<div key={p.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:vencido?C.dangerBg:"transparent"}}>
                  <div><div style={{fontSize:13,fontWeight:500}}>{catalogoMap?.[p.recetaId]?.nombre||"—"}</div><div style={{fontSize:11,fontFamily:"monospace",color:vencido?C.danger:C.muted}}>Entrega: {fmtF(p.fechaEntrega)} · {p.cantidad} uds</div></div>
                  <EstadoBadge estado={p.estado}/>
                </div>);
              })}
          </Widget>
          <Widget title="🛒 Compras pendientes" btn="Ver lista →" btnAct={()=>setSection("compras")}>
            {comprasPend.length===0?<Empty icon="✓" text="Sin compras pendientes"/>:
              comprasPend.slice(0,5).map(c=>(<div key={c.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{c.tipo==="auto"?c.materiaId:c.nombre}</div><div style={{fontSize:11,color:C.muted}}>{c.tipo==="auto"?`${fmt(c.cantSugerida,0)} unid`:c.cantidad}</div></div>
                <Badge text={c.tipo==="auto"?"stock bajo":"manual"} color={c.tipo==="auto"?"yellow":"gray"}/>
              </div>))}
            {comprasPend.length>5&&<div style={{padding:"8px 16px",fontSize:12,color:C.muted,textAlign:"center"}}>+ {comprasPend.length-5} más</div>}
          </Widget>
          <Widget title="📅 Precios sin actualizar" btn={preciosViejos.length>0?"Ver →":null} btnAct={()=>setSection("materias")}>
            {preciosViejos.length===0?<Empty icon="✓" text="Todos los precios actualizados"/>:
              preciosViejos.slice(0,4).map(m=>{const d=diasDesde(m.fechaCosto);return(<div key={m.id} style={{padding:"9px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:d>120?C.dangerBg:C.warningBg}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{m.nombre}</div><div style={{fontSize:11,fontFamily:"monospace",color:C.muted}}>{fmtARS(m.precio)} / {m.unidad}</div></div>
                <Badge text={`${d}d`} color={d>120?"red":"yellow"}/>
              </div>);})}
          </Widget>
          <Widget title="⊙ Producción reciente" btn="Ver todo →" btnAct={()=>setSection("produccion")}>
            {recentProd.length===0?<Empty icon="◎" text="Sin producciones registradas"/>:
              recentProd.map(p=>{const r=catalogoMap?.[p.recetaId];return(<div key={p.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{r?.nombre||"—"}</div><div style={{fontSize:11,fontFamily:"monospace",color:C.muted}}>{p.fecha} · {p.operador}</div></div>
                <Badge text={`${p.cantidad} uds`} color="lime"/>
              </div>);})}
          </Widget>
        </div>
      </div>
    </div>
  );
}

function Materias({ data, handlers, setModal }) {
  const isMobile = useMobile();
  const [search,setSearch] = useState("");
  const [prov,setProv] = useState("");
  const [sel,setSel] = useState(new Set());
  const [editCell,setEditCell] = useState(null);
  const [editVal,setEditVal] = useState("");
  const startEdit = (m,field) => { setEditCell({id:m.id,field}); setEditVal(String(field==="stock"?m.stock:m.stockMin)); };
  const commitEdit = (m) => { if(!editCell)return; const val=parseFloat(editVal); if(!isNaN(val)&&val>=0)handlers.saveMateria({...m,[editCell.field]:val}); setEditCell(null); };
  const onKey = (e,m) => { if(e.key==="Enter")commitEdit(m); if(e.key==="Escape")setEditCell(null); };
  const proveedores = [...new Set(data.materias.map(m=>m.proveedor).filter(Boolean))].sort();
  const filtered = data.materias.filter(m=>m.nombre.toLowerCase().includes(search.toLowerCase())&&(!prov||m.proveedor===prov));
  const allSelected = filtered.length>0&&filtered.every(m=>sel.has(m.id));
  const toggleAll = () => { if(allSelected){const s=new Set(sel);filtered.forEach(m=>s.delete(m.id));setSel(s);}else{const s=new Set(sel);filtered.forEach(m=>s.add(m.id));setSel(s);} };
  const toggleOne = id => { const s=new Set(sel); s.has(id)?s.delete(id):s.add(id); setSel(s); };
  const bulkDelete = async () => {
    const ok = await handlers.confirm(`¿Seguro que querés eliminar ${sel.size} insumo${sel.size > 1 ? "s" : ""}?`);
    if (!ok) return;
    handlers.delMaterias([...sel]);
    setSel(new Set());
  };  const st = m => {
    if(m.stockMin>0&&m.stock===0) return {label:"Sin stock",color:"red"};
    if(m.stockMin>0&&m.stock<=m.stockMin) return {label:"Bajo",color:"yellow"};
    if(m.stockMin===0) return {label:"—",color:"gray"};
    return {label:"OK",color:"lime"};
  };
  const inlineNum = (m, field) => {
    const active = editCell?.id===m.id&&editCell?.field===field;
    const val = field==="stock"?m.stock:m.stockMin;
    if(active) return <input autoFocus type="number" min={0} step={0.1} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>commitEdit(m)} onKeyDown={e=>onKey(e,m)} style={{width:"80px",padding:"3px 6px",fontSize:13,fontFamily:"monospace",border:`2px solid ${C.primary}`,borderRadius:5,background:C.white,outline:"none"}}/>;
    return <span onClick={()=>startEdit(m,field)} style={{cursor:"text",fontFamily:"monospace",fontSize:13,display:"inline-flex",alignItems:"center",gap:3}}>{fmt(val,field==="stock"?1:0)}<span style={{fontSize:9,color:C.light}}>✎</span></span>;
  };
  return (
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Materias Primas" sub={`${data.materias.length} insumos · ${filtered.length} visibles`} action={<Btn onClick={()=>setModal({type:"materia",data:null})}>+ Agregar</Btn>}/>
      <div style={{padding:"12px 16px 8px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{...iSt,width:"auto",flex:1,minWidth:140,fontSize:13}}/>
        <select value={prov} onChange={e=>setProv(e.target.value)} style={{...iSt,width:"auto",flex:1,minWidth:140,fontSize:13,cursor:"pointer"}}>
          <option value="">Todos los proveedores</option>
          {proveedores.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        {(search||prov)&&<Btn size="sm" variant="ghost" onClick={()=>{setSearch("");setProv("");}}>✕</Btn>}
        {sel.size>0&&<><Btn variant="danger" size="sm" onClick={bulkDelete}>🗑 Eliminar {sel.size}</Btn><Btn variant="ghost" size="sm" onClick={()=>setSel(new Set())}>Cancelar</Btn></>}
      </div>
      <div style={{padding:"0 16px 16px",flex:1,overflow:"auto"}}>
        {isMobile ? (
          <div>
            {filtered.map(m=>{
              const s=st(m); const d=diasDesde(m.fechaCosto); const viejo=d!==null&&d>60; const isSelected=sel.has(m.id);
              return (<MCard key={m.id} style={{background:isSelected?"#edf0e6":C.surface,borderColor:isSelected?C.primary:C.border}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1,marginRight:8}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>{m.nombre}</div>{m.proveedor&&<div style={{fontSize:11,color:C.light}}>{m.proveedor}</div>}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={isSelected} onChange={()=>toggleOne(m.id)} style={{width:16,height:16,accentColor:C.primary}}/><Badge text={s.label} color={s.color}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div style={{background:C.alt,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Stock · {m.unidad}</div>{inlineNum(m,"stock")}</div>
                  <div style={{background:C.alt,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Stock mín.</div>{inlineNum(m,"stockMin")}</div>
                  <div style={{background:C.alt,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Precio / {m.unidad}</div><div style={{fontSize:13,fontFamily:"monospace",fontWeight:600,color:viejo?C.warning:C.text}}>{fmtARS(m.precio)}{viejo&&<span style={{marginLeft:4}}>⚠</span>}</div></div>
                  <div style={{background:C.terraBg,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.terra,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Valor total</div><div style={{fontSize:13,fontFamily:"monospace",fontWeight:700,color:C.terra}}>{m.stock>0?fmtARS(m.stock*m.precio):"—"}</div></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn size="sm" variant="success" onClick={() => setModal({ type: "precio", data: m })}>$ ↑</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setModal({ type: "materia", data: m })}>✎ Editar</Btn>
                  <Btn size="sm" variant="danger" onClick={async () => {
                    const ok = await handlers.confirm("¿Seguro que querés eliminar este insumo?");
                    if (ok) handlers.delMaterias([m.id]);
                  }}>✕</Btn>
                </div>
              </MCard>);
            })}
            {filtered.length===0&&<Empty icon="◎" text="No se encontraron insumos"/>}
          </div>
        ) : (
          <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
              <colgroup><col style={{width:"4%"}}/><col style={{width:"22%"}}/><col style={{width:"7%"}}/><col style={{width:"9%"}}/><col style={{width:"14%"}}/><col style={{width:"9%"}}/><col style={{width:"11%"}}/><col style={{width:"8%"}}/><col style={{width:"16%"}}/></colgroup>
              <thead><tr><TH><input type="checkbox" checked={allSelected} onChange={toggleAll} style={{width:15,height:15,cursor:"pointer",accentColor:C.primary}}/></TH><TH>Insumo / Proveedor</TH><TH>Unidad</TH><TH>Stock ✎</TH><TH>Precio / unid</TH><TH>Mín. ✎</TH><TH>Valor total</TH><TH>Estado</TH><TH></TH></tr></thead>
              <tbody>
                {filtered.map((m,i)=>{
                  const s=st(m); const d=diasDesde(m.fechaCosto); const viejo=d!==null&&d>60; const isSelected=sel.has(m.id);
                  return(<tr key={m.id} style={{background:isSelected?"#edf0e6":i%2===0?C.surface:C.bg}}>
                    <TD><input type="checkbox" checked={isSelected} onChange={()=>toggleOne(m.id)} style={{width:15,height:15,cursor:"pointer",accentColor:C.primary}}/></TD>
                    <TD style={{overflow:"hidden"}}><div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.nombre}</div>{m.proveedor&&<div style={{fontSize:11,color:C.light}}>{m.proveedor}</div>}</TD>
                    <TD mono color={C.muted}>{m.unidad}</TD>
                    <TD>{inlineNum(m,"stock")}</TD>
                    <TD><div style={{fontSize:13,fontFamily:"monospace",fontWeight:600,color:viejo?C.warning:C.text}}>{fmtARS(m.precio)}</div>{m.fechaCosto&&<div style={{fontSize:10,color:viejo?C.warning:C.light}}>{fmtF(m.fechaCosto)}{viejo?" ⚠":""}</div>}</TD>
                    <TD>{inlineNum(m,"stockMin")}</TD>
                    <TD mono bold color={C.terra}>{m.stock>0?fmtARS(m.stock*m.precio):"—"}</TD>
                    <TD><Badge text={s.label} color={s.color}/></TD>
                    <TD><div style={{display:"flex",gap:4}}><Btn size="sm" variant="success" onClick={()=>setModal({type:"precio",data:m})}>$ ↑</Btn><Btn size="sm" variant="ghost" onClick={()=>setModal({type:"materia",data:m})}>✎</Btn><Btn size="sm" variant="danger" onClick={async()=>{const ok=await handlers.confirm(`¿Eliminar "${m.nombre}"?`);if(ok)handlers.delMaterias([m.id]);}}>✕</Btn></div></TD></tr>);
                })}
              </tbody>
            </table>
            {filtered.length===0&&<Empty icon="◎" text="No se encontraron insumos"/>}
          </div>
        )}
      </div>
    </div>
  );
}

const CAT_COLORS = {Home:{bg:"#e4f0f8",color:"#1a5080"},Humans:{bg:"#eef2cc",color:"#4a6210"},Kids:{bg:"#faf0d8",color:"#8a5a08"},Pets:{bg:"#f7edda",color:"#c5a06e"}};
const CATS_LIST = ["Home","Humans","Kids","Pets"];

function RecetasCatalogo({ data, handlers }) {
  const [catFiltro,setCatFiltro] = useState("Todos");
  const [buscar,setBuscar] = useState("");
  const [open,setOpen] = useState(null);
  const [editCell,setEditCell] = useState(null);
  const [editVal,setEditVal] = useState("");
  const [editText,setEditText] = useState(null);
  const [editTextVal,setEditTextVal] = useState("");
  const recetas = data.catalogo || [];
  const filtered = recetas.filter(r=>{ const matchCat=catFiltro==="Todos"||r.categoria===catFiltro; const matchBus=!buscar||r.nombre.toLowerCase().includes(buscar.toLowerCase())||r.sku.toLowerCase().includes(buscar.toLowerCase()); return matchCat&&matchBus; });
  const costoReceta = r => r.ingredientes.reduce((s,i)=>s+(i.cantidad*(i.costoUnitario||0)),0);
  const updateReceta = (rId, updater) => {
    const recetaActualizada = updater(recetas.find(r => r.id === rId));
    // Actualiza UI local inmediatamente
    handlers.saveCatalogoLocal(recetas.map(r => r.id === rId ? recetaActualizada : r));
    // Persiste en Sheets solo esa receta
    handlers.saveReceta(recetaActualizada);
  };
  const startEdit = (rId,idx,field,val) => { setEditCell({rId,idx,field}); setEditVal(String(val)); setEditText(null); };
  const commitEdit = () => {
    if(!editCell)return;
    const val = parseFloat(editVal);
    if(!isNaN(val)&&val>=0) updateReceta(editCell.rId,r=>{ const ings=r.ingredientes.map((ing,i)=>{ if(i!==editCell.idx)return ing; const u={...ing,[editCell.field]:val}; u.costoTotal=+(u.cantidad*u.costoUnitario).toFixed(4); return u; }); return{...r,ingredientes:ings,costoTotal:+ings.reduce((s,i)=>s+i.costoTotal,0).toFixed(2)}; });
    setEditCell(null);
  };
  const onKeyN = e => { if(e.key==="Enter")commitEdit(); if(e.key==="Escape")setEditCell(null); };
  const startEditText = (rId,idx,field,val) => { setEditText({rId,idx,field}); setEditTextVal(val||""); setEditCell(null); };
  const commitEditText = () => { if(!editText)return; updateReceta(editText.rId,r=>({...r,ingredientes:r.ingredientes.map((ing,i)=>i===editText.idx?{...ing,[editText.field]:editTextVal}:ing)})); setEditText(null); };
  const onKeyT = e => { if(e.key==="Enter")commitEditText(); if(e.key==="Escape")setEditText(null); };
  const changeCategoria = (rId,cat) => updateReceta(rId,r=>({...r,categoria:cat}));
  const addIng = rId => updateReceta(rId,r=>({...r,ingredientes:[...r.ingredientes,{insumo:"",proveedor:"",unidad:"",cantidad:0,costoUnitario:0,costoTotal:0}]}));
  const delIng = (rId,idx) => updateReceta(rId,r=>{ const ings=r.ingredientes.filter((_,i)=>i!==idx); return{...r,ingredientes:ings,costoTotal:+ings.reduce((s,i)=>s+i.costoTotal,0).toFixed(2)}; });
  const numCell = (rId,idx,field,val) => {
    const active=editCell?.rId===rId&&editCell?.idx===idx&&editCell?.field===field;
    if(active)return <input autoFocus type="number" min={0} step={0.01} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={onKeyN} style={{width:80,padding:"2px 5px",fontSize:12,fontFamily:"monospace",border:`2px solid ${C.primary}`,borderRadius:4,background:C.white,outline:"none"}}/>;
    return <span onClick={()=>startEdit(rId,idx,field,val)} style={{cursor:"text",fontFamily:"monospace",fontSize:12,display:"inline-flex",alignItems:"center",gap:3}}>{fmt(val,val<1?4:2)}<span style={{fontSize:9,color:C.light}}>✎</span></span>;
  };
  const txtCell = (rId,idx,field,val,ph="") => {
    const active=editText?.rId===rId&&editText?.idx===idx&&editText?.field===field;
    if(active)return <input autoFocus value={editTextVal} onChange={e=>setEditTextVal(e.target.value)} onBlur={commitEditText} onKeyDown={onKeyT} placeholder={ph} style={{width:"100%",padding:"2px 5px",fontSize:12,border:`2px solid ${C.primary}`,borderRadius:4,background:C.white,outline:"none",fontFamily:"inherit"}}/>;
    return <span onClick={()=>startEditText(rId,idx,field,val)} style={{cursor:"text",fontSize:12,display:"inline-flex",alignItems:"center",gap:3,color:val?C.text:C.light}}>{val||ph}<span style={{fontSize:9,color:C.light,marginLeft:2}}>✎</span></span>;
  };
  return (
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Recetas & Fichas" sub={`${recetas.length} productos · ${filtered.length} visibles`}/>
      <div style={{padding:"12px 16px 8px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar nombre o SKU..." style={{...iSt,flex:1,minWidth:160,fontSize:13}}/>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {["Todos",...CATS_LIST].map(c=>{ const cfg=CAT_COLORS[c]||{}; return <button key={c} onClick={()=>setCatFiltro(c)} style={{padding:"6px 12px",border:`1.5px solid ${catFiltro===c?(cfg.color||C.primary):C.border}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:catFiltro===c?700:400,background:catFiltro===c?(cfg.bg||C.primary):C.surface,color:catFiltro===c?(cfg.color||"#fff"):C.muted}}>{c}</button>; })}
        </div>
      </div>
      <div style={{padding:"0 16px 16px",flex:1}}>
        {filtered.length===0?<Empty icon="⊕" text="No se encontraron productos"/>:(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(r=>{
              const isOpen=open===r.id; const costo=costoReceta(r); const catCfg=CAT_COLORS[r.categoria]||{bg:C.alt,color:C.muted};
              return(
                <div key={r.id} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,justifyContent:"space-between",flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setOpen(isOpen?null:r.id)}>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nombre}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:C.light,marginTop:1}}>SKU: {r.sku}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <select value={r.categoria} onChange={e=>{e.stopPropagation();changeCategoria(r.id,e.target.value);}} onClick={e=>e.stopPropagation()} style={{padding:"4px 8px",fontSize:11,fontFamily:"monospace",fontWeight:700,border:`1.5px solid ${C.border}`,borderRadius:6,cursor:"pointer",background:catCfg.bg,color:catCfg.color,outline:"none"}}>
                        {CATS_LIST.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                      <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.muted}}>Costo</div><div style={{fontSize:14,fontWeight:800,color:C.terra,fontFamily:"monospace"}}>{fmtARS(costo)}</div></div>
                      <span style={{fontSize:14,color:C.light,cursor:"pointer"}} onClick={()=>setOpen(isOpen?null:r.id)}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{borderTop:`1.5px solid ${C.border}`}}>
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                          <thead><tr><TH>Insumo ✎</TH><TH>Proveedor ✎</TH><TH>Unidad ✎</TH><TH>Cantidad ✎</TH><TH>Costo Unit. ✎</TH><TH>Costo</TH><TH></TH></tr></thead>
                          <tbody>
                            {r.ingredientes.map((ing,idx)=>(
                              <tr key={idx} style={{background:idx%2===0?C.surface:C.bg}}>
                                <TD style={{fontSize:12}}>{txtCell(r.id,idx,"insumo",ing.insumo,"insumo")}</TD>
                                <TD style={{fontSize:11}}>{txtCell(r.id,idx,"proveedor",ing.proveedor,"proveedor")}</TD>
                                <TD style={{fontSize:12}}>{txtCell(r.id,idx,"unidad",ing.unidad,"unid")}</TD>
                                <TD>{numCell(r.id,idx,"cantidad",ing.cantidad)}</TD>
                                <TD>{numCell(r.id,idx,"costoUnitario",ing.costoUnitario)}</TD>
                                <TD mono bold color={C.terra} style={{fontSize:12}}>{fmtARS(ing.cantidad*(ing.costoUnitario||0))}</TD>
                                <TD><button onClick={()=>delIng(r.id,idx)} style={{width:24,height:24,background:C.dangerBg,color:C.danger,border:"none",borderRadius:4,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></TD>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{background:C.alt}}>
                              <td colSpan={3} style={{padding:"9px 12px"}}><button onClick={()=>addIng(r.id)} style={{fontSize:12,color:C.primary,background:"none",border:`1.5px dashed ${C.primary}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Agregar insumo</button></td>
                              <td colSpan={2} style={{padding:"9px 12px",fontSize:12,fontWeight:700,color:C.muted,textAlign:"right"}}>COSTO TOTAL</td>
                              <td style={{padding:"9px 12px",fontSize:14,fontWeight:800,color:C.terra,fontFamily:"monospace"}}>{fmtARS(costo)}</td>
                              <td/>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanProduccion({ data, handlers, setModal }) {
  const isMobile = useMobile();
  const [filtroEstado,setFiltroEstado] = useState("activos");
  const cMap = Object.fromEntries((data.catalogo||[]).map(r=>[r.id,r]));
  const getNombre = id => cMap[id]?.nombre||"Producto eliminado";
  const filtered = data.planes.filter(p=>{ if(filtroEstado==="activos")return p.estado!=="producido"; if(filtroEstado==="producido")return p.estado==="producido"; return true; }).sort((a,b)=>a.fechaEntrega.localeCompare(b.fechaEntrega));
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  return (
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Plan de Producción" sub={`${data.planes.filter(p=>p.estado!=="producido").length} órdenes activas`}
        action={<div style={{display:"flex",gap:8}}><Btn variant="ghost" size="sm" onClick={()=>setModal({type:"csvPlan"})}>⬆ CSV</Btn><Btn onClick={()=>setModal({type:"plan",data:null})}>+ Nueva orden</Btn></div>}/>
      <div style={{padding:"12px 16px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
        {[["activos","Activas"],["producido","Producidas"],["todos","Todas"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFiltroEstado(v)} style={{padding:"6px 14px",border:`1.5px solid ${C.border}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:filtroEstado===v?C.primary:C.surface,color:filtroEstado===v?"#fff":C.muted,fontWeight:filtroEstado===v?700:400}}>{l}</button>
        ))}
      </div>
      <div style={{padding:"0 16px 16px",flex:1}}>
        {isMobile ? (
          <div>
            {filtered.map(p=>{
              const d=new Date(p.fechaEntrega+"T12:00:00"); const vencido=d<hoy&&p.estado!=="producido";
              return (<MCard key={p.id} style={{background:vencido?C.dangerBg:C.surface}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1,marginRight:8}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>{getNombre(p.recetaId)}</div><div style={{fontSize:12,fontFamily:"monospace",color:vencido?C.danger:C.muted,marginTop:2}}>Entrega: {fmtF(p.fechaEntrega)}{vencido?" — Vencida":""}</div></div>
                  <EstadoBadge estado={p.estado}/>
                </div>
                <div style={{marginBottom:10}}><PrioridadBtn valor={p.prioridad||"ok"} onChange={v=>handlers.savePlan({...p,prioridad:v})}/></div>
                <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                  <div style={{background:C.alt,borderRadius:8,padding:"6px 10px",fontSize:12}}><span style={{color:C.muted}}>Cantidad: </span><strong>{p.cantidad} uds</strong></div>
                  {p.totalProducido>0&&<div style={{background:C.successBg,borderRadius:8,padding:"6px 10px",fontSize:12,color:C.success}}><strong>Producido: {p.totalProducido} uds</strong></div>}
                </div>
                {p.notas&&<div style={{fontSize:12,color:C.muted,marginBottom:10,fontStyle:"italic"}}>{p.notas}</div>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {p.estado==="por_hacer"&&<Btn size="sm" variant="info" onClick={()=>handlers.updatePlanEstado(p.id,"en_proceso",{})}>▶ En proceso</Btn>}
                  {p.estado==="en_proceso"&&<Btn size="sm" variant="success" onClick={()=>setModal({type:"producido",plan:p})}>✓ Producido</Btn>}
                  {p.estado!=="producido"&&<Btn size="sm" variant="ghost" onClick={()=>setModal({type:"plan",data:p})}>✎ Editar</Btn>}
                  <Btn size="sm" variant="danger" onClick={async () => {
                    const ok = await handlers.confirm("¿Seguro que querés eliminar este plan de producción?");
                    if (ok) handlers.delPlan(p.id);
                  }}>✕</Btn>
                </div>
              </MCard>);
            })}
            {filtered.length===0&&<Empty icon="📋" text="No hay órdenes en este estado"/>}
          </div>
        ) : (
          <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><TH>Producto</TH><TH>Prioridad</TH><TH>Cantidad</TH><TH>Fecha de entrega</TH><TH>Producido</TH><TH>Estado</TH><TH>Notas</TH><TH></TH></tr></thead>
              <tbody>
                {filtered.map((p,i)=>{
                  const d=new Date(p.fechaEntrega+"T12:00:00"); const vencido=d<hoy&&p.estado!=="producido";
                  return(<tr key={p.id} style={{background:vencido?C.dangerBg:i%2===0?C.surface:C.bg}}>
                    <TD bold>{getNombre(p.recetaId)}</TD>
                    <TD><PrioridadBtn valor={p.prioridad||"ok"} onChange={v=>handlers.savePlan({...p,prioridad:v})}/></TD>
                    <TD mono color={C.muted}>{p.cantidad} uds</TD>
                    <TD><div style={{fontSize:13,fontFamily:"monospace",color:vencido?C.danger:C.text,fontWeight:vencido?700:400}}>{fmtF(p.fechaEntrega)}</div>{vencido&&<div style={{fontSize:10,color:C.danger}}>Vencida</div>}</TD>
                    <TD mono color={p.totalProducido>0?C.success:C.light}>{p.totalProducido>0?`${p.totalProducido} uds`:"—"}</TD>
                    <TD><EstadoBadge estado={p.estado}/></TD>
                    <TD color={C.muted} style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notas||"—"}</TD>
                    <TD>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {p.estado==="por_hacer"&&<Btn size="sm" variant="info" onClick={()=>handlers.updatePlanEstado(p.id,"en_proceso",{})}>▶ En proceso</Btn>}
                        {p.estado==="en_proceso"&&<Btn size="sm" variant="success" onClick={()=>setModal({type:"producido",plan:p})}>✓ Producido</Btn>}
                        {p.estado!=="producido"&&<Btn size="sm" variant="ghost" onClick={()=>setModal({type:"plan",data:p})}>✎</Btn>}
                        <Btn size="sm" variant="danger" onClick={async () => {
                          const ok = await handlers.confirm("¿Seguro que querés eliminar este plan de producción?");
                          if (ok) handlers.delPlan(p.id);
                        }}>✕</Btn>
                      </div>
                    </TD>
                  </tr>);
                })}
              </tbody>
            </table>
            {filtered.length===0&&<Empty icon="📋" text="No hay órdenes en este estado"/>}
          </div>
        )}
        <div style={{marginTop:12,padding:"10px 14px",background:C.alt,borderRadius:8,fontSize:11,color:C.muted}}>
          CSV: <code style={{fontFamily:"monospace",background:C.bg,padding:"1px 4px",borderRadius:3}}>producto,cantidad,fecha_entrega,notas</code>
        </div>
      </div>
    </div>
  );
}

function Calculador({ data, setModal }) {
  const catalogo = data.catalogo || [];
  const [rId,setRId] = useState(catalogo[0]?.id||"");
  const [qty,setQty] = useState(50);
  const receta = catalogo.find(r=>r.id===rId);
  const mByNombre = Object.fromEntries(data.materias.map(m=>[m.nombre.toLowerCase().trim(),m]));
  const calc = receta ? receta.ingredientes.map(ing=>{ const m=mByNombre[ing.insumo?.toLowerCase().trim()]; const nec=ing.cantidad*qty; const disp=m?.stock||0; return{nombre:ing.insumo,unidad:ing.unidad,materia:m,necesario:nec,disponible:disp,deficit:disp-nec}; }) : [];
  const ok = calc.length>0&&calc.every(r=>r.deficit>=0);
  const cost = receta ? receta.ingredientes.reduce((s,ing)=>s+(ing.cantidad*(ing.costoUnitario||0)*qty),0) : 0;
  return (
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Calculador" sub="Verificá materiales antes de producir"/>
      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:16}}>
          <Field label="Producto" required>
            <select value={rId} onChange={e=>setRId(e.target.value)} style={{...iSt,cursor:"pointer"}}>
              <option value="">— seleccionar —</option>
              {CATS_LIST.map(cat=>(<optgroup key={cat} label={cat}>{catalogo.filter(r=>r.categoria===cat).map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</optgroup>))}
            </select>
          </Field>
          <NI label="Cantidad a producir (unidades)" required value={qty} min={1} onChange={e=>setQty(Number(e.target.value))}/>
          {receta&&(<div style={{padding:"12px",background:ok?C.successBg:C.dangerBg,borderRadius:10,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:ok?C.success:C.danger,marginBottom:4}}>{ok?"✓ Stock suficiente":"✗ Stock insuficiente"}</div>
            <div style={{fontSize:12,color:C.muted}}>Costo total: {fmtARS(cost)}</div>
            <div style={{fontSize:12,color:C.muted}}>Por unidad: {fmtARS(cost/qty)}</div>
          </div>)}
          {receta&&<Btn full onClick={()=>setModal({type:"produccionCat",recetaId:rId,cantidad:qty})} disabled={!ok}>⊙ Registrar producción</Btn>}
        </div>
        {receta&&(<div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:14}}>{receta.nombre} · {qty} unidades</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}>
              <thead><tr><TH>Ingrediente</TH><TH>Necesario</TH><TH>En stock</TH><TH>Diferencia</TH><TH>Estado</TH></tr></thead>
              <tbody>{calc.map((row,i)=>{ const o=row.deficit>=0; return(<tr key={i} style={{background:o?(i%2===0?C.surface:C.bg):C.dangerBg}}>
                <TD bold style={{fontSize:13}}>{row.nombre}</TD>
                <TD mono color={C.muted}>{fmt(row.necesario,2)} {row.unidad}</TD>
                <TD mono bold color={o?C.success:C.danger}>{row.materia?fmt(row.disponible,2):"—"}{!row.materia&&<span style={{fontSize:10,color:C.warning,marginLeft:4}}>sin materia</span>}</TD>
                <TD mono bold color={o?C.success:C.danger}>{row.materia?(o?"+":"")+fmt(row.deficit,2):"—"}</TD>
                <TD><Badge text={!row.materia?"Sin materia":o?"OK":"Falta"} color={!row.materia?"yellow":o?"lime":"red"}/></TD>
              </tr>);})}
              </tbody>
            </table>
          </div>
        </div>)}
        {!receta&&<Empty icon="⊘" text="Seleccioná un producto para calcular"/>}
      </div>
    </div>
  );
}

function Produccion({ data, catalogoMap, handlers, setModal }) {
  const isMobile = useMobile();
  const [filter,setFilter] = useState("");
  const filtered = data.produccion.filter(p=>{ if(!filter)return true; const r=catalogoMap?.[p.recetaId]; return r?.nombre.toLowerCase().includes(filter.toLowerCase())||p.operador.toLowerCase().includes(filter.toLowerCase()); });
  return (
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Control de Producción" sub={`${data.produccion.length} lotes`} action={<Btn onClick={()=>setModal({type:"produccionCat",recetaId:(data.catalogo||[])[0]?.id||"",cantidad:50})}>+ Registrar lote</Btn>}/>
      <div style={{padding:"12px 16px 8px"}}><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar..." style={{...iSt,fontSize:13}}/></div>
      <div style={{padding:"0 16px 16px"}}>
        {isMobile ? (
          <div>
            {filtered.map(p=>{ const r=catalogoMap?.[p.recetaId]; return(<MCard key={p.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div><div style={{fontSize:14,fontWeight:700}}>{r?.nombre||"—"}</div><div style={{fontSize:11,fontFamily:"monospace",color:C.muted}}>{p.fecha} · {p.operador}</div></div>
                <Badge text={`${p.cantidad} uds`} color="lime"/>
              </div>
              {p.notas&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic",marginBottom:8}}>{p.notas}</div>}
              <Btn size="sm" variant="danger" onClick={async () => {
                const ok = await handlers.confirm("¿Seguro que querés eliminar este lote?");
                if (ok) handlers.delProduccion(p.id);
              }}>✕ Eliminar</Btn>
            </MCard>);})}
            {filtered.length===0&&<Empty icon="◎" text="No hay lotes registrados"/>}
          </div>
        ) : (
          <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><TH>Fecha</TH><TH>Producto</TH><TH>Cantidad</TH><TH>Operador</TH><TH>Notas</TH><TH></TH></tr></thead>
              <tbody>{filtered.map((p,i)=>{ const r=catalogoMap?.[p.recetaId]; return(<tr key={p.id} style={{background:i%2===0?C.surface:C.bg}}>
                <TD mono color={C.muted}>{p.fecha}</TD><TD bold>{r?.nombre||"—"}</TD>
                <TD><Badge text={`${p.cantidad} uds`} color="lime"/></TD>
                <TD color={C.muted}>{p.operador}</TD>
                <TD color={C.muted} style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notas||"—"}</TD>
                <TD><Btn size="sm" variant="danger" onClick={async () => {
                  const ok = await handlers.confirm("¿Seguro que querés eliminar este lote?");
                  if (ok) handlers.delProduccion(p.id);
                }}>✕</Btn></TD>              
                </tr>);})}
              </tbody>
            </table>
            {filtered.length===0&&<Empty icon="◎" text="No hay lotes registrados"/>}
          </div>
        )}
      </div>
    </div>
  );
}

function Compras({ data, materiasMap, lowStock, handlers, setModal }) {
  const pend=data.compras.filter(c=>!c.completado), comp=data.compras.filter(c=>c.completado);
  const auto=pend.filter(c=>c.tipo==="auto"), manual=pend.filter(c=>c.tipo==="manual");
  const ri = c => { const m=c.tipo==="auto"?materiasMap[c.materiaId]:null; return(
    <div key={c.id} style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.surface}}>
      <input type="checkbox" checked={c.completado} onChange={()=>handlers.toggleCompra(c.id)} style={{width:18,height:18,cursor:"pointer",accentColor:C.primary,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:500}}>{m?m.nombre:c.nombre}</div>
        <div style={{fontSize:11,fontFamily:"monospace",color:C.muted,marginTop:1}}>{m?`${fmt(c.cantSugerida,0)} ${m.unidad} · Stock: ${fmt(m.stock,0)} · ${m.proveedor||"—"}`:c.cantidad}{c.nota?` · ${c.nota}`:""}</div>
      </div>
      <Badge text={c.tipo==="auto"?"auto":"manual"} color={c.tipo==="auto"?"yellow":"gray"}/>
      <Btn size="sm" variant="danger" onClick={()=>handlers.delCompra(c.id)}>✕</Btn>
    </div>
  );};
  const Section = ({label,color,items}) => items.length===0?null:(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color,marginBottom:8}}>{label}</div>
      <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>{items.map(ri)}</div>
    </div>
  );
  return (
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <PH title="Lista de Compras" sub={`${pend.length} ítems pendientes`}
        action={<div style={{display:"flex",gap:8}}><Btn variant="ghost" size="sm" onClick={handlers.generateCompras}>⟳ Alertas</Btn><Btn onClick={()=>setModal({type:"compraManual"})}>+ Manual</Btn></div>}/>
      <div style={{padding:"16px"}}>
        {pend.length===0&&<Empty icon="✓" text="Lista vacía. Generá desde las alertas o agregá ítems manualmente."/>}
        <Section label="⚠ Stock crítico" color={C.warning} items={auto}/>
        <Section label="Ítems manuales" color={C.muted} items={manual}/>
        {comp.length>0&&<div style={{opacity:.6}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.light,marginBottom:8}}>✓ Completadas ({comp.length})</div>
          <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
            {comp.map(c=>{ const m=c.tipo==="auto"?materiasMap[c.materiaId]:null; return(<div key={c.id} style={{padding:"9px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,textDecoration:"line-through"}}>
              <input type="checkbox" checked onChange={()=>handlers.toggleCompra(c.id)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary}}/>
              <span style={{fontSize:13,color:C.muted,flex:1}}>{m?m.nombre:c.nombre}</span>
              <Btn size="sm" variant="ghost" onClick={()=>handlers.delCompra(c.id)}>✕</Btn>
            </div>);})}
          </div>
        </div>}
      </div>
    </div>
  );
}

function MateriaForm({ item, onSave, onClose }) {
  const [f,setF]=useState(item||{nombre:"",proveedor:"",unidad:"ml",stock:0,precio:0,stockMin:0,fechaCosto: item?.fechaCosto || todayStr()});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title={item?"Editar insumo":"Nuevo insumo"} onClose={onClose}>
    <TI label="Nombre" required value={f.nombre} onChange={e=>s("nombre",e.target.value)}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <TI label="Proveedor" value={f.proveedor} onChange={e=>s("proveedor",e.target.value)}/>
      <TI label="Unidad" required value={f.unidad} onChange={e=>s("unidad",e.target.value)} placeholder="ml / unid / g..."/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <NI label="Stock actual" value={f.stock} min={0} step={0.01} onChange={e=>s("stock",Number(e.target.value))}/>
      <NI label="Stock mínimo" value={f.stockMin} min={0} step={1} onChange={e=>s("stockMin",Number(e.target.value))}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <NI label="Precio por unidad ($)" value={f.precio} min={0} step={0.01} onChange={e=>s("precio",Number(e.target.value))}/>
      <TI label="Fecha de precio" type="date" value={f.fechaCosto} onChange={e=>s("fechaCosto",e.target.value)}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.nombre.trim())return;onSave({...f,id:item?.id||genId()});}} disabled={!f.nombre.trim()}>Guardar</Btn>
    </div>
  </Modal>);
}

function PlanForm({ item, catalogo, onSave, onClose }) {
  const [f,setF]=useState(item||{recetaId:catalogo[0]?.id||"",cantidad:50,fechaEntrega:todayStr(),notas:"",estado:"por_hacer",totalProducido:0,prioridad:"ok"});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title={item?"Editar orden":"Nueva orden de producción"} onClose={onClose}>
    <Field label="Producto" required>
      <select value={f.recetaId} onChange={e=>s("recetaId",e.target.value)} style={{...iSt,cursor:"pointer"}}>
        <option value="">— seleccionar —</option>
        {CATS_LIST.map(cat=>(<optgroup key={cat} label={cat}>{catalogo.filter(r=>r.categoria===cat).map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</optgroup>))}
      </select>
    </Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <NI label="Cantidad a producir" required value={f.cantidad} min={1} onChange={e=>s("cantidad",Number(e.target.value))}/>
      <TI label="Fecha de entrega" required type="date" value={f.fechaEntrega} onChange={e=>s("fechaEntrega",e.target.value)}/>
    </div>
    <TAI label="Notas" value={f.notas} onChange={e=>s("notas",e.target.value)} placeholder="Observaciones de la orden..."/>
    <Field label="Prioridad">
      <div style={{display:"flex",gap:8}}>
        {Object.entries(PRIORIDAD_CFG).map(([k,cfg])=>(
          <button key={k} onClick={()=>s("prioridad",k)} style={{flex:1,padding:"8px",border:`2px solid ${f.prioridad===k?cfg.dot:C.border}`,borderRadius:8,cursor:"pointer",background:f.prioridad===k?cfg.bg:C.surface,fontFamily:"inherit",fontSize:13,fontWeight:f.prioridad===k?700:400,color:f.prioridad===k?cfg.color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:cfg.dot,flexShrink:0}}/>{cfg.label}
          </button>
        ))}
      </div>
    </Field>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.recetaId)return;onSave({...f,id:item?.id||genId()});}} disabled={!f.recetaId}>Guardar orden</Btn>
    </div>
  </Modal>);
}

function ProducidoForm({ plan, catalogoMap, onSave, onClose }) {
  const r = catalogoMap[plan.recetaId];
  const [f,setF]=useState({totalProducido:plan.cantidad,operador:"Euge",fecha:todayStr(),notas:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title="Marcar como Producido" onClose={onClose} width={460}>
    <div style={{background:C.alt,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Orden de producción</div>
      <div style={{fontSize:16,fontWeight:700}}>{r?.nombre||"—"}</div>
      <div style={{fontSize:12,color:C.muted,marginTop:2}}>Planificado: {plan.cantidad} uds · Entrega: {fmtF(plan.fechaEntrega)}</div>
    </div>
    <NI label="Total producido (unidades reales)" required value={f.totalProducido} min={0} onChange={e=>s("totalProducido",Number(e.target.value))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <TI label="Operador" required value={f.operador} onChange={e=>s("operador",e.target.value)}/>
      <TI label="Fecha de producción" required type="date" value={f.fecha} onChange={e=>s("fecha",e.target.value)}/>
    </div>
    <TAI label="Notas del lote" value={f.notas} onChange={e=>s("notas",e.target.value)}/>
    <div style={{padding:"10px 12px",background:C.infoBg,borderRadius:8,marginBottom:14,fontSize:12,color:C.info}}>ℹ Al confirmar, se registrará automáticamente en Control de Producción.</div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn variant="success" onClick={()=>onSave(f)} disabled={f.totalProducido<=0||!f.operador.trim()}>✓ Confirmar</Btn>
    </div>
  </Modal>);
}

function ProduccionForm({ recetaId:dR, cantidad:dQ, recetas, onSave, onClose }) {
  const [f,setF]=useState({recetaId:dR||recetas[0]?.id||"",fecha:todayStr(),cantidad:dQ||1,operador:"Euge",notas:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title="Registrar producción" onClose={onClose}>
    <SI label="Producto" required value={f.recetaId} onChange={e=>s("recetaId",e.target.value)} options={recetas.map(r=>({value:r.id,label:r.nombre}))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <TI label="Fecha" required type="date" value={f.fecha} onChange={e=>s("fecha",e.target.value)}/>
      <NI label="Cantidad (unidades)" required value={f.cantidad} min={1} onChange={e=>s("cantidad",Number(e.target.value))}/>
    </div>
    <TI label="Operador" required value={f.operador} onChange={e=>s("operador",e.target.value)}/>
    <TAI label="Notas" value={f.notas} onChange={e=>s("notas",e.target.value)}/>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.recetaId)return;onSave(f);}} disabled={!f.recetaId}>Registrar lote</Btn>
    </div>
  </Modal>);
}

function CSVPlanForm({ catalogo, onSave, onClose }) {
  const [csvText,setCsvText]=useState(""); const [preview,setPreview]=useState([]); const [errors,setErrors]=useState([]);
  const nameMap=Object.fromEntries(catalogo.map(r=>[r.nombre.toLowerCase().trim(),r.id]));
  const parseCSV=text=>{
    const lines=text.trim().split("\n").filter(l=>l.trim());
    if(!lines.length){setPreview([]);setErrors([]);return;}
    const first=lines[0].toLowerCase(); const hasHeader=first.includes("producto")||first.includes("cantidad")||first.includes("fecha");
    const dataLines=hasHeader?lines.slice(1):lines; const rows=[]; const errs=[];
    dataLines.forEach((line,i)=>{
      const cols=line.split(/[,;|\t]/).map(c=>c.trim().replace(/^["']|["']$/g,""));
      const [prod,cant,fecha,notas=""]=cols;
      const rid=nameMap[prod?.toLowerCase().trim()]; const qty=parseInt(cant);
      const fechaOk=/^\d{4}-\d{2}-\d{2}$/.test(fecha)||/^\d{2}\/\d{2}\/\d{4}$/.test(fecha);
      if(!rid)errs.push(`Fila ${i+2}: "${prod}" no encontrado`);
      if(isNaN(qty)||qty<=0)errs.push(`Fila ${i+2}: cantidad inválida`);
      if(!fechaOk)errs.push(`Fila ${i+2}: fecha inválida (usar AAAA-MM-DD)`);
      const fechaFmt=fecha?.includes("/")?fecha.split("/").reverse().join("-"):fecha;
      rows.push({ok:!!rid&&!isNaN(qty)&&qty>0&&fechaOk,nombre:prod,rid,qty,fecha:fechaFmt,notas});
    });
    setPreview(rows); setErrors(errs);
  };
  const okRows=preview.filter(r=>r.ok).length;
  return(<Modal title="Importar Plan desde CSV" onClose={onClose} width={580}>
    <div style={{marginBottom:12,padding:"10px 12px",background:C.infoBg,borderRadius:8,fontSize:12,color:C.info}}>Formato: <code style={{fontFamily:"monospace"}}>producto,cantidad,fecha_entrega,notas</code></div>
    <Field label="Pegá el contenido del CSV">
      <textarea value={csvText} onChange={e=>{setCsvText(e.target.value);parseCSV(e.target.value);}} style={{...iSt,fontFamily:"monospace",fontSize:12,minHeight:100,resize:"vertical"}} placeholder={"Bruma Aroma Sagrado,30,2026-04-20,Lote primavera"}/>
    </Field>
    {errors.length>0&&<div style={{background:C.dangerBg,borderRadius:8,padding:"10px 12px",marginBottom:12}}>{errors.slice(0,4).map((e,i)=><div key={i} style={{fontSize:12,color:C.danger}}>{e}</div>)}</div>}
    {preview.length>0&&<div style={{marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:6}}>{okRows} de {preview.length} filas válidas</div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",maxHeight:180,overflowY:"auto"}}>
        {preview.map((r,i)=>(<div key={i} style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center",background:r.ok?C.surface:C.dangerBg}}>
          <span>{r.ok?"✓":"✗"}</span><span style={{flex:1,fontSize:12}}>{r.nombre}</span><span style={{fontSize:12,fontFamily:"monospace",color:C.muted}}>{r.qty} uds · {r.fecha}</span>
        </div>))}
      </div>
    </div>}
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn disabled={okRows===0} onClick={()=>{const planes=preview.filter(r=>r.ok).map(r=>({id:genId(),recetaId:r.rid,cantidad:r.qty,fechaEntrega:r.fecha,notas:r.notas||"",estado:"por_hacer",totalProducido:0}));onSave(planes);}}>Importar {okRows>0?`${okRows} órdenes`:""}</Btn>
    </div>
  </Modal>);
}

function CompraManualForm({ onSave, onClose }) {
  const [f,setF]=useState({nombre:"",cantidad:"",nota:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<Modal title="Agregar ítem manual" onClose={onClose} width={400}>
    <TI label="Nombre del ítem" required value={f.nombre} onChange={e=>s("nombre",e.target.value)} placeholder="Ej: Alcohol 96°"/>
    <TI label="Cantidad / descripción" value={f.cantidad} onChange={e=>s("cantidad",e.target.value)} placeholder="Ej: 2 litros"/>
    <TI label="Nota" value={f.nota} onChange={e=>s("nota",e.target.value)}/>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={()=>{if(!f.nombre.trim())return;onSave(f);}} disabled={!f.nombre.trim()}>Agregar</Btn>
    </div>
  </Modal>);
}

// ─── App — FIX: todos los hooks ANTES de cualquier return ─────────────────────
export default function App() {
  const isMobile = useMobile();
  const { ui, UIComponents } = useUI();

  // ── Auth state ──
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("herbo_auth") === "1");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  // ── App state (hooks siempre se ejecutan, sin importar authed) ──
  const [sec, setSec] = useState("dashboard");
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogin = () => {
    if (pass === "lavanda2026") {
      sessionStorage.setItem("herbo_auth", "1");
      setAuthed(true);
    } else {
      setError(true);
      setPass("");
      setTimeout(() => setError(false), 2000);
    }
  };

  // ── Carga de datos: espera a que el usuario esté autenticado ──
  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const [resMat, resRec, resPla] = await Promise.all([
          api.getMateriales(),
          api.getRecetas(),
          api.getPlanes(),
        ]);
        setData({
          ...DEMO,
          materias: resMat.ok ? resMat.data : [],
          catalogo: resRec.ok ? resRec.data : [],
          planes:   resPla.ok ? resPla.data : [],
        });
      } catch (e) {
        console.error("Error cargando datos:", e);
        setData(DEMO);
      }
    })();
  }, [authed]);

  // ── Pantalla de login ──
  if (!authed) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:16,padding:"36px 32px",width:"100%",maxWidth:360,boxShadow:"0 8px 32px rgba(0,0,0,0.10)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <HerboLogo width={130} color={C.sidebar}/>
          <div style={{fontSize:12,color:C.muted,marginTop:10,letterSpacing:.5}}>Gestión de Stock & Producción</div>
        </div>
        <Field label="Contraseña">
          <input type="password" value={pass}
            onChange={e=>{setPass(e.target.value);setError(false);}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            autoFocus placeholder="••••••••••••"
            style={{...iSt, textAlign:"center", letterSpacing:3, fontSize:16, borderColor: error ? C.danger : C.border, transition:"border-color .2s"}}/>
        </Field>
        {error && <div style={{textAlign:"center",fontSize:13,color:C.danger,marginTop:-8,marginBottom:10,fontWeight:600}}>Contraseña incorrecta</div>}
        <Btn full onClick={handleLogin} disabled={!pass}>Ingresar</Btn>
      </div>
    </div>
  );

  // ── Pantalla de carga ──
  if (!data) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,flexDirection:"column",gap:16}}>
      <HerboLogo width={120} color={C.sidebar}/>
      <div style={{fontSize:14,color:C.muted}}>Cargando...</div>
    </div>
  );

  const save = async nd => {
    setData(nd);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(nd)); }
    catch(e) { console.error("Error al guardar:", e); }
  };

  const mMap = Object.fromEntries(data.materias.map(m=>[m.id,m]));
  const rMap = Object.fromEntries(data.recetas.map(r=>[r.id,r]));
  const cMap = Object.fromEntries((data.catalogo||[]).map(r=>[r.id,r]));
  const stockValue = data.materias.reduce((s,m)=>s+m.stock*m.precio,0);
  const lowStock = data.materias.filter(m=>m.stockMin>0&&m.stock<=m.stockMin);

  const H = {
    // ── MATERIALES ───────────────────────────────────────────────────────────────
    saveMateria: async (m) => {
      ui.loading("Guardando material...");
      try {
        const res = await api.saveMaterial(m);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            materias: prev.materias.find(x => x.id === m.id)
              ? prev.materias.map(x => x.id === m.id ? m : x)
              : [...prev.materias, m]
          }));
          ui.success("Material guardado correctamente");
        } else {
          ui.error("No se pudo guardar el material", res.error || "Error desconocido");
        }
      } catch (e) {
        ui.error("Error de conexión al guardar", e.message);
      }
    },
  
    delMaterias: async (ids) => {
      ui.loading("Eliminando...");
      try {
        const res = await api.deleteMateriales(ids);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            materias: prev.materias.filter(m => !ids.includes(m.id))
          }));
          ui.success("Eliminado correctamente");
        } else {
          ui.error("No se pudo eliminar", res.error || "Error desconocido");
        }
      } catch (e) {
        ui.error("Error de conexión al eliminar", e.message);
      }
    },
  
    // ── RECETAS ──────────────────────────────────────────────────────────────────
    saveCatalogoLocal: (nuevas) => {
      setData(prev => ({ ...prev, catalogo: nuevas }));
    },
  
    saveReceta: async (receta) => {
      ui.loading("Guardando receta...");
      try {
        const res = await api.saveReceta(receta);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            catalogo: prev.catalogo.map(r => r.id === receta.id ? receta : r)
          }));
          ui.success("Receta guardada correctamente");
        } else {
          ui.error("No se pudo guardar la receta", res.error || "Error desconocido");
        }
      } catch (e) {
        ui.error("Error de conexión al guardar receta", e.message);
      }
    },
  
    // ── PLANES ───────────────────────────────────────────────────────────────────
    savePlan: async (plan) => {
      ui.loading("Guardando orden...");
      try {
        const res = await api.savePlan(plan);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            planes: prev.planes.find(x => x.id === plan.id)
              ? prev.planes.map(x => x.id === plan.id ? plan : x)
              : [...prev.planes, plan]
          }));
          ui.success("Orden guardada correctamente");
        } else {
          ui.error("No se pudo guardar la orden", res.error || "Error desconocido");
        }
      } catch (e) {
        ui.error("Error de conexión al guardar orden", e.message);
      }
    },
    delPlan: async (id) => {
      ui.loading("Eliminando orden...");
      try {
        const res = await api.deletePlan(id);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            planes: prev.planes.filter(p => p.id !== id)
          }));
          ui.success("Orden eliminada");
        } else {
          ui.error("No se pudo eliminar la orden", res.error || "Error desconocido");
        }
      } catch (e) {
        ui.error("Error de conexión al eliminar orden", e.message);
      }
    },  
    updatePlanEstado: async (id, estado, extra) => {
      const plan = data.planes.find(p => p.id === id);
      const planActualizado = { ...plan, estado, ...extra };
      ui.loading("Actualizando estado...");
      try {
        const res = await api.savePlan(planActualizado);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            planes: prev.planes.map(p => p.id === id ? planActualizado : p),
            ...(estado === "producido" ? {
              produccion: [{
                id: genId(),
                recetaId: plan.recetaId,
                fecha: extra.fecha || todayStr(),
                cantidad: extra.totalProducido || plan.cantidad,
                operador: extra.operador || "—",
                notas: extra.notas || "Orden completada"
              }, ...prev.produccion]
            } : {})
          }));
          ui.success("Estado actualizado");
        } else {
          ui.error("No se pudo actualizar el estado", res.error);
        }
      } catch (e) {
        ui.error("Error de conexión", e.message);
      }
    },
  
    addPlanesFromCSV: async (planes) => {
      ui.loading("Importando planes...");
      try {
        const res = await api.savePlanes(planes);
        if (res.ok) {
          setData(prev => ({
            ...prev,
            planes: [...prev.planes, ...planes]
          }));
          ui.success(`${planes.length} órdenes importadas correctamente`);
        } else {
          ui.error("No se pudo importar el CSV", res.error);
        }
      } catch (e) {
        ui.error("Error de conexión al importar", e.message);
      }
    },
  
    // ── PRODUCCION (todavía en memoria) ──────────────────────────────────────────
    saveProduccion: p => {
      save({...data, produccion: [{...p, id: genId()}, ...data.produccion]});
    },
    delProduccion: id => save({...data, produccion: data.produccion.filter(p => p.id !== id)}),
  
    // ── COMPRAS (todavía en memoria) ──────────────────────────────────────────────
    toggleCompra: id => save({...data, compras: data.compras.map(c => c.id === id ? {...c, completado: !c.completado} : c)}),
    delCompra: id => save({...data, compras: data.compras.filter(c => c.id !== id)}),
    addCompraManual: item => save({...data, compras: [...data.compras, {...item, id: genId(), tipo: "manual", completado: false}]}),
    generateCompras: () => {
      const ex = new Set(data.compras.filter(c => c.tipo === "auto" && !c.completado).map(c => c.materiaId));
      const nuevas = lowStock.filter(m => !ex.has(m.id)).map(m => ({
        id: genId(), tipo: "auto", materiaId: m.id,
        cantSugerida: Math.max(m.stockMin * 2 - m.stock, m.stockMin),
        completado: false, nota: ""
      }));
      if (nuevas.length === 0) { window.alert("No hay nuevos ítems para agregar."); return; }
      save({...data, compras: [...data.compras, ...nuevas]});
    },
    confirm: ui.confirm,
  };

  const sp = {data,materiasMap:mMap,recetasMap:rMap,catalogoMap:cMap,stockValue,lowStock,handlers:H,setModal,setSection:(s)=>{setSec(s);setDrawerOpen(false);}};
  const planActivo = data.planes.filter(p=>p.estado!=="producido").length;
  const comprasPend = data.compras.filter(c=>!c.completado).length;

  const NAV = [
    {id:"dashboard",icon:"◈",label:"Inicio"},
    {id:"materias",icon:"⊛",label:"Materias",badge:lowStock.length||null},
    {id:"recetas",icon:"⊕",label:"Recetas"},
    {id:"plan",icon:"📋",label:"Plan",badge:planActivo||null},
    {id:"calculador",icon:"⊘",label:"Calcular"},
    {id:"produccion",icon:"⊙",label:"Producción"},
    {id:"compras",icon:"⊗",label:"Compras",badge:comprasPend||null},
  ];

  // ── FIX NavItem: función flecha correctamente envuelta ──
  const NavItem = ({n, onClick}) => {
    const handleClick = onClick || (() => { setSec(n.id); setDrawerOpen(false); });
    return (
      <button onClick={handleClick} style={{
        display:"flex",alignItems:"center",gap:10,padding:"10px 16px 10px 18px",
        background:sec===n.id?"rgba(192,206,95,0.15)":"transparent",
        border:"none",borderLeft:sec===n.id?`3px solid ${C.accent}`:"3px solid transparent",
        color:sec===n.id?"#fff":"rgba(255,255,255,.62)",
        cursor:"pointer",fontSize:14,fontFamily:"inherit",fontWeight:sec===n.id?700:400,
        textAlign:"left",width:"100%",borderRadius:0,
      }}>
        <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{n.icon}</span>
        <span style={{flex:1}}>{n.label}</span>
        {n.badge?<span style={{background:"#c83020",color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontFamily:"monospace",fontWeight:700}}>{n.badge}</span>:null}
      </button>
    );
  };

  const currentSection = () => {
    switch(sec){
      case "dashboard": return <Dashboard {...sp}/>;
      case "materias": return <Materias {...sp}/>;
      case "recetas": return <RecetasCatalogo data={data} handlers={H}/>;
      case "plan": return <PlanProduccion data={data} handlers={H} setModal={setModal}/>;
      case "calculador": return <Calculador data={data} setModal={setModal}/>;
      case "produccion": return <Produccion {...sp}/>;
      case "compras": return <Compras {...sp}/>;
      default: return null;
    }
  };

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"system-ui,-apple-system,sans-serif",background:C.bg,overflow:"hidden"}}>
      {isMobile && (
        <div style={{position:"fixed",top:0,left:0,right:0,height:52,background:C.sidebar,display:"flex",alignItems:"center",padding:"0 16px",zIndex:900,boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>
          <button onClick={()=>setDrawerOpen(!drawerOpen)} style={{background:"none",border:"none",cursor:"pointer",color:"#fff",fontSize:22,padding:"4px 8px 4px 0",lineHeight:1}}>☰</button>
          <HerboLogo width={80} color="#fff"/>
          <div style={{flex:1}}/>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontFamily:"monospace"}}>v5</div>
        </div>
      )}
      {isMobile && drawerOpen && (
        <div style={{position:"fixed",inset:0,zIndex:950}} onClick={()=>setDrawerOpen(false)}>
          <div style={{position:"absolute",top:0,left:0,bottom:0,width:260,background:C.sidebar,boxShadow:"4px 0 20px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 18px 14px",borderBottom:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",gap:12}}>
              <HerboLogo width={90} color="#fff"/>
            </div>
            <div style={{padding:"8px 0",overflowY:"auto"}}>{NAV.map(n=><NavItem key={n.id} n={n}/>)}</div>
            <div style={{padding:"12px 18px",borderTop:"1px solid rgba(255,255,255,.07)",fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:"monospace"}}>Herbo Botanica · uso interno</div>
          </div>
        </div>
      )}
      {!isMobile && (
        <aside style={{width:226,background:C.sidebar,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
            <HerboLogo width={110} color="#fff"/>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:8,letterSpacing:.5}}>Gestión de Stock & Producción</div>
          </div>
          <nav style={{flex:1,padding:"8px 0",overflowY:"auto"}}>{NAV.map(n=><NavItem key={n.id} n={n}/>)}</nav>
          <div style={{padding:"12px 18px",borderTop:"1px solid rgba(255,255,255,.07)",fontSize:10,color:"rgba(255,255,255,.25)",fontFamily:"monospace"}}>v5.0 · uso interno</div>
        </aside>
      )}
      <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minWidth:0,...(isMobile?{paddingTop:52}:{})}}>
        {currentSection()}
      </main>
      {modal?.type==="materia"&&<MateriaForm item={modal.data} onSave={m=>{H.saveMateria(m);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="precio"&&<PrecioForm materia={modal.data} onSave={m=>{H.saveMateria(m);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="plan"&&<PlanForm item={modal.data} catalogo={data.catalogo||[]} onSave={p=>{H.savePlan(p);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="csvPlan"&&<CSVPlanForm catalogo={data.catalogo||[]} onSave={planes=>{H.addPlanesFromCSV(planes);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="producido"&&<ProducidoForm plan={modal.plan} catalogoMap={cMap} onSave={f=>{H.updatePlanEstado(modal.plan.id,"producido",f);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="produccionCat"&&<ProduccionForm recetaId={modal.recetaId} cantidad={modal.cantidad} recetas={data.catalogo||[]} onSave={p=>{H.saveProduccion(p);setModal(null);}} onClose={()=>setModal(null)}/>}
      {modal?.type==="compraManual"&&<CompraManualForm onSave={c=>{H.addCompraManual(c);setModal(null);}} onClose={()=>setModal(null)}/>}

      <UIComponents />

    </div>
  );
}
