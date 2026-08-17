import { useState } from "react";

const OR="#ff6b2b",TL="#00d4aa",PU="#a78bfa",YL="#fbbf24",RD="#ff3b30";
const BG="#07070f",S1="#10101a",S2="#181826",S3="#22223a";
const TX="#f0f0f8",MT="#55557a",MT2="#8888a8";
const AVC=["linear-gradient(135deg,#3b82f6,#818cf8)","linear-gradient(135deg,#ec4899,#f472b6)","linear-gradient(135deg,#10b981,#34d399)","linear-gradient(135deg,#f59e0b,#fbbf24)"];

function gAv(n){
  if(n==="You"||n==="AT") return{bg:"linear-gradient(135deg,#7c3aed,#a78bfa)",init:"AT"};
  if(n.toLowerCase().includes("red")||n.toLowerCase().includes("iebc")) return{bg:"linear-gradient(135deg,#00d4aa,#009977)",init:n.slice(0,2).toUpperCase()};
  return{bg:AVC[n.charCodeAt(0)%AVC.length],init:n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()};
}

function Av({n,sz=26}){
  const{bg,init}=gAv(n);
  return <div style={{width:sz,height:sz,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.floor(sz*.33),fontWeight:800,color:"white",flexShrink:0}}>{init}</div>;
}

function EBar({level,c}){
  const col=c||OR;
  return(
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {[1,2,3,4].map(d=><div key={d} style={{width:12,height:3.5,borderRadius:2,background:d<=level?col:S3}}/>)}
      <span style={{fontSize:8,color:level>=3?col:MT,fontWeight:700,marginLeft:2}}>{["","Low","Med","High","🔥"][level]}</span>
    </div>
  );
}

const Logo=()=><div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,letterSpacing:-1,background:"linear-gradient(135deg,#ff6b2b,#ff9a5c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>SideQuest</div>;

const ROLES=[
  {id:"user", label:"Normal User",  icon:"👤", color:OR, screens:["Radar","Home","Detail","Chat","Post","I'm Free","Profile"]},
  {id:"org",  label:"Verified Org", icon:"🏢", color:TL, screens:["Dashboard","Post Quest","Analytics","Mission Log"]},
  {id:"admin",label:"Admin",        icon:"🛡️", color:PU, screens:["Analytics","Cities","Users","Revenue"]},
];

const NOTES={
  user:{
    "Radar":{color:OR,what:"The radar is the hook — it answers 'anything happening near me?' in a single glance before any scrolling. Ghost dots show dissolved quests for 2h to trigger FOMO without saying a word.",
      items:["Distance rings: 100m / 500m / 1km / 2km","Dot colours: Orange=Casual, Teal=Community, Red=Flash, Purple=I'm Free","Rotating sweep line — active scanner feeling","Ghost dots: dissolved quests at 40% opacity for 2h","Sorted nearest list below the SVG","Area pulse from Socket.io: '23 people active in Juja'"]},
    "Home":{color:OR,what:"Flash ticker can't be ignored. Energy meter on every card. Full quests stay visible in a dimmed FULL state — removing them would hide social proof that things are happening.",
      items:["Flash ticker scrolls urgent 30-min quests at top (red)","Energy ●●●● bars — 2 signals: reactions + join velocity","Full quest: dimmed card + FULL badge + Create similar button","Ghost card at bottom: last dissolved quest with FOMO nudge","Casual / Community tab bar","Breathing animation on active cards (Reanimated 3)"]},
    "Detail":{color:OR,what:"Non-members see enough to want to join and nothing more. Exact location is hidden until they join. Full quests show Create similar quest instead of Join.",
      items:["3 stat cards: Squad count / Expires / Starts","Non-member: location_label shown, coordinates hidden","Full quest: FULL badge + Create similar quest option","Hype row: 🔥👀🙌 with decay bar (recent/total)","Chat: locked state with progress dots (X/3 filled)","On join: exact location unlocks, chat unlocks at 3"]},
    "Chat":{color:TL,what:"Coordination only. The input placeholder sets the tone. Contact swap is the only social bridge — it appears 30min before dissolution so leaving feels like a natural closing moment.",
      items:["socket.join(quest_id) — isolated room, O(1) broadcast","Status strip: Joined · On my way · Already there","Input placeholder: 'Coordinate — where are you meeting?'","Contact swap slides up 30min before dissolution","'Chat auto-deletes when squad dissolves' always visible","No message reactions, no threads, no pins"]},
    "Post":{color:OR,what:"Eight templates remove blank-input paralysis. The whole form is designed for 30 seconds. No voice input — templates cover 80% of the use case.",
      items:["8 templates (4×2): ☕⚽🎲🚶🏃🍕🎮🏊","Tap fills title + emoji instantly","Start time picker — when it actually begins","Casual / Community type toggle","Radius picker for verified orgs (Community type)","Post button disabled until title + location filled"]},
    "I'm Free":{color:PU,what:"The most impulsive action in the app. One tap broadcasts presence within 1km. The 6h cooldown is non-negotiable — it keeps every broadcast meaningful.",
      items:["1 broadcast per 6 hours — enforced via last_free_broadcast_at","Cooldown bar: animated Reanimated width","Active broadcast shows replies from nearby users","Each reply has a Reply button to suggest an activity","Purple accent — visually distinct from quest orange","Cooldown shows exact time remaining"]},
    "Profile":{color:YL,what:"Identity built from action, not popularity. No follower count. Story cards are an adventure diary — limited for quests you didn't share, full for quests you both attended.",
      items:["Streak badge on avatar — visible to others in the feed","Stats: Quests | Vibe | Energy","Badge wall: 8 types, unearned at 30% opacity","Shared quest cards: full — photos, vibe, context","Non-shared quest cards: limited — emoji + title + date + vibe only","Squad memory with Quest again nudge"]},
  },
  org:{
    "Dashboard":{color:TL,what:"Clean and purposeful. Active quests, partner programme health, and a quick post button. No noise — orgs come here to post and check results.",
      items:["Active quests with live join counts","Stats: Active / Total Reach / This Week / Formation Rate","Org Pro + ✦ Verified Org badges","Partner status: X/2 quests this week progress bar","Quick Post → pre-selects Community type","View button per quest → analytics detail"]},
    "Post Quest":{color:TL,what:"Same flow as regular users but with radius picker (up to 50km) and lifespan picker (up to 7 days) unlocked by Org Pro. Story posting window opens for 48h after dissolution.",
      items:["Radius picker: 1km to 50km in steps","Quest lifespan: 24h up to 7 days (Org Pro)","Community type pre-selected","✦ Org badge auto-applied to every post","Start time prominent — org events are planned","48h story window opens after quest expires"]},
    "Analytics":{color:TL,what:"Per-quest analytics that justify the Org Pro subscription. Views tracked via Redis HLL — privacy-preserving unique count without storing individual user IDs.",
      items:["Views: Redis PFCOUNT (HLL — privacy-preserving)","Joins, join rate %, timeline bar chart","Hype breakdown: 🔥👀🙌 with progress bars","Story card share rate","All data linked from dashboard per quest","Mission Log entry created automatically on dissolution"]},
    "Mission Log":{color:YL,what:"Permanent, public, structured record of every completed quest. Populated automatically by the quest.dissolve BullMQ job. Anyone can view it — no access restriction.",
      items:["Permanent — never deleted, no expires_at","Populated by quest.dissolve job when poster is verified org","Fields: emoji, title, date, member count, optional 📸","Tap 📸 → modal shows highlight photo from Tier 1 stories","Aggregate stats: total missions, total participants","Fully public — builds org trust over time"]},
  },
  admin:{
    "Analytics":{color:PU,what:"Platform health signals. PostHog handles detailed funnels and acquisition — this screen shows the two admin SQL queries that PostHog can't compute: formation rate and revenue by stream.",
      items:["DAU/MAU by city","Quest creation by type per day","Squad formation rate (% reaching 3+ members)","D7 and D30 retention","Top template keywords by usage","Formation rate + revenue SQL — 2 key queries, rest in PostHog"]},
    "Cities":{color:PU,what:"Phase 1 is Juja only. This screen is for Phase 4 expansion — activating new cities, setting their center point and daily default quest locations.",
      items:["City list with user count and quests/day","Active / Seeding / Pending status","Config per city: center_point, 3 default quest locations","Activate new city with one tap","Daily defaults seeded at midnight per active city only","Phase 4: multi-city Nairobi expansion"]},
    "Users":{color:PU,what:"Grant Verified Org status to student clubs — this is the most important admin action for the JKUAT launch. Every org partnership goes through this screen.",
      items:["Search by name, email, city","Grant / revoke Verified Org (key action for org partnerships)","User streak, energy, quest history visible","Suspend account (spam / abuse)","Reset I'm Free cooldown (support tool)","is_admin: simple boolean on users table, no role system needed"]},
    "Revenue":{color:PU,what:"Two revenue streams only. No vendor complexity. M-Pesa transaction log and MRR from Org Pro. PostHog handles acquisition attribution.",
      items:["Total by stream: Event Promoter Boosts / Org Pro","M-Pesa transaction log with status (pending/confirmed/failed)","Failed payments requiring follow-up","MRR from active Org Pro subscriptions","Revenue trend bar chart","Two streams — vendor/sponsor system is Phase 4+"]},
  },
};

