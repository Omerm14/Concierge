# Breaking iPlan: Competitive Strategy & Product Plan

*Israeli wedding & events tech — market entry strategy*
*Prepared for Omer · Draft v2 (sharpened via product-brainstorming pass) · July 2026*

---

## 0. Read this first — the one thing that changes everything

You told me iPlan dominates (~70%), couples hate the product, it's "not smart," and it's expensive. All of that checks out in the research. But the conclusion most people draw from it — *"they have a bad product, so a better product wins"* — is **wrong**, and building on that assumption is the fastest way to burn 18 months.

Here is the reality the research exposes:

> **iPlan's moat is not their product. It's their distribution.** Couples don't *choose* iPlan. **Venues impose it on them.** iPlan sells its real product to venues (a full business-operations SaaS), venues run their whole operation on it, and then couples get funneled in and up-sold on RSVP and messaging. One reviewer literally called it *"a monopoly here with the venues."*

That single fact reframes the entire strategy. You cannot beat a distribution moat with a better couple-facing feature set alone. If you build the world's best wedding app and a venue still hands every couple an iPlan login, you've won nothing.

So this document is built around the real question: **not "how do I build a better product?" but "how do I break the venue → couple funnel that gives iPlan 70%?"**

The good news: their moat *has* a crack, and it's the exact place they're weakest. This plan targets that crack.

> **⚠️ Sharpened after brainstorm pass — read the trap in the crack.** There's a subtlety that kills the naive version of this plan. The venue hands the couple **seating for free** when it creates their event. So by the time a couple would consider you, they *already have working seating inside iPlan*. Your ask is therefore not "decline iPlan" — it's "abandon a free thing you already have and redo the work in my tool." That's a hard behavior change. The couple's **only real decision point** — where money and genuine choice exist — is the **RSVP purchase**. Two implications drive the rest of this doc: **(1)** win the RSVP decision first and let better free seating pull couples over as a bonus; and **(2)** the *clean* escape is to capture the couple **upstream, before the venue ever creates the iPlan event** — at engagement. Whoever owns the couple first owns the data flow. iPlan owns them via the venue; your job is to get there earlier.

---

## 1. Market context — is this even worth attacking?

Yes. It's a large, high-value, emotionally-charged, recurring-in-aggregate market.

| Metric | Figure | Source signal |
|---|---|---|
| Weddings registered in Israel / year | ~50,000–67,000 | CBS (Central Bureau of Statistics) reports |
| Total wedding market turnover / year | ~₪40 billion | Industry data (Easy2Give) |
| Average wedding cost | ₪100,000–150,000 (~300 guests) | Multiple 2025–26 industry sources |
| What a couple pays iPlan (RSVP + messaging) | ₪300–₪2,990 | Real couple reviews (mit4mit, WedReviews) |
| iPlan per-record RSVP pricing | ~₪2.5 / record | Couple-reported sales offer |

**Beyond weddings:** iPlan's platform also serves bar/bat mitzvahs, brit milah, corporate events, and any venue-based event. Your serviceable market is bigger than weddings alone — but weddings are the emotional, high-spend beachhead to start with.

**Napkin math on the wedge:** If ~55,000 weddings/year each spend an average of ~₪600 on RSVP/messaging today, that's a ~₪33M/year couple-facing RSVP layer alone — before you touch the far larger venue/vendor SaaS money or the vendor-marketplace opportunity. Capturing even 10–15% of the couple layer is a real business; the couple layer is also just the *wedge*, not the prize.

---

## 2. iPlan teardown — what they actually are

iPlan is not one product. It's **two products stitched into a funnel:**

### Product A — The venue/vendor SaaS (their real moat)
Sold to venues and vendors as an all-in-one operations system:
- CRM for leads and clients
- Event & meeting calendar
- Quotes, invoices, receipts (digitally signed)
- Menu builder
- **Scaled, realistic seating/floor-plan designer** (modeled on the actual venue)
- Reception check-in stations (iPad/mobile apps)
- Reports, analytics, cash-flow visibility

Venues **love** this. Reviews from venues are glowing — faster quotes, better cash-flow control, real-time headcount during the event. A venue doing 300 events/year runs its entire business on it. **This is the part you must respect, not underestimate.**

