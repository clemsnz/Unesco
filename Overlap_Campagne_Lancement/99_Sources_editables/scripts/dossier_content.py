# -*- coding: utf-8 -*-
"""Contenu de la section 12 « Marketing & Communication » du dossier (anglais) + copy deck (français).
Source unique : build_docs.py en tire le DOCX et les pages A4 au style du dossier."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = json.load(open(os.path.join(ROOT, "campaign.json"), encoding="utf-8"))
V = os.path.join(ROOT, "..", "03_Visuels")

def img(rel): return os.path.join(V, rel)

B = []
def h1(t): B.append(("h1", t))
def h2(t): B.append(("h2", t))
def h3(t): B.append(("h3", t))
def p(t): B.append(("p", t))
def note(t): B.append(("note", t))
def bullets(*items): B.append(("bullets", list(items)))
def table(headers, rows, widths=None): B.append(("table", headers, rows, widths))
def figure(path, width, caption): B.append(("img", path, width, caption))
def figures(items, caption): B.append(("imgs", items, caption))
def brk(): B.append(("break",))

# =====================================================================================
h1("Marketing & Communication")
p("**Launch campaign: “On se tient au jus… jeudi ?”** — This section explains how we launch Overlap in Paris. "
  "Every decision follows the logic of the course: target customer, problem, existing alternative, why it matters, "
  "evidence, riskiest assumption and next test. We separate what is **documented** in our project, what we **propose**, "
  "and what is only an **objective**. We do not have users, results or signed partners yet, and we do not claim any.")

h2("12.1 Our launch in one table")
table(["Step", "Our answer", "Status"], [
 ["Target customer", "Students and young workers aged 18–25 in Paris, like our persona Camille Martin (23, Master's student in Marketing & Communication, intern in a creative agency, moved from Lyon to Paris one year ago).", "Documented (Target, Persona)"],
 ["Problem", "Friends already want to meet. But replies come late, availability changes and the idea gets lost in the group chat.", "Documented (Problem, interviews)"],
 ["Existing alternative", "Group chats (WhatsApp, Instagram), Doodle polls, shared calendars, and apps such as Howbout or To Gather.", "Documented (Competitors)"],
 ["Why it matters", "Plans are postponed or dropped and people lose touch. About 1/3 of 18–24-year-olds say organising outings is a challenge (Harris Interactive); 29% of Gen Z experience loneliness (Mutual Value Labs & University of Manchester, 2025).", "Documented (Market analysis)"],
 ["Evidence", "4 individual interviews with 22–25-year-olds: finding a date is harder than finding a place; late replies and changing availability delay plans; some meetups never happen.", "Documented — small, qualitative sample"],
 ["Riskiest assumption", "A person who discovers Overlap can get enough friends (at least two more) to answer and confirm a first outing.", "Hypothesis"],
 ["Next test", f"A launch evening on {C['event_day_long'].replace('jeudi','Thursday').replace('mars','March')} where each group uses Overlap to plan its NEXT outing. We count the groups that confirm it (D+1) and that really meet (D+7).", "Proposed"],
], [26, 56, 18])
note("Why this test: the course says “behaviour > opinion”. We do not ask people if they like the idea; we watch if a group actually agrees on a date.")

h2("12.2 Launch positioning, promise and proof")
p("**Positioning.** For 18–25-year-olds in Paris who already want to see their friends, Overlap is the planning app that **first finds a time that works for the whole group, then a convenient place**, so the plan finally leaves the group chat. "
  "Unlike a group chat, nobody has to scroll back to find who is free. Unlike a poll, nobody has to invent the dates.")
p("**Promise (French, for the public):** « Ton “on se tient au jus” devient un vrai rendez-vous. » — Your “let's keep in touch” becomes a real date.")
p("**Proof = how the app works** (from our “How it works” and our app mock-ups):")
bullets("Overlap compares everyone's availability and suggests 2–3 common time slots; the group confirms a date in one click (screens “Calendar – Find a slot for everyone” and “Friendship Challenge – Here are 2 available slots”).",
        "Only then, Overlap suggests convenient meeting places based on everyone's location (screen “Map”).",
        "Reminders keep the plan alive until the day (screen “Drinks + Dinner – I'm in!”).")
p("**Product status.** Overlap exists as mock-ups and a prototype. There is no app to download, so our calls to action are: **register your group for the test evening** and **join the waitlist**.")

h2("12.3 The creative idea")
p("Our Canva opens with “We'll keep in touch! (on se tient au jus)”. Everybody says it, and it usually means: we will not see each other. "
  "The idea of the campaign is to show **the exact moment a vague sentence becomes a real date**. We add one word: **“…jeudi ?”**. "
  "It is the moment someone proposes a slot. Then the plan gets its day, time and place.")
p("**One visual system, in the order of the product:** the chat bubble (vague) → the blue pill “jeudi ?” (the slot) → the black ticket Day / Time / Place (the plan). "
  "The slot always comes before the place, like in our interviews and in the app.")
figure(img("01_Visuel_principal/01_KV_1080x1350.png"), 70, "Key visual (1080×1350) — adapted into an A3 poster.")
table(["Medium", "How the transformation lives there"], [
 ["Key visual & A3 poster", "Three bubbles from a group chat, then “On se tient au jus…” turns into the blue pill “jeudi ?” and the event ticket (Thu. 11 March · 18:30 · Paris)."],
 ["Reel / TikTok (15 s)", "A recognisable group chat goes nowhere; Overlap's real screens find the slot, then the place; the punchline “on se tient au jus… jeudi ?” gets the answer “Jeudi 20h, c'est calé !”."],
 ["Stories", "Teasing: the sentence stops at “…”. Invitation: a card to forward to your own group chat. Reminder: “Vu par 5. Réponses : 0. Classique.”"],
 ["Event", "The evening already has a date and a place, so guests use it to fix their NEXT outing: slot, then place, then a “C'est calé” card."],
 ["D+1 follow-up", "“Alors, c'est calé ?” — the group gets its day / time / place back to confirm it in the group chat."],
], [28, 72])
p("**Tone.** Dossier and slides in English; everything for the public in natural French, with words friends really use: « on se tient au jus », « je vous redis », « vu », « c'est calé ».")

h2("12.4 User journey: from the Reel to the second outing")
table(["Step", "What Camille does", "Touchpoint", "What we measure"], [
 ["1. Recognise", "Sees the Reel shared by a classmate and recognises her own group chats.", "Reel / TikTok, carousel", "Views, saves, shares"],
 ["2. Forward", "Sends the story “À transférer dans le groupe” to “Les potes”.", "Story 2 + invitation", "Story shares, link clicks"],
 ["3. Register", "She registers the whole group (3 to 5 people) in one form.", "Registration form", "People and groups registered"],
 ["4. Come", f"Thursday 11 March, {C['event_start']}: welcome juice, table with the group code.", "Event", "Check-ins"],
 ["5. Plan the next outing", "Everyone scans the table card and enters their availability; absent friends get the same link; at 20:45 the screen shows their common slot and 2 convenient places; the group votes.", "Table tent, screen, “C'est calé” card", "Availability forms (present / absent), confirmed slots"],
 ["6. Confirm (D+1)", "Receives the D+1 visual and confirms the outing in the group chat.", "WhatsApp / e-mail", "Confirmations"],
 ["7. Meet (D+7)", "The group meets. Camille answers “OUI”.", "WhatsApp / e-mail", "Outings that happened"],
 ["8. Again (D+14)", "The group plans a second outing with the prototype.", "Prototype link", "Second outings"],
], [16, 40, 22, 22])

h2("12.5 Channels and their role")
p("A team of six can run three platforms well, not ten. Each channel has **one job** in the journey.")
table(["Channel", "Role", "Content", "CTA", "Owner"], [
 ["Instagram Reel + TikTok", "Make people recognise the situation", "Reel 15 s", "Inscris ton groupe · lien en bio", "Opale (video), Francesca (posting)"],
 ["Instagram carousel", "Explain the proof: slot first, place second", "4 pages", "lien en bio", "Francesca"],
 ["Instagram stories", "Trigger the invitation in the group chat", "Teasing, invitation to forward, reminder", "Countdown / link sticker", "Francesca"],
 ["Our own group chats (WhatsApp, DM)", "Personal invitation from the six founders", "Digital invitation + message", "Registration form", "All six"],
 ["A3 posters on campus", "Reach students offline (EFAP and nearby schools, with permission)", "A3 poster with QR", "QR → registration", "Clémentine"],
 ["Launch event", "Make guests plan their next outing", "Table tent, “C'est calé” card, screen", "Scan the QR", "Clémentine, Hénora"],
 ["D+1 / D+7 / D+14 messages", "Confirm, check, repeat", "D+1 visual + messages", "Confirmer notre sortie", "Hénora, Ines"],
 ["Meta boost (€100)", "Push the Reel to 18–25 in Paris (D−10 to D−3)", "Reel", "S'inscrire", "Francesca"],
], [20, 24, 20, 18, 18])
note("Not used at launch: influencers, LinkedIn, paid TikTok, flyering in the street. Reason: budget and team time; we prefer one channel that works to five that we cannot animate.")

h2("12.6 The launch event: « On se tient au jus… jeudi ? »")
p("**Why a group of friends would come.** It is already an outing with your own friends (and the first juice is free). You test an app before everybody else. "
  "And you leave with something you never manage to get in the group chat: **the date and the place of your next outing**.")
p("**The key point.** The evening already has a date and a place. So the activation is about the guests' NEXT outing. This is when they feel what Overlap does.")
h3("Operational sheet")
table(["Item", "Proposal"], [
 ["Date and time", f"{C['event_day_long'].capitalize()}, {C['event_hours']}, Paris. No roadmap slide or page fixes another period in our current files, so we keep the working date."],
 ["Capacity", "60 people on site ≈ 15 groups of 4. We open 75 places because free events always have no-shows."],
 ["Venue (proposal)", "Priority prospect: **Le Comptoir Général**, 84 quai de Jemmapes, Paris 10e (bar; Goncourt and République metro nearby). Not confirmed. Criteria: bar open on Thursday, free corner for 60 in exchange for guests' consumption, within walking distance of République (lines 3, 5, 8, 9, 11). Backup: another bar around République / Oberkampf with the same criteria."],
 ["Registration", f"Free, by group of {C['group_size']}. One person registers the group in a form (Tally): first names, e-mail, phone (optional), consent. Opens {C['registration_open']}, closes {C['registration_deadline']}. The address is sent after registration."],
 ["Prototype mechanics", "Each group gets a code. A short form collects availability (evenings of the next 2 weeks) and the departure metro station. A Google Sheet finds the common slots of each code; Hénora chooses 2 convenient places from a pre-listed set of venues near the group's stations. At 20:45 the screen shows each table's slot + 2 places. The clickable prototype (if ready) is shown on two phones. This is a “concierge test”: the team does by hand what the app will automate."],
], [22, 78])
h3("Run of show")
table(["Time", "What happens", "Who"], [
 ["17:00", "Set-up: tables, table tents, screen, sheet test", "All six"],
 ["18:30", "Welcome, check-in by group, juice, name badges, table + group code", "Clémentine, Agathe"],
 ["19:15", "5-minute welcome: our story and how the evening works", "Francesca, Hénora"],
 ["19:20–20:30", "“Calez la prochaine”: scan, availability, absent friends get the link", "Agathe, Ines on the floor"],
 ["20:30", "Forms close; slot calculation per table", "Hénora, Ines"],
 ["20:45", "The reveal on screen; groups vote; “C'est calé” cards filled in; photo corner (with consent)", "Francesca, Opale"],
 ["21:00–21:30", "Waitlist sign-ups, chat, end", "All six"],
], [16, 64, 20])
h3("Materials and roles")
table(["Member", "Before the event", "On the night", "After"], [
 ["Opale (Creative Director)", "All visuals, Reel, print proof (BAT)", "Photos / video, screen", "Recap visuals"],
 ["Hénora (Strategy)", "Test protocol, forms, Google Sheet, KPI table", "Slot calculation and reveal", "D+1/D+7 data"],
 ["Francesca (Marketing)", "Instagram / TikTok calendar, Meta boost, DMs", "Host, live stories", "D+1 visual sending"],
 ["Clémentine (Marketing)", "Venue, posters, registrations and table plan", "Check-in, table plan", "Thank-you to the venue"],
 ["Agathe (Legal)", "GDPR consent, image rights, venue agreement", "Consent at the door, floor help", "Data deletion after 3 months"],
 ["Ines (Finance)", "Budget, purchases, juice price with the venue", "Floor help, waitlist", "Expenses report, D+7/D+14 with Hénora"],
], [22, 30, 26, 22])
p("**Materials:** 15 table tents + 5 spare, 100 “C'est calé” cards, 100 name badges, 4 A3 posters, 1 screen or TV (venue or borrowed), 2 phones with the prototype, 1 laptop with the Google Sheet, pens, tape, a power strip.")
p("**What we can really measure with a prototype:** people who fill in their availability (present and absent), slots found per table, groups that confirm on the night, D+1 confirmations, outings reported at D+7, second outings at D+14. "
  "**What we cannot measure yet:** real in-app usage, retention over months, the share of friends who would download the app.")
figures([img("06_Chevalet_table/06_Chevalet_face_A5_apercu.png"), img("08_Carte_Cest_cale/08_Carte_Cest_cale_A6.png")], "Table tent (understood without a host) and the “C'est calé” card.")

h2("12.7 Timeline from D−21 to D+14")
TL = [
 ["D−21", "Thu 18 Feb", "Kick-off, roles, KPI sheet; contact 3 bars (priority: Le Comptoir Général)", "All / Clémentine"],
 ["D−17", "Mon 22 Feb", "Forms (registration, availability) + GDPR text; venue answer expected", "Hénora, Agathe"],
 ["D−16", "Tue 23 Feb", "Reel shooting and editing", "Opale, Francesca"],
 ["D−15", "Wed 24 Feb", "Venue confirmed → registration URL → QR codes → print proof (BAT)", "Clémentine, Opale"],
 ["D−14", "Thu 25 Feb", "Reel + teasing story online (Instagram, TikTok)", "Francesca"],
 ["D−13", "Fri 26 Feb", "Print order (posters, table tents, cards)", "Ines"],
 ["D−12", "Sat 27 Feb", "Carousel online", "Francesca"],
 ["D−10", "Mon 1 Mar", "Registrations open: invitation story + digital invitation in our group chats; posters on campus; Meta boost starts", "All six"],
 ["D−7", "Thu 4 Mar", "Check: ≥ 40 people registered? If not, second wave of DMs", "Hénora"],
 ["D−3", "Mon 8 Mar", "Reminder story; Meta boost ends", "Francesca"],
 ["D−2", "Tue 9 Mar", "Registrations close; table plan; full test of forms + sheet", "Clémentine, Hénora"],
 ["D−1", "Wed 10 Mar", "Reminder message to organisers; buy supplies", "Ines, Clémentine"],
 ["D", "Thu 11 Mar", "Launch evening, 18:30–21:30", "All six"],
 ["D+1", "Fri 12 Mar", "D+1 visual + message to each group", "Francesca, Hénora"],
 ["D+7", "Thu 18 Mar", "“Alors, c'était comment ?” message; count outings that happened", "Hénora, Ines"],
 ["D+14", "Thu 25 Mar", "Second outing check; results; persevere / change decision", "All six"],
]
table(["Day", "Date", "Task", "Owner"], TL, [10, 14, 56, 20])

h2("12.8 Editorial calendar")
EC = [
 ["Thu 25 Feb", "Reel “On se tient au jus… jeudi ?”", "Instagram Reel + TikTok", "Francesca", "Lien en bio (waitlist until D−10)"],
 ["Thu 25 Feb", "Story 1 – teasing", "Instagram story", "Francesca", "Countdown sticker"],
 ["Sat 27 Feb", "Carousel (4 pages)", "Instagram feed", "Francesca", "Lien en bio"],
 ["Mon 1 Mar", "Story 2 – invitation to forward", "Instagram story", "Francesca", "Link sticker → registration"],
 ["Mon 1 Mar", "Digital invitation + message", "WhatsApp / DM / class groups", "All six", "Registration form"],
 ["Mon 1 Mar", "A3 posters", "Campus", "Clémentine", "QR → registration"],
 ["1–8 Mar", "Boosted Reel", "Meta Ads (Instagram)", "Francesca", "S'inscrire"],
 ["Thu 4 Mar", "Story 2 again + Reel repost", "Instagram / TikTok", "Francesca", "Link sticker"],
 ["Mon 8 Mar", "Story 3 – reminder", "Instagram story", "Francesca", "Inscrivez-vous avant le 9 mars"],
 ["Wed 10 Mar", "D−1 message", "WhatsApp / e-mail", "Ines", "Transfer to your group"],
 ["Thu 11 Mar", "Live stories (with consent)", "Instagram story", "Francesca", "Join the waitlist"],
 ["Fri 12 Mar", "D+1 visual + message", "WhatsApp / e-mail", "Hénora", "Confirmer notre sortie"],
 ["Thu 18 Mar", "D+7 message", "WhatsApp / e-mail", "Hénora", "Reply OUI / DÉCALÉ"],
 ["Thu 25 Mar", "D+14 message", "WhatsApp / e-mail", "Ines", "Plan the second outing"],
]
table(["Date", "Content", "Channel", "Owner", "CTA"], EC, [13, 29, 22, 13, 23])

h2("12.9 Campaign budget (estimate)")
p("No budget envelope is fixed in our project, so this is a **clearly identified estimate** for a student launch in Paris (prices incl. VAT).")
BUD = [
 ["A3 colour posters (copy shop)", 20, 1.50], ["Table tents, A4 250 g, folded", 20, 1.80], ["“C'est calé” cards, A6", 100, 0.12],
 ["Name badges", 100, 0.08], ["Welcome juice (price to negotiate with the venue)", 60, 4.00], ["Meta boost (Reel + story)", 1, 100.00],
 ["Small supplies (tape, pens, power strip)", 1, 25.00], ["Venue hire (proposal: free against guests' consumption)", 1, 0.00],
 ["Tools: Tally, Google Sheets, Canva, CapCut (free plans)", 1, 0.00]]
sub = sum(q * u for _, q, u in BUD)
rows = [[n, str(q), f"€{u:,.2f}", f"€{q*u:,.2f}"] for n, q, u in BUD]
rows += [["Subtotal", "", "", f"€{sub:,.2f}"], ["Contingency (10%)", "", "", f"€{sub*.1:,.2f}"], ["**Total**", "", "", f"**€{sub*1.1:,.2f}**"]]
table(["Item", "Qty", "Unit cost", "Total"], rows, [58, 10, 16, 16])
BUDGET_TOTAL = sub * 1.1

h2("12.10 Measurement")
p("**North Star: number of activated groups**, i.e. groups that confirmed a first outing.")
p("**What counts as an activated group** — all four conditions:")
bullets("at least 3 different people (the organiser + 2 friends) sent their availability with the group's link;",
        "the group chose one slot (day + time) AND one place;",
        "the date is within 14 days after the event;",
        "at least 3 members confirmed it (vote on the night or “OUI” at D+1).")
p("**No double counting.** Each group gets one ID at registration (the organiser's e-mail). People are identified by e-mail or phone, never by first name only. "
  "If two registrations share two thirds of the same people, they are merged. A group is counted once as “activated”; its later plans count as second outings.")
p("**Tools we really have:** Tally (registration, availability, confirmations, all with the group code), one Google Sheet (group ID, members, availability count, slot, place, status D+1 / D+7 / D+14), Instagram and TikTok insights, Meta Ads Manager, WhatsApp replies logged by hand in the sheet. Owners: Hénora and Ines.")
table(["Indicator", "Objective", "How we got this number"], [
 ["Registrations", "75 people (~19 groups)", "60 places ÷ 0.8 expected show rate"],
 ["Attendance on the night", "60 people (~15 groups)", "80% of registrations: group registration + D−1 reminder (assumption, to check)"],
 ["Invitations sent", "30 absent friends answer the link", "2 absent friends per group × 15 groups; story shares tracked in Instagram insights"],
 ["**Activated groups**", "**10**", "Two thirds of the 15 groups present. Decision rule: ≥ 8 → assumption supported; < 5 → we rethink the invitation step"],
 ["Outings that happened (D+7)", "7", "70% of activated groups"],
 ["Second outing (D+14)", "3 groups", "About 30% of activated groups"],
 ["Waitlist", "120 sign-ups by D+14", "60 guests + 30 absent friends + ~30 online (€100 boost ≈ 12–15k impressions → ~1% clicks → ~25% sign-up)"],
], [26, 26, 48])
note("These are objectives, not results. They come from the capacity and the budget, not from past data.")

# ===================================================================================== NEW PART
h2("12.11 Overlap Free vs Overlap Premium")
p("**Rule 1: the core stays free.** A group must be able to invite friends, find a common slot and choose a convenient place **even if nobody, or only one person, pays**. Otherwise our riskiest assumption (getting friends to join) becomes even harder.")
p("**Rule 2: one big reason to pay — the Rituals (“Rituels”).** Premium users choose a rhythm for each group (e.g. once a month). Overlap watches the synced calendars and, before the group drifts apart, proposes the next 2 common slots, ready to confirm. "
  "It extends the “Friendship Challenge” already in our mock-ups (“It's been 45 days since you saw Thomas — here are 2 available slots”) from one reminder to an automatic habit.")
table(["Feature", "Free", "Premium", "Benefit for the user", "Status"], [
 ["Invite friends by link", "✓", "✓", "Friends answer without paying", "Planned (contacts) — answering without an account: to test"],
 ["Find a common slot (2–3 suggestions, 1-click confirm)", "✓ unlimited", "✓", "No more endless chat", "Planned (How it works)"],
 ["Convenient place for everyone", "✓ with max. 1 labelled sponsored place", "✓ no sponsored place", "A place that is fair for everyone", "Planned — sponsored rules: proposed"],
 ["Reminders", "✓", "✓", "The plan does not get lost", "Planned"],
 ["Amicometre, badges, Memories", "✓", "✓", "Fun follow-up of friendships", "Planned (mock-ups)"],
 ["Calendar sync", "1 calendar", "Several (personal, school, work)", "Real availability, no double booking", "Planned (sync) — multi-calendar: to test"],
 ["Active groups", "Up to 3", "Unlimited", "For people with many circles", "To test"],
 ["**Rituals: automatic next-outing proposals**", "—", "✓", "Friendships kept alive without effort", "To test (built on Friendship Challenge, planned)"],
 ["Advanced place filters (budget, vibe, accessibility)", "Basic", "✓", "Better suggestions", "To test (“smart suggestions” in our market analysis)"],
], [24, 15, 15, 22, 24])
p("**Individual or group?** The subscription is **individual**. When a Premium member organises a plan, the whole group benefits from that plan's Premium features (Ritual, multi-calendar availability). The friends stay free.")
p("**Camille's example.** Camille has three circles: her childhood friends in Lyon, her Master's classmates and her colleagues at the agency, plus the new friends she meets at parties. "
  "With Free, she can plan any outing herself, for 3 groups. But the Lyon group only meets when someone thinks about it — and nobody does. "
  "With Premium, she sets a Ritual “La bande de Lyon – once a month”. Three weeks later, Overlap sends her: “2 créneaux communs : sam. 12 · 19h ou dim. 13 · 12h”. She taps once and forwards it. "
  "Her school and agency calendars are both synced, so the slots are real. For €3.99 a month — less than one drink — she stops being the one who always has to relaunch the group.")
figure(img("10_Offres_Free_Premium/10_Comparatif_Free_Premium_1920x1080.png"), 160, "Offer comparison for the public (French).")

h2("12.12 Pricing for France")
p("**What the group already decided:** our files list “Freemium & Subscriptions” as a business model but **no amount**. The prices below are new proposals, to be validated by the group and by a test.")
table(["Plan", "Price (incl. VAT)", "Who", "12 months", "Saving vs 12 × monthly"], [
 ["Free", "€0", "Everyone", "€0", "—"],
 ["Premium monthly", f"{C['price_month']} / month", "Individual, no commitment", "€47.88", "—"],
 ["Premium annual", f"{C['price_year']} / year", "Individual", "€34.99", f"**€12.89 (−27%)**"],
 ["Student", f"{C['price_student']} / month", "Individual, verified student", "€29.88", "**€18.00 (−38%)** vs standard monthly"],
], [20, 18, 24, 14, 24])
p("**Student offer:** all Premium features, monthly, no commitment. Access with a school e-mail address or a certificate of enrolment (“certificat de scolarité”) uploaded in the app; checked again every year, for up to 4 years; it switches to the standard price when the student status ends.")
p("**Why these prices — comparable offers (checked on official pages, November 2026):**")
table(["Offer", "Price shown", "What it is", "Source"], [
 ["Spotify Premium Étudiants (France)", "€7.07/month (Personnel €12.14)", "Music; benchmark of what students pay monthly", "spotify.com/fr/premium"],
 ["TimeTree Premium", "US$4.49/month or US$44.99/year", "Shared calendar app, premium features", "timetreeapp.com (newsroom, 2022)"],
 ["Doodle Pro", "US$15/month or US$132/year", "Scheduling tool for professionals", "help.doodle.com"],
 ["Timeleft", "€14.90 to €19.99/month depending on the city", "Social dinners with strangers (booking included)", "timeleft.com (blog, Marseille / Nantes)"],
 ["Howbout+ (direct competitor)", "Not published; depends on country and store", "Social calendar premium", "howbout.app (help page)"],
], [24, 24, 30, 22])
p("Overlap is a small utility used a few times a month, so it should sit **below TimeTree** and far below Timeleft or Doodle Pro. "
  "€3.99 is under the price of one drink in Paris; the student price (€2.49) is about one third of Spotify Student. The annual plan gives about 3 months free, to reward people who stay.")
p("**Willingness-to-pay test (behaviour, not opinion).** At D+7, organisers of activated groups and waitlist members see a page “Overlap Premium – les Rituels” with the price. "
  "Button: « Réserver mon 1er mois à 1 € » (payment link, refunded if Premium does not launch). Half of the visitors see €3.99, half see €4.99; students see €2.49. "
  "We measure: page → click rate, click → €1 payment rate. **Success: at least 5% of visitors pay the €1 at €3.99.** Agathe checks the legal terms (refund, terms of sale).")

h2("12.13 Sponsored places in the app")
p("Ads must help the group, not interrupt it. We only accept **native formats** placed after the hard part (the slot) is done.")
table(["Format", "Where in the journey", "Frequency"], [
 ["Sponsored place card", "Step “Choose where to meet”, after the group confirmed its slot. Labelled « Sponsorisé » with a « Pourquoi ce lieu ? » button.", "Max. 1 per list of places, never in 1st position"],
 ["Sponsored pin", "Map screen, “New places” tab", "Max. 1 highlighted pin visible at a time"],
 ["Sponsored experience", "“Discover new experiences” feed", "Max. 1 card out of 6"],
], [24, 52, 24])
p("**Refused:** pop-ups, videos, banners during slot finding, ads inside the invitations sent to friends, push notifications that sell something. A given venue is shown max. 2 times per user per week.")
p("**Accepted advertisers:** places where groups meet in Paris — bars, cafés, restaurants, bowling alleys, escape games, karaoke, cultural venues. "
  "**Refused:** dating apps, gambling, tobacco and vaping, consumer credit, and any offer that pushes alcohol consumption (French Loi Évin: no “2 cocktails for 1”; we accept offers on food, tables or activities).")
p("**Relevance rules — a sponsored place is shown only if:** it is open at the chosen slot; it accepts the group's size; it fits the group's budget level; no member's trip is more than 10 minutes longer than with the best non-sponsored place; it respects accessibility needs if someone set them. If no sponsored place passes these rules, none is shown.")
p("**Premium users** never see sponsored places: only the ranking by travel time. If they open a partner venue themselves, its group offer is shown as information (“Offre partenaire”).")
p("**Example of the ad on screen (French):** [Sponsorisé] **Le Point Commun · Bar** — 8 min en moyenne · ouvert à 20h · €€ — « Offre groupes Overlap : une planche à partager offerte dès 4 personnes. » — buttons « Ajouter au plan » / « Pourquoi ce lieu ? ». (Fictional venue.)")
figure(img("11_Annonce_sponsorisee/11_Annonce_sponsorisee_ecran_1080x1350.png"), 95, "Sponsored place card added to the real “Map” screen of our mock-up (fictional venues).")

h2("12.14 Local partners to approach in Paris (prospects)")
p("All four are **prospects**: no contact has been made and no partnership exists. Activity and address were checked on each venue's official website (November 2026); prices and hours must be checked again before contacting them.")
table(["Category", "Prospect (official source)", "Area", "Why 18–25s go there", "What we propose", "What they gain"], [
 ["Bar", "**Le Comptoir Général** — 84 quai de Jemmapes, 75010 (lecomptoirgeneral.com: cocktail bar, open Tue–Sun from 18:00, events & private-hire page)", "Canal Saint-Martin, 10e — Goncourt / République", "Festive bar, free entry, tropical music Thu–Sat from 21:00 (official site)", "Host the launch evening (corner for ~60, 11 March 18:30–21:30); founding partner, 3 months free in the app", "60 guests on an early Thursday evening before the peak; content; groups that come back"],
 ["Restaurant", "**Bouillon République** — 39 bd du Temple, 75003 (bouillonlesite.com: group bookings by e-mail/phone; private rooms on weekdays, 15–140 covers; low-price menu)", "République, 3e", "Cheap French classics (e.g. œufs mayonnaise €2.70 on the official menu), groups welcome", "Sponsored place on Mon–Thu evenings + tables booked with code OVERLAP", "Weekday group tables filled by groups that already chose their date"],
 ["Bowling", "**Bowling Mouffetard** — 73 rue Mouffetard, 75005 (bowlingmouffetard.fr: open daily, 14:00–02:00 on weekdays; €11.50 a game Mon–Thu evening)", "Latin Quarter, 5e — student area", "Late opening, affordable weeknight game", "Lane booking with code OVERLAP on Mon–Thu evenings; ask for a group offer (e.g. shoes included from 4)", "Weeknight lanes filled with groups of 4–6"],
 ["Escape game", "**Gamescape** — 17 rue de la Pierre Levée, 75011 (fr.gamescape.fr: 3 rooms for 2–5 players; from €19/player off-peak, €25–29 at peak; booking required)", "République / Goncourt, 11e", "The typical group activity for 4–5 friends", "Commission on bookings with code OVERLAP + listing in “Discover”", "Off-peak sessions filled (weekdays 12:00–16:00) by groups who already agreed on a time"],
], [13, 25, 12, 15, 18, 17])
p("**Priority prospect for the launch event: Le Comptoir Général.** Our event happens in a bar on a Thursday evening; the venue is open on Thursdays, has a private-hire offer, is a short walk from République (5 metro lines) and Goncourt, and is popular with our target. "
  "Our timing (18:30–21:30) fills the hours before its music starts at 21:00, and our guests can stay after. Risk: a large venue may ask for a minimum spend; we keep a smaller bar near République as a backup.")
figure(img("12_Fiche_commerciale/12_Fiche_commerciale_A4.png"), 85, "One-page sales sheet for venues (French).")

h2("12.15 How Overlap earns money with venues")
table(["Option", "Who pays", "How much (proposal)", "When", "In exchange for", "Fits"], [
 ["A. Monthly subscription", "The venue", f"{C['venue_subscription']} / month", "Each month, in advance", "Partner profile, appearance in “Discover”, group offer badge, monthly stats", "Any venue — but hard to sell before we have users"],
 ["B. Commission per booking", "The venue", f"{C['venue_commission']} of the booking (escape game, bowling); €1 excl. VAT per honoured cover (restaurant)", "Monthly, after the session took place", "A paid booking that carries the code OVERLAP", "Venues with bookings (escape game, bowling, restaurants) — not walk-in bars"],
 ["C. Paid placement, billed per confirmed plan", "The venue", f"{C['venue_cpp']} per confirmed plan", "Monthly, on a detailed statement", "A group of ≥ 3 confirmed a plan in Overlap with this venue as the place", "Bars and restaurants, even when groups arrive freely"],
], [17, 10, 20, 14, 23, 16])
p("**Recommendation for the launch:** start with a **3-month free pilot** for 4 to 6 founding partners, then use **option C (paid placement billed per confirmed plan)** for bars and restaurants, and **option B (commission)** only for venues that take bookings. "
  "Option A comes later, when we can show numbers. Why C first: the venue pays only for a result; the trigger happens inside Overlap, so we can prove it; and it works for a bar where groups arrive without booking.")
p("**How we check what triggers the bill.**")
bullets("**Bar (walk-in):** the trigger is a plan confirmed in Overlap (≥ 3 members, venue chosen, not cancelled before the slot). The venue receives each month a statement with plan IDs, dates and group sizes (no personal data). During the pilot we compare with the venue's own observations, and we test an optional “On est arrivés” check-in (QR at the counter) to measure how many confirmed plans really come.",
        "**Escape game (booked sessions):** the trigger is a paid booking with the code OVERLAP in the venue's booking system. Each month we match their export with our list of codes; cancelled or refunded sessions are not billed.")
p("**Example for one month (illustration, month 4 after launch, Paris only — assumptions, not forecasts):**")
EX = [
 ["Confirmed plans", "400 monthly active users in 160 groups → 200 confirmed plans", ""],
 ["Paid placement (C)", "50% of plans pick a place among our suggestions (100); 20% of those pick the sponsored place → 20 × €2", "€40.00"],
 ["Commission – escape game (B)", "3 sessions × (5 players × €25) × 8%", "€30.00"],
 ["Commission – bowling (B)", "3 bookings × (4 people × 2 games × €11.50) × 8%", "€22.08"],
 ["Premium", "3% of 400 = 12 subscribers: 6 students (€2.49), 4 monthly (€3.99), 2 annual (€34.99/12) = €36.73 incl. VAT → €30.61 excl. VAT → minus 15% store fee", "€26.02"],
 ["**Total revenue (excl. VAT)**", "", "**€118.10**"],
]
table(["Line", "Assumption", "Revenue / month"], EX, [26, 56, 18])
p("**What it shows:** at launch the revenue is symbolic. The goal of the first months is to prove the trigger (groups confirming plans in a venue), because this is what a venue will pay for.")

h2("12.16 Points for the group to decide")
bullets("The Business Model page of the dossier still contains old placeholder text; no price was fixed. Do we adopt these prices (€3.99 / €34.99 / €2.49) and option C as our official business model?",
        "No roadmap slide or page exists in our files: we kept Thursday 11 March 2027. To confirm against the final roadmap.",
        "Persona age: 23 in the Canva, 24 in the dossier (we used 23). Team page: “Valentine” in the dossier, “Clémentine” in the Canva (we used Clémentine).",
        "Registration URL, waitlist URL and Instagram / TikTok account name: needed to create the QR codes and send the print proof (BAT).",
        "Is a clickable prototype ready for the evening, or only the screens?",
        "Contact Le Comptoir Général (priority prospect) before D−21.")

h3("Sources used in this section")
p("Project files: Overlap dossier (Target, Persona, Market analysis, Competitors), Canva “innovation & entrepreneurship” (problem, interviews, how it works, visual identity), courses “Introduction to Entrepreneurship” and “From Idea to Concept” (O. Friant). "
  "Web, official pages consulted in November 2026: spotify.com/fr/premium; timetreeapp.com/intl/en/newsroom/2022-04-19/timetree-premium; help.doodle.com/en/articles/9457366-how-much-does-doodle-cost; timeleft.com/post/timeleft-sets-sail-for-marseille…; howbout.app/get-help/what-is-howbout; "
  "lecomptoirgeneral.com/en and /en/sections/events-privatization-seminars; bouillonlesite.com/en/bouillon-republique-2 and /en/en-privatisation; bowlingmouffetard.fr/tarifs-bowling and /horaires-et-reservations-bowling-mouffetard; fr.gamescape.fr/reservation-escape-game-paris.html.")

# ===================================================================================== COPY DECK (FR)
COPY = [
 ("Légende Reel / TikTok", f"« On se tient au jus » = on ne se reverra jamais 🫠 Overlap trouve le créneau commun de ton groupe, puis le lieu pratique. Viens le tester avec ta bande le {C['event_day_long']} à {C['event_city']} — gratuit, inscription par groupe, lien en bio. #onsetientaujus #overlap"),
 ("Carrousel p.1", "« On se tient au jus ! » — On l'a tous écrit. Et après ? — Swipe → la suite, c'est jeudi."),
 ("Carrousel p.2", "Le lieu, on trouve. La date, jamais. Ce qu'on a entendu dans nos entretiens : trouver une date est plus dur que trouver un lieu. Les réponses arrivent en décalé, les dispos changent… et la proposition se perd."),
 ("Carrousel p.3", "D'abord le créneau. Ensuite le lieu. 1. Overlap compare les dispos de tout le groupe et propose 2–3 créneaux communs. 2. Vous confirmez en un clic. Puis Overlap suggère un lieu pratique pour tous."),
 ("Carrousel p.4", f"On se tient au jus… jeudi ? Le {C['event_day_long']}, viens avec ta bande ({C['group_size']}). Vous repartez avec la date ET le lieu de votre prochaine sortie. {C['event_day_short']} · {C['event_hours']} · {C['event_city']}. Gratuit · jus d'accueil offert · {C['event_address_note']}. CTA : {C['cta_register']} · {C['cta_where']}."),
 ("Story 1 – teasing", f"Nouveau message dans « Les potes 🍻 » — on se tient au jus… — La suite arrive jeudi. — {C['event_day_num']} · {C['event_city']} — Active le rappel (sticker compte à rebours)."),
 ("Story 2 – à transférer", f"↪ À transférer dans le groupe, celui où on écrit toujours « faut qu'on se voie ». On se tient au jus… jeudi ? On vient à {C['group_size']}, on boit un jus, et on repart avec la date de notre prochaine sortie. 1 personne inscrit le groupe. Les autres disent juste « go ». (sticker lien → formulaire)"),
 ("Story 3 – relance", f"« On s'inscrit à la soirée Overlap ? » Vu par 5. Réponses : 0. Classique. C'est exactement pour ça qu'on a créé Overlap. Inscrivez-vous avant le {C['registration_deadline']}. (sticker lien)"),
 ("Invitation (message WhatsApp)", f"Hello la team 👋 {C['event_day_long'].capitalize()}, {C['event_hours']} à {C['event_city']} : soirée de lancement d'Overlap, l'app qui trouve enfin le créneau commun du groupe (puis le lieu). On vient à 3, 4 ou 5, le jus est offert, et on repart avec la date de notre prochaine sortie. C'est gratuit, une seule personne inscrit le groupe ici 👉 [lien du formulaire]. Clôture {C['registration_deadline']}. On se tient au jus… jeudi ?"),
 ("Affiche A3", f"On se tient au jus… jeudi ? — {C['event_day_short']} · {C['event_hours']} · {C['event_city']} — La soirée où ton groupe cale sa prochaine sortie. Gratuit · inscription par groupe de {C['group_size']} amis. Scanne le QR · {C['event_address_note']}."),
 ("Chevalet", "Votre prochaine sortie, on la cale ici. 1. Scannez. Chacun met ses dispos des 2 prochaines semaines + sa station de départ. 2 minutes. 2. Il manque quelqu'un ? Envoyez le même lien dans votre conversation de groupe. 3. À 20h45, regardez l'écran. Votre créneau commun + 2 lieux pratiques. Votez → c'est calé."),
 ("Carte « C'est calé »", "C'est calé. Le groupe / Jour / Heure / Lieu / On sera __ / __. Prenez la carte en photo et envoyez-la dans la conversation de groupe. Elle fait foi."),
 ("Message J−1", f"C'est demain ! {C['event_day_long'].capitalize()}, {C['event_start']}, [adresse]. Transfère ce message à ton groupe : venez avec vos agendas en tête, on cale votre prochaine sortie sur place. Un empêchement ? Réponds ANNULE pour libérer la place."),
 ("Message J+1 (avec le visuel)", "Hello [prénom] ! Hier, votre table a trouvé : [jour] à [heure], [lieu]. Pour que ça ne se perde pas dans le groupe : transférez ce visuel et confirmez ici 👉 [lien personnel]. Carte perdue ? Réponds RETROUVER."),
 ("Message J+7", "Alors, c'était comment ? Si votre sortie a eu lieu, répondez OUI. Pas encore ? Répondez DÉCALÉ et on vous repropose 2 créneaux."),
 ("Message J+14", "Et la prochaine ? On vous ouvre le prototype pour caler votre 2e sortie : [lien]. Less chatting, more meeting."),
 ("Publicité Meta", f"Texte : « On se tient au jus » = on ne se reverra jamais. Le 11 mars, viens avec ta bande caler votre prochaine sortie en 20 minutes. Gratuit. — Titre : On se tient au jus… jeudi ? — Bouton : S'inscrire. Ciblage : 18–25 ans, Paris + 5 km, 1er au 8 mars, 100 €."),
 ("Formulaire d'inscription", "Titre : On se tient au jus… jeudi ? Champs : ton prénom · ton e-mail · ton téléphone (facultatif, pour le rappel J−1 et le message J+1) · nom du groupe · nombre de personnes (3 à 5) · prénoms des potes · consentement : « J'accepte qu'Overlap utilise ces données pour cette soirée et pour me recontacter à J+1, J+7 et J+14. Elles sont supprimées 3 mois après. » · case photo : « J'accepte d'apparaître sur les photos de la soirée »."),
 ("Liste d'attente", "Overlap arrive. Garde ta place. Prénom · e-mail · école ou ville · consentement. Bouton : Je m'inscris."),
 ("Page test Premium (J+7)", "Overlap Premium — les Rituels. Choisis un rythme pour chaque groupe, Overlap te propose les 2 prochains créneaux communs avant que le groupe se perde de vue. 3,99 €/mois (2,49 € étudiant). Bouton : Réserver mon 1er mois à 1 € (remboursé si Premium ne sort pas)."),
]