export default function SideQuestV41(){
  const[role,setRole]=useState("user");
  const[screen,setScreen]=useState(0);
  const rd=ROLES.find(r=>r.id===role);
  const sn=rd.screens[screen];
  const note=NOTES[role]?.[sn];

  return(
    <div style={{minHeight:"100vh",background:"#04040c",fontFamily:"'Nunito',sans-serif",color:TX,display:"flex",flexDirection:"column",alignItems:"center",paddingBottom:60,backgroundImage:`radial-gradient(ellipse at 20% 0%,${rd.color}09 0%,transparent 50%)`}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#22223a}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .fu{animation:fadeup .3s cubic-bezier(.22,1,.36,1) both}
        .ldot{animation:pulse 1.4s infinite}
        .spin{animation:spin 8s linear infinite;transform-origin:center}
        .ping{animation:ping 1.6s ease-out infinite}
        .ticker{animation:slide 18s linear infinite;white-space:nowrap}
        button{cursor:pointer;border:none;font-family:'Nunito',sans-serif;transition:all .18s}
      `}</style>

      {/* Header */}
      <div style={{width:"100%",maxWidth:1200,padding:"24px 28px 0",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,letterSpacing:-1.5,background:"linear-gradient(135deg,#ff6b2b,#ffaa70)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>SideQuest</div>
            <div style={{fontSize:9,background:"#ff6b2b20",color:OR,border:"1px solid #ff6b2b35",borderRadius:20,padding:"2px 8px",fontWeight:800,textTransform:"uppercase"}}>v4.1</div>
            <div style={{fontSize:9,background:"#a78bfa20",color:PU,border:"1px solid #a78bfa35",borderRadius:20,padding:"2px 8px",fontWeight:800}}>Complexity trimmed</div>
          </div>
          <div style={{fontSize:10,color:MT,letterSpacing:2,textTransform:"uppercase"}}>Multi-Role Visual Blueprint · 3 User Types · 15 Screens</div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:440}}>
          {[["Auto-Merge",true],["Vendor system",true],["Wild Card voting",true],["Dynamic radius",true],["Energy: 2 signals",false],["Supabase RLS",false]].map(([t,removed])=>(
            <div key={t} style={{fontSize:9,background:removed?"#ff3b3014":"#00d4aa12",color:removed?RD:TL,border:`1px solid ${removed?"#ff3b3030":"#00d4aa25"}`,borderRadius:20,padding:"3px 8px",fontWeight:700}}>{removed?"✗":"✓"} {t}</div>
          ))}
        </div>
      </div>

      {/* Role tabs */}
      <div style={{width:"100%",maxWidth:1200,padding:"18px 28px 0",display:"flex",gap:8,flexWrap:"wrap"}}>
        {ROLES.map(r=>(
          <button key={r.id} onClick={()=>{setRole(r.id);setScreen(0);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:16,background:role===r.id?r.color:S1,color:role===r.id?(r.color===YL?"#08080f":"white"):MT,fontSize:12,fontWeight:800,border:role===r.id?"none":`1px solid ${S3}`}}>
            <span style={{fontSize:16}}>{r.icon}</span>
            <div><div>{r.label}</div><div style={{fontSize:8,fontWeight:600,opacity:.7}}>{r.screens.length} screens</div></div>
          </button>
        ))}
      </div>

      {/* Screen nav */}
      <div style={{width:"100%",maxWidth:1200,padding:"12px 28px 0",display:"flex",gap:6,flexWrap:"wrap"}}>
        {rd.screens.map((s,i)=>(
          <button key={s} onClick={()=>setScreen(i)} style={{padding:"6px 13px",borderRadius:20,background:screen===i?rd.color:S1,color:screen===i?(rd.color===YL?"#08080f":"white"):MT,fontSize:11,fontWeight:800,border:screen===i?"none":`1px solid ${S3}`}}>{s}</button>
        ))}
      </div>

      {/* Main */}
      <div className="fu" key={`${role}-${screen}`} style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:44,padding:"24px 28px",width:"100%",maxWidth:1200,flexWrap:"wrap"}}>
        <Phone color={rd.color}>
          {role==="user"  && screen===0 && <URadar/>}
          {role==="user"  && screen===1 && <UHome/>}
          {role==="user"  && screen===2 && <UDetail/>}
          {role==="user"  && screen===3 && <UChat/>}
          {role==="user"  && screen===4 && <UPost/>}
          {role==="user"  && screen===5 && <UFree/>}
          {role==="user"  && screen===6 && <UProfile/>}
          {role==="org"   && screen===0 && <ODash/>}
          {role==="org"   && screen===1 && <OPost/>}
          {role==="org"   && screen===2 && <OAnalytics/>}
          {role==="org"   && screen===3 && <OMissionLog/>}
          {role==="admin" && screen===0 && <AAnalytics/>}
          {role==="admin" && screen===1 && <ACities/>}
          {role==="admin" && screen===2 && <AUsers/>}
          {role==="admin" && screen===3 && <ARevenue/>}
        </Phone>
        {note && <NotePanel note={note} roleLabel={role==="user"?"Normal User View":role==="org"?"Verified Org View":"Admin View"} screenName={sn}/>}
      </div>

      {/* Thumbnail strip */}
      <div style={{display:"flex",gap:8,padding:"0 28px",flexWrap:"wrap",justifyContent:"center",maxWidth:1200}}>
        {rd.screens.map((s,i)=>(
          <div key={s} onClick={()=>setScreen(i)} style={{width:66,height:96,borderRadius:14,background:S1,border:screen===i?`2px solid ${rd.color}`:`1px solid #ffffff08`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",transform:screen===i?"scale(1.06)":"scale(1)",transition:"all .18s",boxShadow:screen===i?`0 4px 18px ${rd.color}30`:"none"}}>
            <div style={{fontSize:14}}>{["📡","🔥","📋","💬","➕","⚡","🏅","📊","✏️","📈","🏆","🛡️","🌆","👥","💰"][ROLES.flatMap(r=>r.screens).indexOf(s)]||"📋"}</div>
            <div style={{fontSize:7,fontWeight:800,color:screen===i?rd.color:MT,textAlign:"center",lineHeight:1.3,padding:"0 4px",textTransform:"uppercase",letterSpacing:.4}}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Phone({children,color}){
  return(
    <div style={{width:300,height:620,borderRadius:44,flexShrink:0,background:"linear-gradient(145deg,#14142a,#0c0c18)",border:"2px solid #1e1e32",boxShadow:`0 0 0 1px #ffffff05,0 32px 80px #00000080,0 0 60px ${color}0a,inset 0 1px 0 #ffffff06`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:84,height:22,background:"#07070f",borderRadius:"0 0 14px 14px",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#141428",border:"1px solid #1e1e32"}}/>
        <div style={{width:27,height:4,borderRadius:2,background:"#141428"}}/>
      </div>
      <div style={{position:"absolute",top:5,left:16,right:16,display:"flex",justifyContent:"space-between",zIndex:19,fontSize:7.5,color:"#30304a",fontWeight:700}}>
        <span>9:41</span><span style={{marginLeft:40}}>●●● WiFi</span><span>100%</span>
      </div>
      <div style={{position:"absolute",inset:0,borderRadius:44,overflow:"hidden"}}>{children}</div>
      <div style={{position:"absolute",bottom:7,left:"50%",transform:"translateX(-50%)",width:88,height:3.5,borderRadius:2,background:"#1e1e32"}}/>
    </div>
  );
}

function NotePanel({note,roleLabel,screenName}){
  return(
    <div style={{flex:1,minWidth:280,maxWidth:400,paddingTop:8}}>
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
        <div style={{width:42,height:42,borderRadius:13,background:`${note.color}14`,border:`1.5px solid ${note.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📋</div>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:TX,lineHeight:1,marginBottom:2}}>{screenName}</div>
          <div style={{fontSize:11,color:note.color,fontWeight:700}}>{roleLabel}</div>
        </div>
      </div>
      <div style={{background:S1,border:`1px solid ${note.color}18`,borderLeft:`3px solid ${note.color}`,borderRadius:12,padding:"11px 14px",marginBottom:14}}>
        <div style={{fontSize:11,color:MT2,fontWeight:600,lineHeight:1.7}}>{note.what}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
        {note.items.map((item,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:note.color,marginTop:6,flexShrink:0}}/>
            <div style={{fontSize:12,color:MT2,fontWeight:600,lineHeight:1.6}}>{item}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {[[OR,"Casual"],[TL,"Community/Org"],[PU,"I'm Free"],[RD,"Flash"],[YL,"Badges"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:4,background:S1,border:"1px solid #ffffff07",borderRadius:9,padding:"3px 8px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/>
            <div style={{fontSize:9,color:MT,fontWeight:800}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ USER SCREENS ═══════════════════════════════════════════ */

function URadar(){
  const dots=[{a:40,r:70,e:"☕",c:OR},{a:150,r:105,e:"⚽",c:OR},{a:230,r:128,e:"🎲",c:PU},{a:310,r:105,e:"🏃",c:OR},{a:80,r:128,e:"🩸",c:TL},{a:185,r:70,e:"⚡",c:RD}];
  return(
    <div style={{width:"100%",height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"26px 14px 4px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><Logo/><Av n="AT" sz={28}/></div>
      <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 14px",background:S1,borderBottom:`1px solid ${S3}`,fontSize:9,color:MT2,fontWeight:700}}>
        <div className="ldot" style={{width:5,height:5,borderRadius:"50%",background:OR,flexShrink:0}}/>
        <span><span style={{color:OR,fontWeight:800}}>23 people</span> active · <span style={{color:TL}}>6 quests</span></span>
        <span style={{marginLeft:"auto",fontSize:8,color:MT}}>📍 Juja</span>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:245}}>
        <svg width="245" height="245" viewBox="0 0 245 245">
          {[38,70,100,124].map((r,i)=><circle key={i} cx="122" cy="122" r={r} fill="none" stroke={i===0?"#ff6b2b22":"#ffffff04"} strokeWidth={i===0?1.5:1} strokeDasharray={i>0?"4 5":"none"}/>)}
          <line x1="122" y1="122" x2="122" y2="18" stroke="#ff6b2b25" strokeWidth="1.5" className="spin" style={{transformOrigin:"122px 122px"}}/>
          {dots.map((d,i)=>{
            const rx=d.a*Math.PI/180,x=122+d.r*Math.sin(rx),y=122-d.r*Math.cos(rx);
            return(
              <g key={i}>
                <circle cx={x} cy={y} r={12} fill={d.c} fillOpacity={.12} stroke={d.c} strokeWidth={1.5}/>
                <circle cx={x} cy={y} r={12} fill="none" stroke={d.c} strokeWidth={7} strokeOpacity={.06} className="ping" style={{transformOrigin:`${x}px ${y}px`,animationDelay:`${i*.35}s`}}/>
                <text x={x} y={y+4} textAnchor="middle" fontSize="10">{d.e}</text>
              </g>
            );
          })}
          <circle cx="122" cy="122" r={5} fill={OR}/>
          <circle cx="122" cy="122" r={14} fill={OR} fillOpacity={.12} className="ping" style={{transformOrigin:"122px 122px"}}/>
          {["100m","500m","1km"].map((l,i)=><text key={l} x={124} y={122-[38,70,100][i]+9} fontSize="6" fill="#30304a" fontWeight="700">{l}</text>)}
        </svg>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 9px 52px",display:"flex",flexDirection:"column",gap:5}}>
        {[{e:"⚡",l:"Pizza Run",d:"195m",c:RD,tag:"FLASH 18min"},{e:"☕",l:"Coffee",d:"210m",c:OR,tag:"2/6"},{e:"⚽",l:"Football",d:"490m",c:OR,tag:"4/10"}].map((q,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:S1,border:`1px solid ${q.c}18`,borderRadius:12,padding:"7px 10px"}}>
            <span style={{fontSize:18}}>{q.e}</span>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:800,color:TX}}>{q.l}</div><div style={{fontSize:8,color:q.c,fontWeight:700}}>{q.tag}</div></div>
            <div style={{fontSize:9,color:MT,marginRight:4}}>{q.d}</div>
            <div style={{padding:"4px 10px",background:q.c,color:"white",borderRadius:8,fontSize:9,fontWeight:800}}>Join</div>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#0b0b14",border:"1px solid #ffffff06",borderRadius:12,padding:"7px 10px",opacity:.6}}>
          <span style={{fontSize:18,filter:"grayscale(1)",opacity:.4}}>🚴</span>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:800,color:MT}}>Bike Ride · ended 22 min ago</div><div style={{fontSize:9,color:MT,fontWeight:600}}>5 people · 🔥</div></div>
          <div style={{fontSize:9,color:MT,background:S2,borderRadius:7,padding:"2px 6px"}}>👻</div>
        </div>
      </div>
      <div style={{position:"absolute",bottom:8,left:8,right:8,display:"flex",gap:6}}>
        <div style={{flex:1,background:PU,borderRadius:12,padding:"11px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:"white"}}>⚡ I'm Free</div>
        <div style={{flex:1,background:OR,borderRadius:12,padding:"11px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:"white"}}>+ Post Quest</div>
      </div>
    </div>
  );
}

function UHome(){
  const quests=[
    {e:"🚴",t:"Bike Ride",l:"Juja Farm Rd",m:3,max:6,nrg:4,st:"17:30",full:false},
    {e:"🎲",t:"Board Games",l:"Kahawa Sukari",m:4,max:8,nrg:3,st:"19:00",full:false},
    {e:"⚽",t:"Evening Football",l:"JKUAT Grounds",m:10,max:10,nrg:2,st:"18:00",full:true},
  ];
  return(
    <div style={{width:"100%",height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"26px 14px 4px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><Logo/><Av n="AT" sz={28}/></div>
      <div style={{background:"#ff3b3014",borderBottom:"1px solid #ff3b3025",padding:"4px 0",overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{fontSize:9,color:RD,fontWeight:800,padding:"0 8px",flexShrink:0}}>⚡</div>
        <div style={{overflow:"hidden",flex:1}}>
          <div className="ticker" style={{display:"inline-flex",gap:28,fontSize:9,color:"#ff8080",fontWeight:700}}>
            <span>Pizza Run · 300m · 14 min</span><span>Taco Hunt · 600m · 22 min</span><span>Pizza Run · 300m · 14 min</span><span>Taco Hunt · 600m · 22 min</span>
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 14px",background:S1,borderBottom:`1px solid ${S3}`,fontSize:9,color:MT2,fontWeight:700}}>
        <div className="ldot" style={{width:5,height:5,borderRadius:"50%",background:OR,flexShrink:0}}/>
        <span><span style={{color:OR,fontWeight:800}}>23 people</span> active in Juja</span>
        <span style={{marginLeft:"auto",fontSize:8,color:MT}}>📡</span>
      </div>
      <div style={{display:"flex",padding:"0 14px",borderBottom:`1px solid ${S3}`}}>
        <div style={{padding:"6px 10px",fontSize:11,fontWeight:800,color:OR,borderBottom:`2px solid ${OR}`}}>🔥 Quests</div>
        <div style={{padding:"6px 10px",fontSize:11,fontWeight:800,color:MT}}>🤝 Community</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"6px 9px 52px",display:"flex",flexDirection:"column",gap:7}}>
        {quests.map((q,i)=>(
          <div key={i} style={{background:q.full?"#0e0e18":S1,border:`1px solid ${q.full?"#ffffff0a":"#ffffff08"}`,borderRadius:16,padding:11,position:"relative",overflow:"hidden",opacity:q.full?.8:1}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${q.full?MT:OR},transparent)`}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:26}}>{q.e}</span>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                {q.full
                  ? <div style={{fontSize:9,background:"#ffffff12",color:MT,border:"1px solid #ffffff20",borderRadius:8,padding:"2px 8px",fontWeight:800,letterSpacing:.5}}>FULL</div>
                  : <span style={{fontSize:8,background:`${TL}12`,color:TL,padding:"2px 6px",borderRadius:7,fontWeight:700}}>▶ {q.st}</span>}
              </div>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:q.full?MT:TX,marginBottom:1}}>{q.t}</div>
            <div style={{fontSize:9,color:MT,marginBottom:7,fontWeight:600}}>📍 {q.l}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:q.full?0:6}}>
              <div style={{display:"flex",gap:3,alignItems:"center"}}>
                {Array.from({length:Math.min(q.max,5)}).map((_,j)=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:j<q.m?OR:S3,border:`1px solid ${j<q.m?OR:"#ffffff0a"}`}}/>)}
                <span style={{fontSize:8,color:MT2,fontWeight:700,marginLeft:2}}>{q.m}/{q.max}</span>
              </div>
              {q.full
                ? <div style={{fontSize:9,color:MT,fontWeight:800,background:S2,borderRadius:8,padding:"4px 10px"}}>Create similar</div>
                : <div style={{padding:"5px 11px",background:OR,color:"white",borderRadius:8,fontSize:9,fontWeight:800}}>Join</div>}
            </div>
            {!q.full && <EBar level={q.nrg}/>}
          </div>
        ))}
        <div style={{background:"#0b0b12",border:"1px solid #ffffff05",borderRadius:14,padding:"9px 11px",opacity:.6}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:18,filter:"grayscale(1)",opacity:.35}}>🚴</span>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:800,color:MT}}>Bike Ride ended 25 min ago</div><div style={{fontSize:9,color:MT,fontWeight:600}}>5 people · 🔥 · Morning Run 7am →</div></div>
            <div style={{fontSize:9,color:MT,background:S2,borderRadius:7,padding:"2px 6px"}}>👻</div>
          </div>
        </div>
      </div>
      <div style={{position:"absolute",bottom:8,left:8,right:8,display:"flex",gap:6}}>
        <div style={{flex:1,background:PU,borderRadius:12,padding:"11px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:"white"}}>⚡ I'm Free</div>
        <div style={{flex:1,background:OR,borderRadius:12,padding:"11px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:"white"}}>+ Post Quest</div>
      </div>
    </div>
  );
}

function UDetail(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto"}}>
      <div style={{padding:"26px 14px 14px",borderBottom:`1px solid ${S3}`,position:"relative"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,${OR},transparent)`}}/>
        <div style={{fontSize:9,color:MT2,fontWeight:700,marginBottom:10}}>← Back</div>
        <div style={{fontSize:42,marginBottom:7}}>🚴</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:TX,marginBottom:3}}>Bike Ride</div>
        <div style={{fontSize:10,color:MT,fontWeight:700}}>📍 Juja Farm Road area</div>
        <div style={{fontSize:8.5,color:MT2,marginTop:2,fontStyle:"italic"}}>Exact location unlocks when you join</div>
      </div>
      <div style={{padding:"11px 13px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
          {[["Squad","2/6",OR],["Expires","18h",TX],["Starts","17:30",TL]].map(([l,v,c])=>(
            <div key={l} style={{background:S1,border:"1px solid #ffffff08",borderRadius:11,padding:"8px 7px"}}>
              <div style={{fontSize:8,color:MT,textTransform:"uppercase",letterSpacing:1,marginBottom:2,fontWeight:700}}>{l}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{background:S1,border:"1px solid #ffffff08",borderRadius:11,padding:"9px 11px",fontSize:9.5,color:"#9090b0",lineHeight:1.7,marginBottom:9,fontWeight:600}}>Casual evening ride through Juja Farm. Any bike works.</div>
        <div style={{fontSize:8,color:MT,textTransform:"uppercase",letterSpacing:1.2,fontWeight:800,marginBottom:5}}>Hype — last 2h</div>
        <div style={{display:"flex",gap:4,marginBottom:9}}>
          {[["🔥",3,7,OR,80],["👀",6,11,TL,100],["🙌",1,5,PU,30]].map(([e,r,t,c,p])=>(
            <div key={e} style={{flex:1,background:S2,border:`1px solid ${c}20`,borderRadius:9,padding:"6px 3px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",bottom:0,left:0,height:2,width:`${p}%`,background:c}}/>
              <div style={{fontSize:16,marginBottom:2}}>{e}</div>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:1}}>
                <span style={{fontSize:12,fontWeight:800,color:c}}>{r}</span>
                <span style={{fontSize:8,color:MT}}>/{t}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:9}}><EBar level={3}/></div>
        <div style={{background:S1,border:"1px solid #ffffff08",borderRadius:12,padding:"11px",textAlign:"center",marginBottom:9}}>
          <div style={{fontSize:20,marginBottom:3}}>🔒</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:TX,marginBottom:2}}>Chat unlocks at 3 members</div>
          <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:2}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<2?OR:S3,border:`1.5px solid ${i<2?OR:"#ffffff0d"}`}}/>)}
          </div>
          <div style={{fontSize:8,color:MT,fontWeight:600}}>1 more needed</div>
        </div>
        <div style={{background:OR,borderRadius:13,padding:"12px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:"white",boxShadow:`0 4px 16px ${OR}45`}}>⚡ Join Quest</div>
      </div>
    </div>
  );
}

function UChat(){
  const msgs=[{u:"Alex M.",t:"Main stage at 5pm?"},{u:"Joy K.",t:"Works! Which route?"},{u:"Alex M.",t:"Farm loop → bypass 🚴"},{u:"You",t:"On my way! 10 mins 🔥"}];
  return(
    <div style={{width:"100%",height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"26px 13px 9px",borderBottom:`1px solid ${S3}`}}>
        <div style={{fontSize:9,color:MT2,fontWeight:700,marginBottom:7}}>← Back</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>🚴</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:TX}}>Bike Ride · dissolves in 1h 44m</div><div style={{fontSize:9,color:MT,fontWeight:600}}>📍 Main Stage · 3/6</div></div>
          <div style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:OR,fontWeight:800,background:"#ff6b2b14",border:"1px solid #ff6b2b25",borderRadius:7,padding:"2px 6px"}}><div className="ldot" style={{width:4,height:4,borderRadius:"50%",background:OR}}/>Live</div>
        </div>
      </div>
      <div style={{padding:"5px 9px",background:S1,borderBottom:`1px solid ${S3}`,display:"flex",gap:4,overflowX:"auto"}}>
        {[{n:"Alex M.",s:"Already there 📍",c:OR},{n:"Joy K.",s:"On my way 🚀",c:TL},{n:"You",s:"On my way 🚀",c:PU}].map(m=>(
          <div key={m.n} style={{display:"flex",alignItems:"center",gap:4,background:S2,borderRadius:8,padding:"3px 7px",flexShrink:0}}>
            <Av n={m.n} sz={14}/>
            <div><div style={{fontSize:7.5,fontWeight:800,color:MT2}}>{m.n==="You"?"You":m.n.split(" ")[0]}</div><div style={{fontSize:7,color:m.c,fontWeight:700}}>{m.s}</div></div>
          </div>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:7}}>
        {msgs.map((m,i)=>{
          const me=m.u==="You";
          return(
            <div key={i} style={{display:"flex",gap:5,flexDirection:me?"row-reverse":"row",alignItems:"flex-end"}}>
              {!me && <Av n={m.u} sz={20}/>}
              <div style={{maxWidth:"76%"}}>
                {!me && <div style={{fontSize:8,color:MT,marginBottom:2,fontWeight:700}}>{m.u}</div>}
                <div style={{background:me?OR:S2,color:"white",borderRadius:me?"11px 11px 3px 11px":"11px 11px 11px 3px",padding:"6px 9px",fontSize:11,lineHeight:1.5,fontWeight:600}}>{m.t}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{margin:"4px 9px",background:"#a78bfa12",border:"1px solid #a78bfa30",borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:14}}>🤝</span>
        <div style={{flex:1}}><div style={{fontSize:9,fontWeight:800,color:PU}}>Share contact before chat closes</div><div style={{fontSize:8,color:MT,fontWeight:600}}>28 min · Chat dissolves when squad disbands</div></div>
        <div style={{fontSize:9,color:PU,fontWeight:800,background:"#a78bfa18",borderRadius:7,padding:"3px 7px"}}>Share</div>
      </div>
      <div style={{padding:"6px 9px",borderTop:`1px solid ${S3}`,display:"flex",gap:5}}>
        <div style={{flex:1,background:S2,borderRadius:9,padding:"7px 11px",fontSize:10,color:MT}}>Coordinate — where are you meeting?</div>
        <div style={{width:32,height:32,borderRadius:9,background:OR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>➤</div>
      </div>
    </div>
  );
}

function UPost(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 12px 40px"}}>
      <div style={{fontSize:9,color:MT2,fontWeight:700,marginBottom:10}}>← Back</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:TX,marginBottom:2}}>Post a <span style={{color:OR}}>Quest</span></div>
      <div style={{fontSize:9,color:MT,marginBottom:12,fontWeight:600}}>Visible to people near you in 30 seconds.</div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>Quick start</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>
        {[["☕","Coffee"],["⚽","Football"],["🎲","Games"],["🚶","Walk"],["🏃","Run"],["🍕","Food"],["🎮","Gaming"],["🏊","Swim"]].map(([e,l],i)=>(
          <div key={l} style={{background:i===1?"#ff6b2b20":S1,border:`1.5px solid ${i===1?OR:"#ffffff0a"}`,borderRadius:9,padding:"5px 3px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:16,marginBottom:1}}>{e}</div>
            <div style={{fontSize:7.5,fontWeight:800,color:i===1?OR:MT2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Activity</div>
      <div style={{background:S1,border:`1.5px solid ${OR}`,borderRadius:10,padding:"8px 11px",fontSize:11,color:TX,marginBottom:10,fontWeight:600}}>Football</div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Location</div>
      <div style={{background:S1,border:"1.5px solid #ffffff0a",borderRadius:10,padding:"8px 11px",fontSize:10,color:MT,marginBottom:10}}>JKUAT Main Gate…</div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Start time</div>
      <div style={{background:`${TL}10`,border:`1.5px solid ${TL}30`,borderRadius:10,padding:"8px 11px",fontSize:11,color:TL,marginBottom:10,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><span>▶</span>18:00</div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:34,height:34,borderRadius:9,background:S1,border:"1.5px solid #ffffff0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:TX}}>−</div>
        <div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:OR}}>10</div><div style={{fontSize:8,color:MT,fontWeight:700}}>people max</div></div>
        <div style={{width:34,height:34,borderRadius:9,background:S1,border:"1.5px solid #ffffff0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:TX}}>+</div>
      </div>
      <div style={{background:OR,borderRadius:12,padding:"12px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:"white"}}>🚀 Post Quest</div>
    </div>
  );
}

function UFree(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 30px"}}>
      <div style={{fontSize:9,color:MT2,fontWeight:700,marginBottom:13}}>← Back</div>
      <div style={{textAlign:"center",padding:"18px 10px 16px",background:"#a78bfa0e",borderRadius:16,border:`1px solid ${PU}25`,marginBottom:11}}>
        <div style={{fontSize:38,marginBottom:7}}>⚡</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,color:TX,marginBottom:3}}>I'm Free Mode</div>
        <div style={{fontSize:9.5,color:MT2,fontWeight:600,lineHeight:1.65}}>No plan. No activity.<br/>People within 1km see you're free.</div>
      </div>
      <div style={{background:S1,border:"1px solid #ffffff0a",borderRadius:11,padding:"8px 11px",marginBottom:9}}>
        <div style={{fontSize:9,color:MT,fontWeight:700,marginBottom:5}}>Next broadcast in <strong style={{color:PU}}>4h 22m</strong></div>
        <div style={{width:"100%",height:4,background:S3,borderRadius:2,overflow:"hidden"}}><div style={{width:"27%",height:"100%",background:PU,borderRadius:2}}/></div>
      </div>
      <div style={{background:"#a78bfa10",border:`1.5px solid ${PU}35`,borderRadius:13,padding:11,marginBottom:11}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:TX}}>Broadcasting ⚡</div>
          <div style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:PU,fontWeight:800}}><div className="ldot" style={{width:4,height:4,borderRadius:"50%",background:PU}}/>LIVE</div>
        </div>
        <div style={{fontSize:8.5,color:MT2,marginBottom:7,fontWeight:600}}>📍 1km · Expires 1h 54m · 2 replies</div>
        {[{n:"Ciku N.",t:"☕ Coffee sounds good?"},{n:"Brian T.",t:"Football? Also free!"}].map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:S2,borderRadius:9,padding:"6px 8px",marginBottom:4}}>
            <Av n={r.n} sz={22}/>
            <div style={{flex:1}}><div style={{fontSize:9.5,fontWeight:800,color:TX}}>{r.n}</div><div style={{fontSize:9.5,color:MT2,fontWeight:600}}>{r.t}</div></div>
            <div style={{fontSize:8.5,color:PU,fontWeight:800,background:"#a78bfa12",border:`1px solid ${PU}30`,borderRadius:6,padding:"2px 6px"}}>Reply</div>
          </div>
        ))}
      </div>
      <button disabled style={{width:"100%",background:S2,color:MT,border:"none",borderRadius:12,padding:"12px",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,opacity:.6}}>⏱ Available in 4h 22m</button>
    </div>
  );
}

function UProfile(){
  const cards=[{e:"🚴",t:"Bike Ride",v:"🔥",gold:true,shared:true},{e:"🎲",t:"Games",v:"🔥",gold:false,shared:true},{e:"⚽",t:"Football",v:"😐",gold:false,shared:false},{e:"🩸",t:"Blood Drive",v:"🙌",gold:false,shared:false}];
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto"}}>
      <div style={{padding:"26px 13px 14px",borderBottom:`1px solid ${S3}`,textAlign:"center",backgroundImage:"radial-gradient(ellipse at 50% 0%,#ff6b2b0e 0%,transparent 55%)"}}>
        <div style={{position:"relative",display:"inline-block",marginBottom:7}}>
          <Av n="AT" sz={50}/>
          <div style={{position:"absolute",bottom:-2,right:-2,background:YL,borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8.5,fontWeight:800,color:"#08080f",border:`2px solid ${BG}`}}>7</div>
        </div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:TX}}>Atacama</div>
        <div style={{fontSize:8.5,color:MT,fontWeight:600,marginBottom:7}}>Juja · Urban Explorer</div>
        <div style={{display:"flex",justifyContent:"center",gap:6}}>
          <div style={{display:"flex",alignItems:"center",gap:3,background:`${YL}16`,border:`1px solid ${YL}35`,borderRadius:20,padding:"2px 8px"}}><span style={{fontSize:10}}>🔥</span><span style={{fontSize:9,fontWeight:800,color:YL}}>7-day streak</span></div>
          <div style={{display:"flex",alignItems:"center",gap:3,background:`${PU}16`,border:`1px solid ${PU}35`,borderRadius:20,padding:"2px 8px"}}><span style={{fontSize:9}}>⚡</span><span style={{fontSize:9,fontWeight:800,color:PU}}>Fast Joiner</span></div>
        </div>
      </div>
      <div style={{padding:"9px 12px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:9}}>
          {[["14","Quests",OR],["🔥 4","Vibe",YL],["88","Energy",TL]].map(([v,l,c])=>(
            <div key={l} style={{background:S1,border:"1px solid #ffffff07",borderRadius:9,padding:"7px 4px",textAlign:"center"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:c}}>{v}</div>
              <div style={{fontSize:7,color:MT,fontWeight:700,marginTop:1}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:8,color:MT,textTransform:"uppercase",letterSpacing:1.2,fontWeight:800,marginBottom:5}}>Badges</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:9}}>
          {[["🚀","First"],["🔥","7-Day"],["🃏","Wild One"],["⚡","Fast"],["💥","Starter"],["🤝","Civic"],["🌟","Vibe"],["🔮","?"]].map(([e,l],i)=>(
            <div key={l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:S1,border:"1px solid #fbbf2420",borderRadius:9,padding:"5px 3px",width:40,opacity:i>=6?.3:1}}>
              <div style={{fontSize:14}}>{e}</div>
              <div style={{fontSize:6,color:MT2,fontWeight:700,textAlign:"center"}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:8,color:MT,textTransform:"uppercase",letterSpacing:1.2,fontWeight:800,marginBottom:5}}>Story Cards</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:9}}>
          {cards.map((c,i)=>(
            <div key={i} style={{background:c.gold?`${YL}0d`:c.shared?S1:"#0a0a12",border:`1px solid ${c.gold?YL+"30":c.shared?S3:"#ffffff06"}`,borderRadius:11,padding:"8px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              {!c.shared&&<div style={{position:"absolute",inset:0,background:"#07070fdd",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,flexDirection:"column",gap:2}}>
                <div style={{fontSize:11}}>🔒</div>
                <div style={{fontSize:7,color:MT,fontWeight:700,textAlign:"center",padding:"0 4px"}}>Join a quest together first</div>
              </div>}
              <div style={{fontSize:20,marginBottom:2}}>{c.e}</div>
              <div style={{fontSize:9,fontWeight:800,color:TX,marginBottom:1}}>{c.t}</div>
              <div style={{fontSize:12}}>{c.v}</div>
              {c.gold&&<div style={{fontSize:7,color:YL,fontWeight:700,marginTop:2}}>Share 📸</div>}
            </div>
          ))}
        </div>
        <div style={{fontSize:8,color:MT,textTransform:"uppercase",letterSpacing:1.2,fontWeight:800,marginBottom:5}}>Squad Memory</div>
        {[["Alex M.",4],["Joy K.",3]].map(([n,c])=>(
          <div key={n} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0",borderBottom:`1px solid ${S3}`}}>
            <Av n={n} sz={24}/>
            <div style={{flex:1}}><div style={{fontSize:10,fontWeight:800,color:TX}}>{n}</div><div style={{fontSize:8,color:MT,fontWeight:600}}>Quested {c}x</div></div>
            <div style={{fontSize:8,background:"#ff6b2b14",color:OR,border:"1px solid #ff6b2b28",borderRadius:6,padding:"2px 7px",fontWeight:800}}>Quest again</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ ORG SCREENS ═══════════════════════════════════════════ */

function ODash(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX}}>Red Cross Kenya</div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:8,marginTop:2}}>
            <span style={{background:"#a78bfa20",color:PU,border:"1px solid #a78bfa40",borderRadius:6,padding:"1px 6px",fontWeight:800}}>✦ Verified</span>
            <span style={{background:`${TL}18`,color:TL,border:`1px solid ${TL}35`,borderRadius:6,padding:"1px 6px",fontWeight:800}}>Org Pro</span>
          </div>
        </div>
        <Av n="RC" sz={34}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:11}}>
        {[["Active","3",TL],["Reach","847",OR],["Joins","124",YL],["Formation","68%",PU]].map(([l,v,c])=>(
          <div key={l} style={{background:S1,border:`1px solid ${c}20`,borderRadius:12,padding:"9px"}}>
            <div style={{fontSize:8,color:MT,fontWeight:700,marginBottom:2}}>{l}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#a78bfa10",border:`1px solid ${PU}28`,borderRadius:11,padding:"9px 11px",marginBottom:10}}>
        <div style={{fontSize:9,color:PU,fontWeight:800,marginBottom:3}}>Partner status · 2/2 this week ✓</div>
        <div style={{width:"100%",height:3,background:S3,borderRadius:2,overflow:"hidden"}}><div style={{width:"100%",height:"100%",background:TL}}/></div>
        <div style={{fontSize:8,color:MT,fontWeight:600,marginTop:3}}>Free Verified Org · 2 quests/week minimum</div>
      </div>
      {[{e:"🩸",t:"Blood Donation Drive",r:"10km",joins:"3/50"},{e:"🗳️",t:"Voter Card Pickup",r:"10km",joins:"1/200"}].map((q,i)=>(
        <div key={i} style={{background:S1,border:`1px solid ${TL}18`,borderRadius:13,padding:"9px 11px",marginBottom:6,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${TL},transparent)`}}/>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:20}}>{q.e}</span>
            <div style={{flex:1}}><div style={{fontSize:10,fontWeight:800,color:TX}}>{q.t}</div><div style={{display:"flex",gap:5}}><span style={{fontSize:8,color:PU,fontWeight:700}}>📡 {q.r}</span><span style={{fontSize:8,color:MT,fontWeight:600}}>{q.joins}</span></div></div>
            <div style={{fontSize:9,color:TL,fontWeight:800,background:`${TL}14`,border:`1px solid ${TL}30`,borderRadius:7,padding:"2px 7px"}}>View</div>
          </div>
        </div>
      ))}
      <div style={{background:TL,borderRadius:13,padding:"12px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#08080f",marginTop:4}}>+ Post New Quest</div>
    </div>
  );
}

