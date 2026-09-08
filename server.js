const express=require("express");
const path=require("path");
const fs=require("fs");

try {
 const env=fs.readFileSync(path.join(__dirname,".env"),"utf8");
 for(const line of env.split(/\r?\n/)){
   const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
   if(m && process.env[m[1]]===undefined) process.env[m[1]]=m[2].replace(/^(['"])(.*)\1$/,"$2");
 }
} catch {}

const app=express();
app.use(express.json({limit:"32kb"}));
app.use(express.static(path.join(__dirname,"public")));
const TOKEN=String(process.env.DISCORD_BOT_TOKEN||"").trim();
const API="https://discord.com/api/v9";

async function discord(route, options = {}) {
  if (!TOKEN) {
    throw Object.assign(
      new Error("DISCORD_BOT_TOKEN is not configured."),
      { status: 503 }
    );
  }

  const response = await fetch(API + route, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": `${TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  return { response, data };
}



app.get("/api/bot",async(req,res)=>{
 try{
   const {response,data}=await discord("/users/@me");
   res.status(response.status).json(response.ok?{online:true,bot:data}:{online:false,error:data});
 }catch(e){res.status(e.status||500).json({online:false,error:e.message})}
});

app.get("/api/guilds",async(req,res)=>{
 try{
   const {response,data}=await discord("/users/@me/guilds");
   res.status(response.status).json(response.ok?data:{error:data});
 }catch(e){res.status(e.status||500).json({error:e.message})}
});

app.get("/api/guilds/:id/members",async(req,res)=>{
 try{
   const limit=Math.min(Math.max(Number(req.query.limit)||50,1),1000);
   const {response,data}=await discord(`/guilds/${encodeURIComponent(req.params.id)}/members?limit=${limit}`);
   res.status(response.status).json(response.ok?data:{error:data});
 }catch(e){res.status(e.status||500).json({error:e.message})}
});

app.post("/api/dm",async(req,res)=>{
 try{
   const userId=String(req.body?.userId||"").trim();
   const content=String(req.body?.message||"").trim();
   if(!/^\d{17,20}$/.test(userId)) return res.status(400).json({error:"Enter a valid Discord user ID."});
   if(!content || content.length>2000) return res.status(400).json({error:"Message must be 1-2000 characters."});

   const dm=await discord("/users/@me/channels",{
     method:"POST",headers:{"Content-Type":"application/json"},
     body:JSON.stringify({recipient_id:userId})
   });
   if(!dm.response.ok) return res.status(dm.response.status).json({error:"Discord refused to open the DM.",details:dm.data});

   const sent=await discord(`/channels/${encodeURIComponent(dm.data.id)}/messages`,{
     method:"POST",headers:{"Content-Type":"application/json"},
     body:JSON.stringify({content})
   });
   if(!sent.response.ok) return res.status(sent.response.status).json({error:"Discord refused to send the message.",details:sent.data});
   res.json({success:true,channel_id:dm.data.id,message_id:sent.data.id});
 }catch(e){res.status(e.status||500).json({error:e.message})}
});

app.post("/api/friend-request", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();

    if (!username) {
      return res.status(400).json({
        error: "Enter a username."
      });
    }

    const response = await discord("/users/@me/relationships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username
      })
    });

    if (!response.response.ok) {
      return res.status(response.response.status).json({
        error: "Discord rejected the request.",
        details: response.data
      });
    }

    res.json({
      success: true,
      data: response.data
    });

  } catch (e) {
    res.status(e.status || 500).json({
      error: e.message
    });
  }
});

app.listen(Number(process.env.PORT)||3000,process.env.HOST||"127.0.0.1",()=>{
 console.log(`Dashboard running at http://${process.env.HOST||"127.0.0.1"}:${Number(process.env.PORT)||3000}`);
});

app.get("/api/test-token", async (req, res) => {
  try {
    const result = await discord("/users/@me");

    res.status(result.response.status).json({
      status: result.response.status,
      ok: result.response.ok,
      data: result.data
    });
  } catch (e) {
    res.status(e.status || 500).json({
      error: e.message
    });
  }
});