### Product B — The couple-facing layer (their revenue extraction + their weakness)
Once the venue creates the event, the couple gets access to:
- Guest list management
- Seating sketch (synced to the venue's floor plan)
- **RSVP service** (אישורי הגעה) — SMS, WhatsApp, call-center
- Guest messaging (save-the-date, reminders, "thank you")
- Digital invitation
- Credit-card gifting

### The funnel (how 70% actually happens)
```
Venue runs its business on iPlan  →  Venue creates the couple's event in iPlan (free seating)
        →  Couple is now "inside" iPlan  →  iPlan up-sells RSVP + messaging to the couple
        →  RSVP data auto-syncs into the seating the venue already built  →  LOCK-IN
```

### The lock-in mechanism (the crux)
Cheaper RSVP competitors already exist (~₪100–200 vs iPlan's ₪300–3,000). Couples *know* iPlan is expensive. They pay anyway because:

> **iPlan's RSVP is "the only one that auto-syncs with the seating system"** the venue already set up. Using a cheaper competitor means doing the seating work twice, by hand. That sync — not the RSVP quality — is the lock.

**Break the sync dependency and you break the lock.** Everything downstream in this plan flows from that sentence.

---

## 3. Where iPlan is genuinely weak (evidence-based)

These are not my opinions — they're recurring themes from real couple reviews (mit4mit, WedReviews) and the couple-side product itself.

**Pricing rage (their biggest liability).** The single most common emotional word in negative reviews is theft. Couples describe it as *"feels like being robbed,"* *"extortion,"* *"RUN."* Drivers:
- Per-record pricing that balloons with guest count
- A "VIP" package couples felt was misleading (didn't include what they actually came to buy)
- Opaque, upsell-heavy sales; price "after squeezing"
- Roughly **2× the price of competitors** for the RSVP + digital-invite + gifting bundle

**A dated, desktop-era product.**
- UI described as *outdated* (מיושן) on both guest list and seating
- **Seating is not usable on mobile at all** — you literally cannot drag a guest to a table on a phone. In a market where couples live on WhatsApp and their phones, this is a gaping hole.
- Only Excel import (no CSV)

**Not actually "smart."** Despite marketing "smart algorithms," the couple experience is manual forms and lists. Zero AI, zero automation, zero real intelligence. The couple does all the work.

**Missing modern guest-experience features.**
- No usable dietary handling: kids' meals, glatt, gluten-free, allergies aren't cleanly supported, and notes don't surface in the seating view
- WhatsApp only works for **local** numbers — fails for international / Anglo / immigrant guests (a large, high-value segment in Israel)
- Invitations go out **under iPlan's brand**, not the couple's — impersonal and slightly spammy
- Broken chat/support button reported

**Privacy friction.** The venue can see the couple's guest data. Couples are uneasy that the hall owner sees their list, RSVPs, and choices.

### Balanced view — don't kid yourself
iPlan is **not** universally hated. Many reviews praise fast, kind customer service and a reliable core. They reset message packages for couples who postponed weddings during wartime. The *core RSVP job* mostly works. So your attack can't be "they're terrible" (they're not) — it has to be **"we make you feel respected, we're radically cheaper and transparent, we're actually smart, and we're built for your phone."**

---

## 4. Feature & positioning comparison

| Capability | iPlan | Cheap RSVP tools | **You (target)** | Why it matters |
|---|---|---|---|---|
| RSVP (SMS/WhatsApp/call) | Strong | Adequate | **Strong** | Table stakes |
| Seating ↔ RSVP sync | Strong (the lock) | Absent | **Strong (owned by you)** | The lock-in — must neutralize |
| Mobile seating (drag on phone) | **Absent** | Absent | **Strong** | Couples are mobile-first |
| AI / automation | Absent | Absent | **Strong** | The "smart" gap; your identity |
| WhatsApp-native, multilingual guest UX | Weak (local only) | Weak | **Strong** | Israel's mixed/international guests |
| Pricing transparency | **Weak (rage)** | Adequate | **Strong (flat)** | Their #1 liability |
| Couple-branded invitations | Weak (iPlan-branded) | Varies | **Strong** | It's the couple's day, not yours |
| Venue operations SaaS | **Strong** | Absent | Absent → later | Their true moat — don't fight here yet |
| Vendor discovery / marketplace | Weak | Absent | **Strong (flywheel)** | Second revenue engine + venue wedge |

**Positioning gap you can own (unclaimed today):**

> *For couples who want their wedding planned without the stress and the rip-off, **Concierge** is an AI wedding concierge that runs your whole guest experience from WhatsApp — for one honest flat price. Unlike iPlan, you're not a hostage of your venue, you're not paying per guest, and it actually does the work for you.*

**The job to be done (brainstorm reframe — this is your real axis of attack).** iPlan does the *functional* job (manage RSVP + seating) adequately. Where it fails is the **emotional/social job**: *"When I'm drowning in wedding logistics and scared of screwing up the biggest day of my life, I want to feel in control and not ripped off, so I can actually enjoy being engaged."* That emotional job is where an AI concierge structurally wins and where a **venue-tools company can't follow** — iPlan's customer is the venue, not the couple's peace of mind. Compete there, not on a feature checklist.

Two consequences most people miss:
- **Your free tier's real competitor is DIY, not iPlan.** Couples literally say *"I'll just broadcast on WhatsApp myself."* Non-consumption is the incumbent for the low end. Free has to beat a group broadcast, not just beat iPlan.
- **Don't fall into the feature-parity trap.** The table above is a map of where they're soft, *not* a build list. If you build "everything they have, but better," you'll sprawl for 18 months and hand them time to copy you. Build the wedge (§14), win on the axis they can't pivot to (relationship + emotional job + guest graph), ignore the rest for now.

---

## 5. The strategic trap (honest pushback before you commit)

Before the exciting part, four hard truths. If you can't answer these, don't start.

1. **A better couple product wins zero venues by itself.** Venues are the distribution. You need a plan to make the venue irrelevant *or* to win venues — a great app alone does neither.

2. **Weddings have no repeat purchase.** A couple buys once, ever. That means your customer-acquisition cost must be repaid in a *single* transaction, or through a *second* revenue engine (vendor marketplace), or through *virality* (each wedding exposes ~300 guests — future couples — to your brand). Retention-SaaS thinking doesn't apply. Virality and marketplace aren't nice-to-haves here; they're survival.

3. **iPlan can copy any single feature faster than you can win the market.** Mobile seating, WhatsApp, AI — they can bolt these on. So no single feature is your moat. Your defensibility is **speed + AI-native architecture + owning the couple upstream (from engagement, before the venue) + brand love + the vendor flywheel** — combined, not any one.

4. **Couples spend ₪100–150K on the most emotional day of their life.** They will not gamble it on an unknown startup without heavy social proof and reliability guarantees. Trust is a feature you have to build deliberately.

None of these kill the idea. They *shape* it — which is what the rest of this plan does.

---

## 6. Three ways in — and the one I recommend

**Path A — Frontal assault (beat them at the venue layer).** Build a better venue SaaS, win venues directly. → *Hardest. Long B2B sales cycles, brutal switching costs, and iPlan is genuinely loved by venues. Not a starting move for a solo founder. This is a Phase 3 play, not Phase 1.*

**Path B — Flank (direct-to-couple, detach RSVP from the venue).** Win the couple regardless of venue by being dramatically better/cheaper AND solving the seating-sync objection yourself. → *Viable wedge. The whole game is breaking the sync lock.*

**Path C — Change the game (AI-native "wedding OS" owning the couple from engagement).** Capture the couple the moment they get engaged — *months before a venue is chosen* — and make RSVP/seating a commodity feature inside a much bigger AI concierge. → *Highest ceiling, most defensible, and it plays directly to your existing AI + WhatsApp-agent strengths.*

### Recommended: **B as the wedge, C as the destination, A as the endgame.**

Start with a direct-to-couple AI-native RSVP + guest-experience product that **neutralizes the seating lock-in by owning seating itself**. Grow it into the full AI wedding concierge that owns the couple from engagement. Then — once couples are actively *pulling* you into venues — reverse iPlan's distribution: instead of venues dragging couples into your tool, **couples drag venues onto your platform.**

---

## 7. The edge — how you neutralize the lock-in

The lock-in is: *"iPlan RSVP is the only one that syncs to the seating the venue built."* You defeat it three ways, stacked:

1. **Own the seating yourself — and make it 10× better.** The couple builds their seating chart on *your* platform: mobile-first (drag on a phone — the thing iPlan literally can't do), AI auto-seating ("keep these families together, keep the divorced aunt away from her ex, fill tables evenly"), with dietary/allergy/kids-meal tags that actually surface on the chart. When *you* own a better seating chart, "syncs to iPlan's seating" stops being a reason to buy iPlan.

2. **Give the venue what it needs — for free — without iPlan.** The venue only needs a few things from the seating system: final headcount, the table layout, dietary totals for the kitchen, and a check-in list. Generate a clean, read-only **"Venue View"** (printable + shareable link) that hands the venue exactly that. Now the couple can tell the venue *"here's everything you need — I'm not buying iPlan."* This is the crowbar.

3. **Win venues bottom-up, later.** Every time a couple shares a Venue View, the venue sees your brand and a better artifact than iPlan produces. That's your zero-cost top of funnel into the venue/SaaS business — the same place iPlan makes its B2B money. You reverse their motion.

> **⚠️ The single riskiest assumption in this entire plan lives here.** The Venue View only works *if venues will accept it.* But venues run their kitchen, staffing, and floor off iPlan's **live** data — a static chart from an unknown tool may simply get refused: *"put your final numbers into iPlan, that's what we use."* If venues mandate iPlan seating as a condition of service, the crowbar snaps and Path B stalls. **This must be tested in week one, before any building** (see §14). It is cheaper to make five phone calls than to build the wrong product. And note the sequencing correction from §0: don't lead by asking couples to rebuild the free seating they already have — **lead with RSVP** (the real decision point) and let a better, free, mobile seating chart pull them over. Seating is the lock-breaker, but RSVP is the wedge.

---

## 8. The product — what actually creates stickiness

"Stickiness" in a no-repeat-purchase market means three specific things: **(a) become indispensable across the whole 12-month journey** (not just the RSVP week), **(b) engineer virality** (every guest is a future couple), and **(c) build a data/vendor flywheel**. Here's the product that does all three.

> **First-principles insight from the brainstorm — the guest graph is the only thing that compounds.** Because there's no repeat purchase, the durable asset you accumulate isn't a subscriber base — it's **data**. Every wedding is ~300 contacts with phone numbers, relationships (bride's side / groom's side / work / army), dietary prefs, RSVP-reliability, and gifting behavior — and hidden among those 300 are next year's couples and next decade's bar/bat-mitzvah parents. iPlan sits on this exact data and *wastes* it (siloed per venue, never activated). This should shape v0: **capture clean, consented guest data from day one, even in the free tier.** The RSVP flow isn't just a feature — it's how you build the graph. Treat it that way in the schema.

### 8.1 The AI Wedding Concierge (your core identity — the "smart" iPlan isn't)
A WhatsApp-native AI agent that becomes the couple's planning partner **from the day they get engaged** — long before a venue is picked. Conversational, in Hebrew (plus English / Russian / Arabic for Israel's mixed guest base):
- Budget planner and live budget tracker
- 12-month timeline with nudges ("time to book a photographer")
- Vendor shortlists tailored to their style and budget
- Guest-list building and de-duping
- Drafts messages, answers "how much should we spend on X," flags where they're overpaying

This is your differentiation *and* it captures the couple **upstream of the venue** — the structural counter to iPlan's whole funnel. It also leans directly on infrastructure you've already built (WhatsApp Business API, AI agents like Noga, the Cashflow stack).

### 8.2 Guest-side magic (your viral engine)
Every guest interacts through a delightful WhatsApp flow — *not* spammy SMS "under a stranger's name":
- One-tap RSVP, dietary/allergy/kids-meal, plus-ones
- **Auto-detected language** per guest (huge for international/Anglo/immigrant guests iPlan fails)
- Ride-share / carpool coordination between guests
- Credit-card gifting (you already know this space from Cashflow — PayPlus/Cardcom)
- Day-of: directions, parking, "which table am I at," live schedule

Every wedding = ~300 guests experiencing your brand at its best. Put a subtle *"planning your own wedding? →"* hook in the guest flow and each event becomes a funnel for the next couples. **This is how you beat the no-repeat-purchase problem.** iPlan already gets this guest exposure and *wastes* it (impersonal, spammy, iPlan-branded). You turn it into growth.

### 8.3 Mobile-first live seating (the lock-breaker from §7)
Drag on your phone. AI auto-seating. Dietary tags on the chart. Real-time day-of check-in. Generates the free "Venue View."

### 8.4 The vendor flywheel (your second revenue engine + venue wedge)
As couples plan on the platform, you become the **demand funnel** for vendors — photographers, DJs, caterers, designers. That's:
- A second revenue engine (qualified lead-gen / marketplace / featured listings) that fixes the CAC-payback math
- The natural on-ramp into the vendor/venue B2B side (Path A endgame), because you now own the couples the vendors want

### 8.5 Trust layer (because it's their wedding day)
- Reliability guarantee on RSVP/check-in (SLA-style promise)
- Social proof front and center (real couples, real venues)
- Radical transparency on pricing (see §9) — trust *is* the anti-iPlan positioning

---

## 9. Pricing — weaponize their biggest liability

iPlan's deepest wound is the "extortion" feeling: per-record gouging, opaque upsells, fake "VIP." Your pricing should be a **marketing weapon**, not just a number.

- **One flat price per wedding. Unlimited guests. Unlimited messages. No per-record anything.** Price it visibly *below* iPlan's ₪300–3,000 spread while delivering more (e.g., a single transparent tier around the low-middle of their range).
- **Freemium option to break in:** free guest list + basic RSVP; pay for the AI concierge, premium design, gifting, day-of tools. Free tier = acquisition + virality fuel.
- **Publish the price on the website.** iPlan doesn't. Transparency alone is a differentiator here.
- Second revenue engine (vendor marketplace) means you can afford to under-price the couple layer — iPlan can't easily follow without cannibalizing their model.

Anchor line for the site: *"No per-guest games. No 'VIP' tricks. One honest price, unlimited everything."*

**Brainstorm addition — the third revenue engine hiding in plain sight: gifting.** iPlan already runs credit-card gifting (מתנה באשראי). Do the math: ~₪100–150K of gifts flow through a *single* wedding, across ~55K weddings/year. Even a modest take-rate or processing margin on that volume can dwarf RSVP fees — and you already understand Israeli payments deeply from Cashflow (PayPlus/Cardcom). This reframes gifting from a "nice feature" to potentially your **largest** monetization lever, and it's naturally viral (every guest touches it). **Caveat:** this is a payments/PCI/regulated-money path — scope it deliberately with compliance, not as a v0 afterthought. But put it on the strategic map now, because it may change what the business *is*.

---

## 10. Go-to-market — how you break in without permission

You do **not** start by fighting for venues. You start where you need nobody's permission: the couple.

> **Brainstorm reframe — pick the beachhead where iPlan is weakest, not strongest.** The research flagged a real post-war shift toward **small, intimate weddings in non-conventional venues** — villas, restaurants, nature/boutique spaces. These venues **don't run iPlan's full operations stack**, so the seating-sync lock is weak or absent there, and no one is imposing iPlan on the couple. That is your soft underbelly: **open against boutique / nature / restaurant weddings, not 300-guest banquet halls.** Same couples, same pain, a fraction of the incumbent's grip. Prove the model where the lock doesn't hold, then push up-market into the halls once you have brand love and social proof.

**Phase 0 — Wedge (0–3 months): win couples directly, one channel deep, at boutique/small venues.**
- Instagram / TikTok where Israeli couples already are; wedding Facebook groups (מאורסים מאורסות etc.)
- Content marketing on the exact rage iPlan creates ("stop overpaying for אישורי הגעה")
- Partner with independent **wedding planners** (מפיקים) — they hate being locked to venue tools and influence many couples
- Target the **boutique/nature/restaurant segment first** (weak iPlan grip)
- Nail RSVP + mobile seating + flat pricing for a small cohort. Get 20–50 real weddings and obsessive testimonials.

**Phase 1 — Expand the couple product (3–9 months):**
- Ship the AI concierge; move capture upstream to engagement
- Turn on the guest-side viral hooks; instrument the funnel (you know product tracking)
- Launch the free "Venue View" — start letting couples decline iPlan out loud

**Phase 2 — Flip to venues bottom-up (9–18 months):**
- Use accumulated couple demand + Venue Views to approach venues: *"your couples already use us — plug in for free"*
- Begin the vendor marketplace; monetize lead-gen
- Only now consider a light venue-facing SaaS layer (Path A), armed with couples as leverage

**Note:** short season sensitivity — Israeli wedding demand spikes spring/summer and around ט"ו באב. Plan launches and ad spend around the season; use winter to build.

---

## 11. Risks & honest challenges (and how to blunt them)

| Risk | Severity | Mitigation |
|---|---|---|
| Seating-sync lock-in holds; venues insist on iPlan seating | **Highest** | **Test in Gate 0 before building (§14).** If halls mandate iPlan, pivot to boutique/nature/restaurant segment where the lock is weak; sign flagship venues as proof |
| No repeat purchase → CAC won't pay back | High | Engineer virality (guest → future couple) + vendor marketplace as 2nd revenue engine |
| iPlan copies mobile/WhatsApp/AI | Medium | Compete on speed + AI-native architecture + upstream capture + brand, not one feature |
| Couples won't trust an unknown with "the big day" | High | Heavy social proof, reliability SLA, flagship venue/planner endorsements |
| Payments/gifting = PCI, WhatsApp API template rules, SMS regs | Medium | You already navigated this with Cashflow (PayPlus/Cardcom, WhatsApp Business API) |
| Solo-founder bandwidth vs a full platform | High | Sequence ruthlessly: RSVP + mobile seating + flat price *first*. Everything else is later. |
| iPlan retaliates on price / leans on venue relationships | Medium | Your flat/transparent pricing is hard for them to match without breaking their per-record model |

---

## 12. 90-day starting plan (if you decide to go)

1. **Validate the lock-breaker.** Talk to 10 recently-married couples and 5 venues. Confirm: would a great free "Venue View" actually let a couple decline iPlan? This is the make-or-break assumption — test it before building.
2. **Talk to 5 independent wedding planners.** They're your cheapest distribution and your reality check.
3. **Build the thin wedge:** WhatsApp RSVP + mobile drag-and-drop seating + AI auto-seating + flat transparent price. Nothing else yet.
4. **Run 10–20 real weddings** at cost or free. Instrument everything. Collect testimonials like your life depends on it (it does).
5. **Decide** based on: did couples feel able to skip iPlan? Did guests convert into new couples? If yes to both — press. If no — the venue lock is stronger than the reviews suggest, and you re-plan around winning venues first.

---

## 13. Open questions for you

- **Naming:** this needs a brand. Does it sit under the new mother company (Labo / Ziklab / Ziklabo), or stand alone like Cashflow / Floory? A couple-facing consumer wedding brand probably wants its own warm, Hebrew-friendly name — separate from the B2B parent.
- **Scope of "events":** weddings only to start, or design for bar/bat mitzvah + corporate from day one? (Recommend: weddings-only wedge, architecture that generalizes later.)
- **Reuse:** how much of the Cashflow / Noga WhatsApp + AI + payments stack can you lift directly? That's your unfair speed advantage.
- **Appetite:** are you willing to run 10–20 weddings essentially for free to prove the lock-breaker? That validation is non-negotiable before real build.

---

## 14. Builder brief — for Claude Code (v0 scope, anti-scope, kill criteria)

*This section exists so the build stays disciplined. The strategy above is the "why"; this is the "build exactly this, and nothing else, until the gate passes."*

### Build order is driven by the riskiest assumption, not by the feature list
The purpose of v0 is **not** to launch a product — it's to **cheaply disprove the two assumptions that would kill the business.** Test order:

**Gate 0 — No code. Phone calls only (Week 1).**
- Riskiest assumption: *will venues accept an external "Venue View" instead of iPlan seating?* Call 5–8 venues (bias toward boutique/nature/restaurant). Ask: "If a couple brought you a clean seating chart + dietary totals + check-in list from another app, would you accept it, or do you require iPlan?"
- Second: talk to 10 recently-married couples + 5 planners. Where did the money and the rage actually land? Confirm RSVP (not seating) is the real decision point.
- **Kill/redirect criteria:** if most venues *mandate* iPlan seating, Path B stalls → pivot the plan toward the boutique segment (where they don't) or toward winning venues first. Do not build until this is answered.

### v0 scope (build only this) — the thin wedge
An **AI-native, WhatsApp-first RSVP + guest-experience** product for couples, sold flat-price, aimed at boutique/small-venue weddings:

1. **Guest list** — import (Excel **and** CSV — a cheap iPlan miss), manual add, dedupe, sides/groups tagging. **Schema built around the guest graph from day one** (consented contacts, relationships, dietary, RSVP status, gifting) — see §8.
2. **WhatsApp-native RSVP** — one-tap yes/no, plus-ones, dietary/allergy/kids-meal, **auto-detected language** (He/En/Ru/Ar). Couple-branded, never "Concierge"-branded to guests.
3. **Mobile-first seating** — drag on a phone (the thing iPlan can't do) + **AI auto-seating** from the guest graph. Dietary tags surface on the chart.
4. **Free "Venue View"** — read-only, shareable/printable: headcount, layout, dietary totals, check-in list. *This is the test artifact for the Gate-0 assumption; make it genuinely good.*
5. **Flat transparent price + published pricing page.** One tier, unlimited guests/messages.
6. **Instrumentation from line one** — funnel + a hard-wired viral hook ("planning your own wedding? →") in the guest flow. You need the virality data to know if CAC math works.

### Anti-scope (do NOT build in v0 — this is where you'll be tempted to sprawl)
- ❌ Venue/vendor operations SaaS (that's Path A, the *endgame* — not now)
- ❌ Full 12-month AI concierge / budget / vendor-shortlist (Phase 1, after wedge proves out)
- ❌ Vendor marketplace (Phase 2 revenue engine)
- ❌ Credit-card gifting / payments (strategically huge per §9, but regulated — deliberate later scope, not v0)
- ❌ "Feature parity with iPlan." If it's not one of the 6 items above, it waits.

### Kill criteria for the whole wedge (be honest at the gate)
After 10–20 real weddings run at/near cost:
- Did couples feel able to skip iPlan (or never need it)? **and**
- Did guests measurably convert into new couples (viral coefficient > 0, trending toward payback)?
- **Yes to both → press and fund Phase 1.** No to either → the lock is stronger than reviews suggest; re-plan around venues-first or the boutique niche. Don't limp forward on hope.

### Reuse from your existing stack (your unfair speed advantage)
WhatsApp Business API + AI agents (Noga) + payments knowledge (Cashflow/PayPlus/Cardcom) + your autonomous Linear→GitHub build workflow. Lift, don't rebuild.

---

## 15. Brainstorm log — parked ideas & opportunity tree

*Captured from the brainstorm so nothing good gets lost. Not for v0 — this is the backlog of bets.*

**Opportunity → solution sketch (evidence-backed opportunities only):**
```
Outcome: couple feels in control & not ripped off, plans without stress
├── Opp A: seating is a dreaded chore (iPlan: manual, desktop-only)
│   ├── Sol A1: mobile drag + AI auto-seat            [v0]
│   ├── Sol A2: FULLY auto seating, couple just approves   [parked — 10x concierge]
│   └── Sol A3: guests request who they sit near; chart assembles bottom-up [parked — social/novel]
├── Opp B: couples feel gouged & disrespected (iPlan: per-record, fake VIP)
│   └── Sol B1: flat transparent price + published pricing   [v0]
├── Opp C: guest experience is spammy & monolingual (iPlan: local numbers, iPlan-branded)
│   └── Sol C1: couple-branded, multilingual WhatsApp flow   [v0]
├── Opp D: couple is captured too late (by the venue) 
│   └── Sol D1: engagement-stage AI concierge captures upstream  [Phase 1 — but seed a light hook in v0]
└── Opp E: no repeat purchase → need compounding assets
    ├── Sol E1: guest graph as core data asset          [schema in v0, monetize later]
    ├── Sol E2: vendor marketplace demand funnel        [Phase 2]
    └── Sol E3: gifting float / payments                [strategic, regulated — later]
```

**Parked provocations worth revisiting:**
- *Eliminate the seating chart entirely* — what if AI builds it and the couple only approves? Turns the biggest chore into a 30-second task.
- *Reverse the guest flow* — guests self-RSVP and self-declare seating preferences; the chart emerges bottom-up. Novel, social, potentially viral.
- *The guest graph as a cross-event asset* — the same 300 contacts reappear as future couples, bar/bat-mitzvah parents, corporate planners. One wedding seeds years of demand. This is the real long-game moat iPlan is sitting on and wasting.
- *Gifting as the main business* — if the take-rate on gift volume dwarfs RSVP fees, the "wedding RSVP app" might actually be a "wedding payments company" wearing an RSVP coat. Worth a serious model before you commit to identity.

---

### Bottom line
iPlan is beatable — but **not** by out-featuring them for couples. They're beatable by (1) breaking the venue→couple seating lock, (2) being radically honest on price where they enrage people, (3) being genuinely AI-native where they're a forms tool, and (4) capturing the couple upstream from engagement, then reversing their distribution so couples pull venues onto *your* platform. Wedge with couples, win with an AI concierge, finish at the venue layer.

*Sources: iplan.co.il · couple reviews on mit4mit.co.il and wedreviews.co.il · CBS marriage statistics · Israeli wedding-cost industry reporting (ice.co.il, N12, saveadate, Easy2Give). Figures are directional and should be re-validated before investment.*