function OPost(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 12px 40px"}}>
      <div style={{fontSize:9,color:MT2,fontWeight:700,marginBottom:10}}>← Dashboard</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:TX,marginBottom:10}}>Post a <span style={{color:TL}}>Community Quest</span></div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Activity</div>
      <div style={{background:S1,border:`1.5px solid ${TL}`,borderRadius:10,padding:"8px 11px",fontSize:11,color:TX,marginBottom:10,fontWeight:600}}>Blood Donation Drive</div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Location</div>
      <div style={{background:S1,border:"1.5px solid #ffffff0a",borderRadius:10,padding:"8px 11px",fontSize:10,color:MT,marginBottom:10}}>JKUAT Health Center</div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Quest lifespan — Org Pro</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:10}}>
        {["24h","3 days","5 days","7 days"].map((l,i)=>(
          <div key={l} style={{background:i===2?`${TL}20`:S1,border:`1.5px solid ${i===2?TL:"#ffffff0a"}`,borderRadius:9,padding:"6px 3px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:9,fontWeight:800,color:i===2?TL:MT2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:8,color:MT,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Broadcast radius — Org Pro</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:10}}>
        {["2km","5km","10km","15km","25km","50km"].map((l,i)=>(
          <div key={l} style={{background:i===2?`${PU}18`:S1,border:`1.5px solid ${i===2?PU:"#ffffff0a"}`,borderRadius:9,padding:"7px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:10,fontWeight:800,color:i===2?PU:MT2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:`${TL}10`,border:`1.5px solid ${TL}30`,borderRadius:10,padding:"8px 11px",fontSize:11,color:TL,marginBottom:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><span>▶</span>09:00</div>
      <div style={{background:TL,borderRadius:12,padding:"12px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#08080f"}}>🚀 Post Community Quest</div>
    </div>
  );
}

function OAnalytics(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{fontSize:9,color:MT2,fontWeight:700,marginBottom:10}}>← Dashboard</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX,marginBottom:11}}>Quest Analytics</div>
      <div style={{background:S1,border:`1px solid ${TL}25`,borderRadius:14,padding:"11px",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><span style={{fontSize:20}}>🩸</span><div><div style={{fontSize:11,fontWeight:800,color:TX}}>Blood Donation Drive</div><div style={{fontSize:9,color:MT,fontWeight:600}}>JKUAT · 10km</div></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:9}}>
          {[["Views","312",TL],["Joins","23",OR],["Rate","7.4%",YL]].map(([l,v,c])=>(
            <div key={l} style={{background:S2,borderRadius:9,padding:"7px"}}>
              <div style={{fontSize:8,color:MT,fontWeight:700,marginBottom:2}}>{l}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:8,color:MT,fontWeight:800,marginBottom:4}}>JOINS OVER TIME</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:3,height:44}}>
          {[2,4,3,6,8,12,9,11,7,15,18,23].map((v,i)=>(
            <div key={i} style={{flex:1,background:`${TL}${i>=9?"90":"30"}`,borderRadius:"2px 2px 0 0",height:`${(v/23)*100}%`,minHeight:3}}/>
          ))}
        </div>
      </div>
      {[["🔥","Fire",180,OR],["👀","Watching",220,TL],["🙌","Let's go",90,PU]].map(([e,l,v,c])=>(
        <div key={l} style={{display:"flex",alignItems:"center",gap:8,background:S1,border:`1px solid ${c}18`,borderRadius:10,padding:"7px 10px",marginBottom:5}}>
          <span style={{fontSize:16}}>{e}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:TX,fontWeight:700}}>{l}</span><span style={{fontSize:9,color:c,fontWeight:800}}>{v}</span></div>
            <div style={{width:"100%",height:3,background:S3,borderRadius:2,overflow:"hidden"}}><div style={{width:`${(v/220)*100}%`,height:"100%",background:c,borderRadius:2}}/></div>
          </div>
        </div>
      ))}
      <div style={{background:"#a78bfa12",border:`1px solid ${PU}25`,borderRadius:11,padding:"8px 11px",marginTop:8}}>
        <div style={{fontSize:9,fontWeight:800,color:PU,marginBottom:2}}>Views: Redis HLL (privacy-preserving)</div>
        <div style={{fontSize:8,color:MT,fontWeight:600}}>PFADD quest:views:{'{id}'} {'{user_id}'} → PFCOUNT per quest</div>
      </div>
    </div>
  );
}

function OMissionLog(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX,marginBottom:2}}>Mission Log</div>
      <div style={{fontSize:8.5,color:MT,fontWeight:600,marginBottom:11}}>Red Cross Kenya · Permanent · Public</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:11}}>
        {[["18","Missions",TL],["847","People",OR],["~2.5k","Impact",YL]].map(([v,l,c])=>(
          <div key={l} style={{background:S1,border:`1px solid ${c}20`,borderRadius:10,padding:"8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:7.5,color:MT,fontWeight:700,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:`${YL}0a`,border:`1px solid ${YL}20`,borderRadius:10,padding:"7px 10px",marginBottom:10,fontSize:8.5,color:MT2,fontWeight:600,lineHeight:1.5}}>
        Auto-populated by <strong style={{color:TL}}>quest.dissolve</strong> BullMQ job when poster is verified org. Never deleted.
      </div>
      {[{e:"🩸",t:"Blood Donation Drive",date:"Mar 2025",m:"23 donors",p:true},{e:"🩸",t:"Blood Donation Drive",date:"Feb 2025",m:"18 donors",p:false},{e:"🗳️",t:"Voter Card Collection",date:"Jan 2025",m:"47 collected",p:true},{e:"🌊",t:"River Cleanup",date:"Dec 2024",m:"31 volunteers",p:false},{e:"💉",t:"Cancer Screening",date:"Nov 2024",m:"55 patients",p:true}].map((m,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:i===0?`${TL}0a`:S1,border:`1px solid ${i===0?TL+"25":S3}`,borderRadius:11,padding:"8px 10px",marginBottom:5}}>
          <span style={{fontSize:20}}>{m.e}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:800,color:TX}}>{m.t}</div>
            <div style={{display:"flex",gap:8,marginTop:2}}><span style={{fontSize:8,color:MT,fontWeight:600}}>{m.date}</span><span style={{fontSize:8,color:TL,fontWeight:700}}>{m.m}</span></div>
          </div>
          {m.p&&<span style={{fontSize:16,cursor:"pointer"}}>📸</span>}
        </div>
      ))}
    </div>
  );
}

