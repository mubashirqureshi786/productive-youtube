const _=["ytd-reel-shelf-renderer","ytd-rich-shelf-renderer[is-shorts]",'[aria-label*="Shorts"]',"ytd-shells-renderer",'#dismissible[class*="shorts"]'],H=["#secondary-inner ytd-compact-video-renderer","#secondary-inner ytd-compact-playlist-renderer","#secondary-inner ytd-reel-shelf-renderer","ytd-watch-next-secondary-results-renderer","#related ytd-video-renderer","#related ytd-compact-video-renderer","#related ytd-reel-shelf-renderer",".ytd-watch-next-secondary-results-renderer #items ytd-video-renderer",".ytd-watch-next-secondary-results-renderer #items ytd-compact-video-renderer","ytd-continuation-item-renderer:has(#related)",'[data-session-link]:not([href*="/shorts/"]) > ytd-thumbnail',"ytd-item-section-renderer:has(ytd-compact-video-renderer)"],N=["ytd-rich-item-renderer","ytd-rich-grid-row","ytd-rich-grid-renderer","ytd-two-column-browse-results-renderer #primary #contents",'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer','ytd-browse[page-subtype="home"] ytd-rich-item-renderer','ytd-browse[page-subtype="home"] ytd-rich-grid-row',"ytd-grid-video-renderer","ytd-video-renderer","ytd-item-section-renderer"];let T={removeShorts:!0,removeShortsButton:!0,removeHomepageVideos:!0,removeWatchPageSuggestions:!0,showTranscript:!1};function te(e){const t=Object.keys(T);chrome.storage.local.get(t,function(r){t.forEach(o=>{r[o]!==void 0&&(T[o]=r[o])}),e&&e()})}function oe(e){const t=[],r=new Set,o=["ytd-reel-item-renderer","ytd-rich-item-renderer","ytd-video-renderer","ytd-compact-video-renderer","ytm-shorts-lockup-view-model-v2","ytm-shorts-lockup-view-model",".shortsLockupViewModelHost",'[class*="reel-item"]','[class*="rich-item"]','[class*="shortsLockup"]'],n=["#video-title","#title yt-formatted-string","h3 a span[title]",'yt-formatted-string[slot="title"]',"#video-title-link","a[title]","h3 span[title]",'[id="video-title"]',".ytd-rich-grid-media h3",".reel-item-title","[aria-label]"],i=['a[href*="/@"]:not([href*="/shorts/"]):not([href*="/watch"])','a[href*="/channel/"]:not([href*="/shorts/"]):not([href*="/watch"])','a[href*="/c/"]:not([href*="/shorts/"]):not([href*="/watch"])','.shortsLockupViewModelHostMetadataRoundedContainerContent a:not([title]):not([href*="/shorts/"])','.shortsLockupViewModelHostMetadata a:not([title]):not([href*="/shorts/"])',".ytd-rich-grid-media .details.ytd-rich-grid-media #text a",".ytd-rich-grid-media .meta.ytd-rich-grid-media #text a","#meta-contents #channel-name a",".ytd-rich-grid-media #byline a",".ytd-video-meta-block #text a","ytd-channel-name #container #text-container #text a",".ytd-channel-name a","#channel-name a","ytd-channel-name a","ytd-channel-name yt-formatted-string",".metadata-line a",".byline a","#byline a",'[aria-label*="by"] a','[aria-label*="by "]',".shortsLockupViewModelHostMetadataRoundedContainerContent span:not([title])",".shortsLockupViewModelHostMetadata span:not([title])",'.shortsLockupViewModelHostMetadataRoundedContainerContent [role="text"]:not([title])','.shortsLockupViewModelHostMetadata [role="text"]:not([title])','.shortsLockupViewModelHost [aria-label]:not([aria-label*="views"]):not([aria-label*="ago"]):not([title])'];return o.forEach(s=>{e.querySelectorAll(s).forEach(y=>{let l="",h="";for(const d of n){const u=y.querySelector(d);if(u&&(u.hasAttribute("title")?l=u.getAttribute("title")||"":u.textContent?l=u.textContent.trim():u.innerText&&(l=u.innerText.trim()),l&&l.length>0&&l!=="Shorts")){const a=l.match(/\s+by:\s*(@?\w+)/i);if(a){const b=a[1];l=l.replace(/\s+by:\s*@?\w+/i,"").trim(),h||(h=b.startsWith("@")?b:"@"+b)}break}}for(const d of i){const u=y.querySelector(d);if(u){let a="";if(u.title?a=u.title.trim():u.textContent?a=u.textContent.trim():u.innerText&&(a=u.innerText.trim()),a=a.replace(/^by\s+/i,"").trim(),!a&&u.href){const b=u.href;b.includes("/@")?(a=b.split("/@")[1].split("/")[0],a="@"+a):b.includes("/channel/")?a="":b.includes("/c/")&&(a=b.split("/c/")[1].split("/")[0])}if(a&&a.length>0&&a.length<100&&a!==l&&!a.includes(l)&&!a.includes("http")&&!a.includes("Subscribe")&&!a.includes("views")&&!a.includes("ago")&&!a.includes("#")&&!a.includes("🤯")&&!a.includes("🧊")&&!a.includes("🤣")&&!a.includes("😲")&&!a.toLowerCase().includes("short")&&!a.toLowerCase().includes("nerf")&&!a.toLowerCase().includes("economy")&&!a.toLowerCase().includes("truth")&&!a.toLowerCase().includes("military")&&!a.toLowerCase().includes("integrity")&&a!=="Shorts"){h=a;break}}}if(!h&&l){const d=y.querySelectorAll("*"),u=[];d.forEach(a=>{a.textContent&&a.textContent.trim()&&a.textContent.trim()!==l&&a.textContent.trim().length<100&&a.textContent.trim().length>2&&!a.textContent.includes("http")&&!a.textContent.includes("ago")&&!a.textContent.includes("views")&&u.push(`"${a.textContent.trim()}" (${a.tagName.toLowerCase()}.${a.className})`)}),u.length>0&&console.log("Potential channel candidates:",u.slice(0,5))}if(l&&h){const d=`${l}-${h}`;r.has(d)||(r.add(d),t.push({title:l,channel:h}))}else if(l){const d=`${l}-unknown`;r.has(d)||(r.add(d),t.push({title:l,channel:"Unknown Channel"}))}})}),t}function j(){if(!T.removeShorts){re();return}let e=0;_.forEach(t=>{document.querySelectorAll(t).forEach(o=>{const n=o;if(n&&!n.dataset.shortsRemoved){const i=oe(n);i.length>0?(console.log(`YouTube Shorts Remover: Found ${i.length} Shorts videos in shelf:`),i.forEach((s,c)=>{console.log(`  ${c+1}. "${s.title}" - ${s.channel}`)})):(console.log("YouTube Shorts Remover: No videos found in this shelf"),console.log("Shelf HTML structure:",n.innerHTML.substring(0,500)+"...")),n.dataset.shortsRemoved="true",n.style.display="none",e++,console.log(`YouTube Shorts Remover: Hidden element with selector: ${t}`)}})}),e>0&&console.log(`YouTube Shorts Remover: Hidden ${e} Shorts shelf(s)`)}function re(){let e=0;_.forEach(t=>{document.querySelectorAll(t).forEach(o=>{const n=o;n&&n.dataset.shortsRemoved&&(n.style.display="",delete n.dataset.shortsRemoved,e++)})}),e>0&&console.log(`Productive YouTube: Restored ${e} Shorts shelf(s)`)}function X(e,t,r){let o=0;e.forEach(n=>{document.querySelectorAll(n).forEach(s=>{const c=s;c&&c.dataset[t]&&(c.style.display="",delete c.dataset[t],o++)})}),o>0&&console.log(`Productive YouTube: Restored ${o} ${r}`)}function K(){if(!T.removeHomepageVideos){X(N,"homepageVideosRemoved","homepage videos");return}let e=0;N.forEach(t=>{document.querySelectorAll(t).forEach(o=>{const n=o;if(n&&!n.dataset.homepageVideosRemoved){const i=n.getAttribute("role"),s=n.getAttribute("aria-label");if(i==="navigation"||i==="banner"||s&&(s.includes("header")||s.includes("navigation")))return;n.dataset.homepageVideosRemoved="true",n.style.display="none",e++,console.log(`Homepage Videos Remover: Hidden element with selector: ${t}`)}})}),e>0&&console.log(`Homepage Videos Remover: Hidden ${e} homepage video elements`)}let $;function ne(){clearTimeout($),$=window.setTimeout(j,100)}let z;function se(){clearTimeout(z),z=window.setTimeout(K,100)}function G(){if(!T.removeWatchPageSuggestions){X(H,"suggestionsRemoved","video suggestions");return}let e=0;H.forEach(t=>{try{document.querySelectorAll(t).forEach(o=>{const n=o,i=n.closest("#items.ytd-playlist-panel-renderer")||n.closest("ytd-playlist-panel-video-renderer")||n.closest("ytd-playlist-panel-renderer")||n.id&&n.id.includes("playlist");!i&&n&&!n.dataset.suggestionsRemoved?(n.dataset.suggestionsRemoved="true",n.style.display="none",e++,console.log(`Video Suggestions Remover: Hidden element with selector: ${t}`)):i?console.log("Video Suggestions Remover: Skipped playlist item"):n&&n.dataset.suggestionsRemoved})}catch(r){const o=r instanceof Error?r.message:"Unknown error";console.log(`Video Suggestions Remover: Error with selector ${t}:`,o)}}),e>0&&console.log(`Video Suggestions Remover: Hidden ${e} video suggestion elements`)}let V;function ie(){clearTimeout(V),V=window.setTimeout(G,100)}function Z(){if(!T.removeShortsButton){let o=0;document.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer").forEach(i=>{const s=i;s&&s.dataset.shortsButtonRemoved&&(s.style.display="",delete s.dataset.shortsButtonRemoved,o++)}),o>0&&console.log(`Productive YouTube: Restored ${o} Shorts button(s)`);return}let e=0;['ytd-guide-entry-renderer:has(a[href="/shorts"])','ytd-mini-guide-entry-renderer:has(a[href="/shorts"])','ytd-guide-entry-renderer:has([title="Shorts"])','ytd-mini-guide-entry-renderer:has([title="Shorts"])'].forEach(o=>{try{document.querySelectorAll(o).forEach(i=>{const s=i;s&&!s.dataset.shortsButtonRemoved&&(s.dataset.shortsButtonRemoved="true",s.style.display="none",e++,console.log("Productive YouTube: Hidden Shorts button container"))})}catch{}}),['a[href="/shorts"]','a[title="Shorts"]'].forEach(o=>{document.querySelectorAll(o).forEach(i=>{const s=i.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer");s&&!s.dataset.shortsButtonRemoved&&(s.dataset.shortsButtonRemoved="true",s.style.display="none",e++,console.log("Productive YouTube: Hidden Shorts button via parent"))})}),e>0&&console.log(`Productive YouTube: Hidden ${e} Shorts button(s)`)}let U;function ae(){clearTimeout(U),U=window.setTimeout(Z,100)}function le(){try{const t=new URLSearchParams(window.location.search).get("v");if(t)return t;const r=window.ytInitialPlayerResponse;if(r&&r.videoDetails&&r.videoDetails.videoId)return r.videoDetails.videoId;const o=document.querySelector('link[rel="canonical"]');if(o&&o.href){const i=o.href.match(/[?&]v=([^&]+)/);if(i&&i[1])return i[1];const s=o.href.match(/watch\/([a-zA-Z0-9_-]+)/);if(s&&s[1])return s[1]}const n=window.location.href.match(/[?&]v=([a-zA-Z0-9_-]+)/)||window.location.href.match(/watch\/([a-zA-Z0-9_-]+)/);if(n&&n[1])return n[1]}catch(e){console.warn("getVideoId: error while extracting video id",e)}return null}async function ce(e){return console.log(`Fetching video page for video ID: ${e}`),(await fetch(`https://www.youtube.com/watch?v=${e}`)).text()}function de(e){const t=e.match(/"INNERTUBE_API_KEY":"([^"]+)"/);return t&&t[1]?(console.log("Productive YouTube: API key extracted successfully"),t[1]):(console.warn("Productive YouTube: Could not extract API key from video page HTML"),null)}async function ue(e,t){console.log("Productive YouTube: Fetching player API response...");const r=await fetch(`https://www.youtube.com/youtubei/v1/player?key=${t}`,{method:"POST",headers:{"Content-Type":"application/json","User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},body:JSON.stringify({context:{client:{clientName:"WEB",clientVersion:"2.20240101.00.00"}},videoId:e})});if(!r.ok)throw console.error("Productive YouTube: Player API HTTP error:",r.status),new Error(`HTTP error! status: ${r.status}`);const o=await r.json();return console.log("Productive YouTube: Player API response received, has captions:",!!(o!=null&&o.captions)),o}function me(e){var o,n,i;console.log("Productive YouTube: Extracting transcript URL...");const t=(n=(o=e==null?void 0:e.captions)==null?void 0:o.playerCaptionsTracklistRenderer)==null?void 0:n.captionTracks;if(!t||t.length===0)return console.warn("Productive YouTube: No caption tracks found in player response"),null;console.log(`Productive YouTube: Found ${t.length} caption track(s)`),t.forEach((s,c)=>{var y;console.log(`Track ${c+1}: ${s.languageCode||"unknown"} - ${((y=s.name)==null?void 0:y.simpleText)||"unknown name"}`)});let r=t.find(s=>s.baseUrl&&s.languageCode&&s.languageCode.toLowerCase().startsWith("en"));return r||(r=t.find(s=>{var c;return s.baseUrl&&((c=s.name)==null?void 0:c.simpleText)&&(s.name.simpleText.toLowerCase().includes("english")||s.name.simpleText.toLowerCase().includes("auto-generated"))})),r||(r=t.find(s=>s.baseUrl)),!r&&t.length>0&&(r=t[0]),!r||!r.baseUrl?(console.warn("Productive YouTube: Could not find caption track with baseUrl"),null):(console.log("Productive YouTube: Selected caption track:",r.languageCode||"unknown language","-",((i=r.name)==null?void 0:i.simpleText)||"no name"),r.baseUrl)}async function pe(e){try{const t=await fetch(e);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const r=await t.text();if(!r)throw new Error("Empty transcript response");return r}catch(t){throw console.error("Productive YouTube: Error fetching transcript XML:",t),t}}function fe(e){try{const r=new DOMParser().parseFromString(e,"text/xml");if(r.getElementsByTagName("parsererror").length>0)return console.error("Productive YouTube: XML parsing error"),[];const o=r.getElementsByTagName("text");if(o.length===0)return console.warn("Productive YouTube: No text nodes found in transcript XML"),[];const n=[];for(let i=0;i<o.length;i++){const s=o[i].textContent||"",c=parseFloat(o[i].getAttribute("start")||"0");s.trim()&&n.push({text:s,start:c})}return n}catch(t){return console.error("Productive YouTube: Error parsing transcript:",t),[]}}function ge(e){const t=document.createElement("textarea");return t.innerHTML=e,t.value}function ye(e){return e=e.replace(/\[music\]/gi,""),e=e.replace(/\[applause\]/gi,""),e=e.replace(/\[laughter\]/gi,""),e=e.replace(/\[.*?\]/g,""),e=e.replace(/>>+/g,""),e=e.replace(/\s+/g," "),e=e.trim(),e}function he(e){console.log("Productive YouTube: displayTranscript function called with",e.length,"entries");let t=document.querySelector("#secondary");if(t||(console.log("Productive YouTube: #secondary not found, trying alternatives..."),t=document.querySelector("ytd-watch-next-secondary-results-renderer")),t||(console.log("Productive YouTube: ytd-watch-next-secondary-results-renderer not found, trying #secondary-inner..."),t=document.querySelector("#secondary-inner")),t||(console.log("Productive YouTube: #secondary-inner not found, trying #related..."),t=document.querySelector("#related")),!t){console.log("Productive YouTube: No sidebar found, creating fixed position container...");const m=document.createElement("div");m.id="transcript-fixed-wrapper",m.style.cssText=`
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      width: 400px !important;
      max-height: calc(100vh - 100px) !important;
      overflow-y: auto !important;
      z-index: 9999 !important;
    `,document.body.appendChild(m),t=m,console.log("Productive YouTube: Created fixed position wrapper")}if(!t){console.error("Productive YouTube: Could not find any suitable container for transcript - giving up");return}console.log("Productive YouTube: Using container:",t.tagName||t.id||"unknown");const r=25,o=[];let n=null;e.forEach((m,v)=>{let f=ge(m.text);if(f=ye(f),!f)return;const p=Math.floor(m.start/r)*r,w=(v<e.length-1?e[v+1].start:m.start+2)-m.start,S={text:f,start:m.start,duration:w};!n||n.start!==p?(n&&o.push(n),n={start:p,lines:[S]}):n.lines.push(S)}),n&&o.push(n);let i=document.getElementById("transcript-container");i?(console.log("Productive YouTube: Reusing existing transcript container"),i.innerHTML=""):(console.log("Productive YouTube: Creating new transcript container"),i=document.createElement("div"),i.id="transcript-container",i.className="transcript-container",i.style.cssText=`
      background: rgba(255, 255, 255, 0.85) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(229, 231, 235, 0.5) !important;
      border-radius: 0.5rem !important;
      margin-bottom: 1rem !important;
      margin-top: 1rem !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      width: 100% !important;
      max-width: 400px !important;
      z-index: 1000 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    `,t.prepend(i),console.log("Productive YouTube: Transcript container created and inserted into DOM"));const s=document.createElement("div");s.className="transcript-header",s.style.cssText=`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
    cursor: pointer;
    background-color: rgba(249, 250, 251, 0.5);
  `,i.appendChild(s);const c=document.createElement("div");c.className="transcript-title",c.textContent="Video Transcript",c.style.cssText=`
    font-size: 2rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `,s.appendChild(c);const y=document.createElement("span");y.className="transcript-arrow",y.style.cssText=`
    margin-left: 0.5rem;
    color: #9ca3af;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `,y.textContent="▲",c.appendChild(y);const l=document.createElement("button");l.className="transcript-copy-button",l.textContent="Copy Text",l.style.cssText=`
    background-color:#2986cc;
    color: #eef3fa;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 2rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `,l.onmouseover=()=>{l.style.backgroundColor="#008df7"},l.onmouseout=()=>{l.style.backgroundColor="#2986cc"},l.onclick=m=>{m.stopPropagation();const v=o.flatMap(f=>f.lines).map(f=>`[${B(f.start)}] ${f.text}`).join(` 

`);navigator.clipboard.writeText(v),l.textContent="Copied!",setTimeout(()=>{l.textContent="Copy Text"},2e3)},s.appendChild(l);const h=document.createElement("button");h.className="transcript-sync-button",h.textContent="⟳ Sync",h.title="Scroll to current timestamp",h.style.cssText=`
    background-color: #10b981;
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 2rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `,h.onmouseover=()=>{h.style.backgroundColor="#059669"},h.onmouseout=()=>{h.style.backgroundColor="#10b981"},s.appendChild(h);const d=document.createElement("div");d.className="transcript-content";const a=T.removeWatchPageSuggestions?"calc(100vh - 180px)":"24rem";d.style.cssText=`
    max-height: ${a};
    overflow-y: auto;
    padding: 1rem;
    background-color: transparent;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `,i.appendChild(d),h.onclick=m=>{m.stopPropagation();const v=document.querySelector("video");if(v){const f=v.currentTime,p=d.querySelector(".transcript-line.active");if(p)p.scrollIntoView({behavior:"smooth",block:"center"});else{const g=d.querySelectorAll(".transcript-line");let w=null,S=1/0;g.forEach(I=>{const k=I,E=parseFloat(k.dataset.start||"0"),Y=Math.abs(f-E);Y<S&&(S=Y,w=k)}),w&&w.scrollIntoView({behavior:"smooth",block:"center"})}}},s.onclick=()=>{d.style.display=d.style.display==="none"?"block":"none";const m=s.querySelector(".transcript-arrow");m&&(m.textContent=d.style.display==="none"?"▼":"▲")},o.forEach(m=>{const v=document.createElement("div");v.className="transcript-chunk-header",v.style.cssText=`
      color: #2563eb;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      margin-bottom: 0.5rem;
      margin-top: 1rem;
      padding: 0.25rem 0.5rem;
      background-color: rgba(37, 99, 235, 0.1);
      border-radius: 0.25rem;
      display: inline-block;
    `,v.textContent=B(m.start),v.onclick=()=>{const f=document.querySelector("video");f&&(f.currentTime=m.start)},d.appendChild(v),m.lines.forEach(f=>{const p=document.createElement("div");p.className="transcript-line",p.dataset.start=f.start.toString(),p.dataset.duration=f.duration.toString(),p.style.cssText=`
        margin-bottom: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
      `,p.onmouseover=function(){var S;const w=document.documentElement.classList.contains("dark")||((S=document.querySelector("html"))==null?void 0:S.getAttribute("dark"))!==null||document.body.style.backgroundColor==="rgb(19, 19, 19)"||document.body.style.backgroundColor==="#131313";p.classList.contains("active")||(p.style.backgroundColor=w?"rgba(55, 65, 81, 0.5)":"rgba(243, 244, 246, 0.8)")},p.onmouseout=function(){p.classList.contains("active")||(p.style.backgroundColor="transparent")};const g=document.createElement("span");g.className="transcript-text",g.textContent=f.text,g.style.cssText=`
        color: #1f2937;
        font-size: 1.1rem;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        transition: color 0.3s ease;
        cursor: pointer;
      `,g.onclick=()=>{const w=document.querySelector("video");w&&(w.currentTime=f.start)},p.appendChild(g),d.appendChild(p)})});const b=m=>{m?(i.style.cssText=`
        background: rgba(31, 41, 55, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(55, 65, 81, 0.5);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      `,s.style.cssText=`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid rgba(55, 65, 81, 0.5);
        cursor: pointer;
        background-color: rgba(17, 24, 39, 0.5);
      `,c.style.cssText=`
        font-size: 2rem;
        font-weight: 600;
        color: #f9fafb;
        display: flex;
        align-items: center;
      `,y.style.cssText=`
        margin-left: 0.5rem;
        color: #9ca3af;
      `,l.style.cssText=`
        background-color: #4a5f7d;
        color: #ffffff;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 2rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      `,l.onmouseover=()=>{l.style.backgroundColor="#13334c"},l.onmouseout=()=>{l.style.backgroundColor="#4a5f7d"},d.style.cssText=`
        max-height: ${a};
        overflow-y: auto;
        padding: 1rem;
        background-color: transparent;
      `,d.querySelectorAll(".transcript-timestamp").forEach(p=>{p.style.cssText=`
          color: #60a5fa;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.75rem;
          display: inline-block;
          min-width: 50px;
          font-size: 2rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        `}),d.querySelectorAll(".transcript-text").forEach(p=>{p.style.cssText=`
          color: #e5e7eb;
          font-size: 2rem;
          line-height: 1.7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
        `})):(i.style.cssText=`
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(229, 231, 235, 0.5);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      `,s.style.cssText=`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        cursor: pointer;
        background-color: rgba(249, 250, 251, 0.5);
      `,c.style.cssText=`
        font-size: 2rem;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
      `,y.style.cssText=`
        margin-left: 0.5rem;
        color: #9ca3af;
      `,l.style.cssText=`
        background-color: #d3d6da;
        color: #1f2937;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 2rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      `,l.onmouseover=()=>{l.style.backgroundColor="#fff",l.style.border="1px solid #575757"},l.onmouseout=()=>{l.style.backgroundColor="#d3d6da",l.style.border="none"},d.style.cssText=`
        max-height: ${a};
        overflow-y: auto;
        padding: 1rem;
        background-color: transparent;
      `,d.querySelectorAll(".transcript-timestamp").forEach(p=>{p.style.cssText=`
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.75rem;
          display: inline-block;
          min-width: 50px;
          font-size: 2rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        `}),d.querySelectorAll(".transcript-text").forEach(p=>{p.style.cssText=`
          color: #1f2937;
          font-size: 2rem;
          line-height: 1.7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
        `}))},R=()=>{var m;return document.documentElement.classList.contains("dark")||((m=document.querySelector("html"))==null?void 0:m.getAttribute("dark"))!==null||document.body.style.backgroundColor==="rgb(19, 19, 19)"||document.body.style.backgroundColor==="#131313"};b(R());const A=new MutationObserver(()=>{b(R())});A.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]}),A.observe(document.body,{attributes:!0});const C=document.querySelector("video");C&&C.addEventListener("timeupdate",()=>{const m=C.currentTime,v=d.querySelectorAll(".transcript-line"),f=R();v.forEach(p=>{const g=p,w=parseFloat(g.dataset.start||"0"),S=parseFloat(g.dataset.duration||"2"),I=w+S;if(m>=w&&m<I){g.classList.add("active");const k=g.querySelector(".transcript-text"),E=g.querySelector(".transcript-timestamp");g.style.cssText=`
            margin-bottom: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
            background-color: ${f?"rgba(30, 58, 138, 0.3)":"rgba(219, 234, 254, 0.5)"};
            border-left: 4px solid #3b82f6;
          `,k&&(k.style.color=f?"#93c5fd":"#1e40af",k.style.fontWeight="500"),E&&(E.style.color="#3b82f6")}else{g.classList.remove("active");const k=g.querySelector(".transcript-text"),E=g.querySelector(".transcript-timestamp");g.style.cssText=`
            margin-bottom: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
          `,k&&(k.style.color=f?"#e5e7eb":"#1f2937",k.style.fontWeight="400"),E&&(E.style.color="#2563eb"),g.onmouseover=function(){g.classList.contains("active")||(g.style.backgroundColor=f?"rgba(55, 65, 81, 0.5)":"rgba(243, 244, 246, 0.8)")},g.onmouseout=function(){g.classList.contains("active")||(g.style.backgroundColor="transparent")}}})})}function B(e){const t=new Date(0);if(t.setSeconds(e),Math.floor(e/60)<60){const o=Math.floor(e/60),n=Math.floor(e%60);return`${o.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`}else return t.toISOString().substr(11,8)}async function be(){var e,t;if(console.log("Productive YouTube: showVideoTranscript called, showTranscript setting:",T.showTranscript),!T.showTranscript){const r=document.getElementById("transcript-container");r&&(r.remove(),console.log("Productive YouTube: Transcript container removed"));return}try{console.log("Productive YouTube: Starting transcript fetch process...");const r=le();if(!r){console.warn("Productive YouTube: Could not get video ID");return}console.log("Productive YouTube: Video ID found:",r),await new Promise(c=>setTimeout(c,1e3));let o=null;if(window.ytInitialPlayerResponse)if(o=window.ytInitialPlayerResponse,console.log("Productive YouTube: Using ytInitialPlayerResponse from page"),o!=null&&o.captions){const c=((t=(e=o.captions.playerCaptionsTracklistRenderer)==null?void 0:e.captionTracks)==null?void 0:t.length)||0;console.log("Productive YouTube: Caption tracks available:",c)}else console.log("Productive YouTube: No captions object in player response");else{console.log("Productive YouTube: ytInitialPlayerResponse not found on page, fetching from API");try{const c=await ce(r),y=de(c);if(!y){console.warn("Productive YouTube: Could not extract API key from video page");return}o=await ue(r,y),console.log("Productive YouTube: Fetched player response from API successfully")}catch(c){console.error("Productive YouTube: Failed to fetch from API:",c);return}}if(!o){console.warn("Productive YouTube: No player API response received");return}console.log("Productive YouTube: Attempting to extract transcript URL...");const n=me(o);if(!n){console.warn("Productive YouTube: Could not extract transcript URL - this video may not have captions available");return}console.log("Productive YouTube: Transcript URL found, fetching XML...");const i=await pe(n),s=fe(i);if(!s||s.length===0){console.warn("Productive YouTube: No transcript content parsed");return}console.log("Productive YouTube: SUCCESS - Parsed transcript with",s.length,"entries, displaying..."),he(s),setTimeout(()=>{Se(),console.log("Productive YouTube: AI Translation feature initialized for transcript")},500)}catch(r){console.error("Productive YouTube: Error showing video transcript:",r)}}function J(){return window.location.href.includes("/watch")&&!window.location.href.includes("/shorts")}function Q(){return window.location.pathname==="/"||window.location.pathname===""}function D(){console.log("Productive YouTube: Initializing..."),te(function(){ee(),new MutationObserver(t=>{let r=!1;t.forEach(o=>{if(o.addedNodes.length>0){for(let n of o.addedNodes)if(n.nodeType===Node.ELEMENT_NODE){r=!0;break}}}),r&&ve()}).observe(document.body,{childList:!0,subtree:!0}),console.log("Productive YouTube: Observer started")})}function ee(){j(),Z(),J()?(G(),be()):Q()&&K()}function ve(){ne(),ae(),J()?ie():Q()&&se()}chrome.storage.onChanged.addListener(function(e,t){if(t==="local"){let r=!1;for(let o in e)T.hasOwnProperty(o)&&(T[o]=e[o].newValue,console.log(`Setting ${o} changed to ${e[o].newValue}`),r=!0);r&&(console.log("Applying settings changes immediately..."),ee())}});let x=null,q=!1;function M(){const e=document.documentElement;if(e.hasAttribute("dark")||e.classList.contains("dark"))return!0;const t=window.getComputedStyle(document.body).backgroundColor;return t==="rgb(15, 15, 15)"||t==="rgb(24, 24, 24)"||t==="rgb(33, 33, 33)"?!0:window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches}function L(e){const t=M();console.log("updatePopupTheme called - isDark:",t),e.style.background=t?"rgba(31, 41, 55, 0.98)":"rgba(255, 255, 255, 0.98)",e.style.boxShadow=`0 8px 32px rgba(0, 0, 0, ${t?"0.3":"0.15"})`;const r=e.querySelector("#yt-translation-popup > div:first-child");if(r){r.style.background=t?"rgba(31, 41, 55, 0.98)":"rgba(255, 255, 255, 0.98)";const a=r.querySelector("h3");a&&(a.style.color=t?"#f9fafb":"#1f2937");const b=r.querySelector("#close-translation-popup");b&&(b.style.color=t?"#9ca3af":"#6b7280")}const o=e.querySelector("#translation-content");o&&(o.style.color=t?"#e5e7eb":"#374151");const n=e.querySelector("#translation-loading > div");n&&(n.style.borderColor=t?"#374151":"#f3f4f6",n.style.borderTopColor=t?"#60a5fa":"#3b82f6");const i=e.querySelector("#translation-loading > p");i&&(i.style.color=t?"#9ca3af":"#6b7280"),e.querySelectorAll("#translation-result > div > div:first-child").forEach(a=>{a.style.color=t?"#9ca3af":"#6b7280"});const c=e.querySelector("#selected-text");c&&(c.style.background=t?"#374151":"#f9fafb",c.style.color=t?"#f9fafb":"#1f2937",c.style.borderLeftColor=t?"#60a5fa":"#3b82f6");const y=e.querySelector("#urdu-translation");y&&(y.style.background=t?"#064e3b":"#ecfdf5",y.style.color=t?"#6ee7b7":"#065f46");const l=e.querySelector("#best-word");l&&(l.style.background=t?"#78350f":"#fef3c7",l.style.color=t?"#fde68a":"#92400e");const h=e.querySelector("#context-text");h&&(h.style.background=t?"#1e3a8a":"#eff6ff",h.style.color=t?"#93c5fd":"#1e40af"),e.querySelectorAll("#vocabulary-list > span").forEach(a=>{const b=a;b.style.background=t?"#1e3a8a":"#dbeafe",b.style.color=t?"#93c5fd":"#1e40af"});const u=e.querySelector("style");u&&(u.textContent=`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      #yt-translation-popup::-webkit-scrollbar {
        width: 8px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-track {
        background: ${t?"#1f2937":"#f3f4f6"};
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb {
        background: ${t?"#4b5563":"#d1d5db"};
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb:hover {
        background: ${t?"#6b7280":"#9ca3af"};
      }
      
      #close-translation-popup:hover {
        color: ${t?"#f9fafb":"#1f2937"};
      }
    `)}function xe(){const e=document.createElement("div");e.id="yt-translation-popup",e.style.cssText=`
    position: fixed;
    z-index: 999999;
    backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 20px;
    max-width: 420px;
    min-width: 320px;
    max-height: 80vh;
    display: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-y: auto;
    overflow-x: hidden;
  `,e.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; position: sticky; top: -20px; padding: 20px 0 16px 0; margin: -20px 0 16px 0; z-index: 10; backdrop-filter: blur(20px);">
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">AI Translation</h3>
      <button id="close-translation-popup" style="
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      ">×</button>
    </div>
    
    <div id="translation-content" style="line-height: 1.6;">
      <div id="translation-loading" style="text-align: center; padding: 20px;">
        <div style="
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
        <p style="margin-top: 12px; font-size: 14px;">Generating translation...</p>
      </div>
      
      <div id="translation-result" style="display: none;">
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">SELECTED TEXT</div>
          <div id="selected-text" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 14px;
            word-wrap: break-word;
          "></div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">اردو ترجمہ</div>
          <div id="urdu-translation" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 15px;
            direction: rtl;
            font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
            word-wrap: break-word;
          "></div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">BEST ALTERNATIVE</div>
          <div id="best-word" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 14px;
            word-wrap: break-word;
          "></div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">SIMILAR VOCABULARY</div>
          <div id="vocabulary-list" style="
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          "></div>
        </div>
        
        <div>
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">CONTEXT</div>
          <div id="context-text" style="
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 13px;
            line-height: 1.6;
            word-wrap: break-word;
          "></div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      #yt-translation-popup::-webkit-scrollbar {
        width: 8px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-track {
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb {
        border-radius: 4px;
      }
      
      #yt-translation-popup::-webkit-scrollbar-thumb:hover {
      }
      
      #close-translation-popup:hover {
      }
    </style>
  `,document.body.appendChild(e),L(e);let t=M();const r=new MutationObserver(()=>{const n=M();n!==t&&(t=n,console.log("AI Popup: Theme changed to",n?"dark":"light"),e.style.display==="block"&&L(e))});r.observe(document.documentElement,{attributes:!0,attributeFilter:["dark","class"],attributeOldValue:!0}),r.observe(document.body,{attributes:!0,attributeFilter:["style"]});const o=e.querySelector("#close-translation-popup");return o==null||o.addEventListener("click",()=>{e.style.display="none"}),document.addEventListener("click",n=>{if(e.style.display==="block"&&!e.contains(n.target)){const i=window.getSelection();(!i||i.toString().trim()==="")&&(e.style.display="none")}}),e}const P=new Map;let F=0;const O=1e3;async function we(e){if(P.has(e))return console.log("Using cached translation for:",e),P.get(e);const r=Date.now()-F;if(r<O){const i=O-r;console.log(`Rate limiting: waiting ${i}ms before next request`),await new Promise(s=>setTimeout(s,i))}F=Date.now();const o=await chrome.runtime.sendMessage({type:"TRANSLATE_TEXT",text:e});if(!o.success)throw new Error(o.error||"Translation failed");const n=o.data;if(P.set(e,n),P.size>50){const i=P.keys().next().value;i&&P.delete(i)}return n}function Te(e,t,r){x||(x=xe());const o=420,n=window.innerHeight*.8,i=20;let s=t;s+o>window.innerWidth-i&&(s=window.innerWidth-o-i),s<i&&(s=i);let c=r+10;c+n>window.innerHeight-i&&(c=Math.max(i,r-n-10)),x.style.left=`${s}px`,x.style.top=`${c}px`,x.style.display="block",setTimeout(()=>{L(x)},0);const y=x.querySelector("#translation-loading"),l=x.querySelector("#translation-result"),h=x.querySelector("#selected-text");y.style.display="block",l.style.display="none",h.textContent=e,q||(q=!0,we(e).then(d=>{const u=x.querySelector("#urdu-translation"),a=x.querySelector("#best-word"),b=x.querySelector("#vocabulary-list"),R=x.querySelector("#context-text");u.textContent=d.urduTranslation,a.textContent=d.bestWord,R.textContent=d.context;const A=M();b.innerHTML=d.vocabulary.map(C=>`
          <span style="
            padding: 6px 12px;
            background: ${A?"#1e3a8a":"#dbeafe"};
            color: ${A?"#93c5fd":"#1e40af"};
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
          ">${C}</span>
        `).join(""),y.style.display="none",l.style.display="block",L(x),setTimeout(()=>{L(x);const C=M();b.querySelectorAll("span").forEach(v=>{v.style.background=C?"#1e3a8a":"#dbeafe",v.style.color=C?"#93c5fd":"#1e40af"})},100)}).catch(d=>{console.error("Translation error:",d);const u=M();y.innerHTML=`
          <div style="color: ${u?"#f87171":"#dc2626"}; text-align: center;">
            <p style="font-weight: 600; margin-bottom: 8px;">⚠️ Error</p>
            <p style="font-size: 14px;">${d.message}</p>
            <p style="font-size: 12px; color: ${u?"#9ca3af":"#6b7280"}; margin-top: 8px;">
              ${d.message.includes("API key")?"Go to extension settings to add your Gemini API key":""}
            </p>
          </div>
        `}).finally(()=>{q=!1}))}let W=!1;function Se(){if(W){console.log("Transcript selection handler already initialized, skipping...");return}console.log("Initializing transcript text selection handler..."),W=!0,document.addEventListener("mouseup",e=>{const t=window.getSelection(),r=t==null?void 0:t.toString().trim();if(r&&r.length>0&&r.length<300){const o=e.target,n=document.getElementById("transcript-container"),i=o.closest(".transcript-line, .transcript-text")!==null||(n==null?void 0:n.contains(o));if(console.log("Selection:",r,"Container found:",!!n,"Within transcript:",i),i){const c=t.getRangeAt(0).getBoundingClientRect();console.log("Showing translation popup for:",r),Te(r,c.left+window.scrollX,c.bottom+window.scrollY+10)}}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",D):D();
