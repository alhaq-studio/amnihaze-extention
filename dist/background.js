var Se=Object.defineProperty;var Ae=(t,e,r)=>e in t?Se(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var z=(t,e,r)=>(Ae(t,typeof e!="symbol"?e+"":e,r),r);var G={status:!0,blurryStartMode:!1,blurAmount:30,blurImages:!0,blurVideos:!0,blurMale:!1,blurFemale:!0,specificBlur:!0,unblurImages:!1,unblurVideos:!1,gray:!1,useSolidColor:!1,solidColor:"#808080",strictness:.4,whitelist:[],detectionModel:"vZNq2WHrFm7b",scoreThreshold:.4,hideVideoToggle:!1,passwordProtectionEnabled:!1,companionMode:{enabled:!1,email:"",lastNotificationTime:0},uninstallPreventionEnabled:!1,preventIncognitoGuestEnabled:!1,protectionMode:"free",trialWelcomeShown:!1,pageShieldEnabled:!0,nuditySensitivity:"balanced",showShieldToast:!0,compareMode:{enabled:!1,modelA:"vZNq2WHrFm7b",modelB:"mcDNsuzfxMHy",iouThreshold:.5,softness:.12,overlay:"all",collectDisagreements:!0,confidenceA:null,confidenceB:null,maxSamples:1e4}};var Ke=typeof window<"u"&&window.requestIdleCallback||function(t){let e=Date.now();return setTimeout(()=>{t({didTimeout:!1,timeRemaining(){return Math.max(0,50-(Date.now()-e))}})},1)},Ze=typeof window<"u"&&window.cancelIdleCallback||function(t){clearTimeout(t)};var I=!1,ve=typeof navigator<"u"&&navigator.webdriver===!0;if(ve)I=!0,console.log("[AmnGaze] Test mode detected - debug logging enabled");else if(typeof localStorage<"u")try{I=localStorage.getItem("AmnGaze-debug")==="true"}catch{}else typeof chrome<"u"&&chrome.storage&&chrome.storage.local.get(["AmnGaze-debug"],t=>{I=t["AmnGaze-debug"]===!0||t["AmnGaze-debug"]==="true"});var p=(t,...e)=>{I&&console.log(`[AmnGaze] ${t}`,...e)};var V="https://AmnGaze-api.md-alganzory.workers.dev",_="AmnGaze-auth-token",T="AmnGaze-auth-token-expiry",h=class{static async makeRequest(e,r="GET",s=null,n=15e3){try{let o=await this.getAuthToken(),a=`${V}${e}`,i={"Content-Type":"application/json"};o&&(i.Authorization=`Bearer ${o}`);let u={method:r,headers:i,body:s?JSON.stringify(s):void 0},d=new AbortController,c=setTimeout(()=>d.abort(),n),l;try{l=await fetch(a,{...u,signal:d.signal})}finally{clearTimeout(c)}if(l.status===401&&await this.refreshToken())return this.makeRequest(e,r,s);if(!l.ok){let m=await l.text();throw new Error(`API error (${l.status}): ${m}`)}return await l.json()}catch(o){throw console.error("API request error:",o),o}}static async getAuthToken(){try{let e=await chrome.storage.sync.get([_,T]),r=e[_],s=e[T];return r&&s&&Date.now()<s?r:null}catch(e){return console.error("Error getting auth token:",e),null}}static async setAuthToken(e,r){try{let s=Date.now()+r*1e3;return await chrome.storage.sync.set({[_]:e,[T]:s}),!0}catch(s){return console.error("Error setting auth token:",s),!1}}static async clearAuthToken(){try{return await chrome.storage.sync.remove([_,T]),this.premiumStatusCache={value:null,timestamp:0},!0}catch(e){return console.error("Error clearing auth token:",e),!1}}static async refreshToken(){try{let r=(await chrome.storage.sync.get("AmnGaze-auth-user"))["AmnGaze-auth-user"];if(!r||!r.uid||!r.email)return!1;let s=await fetch(`${V}/api/auth/validate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:r.uid,email:r.email,emailVerified:!0})});if(!s.ok)return s.status,!1;let n=await s.json();return n.valid&&n.token?(await this.setAuthToken(n.token,n.expiresIn||3600),!0):!1}catch(e){return console.error("Error refreshing token:",e),!1}}static async isPremiumUser(e=!0){return true;}static async syncCustomerState(){try{let r=(await chrome.storage.sync.get("AmnGaze-auth-user"))["AmnGaze-auth-user"]||{};let n={...r,isPremium:true,isTrialActive:true,trialEndDate:null,subscriptionEndsAt:null};await chrome.storage.sync.set({"AmnGaze-auth-user":n});return n;}catch(e){return null;}}static async createCheckoutSession(e,r=null){return {url:""};}static async sendCompanionNotification(e){return {success:true};}};z(h,"premiumStatusCache",{value:null,timestamp:0,TTL:3e5});var g="AmnGaze-auth-user",w=class{static async isAuthenticated(){return true;}static async getUser(){return {uid:"free_user",email:"free@AmnGaze.com",isPremium:true,emailVerified:true};}static async hasPremiumAccess(){return true;}static async signIn(e,r){try{if(!e||!r)return{success:!1,message:"Email and password are required"};if(!this.isValidEmail(e))return{success:!1,message:"Invalid email format"};let s=await this.getAuthFromOffscreen("signIn",{email:e,password:r});return s.success&&await chrome.storage.sync.set({[g]:s.user}),s}catch(s){return console.error("Error signing in:",s),{success:!1,message:"An error occurred while signing in"}}}static async signUp(e,r){try{if(!e||!r)return{success:!1,message:"Email and password are required"};if(!this.isValidEmail(e))return{success:!1,message:"Invalid email format"};if(r.length<6)return{success:!1,message:"Password must be at least 6 characters"};let s=await this.getAuthFromOffscreen("signUp",{email:e,password:r});return s.success&&await chrome.storage.sync.set({[g]:s.user}),s}catch(s){return console.error("Error signing up:",s),{success:!1,message:"An error occurred while signing up"}}}static async signOut(){try{return await chrome.runtime.sendMessage({target:"offscreen",type:"signOut"}),await chrome.storage.sync.remove([g]),await h.clearAuthToken(),!0}catch(e){return console.error("Error signing out:",e),!1}}static isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}static async getAuthFromOffscreen(e,r={},s=4e3){return await this.ensureOffscreenDocument(),new Promise((n,o)=>{let a=!1,i=(c,l)=>{a||(a=!0,clearTimeout(u),c(l))},u=setTimeout(()=>{i(o,new Error(`Offscreen request timed out: ${e}`))},s),d=(c=0)=>{chrome.runtime.sendMessage({target:"offscreen",type:e,...r},l=>{chrome.runtime.lastError?(console.error("Error communicating with offscreen document:",chrome.runtime.lastError),c<2&&chrome.runtime.lastError.message.includes("port closed")?(p("Retrying after attempting to recreate offscreen document..."),this.ensureOffscreenDocument().then(()=>{setTimeout(()=>{d(c+1)},500)}).catch(m=>{i(o,chrome.runtime.lastError)})):i(o,chrome.runtime.lastError)):i(n,l)})};d()})}static async ensureOffscreenDocument(){return new Promise(e=>{chrome.runtime.sendMessage({type:"ensureOffscreenDocument"},()=>{setTimeout(e,100)})})}static async handleAuthStateChange(e){try{return e?(await chrome.storage.sync.set({[g]:e}),await h.refreshToken()&&await h.syncCustomerState()):(await chrome.storage.sync.remove(g),await h.clearAuthToken()),!0}catch(r){return console.error("Error handling auth state change:",r),!1}}static async initAuthStateObserver(){try{return await this.getAuthFromOffscreen("initAuthObserver"),!0}catch(e){return console.error("Error initializing auth observer:",e),!1}}static async validateAuthState(){return true;}static async openPaymentPage(e=null){try{p(`Opening Polar payment page for tier: ${e||"default"}...`);let s=(await chrome.storage.sync.get(g))[g];if(!s)return console.error("Cannot open payment page: User not authenticated"),!1;let n=await h.createCheckoutSession(s,e);if(!n||!n.url)throw new Error("Failed to create checkout session or missing URL");return await chrome.tabs.create({url:n.url}),!0}catch(r){return console.error("Error opening payment page:",r),!1}}static async resetPassword(e){try{if(!e||!this.isValidEmail(e))return{success:!1,message:"Please enter a valid email address"};let r=await this.getAuthFromOffscreen("resetPassword",{email:e});return r?.success?{success:!0,message:"Password reset email sent. Please check your inbox."}:{success:!1,message:r?.message||"Failed to send reset email. Please try again later."}}catch(r){return console.error("Error resetting password:",r),{success:!1,message:"An error occurred while sending reset email"}}}static async sendVerificationEmail(){return this.getAuthFromOffscreen("sendEmailVerification")}static async checkEmailVerified(){let e=await this.getAuthFromOffscreen("checkEmailVerified");if(e.verified){let r=await this.getAuthFromOffscreen("getAuthState");r?.user&&await this.handleAuthStateChange(r.user)}return e.verified}static async getCustomerPortalUrl(){return null;}static async signInWithGoogle(){return new Promise(e=>{let r=!1,s=null,n=()=>{s&&(chrome.storage.onChanged.removeListener(s),s=null)},o=a=>{r||(r=!0,n(),e(a))};s=(a,i)=>{if(i==="sync"&&a[g]?.newValue){p("Google sign-in: detected auth state change in storage");let u=a[g].newValue;o({success:!0,isNewUser:!1,user:u})}},chrome.storage.onChanged.addListener(s),this.sendAuthRequestNoTimeout("signInWithGoogle",{}).then(a=>{a.success?(chrome.storage.sync.set({[g]:a.user}),o({success:!0,isNewUser:a.isNewUser||!1,user:a.user})):o(a)}).catch(a=>{console.warn("Google sign-in: direct request failed, waiting for auth state change:",a.message),setTimeout(()=>{o({success:!1,message:"Sign-in timed out. Please try again."})},3e4)})})}static async signInWithGoogleToken(e){return new Promise(r=>{let s=!1,n=null,o=()=>{n&&(chrome.storage.onChanged.removeListener(n),n=null)},a=i=>{s||(s=!0,o(),r(i))};n=(i,u)=>{if(u==="sync"&&i[g]?.newValue){p("Google sign-in: detected auth state change in storage");let d=i[g].newValue;a({success:!0,isNewUser:!1,user:d})}},chrome.storage.onChanged.addListener(n),this.sendAuthRequestNoTimeout("signInWithGoogleToken",{token:e}).then(i=>{i.success?(chrome.storage.sync.set({[g]:i.user}),a({success:!0,isNewUser:i.isNewUser||!1,user:i.user})):a(i)}).catch(i=>{console.warn("Google sign-in: direct request failed, waiting for auth state change:",i.message),setTimeout(()=>{a({success:!1,message:"Sign-in timed out. Please try again."})},3e4)})})}static async sendAuthRequestNoTimeout(e,r={}){return await this.ensureOffscreenDocument(),new Promise((s,n)=>{let o=(a=0)=>{chrome.runtime.sendMessage({target:"offscreen",type:e,...r},i=>{chrome.runtime.lastError?(console.error("Error communicating with offscreen document:",chrome.runtime.lastError),a<1&&chrome.runtime.lastError.message?.includes("port closed")?(p("Retrying offscreen request after port closed..."),this.ensureOffscreenDocument().then(()=>setTimeout(()=>o(a+1),500)).catch(()=>n(chrome.runtime.lastError))):n(chrome.runtime.lastError)):s(i)})};o()})}};var q=[["ev","extension.version"],["bn","browser.name"],["bp","browser.platform"],["bl","browser.language"],["bg","browser.languages"],["hc","browser.hardware_concurrency"],["dm","browser.device_memory_gb"],["mo","browser.mobile"],["fi","install.first_installed_at"],["ii","install.incognito_access_allowed"],["se","settings.extension_enabled"],["si","settings.blur_images"],["sv","settings.blur_videos"],["sm","settings.blur_male"],["sf","settings.blur_female"],["ui","settings.unblur_images"],["uv","settings.unblur_videos"],["sb","settings.specific_blur"],["sg","settings.gray_mode"],["ss","settings.use_solid_color"],["sh","settings.hide_video_toggle"],["sp","settings.password_protection_enabled"],["sc","settings.companion_enabled"],["su","settings.uninstall_prevention_enabled"],["pg","settings.prevent_incognito_guest_enabled"],["cm","settings.compare_mode_enabled"],["wc","settings.whitelist_count"],["ba","settings.blur_amount"],["st","settings.strictness"],["th","settings.score_threshold"],["md","settings.detection_model"],["pm","settings.protection_mode"],["au","account.is_authenticated"],["ap","account.is_premium"],["at","account.is_trial_active"],["rc","runtime.crash_count"],["rt","runtime.crash_timestamp"],["ta","runtime.turbo_active"],["te","runtime.turbo_error"],["ab","runtime.active_backend"],["tl","runtime.saved_texture_limit"],["de","runtime.detection_errors"],["dt","runtime.last_detection_error_at"],["me","runtime.model_error_at"],["lr","runtime.last_recreation_attempt_at"],["mm","benchmark.selected_model"],["bt","benchmark.average_time_ms"],["bs","benchmark.sample_count"],["br","benchmark.raw_sample_count"],["bo","benchmark.timeout"],["be","benchmark.early_exit"],["bd","benchmark.recorded_at"],["bx","benchmark.error"]],it=Object.fromEntries(q),Ee=new Set(["mo","ii","se","si","sv","sm","sf","ui","uv","sb","sg","ss","sh","sp","sc","su","pg","cm","au","ap","at","ta","bo","be"]),Ie="hb1",_e="AmnGaze-uninstall-v1-s6G7X9r2Q1m8Lp4Na0TzK5wV3cY7Df2H",R=null;function Q(){if(!globalThis.crypto?.subtle)throw new Error("Web Crypto API is unavailable");return globalThis.crypto}async function Te(){if(!R){let t=Q(),e=new TextEncoder().encode(_e),r=await t.subtle.digest("SHA-256",e);R=t.subtle.importKey("raw",r,{name:"AES-GCM"},!1,["encrypt","decrypt"])}return R}function j(t){let e=Array.from(t,s=>String.fromCharCode(s)).join("");return btoa(e).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/u,"")}function ke(t){return t==null||t===""?"":typeof t=="boolean"?t:Array.isArray(t)?t.filter(e=>e!=null&&e!=="").join(","):String(t).trim()}function Ce(t,e){let r=ke(e);return r===""?"":Ee.has(t)?r===!0||r===1||r==="1"||r==="true"?"1":"0":encodeURIComponent(String(r))}function Y(t){return q.map(([e,r])=>{let s=Ce(e,t[r]);return s===""?null:`${e}=${s}`}).filter(Boolean).join(";")}async function X(t){let e=String(t||"").trim();if(!e)return"";let r=Q(),s=r.getRandomValues(new Uint8Array(12)),n=await Te(),o=new TextEncoder().encode(e),a=new Uint8Array(await r.subtle.encrypt({name:"AES-GCM",iv:s},n,o));return`${Ie}.${j(s)}.${j(a)}`}var v=G,J=0,O=0,C=!1,M=!1,Z="authStateValidation",ee="customerStateSync",te="trialExpirationCheck",S="installMetadata",P="uninstallDiagnosticsRuntime",Me=1023,B="https://docs.google.com/forms/d/e/1FAIpQLSeKaTN6sOZkMUFLgfQJLHZadm3_mL_QYeq9dFKaF6frUkFICQ/viewform",De="1257235115",L=!1,N=!1;function Ue(){let t=navigator.userAgentData?.brands||[];for(let r of t){if(/edge/i.test(r.brand))return"edge";if(/opera/i.test(r.brand))return"opera";if(/chrome/i.test(r.brand))return"chrome"}let e=navigator.userAgent||"";return/edg/i.test(e)?"edge":/opr\//i.test(e)?"opera":/firefox/i.test(e)?"firefox":/safari/i.test(e)&&!/chrome|chromium|edg/i.test(e)?"safari":/chrome|chromium/i.test(e)?"chrome":"unknown"}function Re(){let e=(navigator.userAgentData?.platform||navigator.platform||"").toLowerCase();return e.includes("mac")?"macos":e.includes("win")?"windows":e.includes("linux")?"linux":e.includes("android")?"android":e.includes("iphone")||e.includes("ipad")?"ios":e||"unknown"}function Oe(){return new Promise(t=>{if(!chrome.extension?.isAllowedIncognitoAccess){t(null);return}chrome.extension.isAllowedIncognitoAccess(e=>{t(!!e)})})}async function Le(){return{browserName:Ue(),platformName:Re(),language:navigator.language||"",languages:Array.isArray(navigator.languages)?navigator.languages:[],hardwareConcurrency:navigator.hardwareConcurrency??"",deviceMemory:navigator.deviceMemory??"",mobile:navigator.userAgentData?.mobile??!1,incognitoAccessAllowed:await Oe()}}async function H(){let{[S]:t}=await chrome.storage.local.get(S),e={firstInstalledAt:t?.firstInstalledAt||Date.now()};return e.firstInstalledAt!==t?.firstInstalledAt&&await chrome.storage.local.set({[S]:e}),e}function Ne(t){let e=new URLSearchParams({usp:"pp_url"});t&&e.set(`entry.${De}`,t);let r=`${B}?${e.toString()}`;return r.length>Me?(console.warn("Uninstall URL exceeded browser limit; falling back to Google Form without diagnostics",r.length),B):r}async function Pe(){let t=chrome.runtime.getManifest(),e=await chrome.storage.sync.get(["AmnGaze-settings","AmnGaze-auth-user","AmnGaze-allowed-sites"]),r=await chrome.storage.local.get(["crashInfo","turboModeStatus",P,S]),s=await Le(),n=r[S]||await H(),o={...v,...e["AmnGaze-settings"]||{}},a=e["AmnGaze-auth-user"]||{},i=e["AmnGaze-allowed-sites"]||[],u=r.crashInfo||{},d=r.turboModeStatus||{},c=r[P]||{},l=c.benchmark||{},m=new Set([...Array.isArray(o.whitelist)?o.whitelist:[],...Array.isArray(i)?i:[]]).size,y={"extension.version":t.version,"browser.name":s.browserName,"browser.platform":s.platformName,"browser.language":s.language,"browser.languages":s.languages.join(","),"browser.hardware_concurrency":s.hardwareConcurrency,"browser.device_memory_gb":s.deviceMemory,"browser.mobile":s.mobile,"install.first_installed_at":n.firstInstalledAt||"","install.incognito_access_allowed":s.incognitoAccessAllowed,"settings.extension_enabled":o.status,"settings.blur_images":o.blurImages,"settings.blur_videos":o.blurVideos,"settings.blur_male":o.blurMale,"settings.blur_female":o.blurFemale,"settings.unblur_images":o.unblurImages,"settings.unblur_videos":o.unblurVideos,"settings.specific_blur":o.specificBlur,"settings.gray_mode":o.gray,"settings.use_solid_color":o.useSolidColor,"settings.hide_video_toggle":o.hideVideoToggle,"settings.password_protection_enabled":o.passwordProtectionEnabled,"settings.companion_enabled":o.companionMode?.enabled,"settings.uninstall_prevention_enabled":o.uninstallPreventionEnabled,"settings.prevent_incognito_guest_enabled":o.preventIncognitoGuestEnabled,"settings.compare_mode_enabled":o.compareMode?.enabled,"settings.whitelist_count":m,"settings.blur_amount":o.blurAmount,"settings.strictness":o.strictness,"settings.score_threshold":o.scoreThreshold,"settings.detection_model":o.detectionModel,"settings.protection_mode":o.protectionMode,"account.is_authenticated":!!a?.uid,"account.is_premium":!!a?.isPremium,"account.is_trial_active":!!a?.isTrialActive,"runtime.crash_count":u.crashesCount||0,"runtime.crash_timestamp":u.crashTimestamp||"","runtime.turbo_active":!!d.active,"runtime.turbo_error":d.error||"","runtime.active_backend":c.activeBackend||"","runtime.saved_texture_limit":c.savedTextureLimit||"","runtime.detection_errors":c.detectionErrors||0,"runtime.last_detection_error_at":c.lastDetectionErrorAt||"","runtime.model_error_at":c.modelErrorAt||"","runtime.last_recreation_attempt_at":c.lastRecreationAttemptAt||"","benchmark.selected_model":l.selectedModel??o.detectionModel,"benchmark.average_time_ms":l.averageTimeMs??"","benchmark.sample_count":l.sampleCount??"","benchmark.raw_sample_count":l.rawSampleCount??"","benchmark.timeout":!!l.timeout,"benchmark.early_exit":!!l.earlyExit,"benchmark.recorded_at":l.recordedAt||"","benchmark.error":l.error||""};return{diagnosticsPayload:Y(y)}}async function Be(){try{await chrome.runtime.setUninstallURL("")}catch(t){}}async function W(){if(N=!0,!L){L=!0;try{for(;N;)N=!1,await Be()}finally{L=!1}}}var F=()=>new Promise(t=>{chrome.storage.sync.get(["AmniHaze-settings","AmnGaze-settings","amngaze-settings"],e=>{const o=e["AmniHaze-settings"]||e["AmnGaze-settings"]||e["amngaze-settings"];const merged={...v,...(o||{}),version:chrome.runtime.getManifest().version};Array.isArray(merged.whitelist)||(merged.whitelist=[]),chrome.storage.sync.set({"AmniHaze-settings":merged,"AmnGaze-settings":merged,"amngaze-settings":merged},()=>{C=!0,t()})})});(async()=>(await F(),console.log("Settings initialized"),await H(),await W()))();var A=async()=>{if(!chrome?.offscreen?.createDocument)return;if(!M)try{C||await F(),await chrome?.offscreen?.createDocument({url:chrome.runtime.getURL("dist/offscreen.html"),reasons:["DOM_PARSER","IFRAME_SCRIPTING"],justification:"Process Images and Firebase Authentication"}),console.log("offscreen document created"),M=!0}catch(t){t?.message.includes("single")||(console.error("Error creating offscreen document:",t),setTimeout(A,500))}},He=async()=>{await chrome.storage.sync.set({"amngaze-auth-user":{uid:"free_user",email:"free@AmnGaze.com",isPremium:true,emailVerified:true}});console.log("Auth state management initialized (mocked)");};async function re(){try{let e=(await chrome.storage.sync.get("AmnGaze-auth-token-expiry"))["AmnGaze-auth-token-expiry"];if(!e)return;let r=Date.now(),s=3*24*60*60*1e3;e-r<s&&(console.log("Token expiring soon, refreshing proactively"),await h.refreshToken())}catch(t){console.error("Error checking token expiry:",t)}}chrome.runtime.onInstalled.addListener(async t=>{try{await F(),await H(),await W(),await A(),await He();let e=chrome.runtime.getManifest();if(t?.reason==="install")console.log("New installation detected - showing onboarding wizard"),chrome.tabs.create({url:chrome.runtime.getURL("dist/options/options.html?tour=full")});else if(t?.reason==="update"){if(t.previousVersion==e.version||t.previousVersion==="0.6.8")return;console.log(`Extension updated from ${t.previousVersion} to ${e.version}`),chrome.tabs.create({url:chrome.runtime.getURL("dist/options/options.html?tour=update")})}$()}catch(e){console.error("Error during extension initialization:",e)}});setTimeout(async()=>{(!C||!M)&&await A()},500);chrome.runtime.onMessage.addListener((t,e,r)=>{if(t.type==="AmnGaze-getSettings"||t.type==="amngaze-getSettings"||t.type==="AmniHaze-getSettings")return chrome.storage.sync.get(["AmniHaze-settings","AmnGaze-settings","amngaze-settings"],s=>{const o=s["AmniHaze-settings"]||s["AmnGaze-settings"]||s["amngaze-settings"];const cfg={...v,...(o||{})};Array.isArray(cfg.whitelist)||(cfg.whitelist=[]),r(cfg)}),!0;if(t.type==="recreateOffscreen"){let s=Date.now(),n=s-J,o=[0,2e3,5e3,1e4,2e4],a=o[Math.min(O,o.length-1)];if(n<a){console.log(`AmnGaze== Skipping recreation, too soon (${n}ms < ${a}ms)`);return}J=s,O++,setTimeout(()=>{O=0},3e5),(async()=>(await $e(),M=!1,chrome?.offscreen?.closeDocument?.(),setTimeout(()=>{A(),oe()},1e3)))()}else{if(t.type==="ensureOffscreenDocument")return (chrome?.offscreen ? chrome.offscreen.hasDocument() : Promise.resolve(true)).then(s=>{s?(console.log("Offscreen document already exists"),r({success:!0})):(console.log("Creating offscreen document as it doesn't exist"),A().then(()=>{r({success:!0})}))}).catch(s=>{console.error("Error checking if offscreen document exists:",s),A().then(()=>{r({success:!0})})}),!0;if(t.type==="reloadExtension")chrome.storage.local.get("reloadingInfo",s=>{let{lastReload:n,reloadCount:o}=s.reloadingInfo??{lastReload:0,reloadCount:0};if(Date.now()-n>6e4){if(o>3){setTimeout(()=>{chrome.storage.local.set({reloadingInfo:{lastReload:Date.now(),reloadCount:0}})},3e5);return}chrome.storage.local.set({reloadingInfo:{lastReload:Date.now(),reloadCount:o+1}}),se()}});else if(t.type==="updateSettings"){let{key:s,value:n}=t.newSetting||{};return chrome.storage.sync.get(["AmniHaze-settings","AmnGaze-settings","amngaze-settings"],o=>{let a=o["AmniHaze-settings"]||o["AmnGaze-settings"]||o["amngaze-settings"]||{...v};s!==void 0&&(a[s]=n),Array.isArray(a.whitelist)||(a.whitelist=[]),chrome.storage.sync.set({"AmniHaze-settings":a,"AmnGaze-settings":a,"amngaze-settings":a},()=>{try{r({key:s,value:n,success:!0})}catch(e){}})}),!0}else if(t.type==="offscreen:authStateChanged")w.handleAuthStateChange(t.user);else if(t.type==="validateAuth"){if(t.user)return w.handleAuthStateChange(t.user).then(()=>r({success:!0})).catch(s=>{console.error("Error validating new user:",s),r({success:!1,error:s.message})}),!0}else{if(t.type==="checkPremiumStatus")return h.isPremiumUser().then(s=>{r({isPremium:s})}).catch(s=>{console.error("Error checking premium status:",s),r({isPremium:!1,error:s.message})}),!0;if(t.type==="AmnGaze-reportBlockedSite")return je(t.url).then(s=>r({success:s})),!0;if(t.type==="AmnGaze-harmfulSiteBlocked")return qe(t.url),r({success:!0}),!0}}if(t.type=="AmnGaze-updateBlockList")$();else{if(t.type==="relay-false-negative")return chrome.tabs.sendMessage(t.tabId,{type:"process-false-negative",imageUrl:t.imageUrl},s=>{s?.success||console.error("Failed to process false negative:",s?.error)}),r({success:!0}),!0;if(t.type==="relay-false-positive")return chrome.tabs.sendMessage(t.tabId,{type:"process-false-positive",imageUrl:t.imageUrl},s=>{s?.success||console.error("Failed to process false positive:",s?.error)}),r({success:!0}),!0;if(t.target==="offscreen")return!1;if(t.type==="start-turbo-mode")return Fe(r),!0;if(t.type==="get-turbo-status")return chrome.storage.local.get("turboModeStatus",s=>{r(s.turboModeStatus||{active:!1})}),!0;if(t.type==="stop-turbo-mode")return We(r),!0}});var k=!1;async function We(t){k=!0,await new Promise(e=>{chrome.runtime.sendMessage({target:"offscreen",type:"compare:stop"},r=>{console.log("Compare mode stop response:",r),e(r)})}),await chrome.storage.local.set({turboModeStatus:{active:!1,message:"Turbo mode stopped"}}),t({success:!0,stopped:!0})}async function Fe(t){k=!1;try{await chrome.storage.local.set({turboModeStatus:{active:!0,progress:0,totalTabs:0,currentTab:0,message:"Starting turbo mode..."}});let r=(await chrome.storage.sync.get(["AmnGaze-settings"]))["AmnGaze-settings"]||{};r.compareMode=r.compareMode||{},r.compareMode.enabled=!0,await chrome.storage.sync.set({"AmnGaze-settings":r}),await new Promise(i=>{chrome.runtime.sendMessage({target:"offscreen",type:"compare:start"},u=>{console.log("Compare mode start response:",u),i(u)})});let s=await chrome.tabs.query({currentWindow:!0}),n=s.length,o=0;await chrome.storage.local.set({turboModeStatus:{active:!0,progress:0,totalTabs:n,currentTab:0,message:`Processing ${n} tabs...`}});for(let i of s){if(k){console.log("Turbo mode aborted by user");break}try{await chrome.storage.local.set({turboModeStatus:{active:!0,progress:Math.round(o/n*100),totalTabs:n,currentTab:o+1,message:`Processing tab ${o+1}/${n}: ${i.title||i.url}`}}),await chrome.tabs.update(i.id,{active:!0}),await new Promise(u=>setTimeout(u,500)),await chrome.tabs.reload(i.id),await new Promise(u=>{let d=(c,l)=>{c===i.id&&l.status==="complete"&&(chrome.tabs.onUpdated.removeListener(d),u())};chrome.tabs.onUpdated.addListener(d),setTimeout(u,1e4)});try{await chrome.tabs.sendMessage(i.id,{type:"toggleInfiniteScroll",scrollSpeed:100,scrollDelay:1})}catch(u){console.log(`Could not apply infinite scroll to tab ${i.id}:`,u)}o++,await new Promise(u=>setTimeout(u,5e3))}catch(u){console.error(`Error processing tab ${i.id}:`,u),o++}}let a=k;await chrome.storage.local.set({turboModeStatus:{active:!1,progress:a?Math.round(o/n*100):100,totalTabs:n,currentTab:o,message:a?`Stopped! Processed ${o} of ${n} tabs.`:`Completed! Processed ${o} tabs.`}}),a||chrome.notifications.create({type:"basic",iconUrl:chrome.runtime.getURL("src/assets/amngaze-icon-128.png"),title:"Turbo Mode Complete",message:`Processed ${o} tabs with comparison mode and infinite scroll`}),t({success:!0,processed:o,total:n})}catch(e){console.error("Turbo mode error:",e),await chrome.storage.local.set({turboModeStatus:{active:!1,error:e.message,message:"Turbo mode failed"}}),t({success:!1,error:e.message})}}var $e=async()=>{let t=await chrome.storage.local.get("crashInfo"),{crashTimestamp:e=0,crashesCount:r=0}=t.crashInfo||{},s=Date.now(),n=r+1,o=e||s;if(s-o>12e4&&(n=1,o=s),await chrome.storage.local.set({crashInfo:{crashTimestamp:o,crashesCount:n}}),n>=3){let i=(await chrome.storage.local.get("lastCrashReload")).lastCrashReload||0;if(s-i<3e5){console.log("AmnGaze== Already reloaded recently, skipping to prevent reload loop"),await chrome.storage.local.set({crashInfo:{crashTimestamp:0,crashesCount:0}});return}await chrome.storage.local.set({lastCrashReload:s}),await chrome.storage.local.set({crashInfo:{crashTimestamp:0,crashesCount:0}}),console.log("AmnGaze== 3 crashes in 2 minutes, reloading extension"),se()}};chrome.contextMenus.remove("report-image",()=>{chrome.runtime.lastError,chrome.contextMenus.create({id:"report-image",title:"AmnGaze - Report Image",contexts:["image"],enabled:!0})});function ze(t,e,r){chrome.scripting.executeScript({target:{tabId:t.id},func:(s,n,o,a)=>{let i=document.getElementById("AmnGaze-report-modal");i&&i.remove();let u=`
        <div class="AmnGaze-report-modal" dir="ltr">
          <div class="AmnGaze-modal-content">
            <div class="AmnGaze-modal-header">
              <div class="AmnGaze-header-title">
                <img src="${chrome.runtime.getURL("src/assets/amngaze-icon-48.png")}" width="24" height="24" alt="AmnGaze">
                <h3>Report Image</h3>
              </div>
              <button class="AmnGaze-close-button">&times;</button>
            </div>
            <div class="AmnGaze-modal-body">
              <p class="AmnGaze-description">Help us improve our detection by reporting any issues.</p>
              <div class="AmnGaze-image-section">
                <button class="AmnGaze-toggle-image AmnGaze-button AmnGaze-button-secondary">
                  <span class="AmnGaze-toggle-text">Show Image</span>
                  <span class="AmnGaze-toggle-arrow">\u25B6</span>
                </button>
                <div class="AmnGaze-image-preview" style="display: none;">
                  <img src="${s}" alt="Content preview">
                </div>
              </div>
              <div class="AmnGaze-report-options">
                <p class="AmnGaze-label">What's wrong with this detection?</p>
                <label class="AmnGaze-radio-label">
                  <input type="radio" name="report-type" value="false-positive">
                  <span>False Positive - Content was wrongly blurred</span>
                </label>
                <label class="AmnGaze-radio-label">
                  <input type="radio" name="report-type" value="false-negative">
                  <span>False Negative - Inappropriate content wasn't blurred</span>
                </label>
              </div>
            </div>
            <div class="AmnGaze-modal-footer">
              <button class="AmnGaze-button AmnGaze-button-secondary AmnGaze-cancel-button">Cancel</button>
              <button class="AmnGaze-button AmnGaze-button-primary AmnGaze-submit-button" disabled>Send Report</button>
            </div>
          </div>
        </div>
      `,d=document.createElement("div");d.id="AmnGaze-report-modal";let c=d.attachShadow({mode:"closed"}),l=document.createElement("style");l.textContent=`
        /* CSS Reset for Shadow DOM */
        :host {
          all: initial;
          display: block;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.5;
        }
        
        .AmnGaze-report-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333;
          font-size: 14px;
          font-weight: normal;
          text-align: left;
          letter-spacing: normal;
          word-spacing: normal;
          text-transform: none;
          text-indent: 0;
          text-shadow: none;
          text-decoration: none;
        }

        .AmnGaze-modal-content {
          background: white;
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          color: #333;
          font-size: 14px;
        }

        .AmnGaze-modal-header {
          padding: 16px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .AmnGaze-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .AmnGaze-header-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          line-height: 1.2;
          text-transform: none;
          letter-spacing: normal;
        }

        .AmnGaze-close-button {
          border: none;
          background: none;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
        }

        .AmnGaze-close-button:hover {
          opacity: 1;
        }

        .AmnGaze-modal-body {
          padding: 16px;
        }

        .AmnGaze-description {
          margin: 0 0 16px;
          opacity: 0.7;
          font-size: 14px;
          color: #666;
          font-weight: normal;
          line-height: 1.5;
        }

         .AmnGaze-radio-label {
          display: flex;
          align-items: flex-start;
          padding: 8px 0;
          cursor: pointer;
          gap: 12px;
          position: relative;
        }

        .AmnGaze-radio-label input[type="radio"] {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
          width: 20px;
          height: 20px;
          border: 2px solid #ccc;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 2px;
          position: relative;
          transition: all 0.2s ease;
        }

        .AmnGaze-radio-label:hover input[type="radio"] {
          border-color: #2196f3;
        }

        .AmnGaze-radio-label input[type="radio"]:checked {
          border-color: #2196f3;
          border-width: 6px;
          background: white;
        }

        .AmnGaze-radio-label span {
          font-size: 14px;
          color: #444;
          line-height: 1.4;
          padding-top: 2px;
        }

        .AmnGaze-report-options {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .AmnGaze-label {
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
          display: block;
          line-height: 1.5;
        }

        .AmnGaze-image-section {
          margin-bottom: 16px;
        }

        .AmnGaze-toggle-image {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .AmnGaze-toggle-arrow {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .AmnGaze-toggle-image.expanded .AmnGaze-toggle-arrow {
          transform: rotate(90deg);
        }

        .AmnGaze-image-preview {
          background: #f5f5f5;
          border-radius: 4px;
          text-align: center;
          padding: 8px;
          transition: all 0.3s ease;
        }

        .AmnGaze-image-preview img {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
        }

        .AmnGaze-modal-footer {
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .AmnGaze-button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
          line-height: 1.5;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-decoration: none;
          text-transform: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .AmnGaze-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .AmnGaze-button-primary {
          background: #2196f3;
          color: white;
        }

        .AmnGaze-button-primary:not(:disabled):hover {
          background: #1976d2;
        }

        .AmnGaze-button-secondary {
          background: #f5f5f5;
          background-color: #f5f5f5;
          color: #333;
        }

        .AmnGaze-button-secondary:hover {
          background: #e5e5e5;
        }

        .AmnGaze-success-message {
          text-align: center;
          padding: 32px 16px;
        }

        .AmnGaze-success-message h3 {
          color: #4caf50;
          margin: 0 0 8px;
        }
      `,c.replaceChildren(...new DOMParser().parseFromString(u,"text/html").body.childNodes),c.prepend(l),document.body.appendChild(d);let m=c.querySelector(".AmnGaze-report-modal"),y=c.querySelector(".AmnGaze-close-button"),f=c.querySelector(".AmnGaze-cancel-button"),x=c.querySelector(".AmnGaze-submit-button"),ie=c.querySelectorAll('input[name="report-type"]'),ce=c.querySelector(".AmnGaze-modal-content"),D=c.querySelector(".AmnGaze-toggle-image"),le=c.querySelector(".AmnGaze-image-preview"),ue=c.querySelector(".AmnGaze-toggle-text"),E=()=>d.remove();D.addEventListener("click",()=>{let b=D.classList.contains("expanded");D.classList.toggle("expanded"),le.style.display=b?"none":"block",ue.textContent=b?"Show Image":"Hide Image"}),y.addEventListener("click",E),f.addEventListener("click",E),m.addEventListener("click",b=>{b.target===m&&E()}),ie.forEach(b=>{b.addEventListener("change",()=>{x.disabled=!1})}),x.addEventListener("click",async()=>{let b=c.querySelector('input[name="report-type"]:checked').value,U=c.querySelector(".AmnGaze-image-preview img").src;x.disabled=!0,x.textContent="Sending...";let de="625186413",he="1528363305",me="2049916266",ge="2050137681",fe=await chrome.storage.sync.get("AmnGaze-settings"),pe="928202137",be=o?.originalSrc,we="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfHbTsJaydX__sCbv7aGf0RiVBxTcbBSzv5LU-VALJm1TFnlg/formResponse",ye=new URLSearchParams({[`entry.${de}`]:b,[`entry.${he}`]:U,[`entry.${pe}`]:be,[`entry.${me}`]:n,[`entry.${ge}`]:JSON.stringify(fe["AmnGaze-settings"])});try{b==="false-negative"?chrome.runtime.sendMessage({type:"relay-false-negative",tabId:a,imageUrl:U}):b==="false-positive"&&chrome.runtime.sendMessage({type:"relay-false-positive",tabId:a,imageUrl:U}),await fetch(we,{method:"POST",mode:"no-cors",body:ye}),ce.replaceChildren(...new DOMParser().parseFromString(`
            <div class="AmnGaze-success-message">
              <h3>Thank You!</h3>
              <p>Your report has been submitted successfully.<br>We appreciate your help in improving AmnGaze.</p>
            </div>
          `,"text/html").body.childNodes),setTimeout(E,2e3)}catch(xe){console.error("Failed to send report:",xe),x.textContent="Send Report",x.disabled=!1}})},args:[e.srcUrl,e.pageUrl,r,t.id]})}chrome.contextMenus.onClicked.addListener(async(t,e)=>{if(t.menuItemId==="report-image"){let r=await chrome.tabs.sendMessage(e.id,{type:"get-reported-image-info",url:t.srcUrl});ze(e,t,r)}return!0});function se(){if(typeof chrome?.offscreen!=="undefined"&&chrome.runtime?.reload){chrome.runtime.reload(),oe()}}function oe(){let t={active:!0,lastFocusedWindow:!0};chrome.tabs.query(t,([e])=>{chrome.scripting.executeScript({target:{tabId:e.id},files:["dist/content.js"]})})}var Ge=100,K=1e4,Ve=async()=>{try{let e=null;try{let f=await fetch("https://raw.githubusercontent.com/alganzoryP/hb-related/refs/heads/main/blocklist.json",{cache:"no-cache"});if(f.ok){e=await f.json();if(e?.blocked?.length)await chrome.storage.local.set({"amngaze_cached_blocklist":e})}}catch(err){console.warn("[AmniHaze-BLOCK] Remote blocklist fetch failed:",err)}if(!e?.blocked?.length){let c=await chrome.storage.local.get("amngaze_cached_blocklist");e=c?.amngaze_cached_blocklist}if(!e?.blocked?.length){try{let f=await fetch(chrome.runtime.getURL("data/blocklists/adult-domains.json"));if(f.ok){let l=await f.json();if(Array.isArray(l)&&l.length)e={blocked:l,allowed:["google.com","bing.com","duckduckgo.com","youtube.com","wikipedia.org","github.com","alhaq-initiative.org"]}}}catch(err){}}if(!e?.blocked?.length){e={blocked:["pornhub.com","xvideos.com","xnxx.com","xhamster.com","redtube.com","youporn.com","tube8.com","beeg.com","chaturbate.com","stripchat.com","onlyfans.com","camsoda.com","livejasmin.com","bonga.com","spankbang.com","eporner.com","tnaflix.com","heavy-r.com","hentaihaven.xxx","nhentai.net","hanime.tv","rule34.xxx","gelbooru.com","e-hentai.org","luscious.net","brazzers.com","bangbros.com","realitykings.com","naughtyamerica.com","mofos.com","motherless.com","daftsex.com","hqporner.com","fuq.com","thumbzilla.com"],allowed:["google.com","bing.com","duckduckgo.com","youtube.com","wikipedia.org","github.com","alhaq-initiative.org"]}}let{blocked:r,allowed:s}=e,n=[],o=r.reduce((l,m,y)=>y%5===0?(n.push(l),m):`${l}|${m}`);n.push(o);let a=n.map((l,m)=>({id:Ge+m,priority:1,action:{type:"redirect",redirect:{regexSubstitution:`${chrome.runtime.getURL("src/assets/blocked/blocked.html")}?url=\\0`}},condition:{regexFilter:`^[^:]*:\\/\\/(?:[^/]*(?:${l}))[^/]*\\/`,resourceTypes:["main_frame"]}})),i=s.map((l,m)=>({id:K+m,priority:2,action:{type:"allow"},condition:{regexFilter:`^[^:]*:\\/\\/(?:(?:www\\.)?(?:[^\\/]*\\.)?${l}\\.[^\\/]*)\\/`,resourceTypes:["main_frame"]}})),c=((await chrome.storage.sync.get("AmnGaze-allowed-sites"))["AmnGaze-allowed-sites"]||[]).map((l,m)=>({id:K+s.length+m,priority:3,action:{type:"allow"},condition:{urlFilter:`||${l}^`,resourceTypes:["main_frame"]}}));return[...a,...i,...c]}catch(t){return console.error("Error creating rules:",t),[]}},$=async()=>{try{if(!chrome?.declarativeNetRequest)return;let e=(await chrome.declarativeNetRequest.getDynamicRules()).map(s=>s.id),r=await Ve();if(r&&r.length>0){await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:e,addRules:r});console.log(`[AmniHaze-BLOCK] Dynamic adult blocking rules active (${r.length} rules)`)}}catch(t){console.error("Error initializing rules:",t)}},je=async t=>{try{let{hostname:e}=new URL(t),s=(await chrome.storage.sync.get("AmnGaze-allowed-sites"))["AmnGaze-allowed-sites"]||[];s.includes(e)||(s.push(e),await chrome.storage.sync.set({"AmnGaze-allowed-sites":s})),await $();try{let n="https://docs.google.com/forms/u/0/d/e/1FAIpQLSeI4RsKKr1kDVaOTJ96QJpphiuNC225CJfr02-rNcbr5pB5AA/formResponse",o="1516836759",a=new URLSearchParams({[`entry.${o}`]:t});fetch(n,{method:"POST",mode:"no-cors",body:a})}catch(n){console.error("Failed to send report:",n)}return!0}catch(e){return console.error("Error handling false positive report:",e),!1}},qe=async t=>{try{let r=(await chrome.storage.sync.get("AmnGaze-settings"))["AmnGaze-settings"]?.companionMode;if(!r?.enabled||!r?.email)return;if(!await h.isPremiumUser()){console.error("Companion notification attempted without premium access");return}try{await h.sendCompanionNotification({email:r.email,modifications:{harmfulSiteBlocked:{url:t,timestamp:new Date().toISOString()}},url:t,isHarmfulSiteNotification:!0})}catch(n){console.error("Failed to send harmful site notification:",n)}}catch(e){console.error("Error handling harmful site blocked:",e)}};async function ne(){try{let e=(await chrome.storage.sync.get("AmnGaze-auth-user"))["AmnGaze-auth-user"];if(!e||!e.uid){console.log("No authenticated user found, skipping customer state sync");return}await h.syncCustomerState(),console.log("Customer state synchronized successfully")}catch(t){console.error("Error synchronizing customer state:",t)}}async function ae(){try{if(!await w.isAuthenticated())return;let e=await w.getUser();if(!e||!e.trialEndDate)return;let r=new Date;if(!(new Date(e.trialEndDate)<r&&!e.isPremium))return;let o=await chrome.storage.local.get(["trialExpirationNotified","trialExpirationRemindLater","trialExpirationNotificationCount"]),a=o.trialExpirationNotified,i=o.trialExpirationRemindLater,u=o.trialExpirationNotificationCount||0,d=!1,c=24*60*60*1e3;a?(i&&r.getTime()>=i||u===1&&r.getTime()-a>=c)&&(d=!0):d=!0,d&&u<2&&(chrome.tabs.create({url:chrome.runtime.getURL("dist/options/options.html?trialExpired=true")}),await chrome.storage.local.set({trialExpirationNotified:r.getTime(),trialExpirationNotificationCount:u+1}),i&&await chrome.storage.local.remove("trialExpirationRemindLater"))}catch(t){console.error("Error checking trial expiration:",t)}}chrome.alarms.onAlarm.addListener(async t=>{t.name===ee?await ne():t.name===Z?await w.validateAuthState():t.name==="tokenRefreshAlarm"?await re():t.name===te&&await ae()});chrome.storage.onChanged.addListener(async(t,e)=>{if(e==="sync"&&(t["AmnGaze-settings"]||t["amngaze-settings"])){const _settChange=t["AmnGaze-settings"]||t["amngaze-settings"];let s=_settChange.newValue,n=_settChange.oldValue,o=s?.companionMode,a=n?.companionMode;if(o?.enabled&&o?.email){let i=Date.now(),u=o.lastNotificationTime||0,d=30*1e3;if(i-u>d){if(!await h.isPremiumUser()){console.error("Companion notification attempted without premium access");let f={...s};f.companionMode={...o,enabled:!1},chrome.storage.sync.set({"AmnGaze-settings":f});return}let l={},m=["detectionModel","version","trialWelcomeShown"];for(let f in s)!m.includes(f)&&JSON.stringify(s[f])!==JSON.stringify(n?.[f])&&(l[f]={old:n?.[f],new:s[f]});let y=JSON.stringify(o)!==JSON.stringify(a);if(Object.keys(l).length>0&&!y)try{await h.sendCompanionNotification({email:o.email,modifications:l,url:"Extension Settings"});let f={...s};f.companionMode={...o,lastNotificationTime:i},chrome.storage.sync.set({"AmnGaze-settings":f})}catch(f){console.error("Error sending companion notification:",f)}}}}(e==="sync"&&(t["AmnGaze-settings"]||t["amngaze-settings"]||t["AmnGaze-auth-user"]||t["AmnGaze-allowed-sites"])||e==="local"&&(t.crashInfo||t.turboModeStatus||t[P]||t[S]))&&await W()});