/* ═══ ADMIN SCREENS ══════════════════════════════════════════ */

function AAnalytics(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
        <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX}}>Platform Analytics</div><div style={{fontSize:8.5,color:MT,fontWeight:600}}>All cities · Live</div></div>
        <div style={{fontSize:8,background:`${PU}18`,color:PU,border:`1px solid ${PU}35`,borderRadius:7,padding:"3px 8px",fontWeight:800}}>🛡️ Admin</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
        {[["DAU","1,284",PU,"↑12%"],["Quest/day","47",OR,"2 cities"],["Formation","64%",TL,"↑58%"],["D7","31%",YL,"on track"]].map(([l,v,c,s])=>(
          <div key={l} style={{background:S1,border:`1px solid ${c}20`,borderRadius:12,padding:"9px"}}>
            <div style={{fontSize:8,color:MT,fontWeight:700,marginBottom:2}}>{l}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:7.5,color:MT,fontWeight:600}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:8,color:MT,fontWeight:800,textTransform:"uppercase",letterSpacing:1.2,marginBottom:4}}>DAU — 14 days</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:2.5,height:44,marginBottom:9}}>
        {[620,710,680,820,890,950,840,1020,980,1100,1180,1150,1240,1284].map((v,i)=>(
          <div key={i} style={{flex:1,background:`${PU}${i>=10?"90":"40"}`,borderRadius:"2px 2px 0 0",height:`${(v/1284)*100}%`}}/>
        ))}
      </div>
      <div style={{fontSize:8,color:MT,fontWeight:800,textTransform:"uppercase",letterSpacing:1.2,marginBottom:4}}>Quest types today</div>
      {[["🔥 Casual","28",OR,60],["🤝 Community","11",TL,23],["⚡ Flash","5",RD,11],["🃏 Wild Card","3",PU,6]].map(([t,c2,c,pct])=>(
        <div key={t} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
          <div style={{fontSize:9,fontWeight:800,color:c,width:78,flexShrink:0}}>{t}</div>
          <div style={{flex:1,height:4,background:S3,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:2}}/></div>
          <div style={{fontSize:8,color:MT,fontWeight:700,width:20,textAlign:"right"}}>{c2}</div>
        </div>
      ))}
      <div style={{background:S1,border:"1px solid #ffffff08",borderRadius:10,padding:"8px 10px",marginTop:8}}>
        <div style={{fontSize:9,fontWeight:800,color:PU,marginBottom:2}}>PostHog handles funnels + acquisition</div>
        <div style={{fontSize:8,color:MT,fontWeight:600}}>2 admin SQL queries only: formation rate · revenue by stream</div>
      </div>
    </div>
  );
}

function ACities(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX,marginBottom:11}}>City Management</div>
      {[{city:"Juja",users:847,q:28,status:"active",c:OR,note:"Phase 1 campus launch"},{city:"Nairobi CBD",users:312,q:11,status:"active",c:TL,note:"Phase 4"},{city:"Westlands",users:189,q:6,status:"active",c:PU,note:"Phase 4"},{city:"Thika",users:34,q:2,status:"seeding",c:YL,note:"Testing"},{city:"Mombasa",users:0,q:0,status:"pending",c:MT,note:"Planned"}].map((city,i)=>(
        <div key={i} style={{background:S1,border:`1px solid ${city.c}20`,borderRadius:12,padding:"9px 11px",marginBottom:5}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:TX}}>{city.city}</div><div style={{fontSize:7.5,color:MT,fontWeight:600}}>{city.note}</div></div>
            <div style={{fontSize:8,background:city.status==="active"?`${TL}18`:city.status==="seeding"?`${YL}18`:`${MT}18`,color:city.status==="active"?TL:city.status==="seeding"?YL:MT,border:`1px solid ${city.status==="active"?TL:city.status==="seeding"?YL:MT}35`,borderRadius:6,padding:"2px 6px",fontWeight:800,textTransform:"uppercase"}}>{city.status}</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            {[["Users",city.users,city.c],["Q/day",city.q,OR]].map(([l,v,c])=>(
              <div key={l}><div style={{fontSize:7.5,color:MT,fontWeight:600}}>{l}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:c}}>{v}</div></div>
            ))}
          </div>
        </div>
      ))}
      <div style={{background:`${PU}14`,border:`1.5px solid ${PU}35`,borderRadius:12,padding:"10px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:4}}>
        <div style={{width:30,height:30,borderRadius:9,background:`${PU}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>+</div>
        <div><div style={{fontSize:11,fontWeight:800,color:PU}}>Add New City</div><div style={{fontSize:8,color:MT,fontWeight:600}}>Phase 4 — set center point + default locations</div></div>
      </div>
    </div>
  );
}

function AUsers(){
  const users2=[{n:"Alex M.",city:"Juja",streak:12,org:false,status:"active"},{n:"Red Cross Kenya",city:"Juja",streak:0,org:true,status:"active"},{n:"Joy K.",city:"Juja",streak:4,org:false,status:"active"},{n:"IEBC Juja",city:"Juja",streak:0,org:true,status:"active"},{n:"Brian T.",city:"Nairobi",streak:0,org:false,status:"suspended"}];
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX,marginBottom:10}}>User Management</div>
      <div style={{background:S1,border:"1px solid #ffffff08",borderRadius:10,padding:"7px 10px",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:13}}>🔍</span>
        <div style={{fontSize:10,color:MT}}>Search by name, email, city…</div>
      </div>
      {users2.map((u,i)=>{
        const{bg}=gAv(u.n);
        return(
          <div key={i} style={{background:S1,border:`1px solid ${u.status==="suspended"?"#ff505030":"#ffffff08"}`,borderRadius:12,padding:"8px 10px",marginBottom:5,display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"white",flexShrink:0}}>{u.n.slice(0,2).toUpperCase()}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{fontSize:10,fontWeight:800,color:TX}}>{u.n}</div>
                {u.org&&<span style={{fontSize:7,background:`${PU}18`,color:PU,border:`1px solid ${PU}35`,borderRadius:4,padding:"1px 4px",fontWeight:800}}>✦</span>}
                {u.status==="suspended"&&<span style={{fontSize:7,background:"#ff505018",color:"#ff5050",border:"1px solid #ff505035",borderRadius:4,padding:"1px 4px",fontWeight:800}}>Suspended</span>}
              </div>
              <div style={{fontSize:8,color:MT,fontWeight:600}}>{u.city}{u.streak>0?` · 🔥 ${u.streak}d`:""}</div>
            </div>
            <div style={{fontSize:9,color:PU,fontWeight:800,background:`${PU}12`,border:`1px solid ${PU}25`,borderRadius:7,padding:"2px 7px",cursor:"pointer"}}>
              {u.org&&!u.status.includes("suspend")?"✦ Org":"View"}
            </div>
          </div>
        );
      })}
      <div style={{background:`${TL}0a`,border:`1px solid ${TL}20`,borderRadius:10,padding:"8px 11px",marginTop:6}}>
        <div style={{fontSize:9,fontWeight:800,color:TL,marginBottom:2}}>Key admin action: Grant Verified Org</div>
        <div style={{fontSize:8,color:MT,fontWeight:600}}>Every student club partnership goes through this screen</div>
      </div>
    </div>
  );
}

function ARevenue(){
  return(
    <div style={{width:"100%",height:"100%",background:BG,overflowY:"auto",padding:"26px 13px 20px"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:TX,marginBottom:10}}>Revenue Dashboard</div>
      <div style={{background:`${PU}0e`,border:`1.5px solid ${PU}35`,borderRadius:14,padding:"11px",marginBottom:10}}>
        <div style={{fontSize:8,color:MT,fontWeight:700,marginBottom:2}}>TOTAL THIS MONTH</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:PU}}>KSh 47,200</div>
        <div style={{fontSize:8.5,color:MT2,fontWeight:600}}>vs KSh 23,400 last month ↑ 102%</div>
      </div>
      <div style={{fontSize:8,color:MT,fontWeight:800,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>By stream — 2 streams only</div>
      {[["Event Promoter Boosts","KSh 29,200","62%",OR],["Org Pro Subscriptions","KSh 18,000","38%",TL]].map(([l,v,pct,c])=>(
        <div key={l} style={{background:S1,border:`1px solid ${c}20`,borderRadius:12,padding:"9px 11px",marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <div style={{fontSize:10,fontWeight:800,color:TX}}>{l}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:c}}>{v}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{flex:1,height:4,background:S3,borderRadius:2,overflow:"hidden"}}><div style={{width:pct,height:"100%",background:c,borderRadius:2}}/></div>
            <div style={{fontSize:8,color:MT,fontWeight:700}}>{pct}</div>
          </div>
        </div>
      ))}
      <div style={{fontSize:8,color:MT,fontWeight:800,textTransform:"uppercase",letterSpacing:1.2,marginBottom:4,marginTop:4}}>Revenue trend</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:40,marginBottom:10}}>
        {[8400,11200,9800,14300,16700,19200,23400,31500,38200,42100,45800,47200].map((v,i)=>(
          <div key={i} style={{flex:1,background:`${PU}${i>=8?"90":"40"}`,borderRadius:"2px 2px 0 0",height:`${(v/47200)*100}%`}}/>
        ))}
      </div>
      <div style={{background:"#ff3b3010",border:"1px solid #ff3b3030",borderRadius:10,padding:"8px 11px"}}>
        <div style={{fontSize:9,fontWeight:800,color:RD,marginBottom:2}}>🚫 Never will be a revenue stream</div>
        <div style={{fontSize:8,color:MT,fontWeight:600}}>User data sales · Feed ads · Pay-to-rank · Vendor system (Phase 4+)</div>
      </div>
    </div>
  );
}
