# "Corps of Discovery: Mission West" — Build Specification
### Unit 4 Game · 8th Grade U.S. History · Early Republic and Age of Jackson

**Purpose:** A build-ready spec to paste into Claude (Fable, Opus, Sonnet): build, deploy on Render via GitHub, embed in Wix. Engine, Command Center, and workflow per the **US History Common Build Standards**; this spec covers only what's unique.

> **Reading-level rule (everything the student sees):** 8th grade content at a **5th grade reading level**. Short sentences, common words, define hard terms on first use.

> **Data method:** the **shared Socket.IO engine, solo mode**. One adapter: `usCorpsOfDiscovery.js` (`gameId: 'us-corps-of-discovery'`).

> **The design's engine:** the student co-commands the real 1804–1806 expedition. Twelve decisions follow the actual route and dilemmas; a choice is "right" when it matches what Lewis and Clark really did — and what they did, again and again, was prepare, hold discipline, and **trust the Native nations whose land this already was**. Crossing the Purchase mile by mile teaches its scale and purpose (8.5C, 8.6B).

---

## 1. Game at a Glance

| Field | Value |
|---|---|
| **Title** | Corps of Discovery: Mission West |
| **Unit** | 4 — Early Republic and Age of Jackson |
| **TEKS** | 8.5C (Louisiana Purchase, Lewis & Clark), 8.6B (westward expansion), 8.10A (physical geography), 8.11A (geography shaping decisions), 8.31B (problem solving) |
| **Pick** | **None — one class-wide group** |
| **Type** | Solo expedition survival game — 12 decisions = **12 graded actions**, following the real route |
| **Playtime** | 10–14 minutes |
| **Platform / tracking** | Shared engine solo mode; Teacher Command Center; session-only data |
| **Art style** | Semi-realistic / cinematic landscapes, cool light |

**One-sentence pitch:** Provision the keelboat in St. Louis, survive the Missouri, the Rockies, and the Bitterroot snows, and reach the Pacific the way the real Corps did — preparation, discipline, diplomacy — with Sacagawea's presence opening doors no rifle could.

---

## 2. Historical Content Bank

From the unit source document, plus standard expedition record:

- **Mission (Jefferson's orders):** find a water route to the Pacific (the fabled Northwest Passage); map and document geography, plants, animals; build **peaceful trade relations with Native nations**; assert American claims.
- **Scale:** 1804–1806, **8,000+ miles**, St. Louis → Missouri → Rockies → Columbia → Pacific and back.
- **Sacagawea** — a young Shoshone woman, joined at the Mandan-Hidatsa villages with her husband Toussaint Charbonneau as interpreters, carrying her infant son. She found food, navigated, and her reunion with her brother, the Shoshone chief **Cameahwait**, got the Corps the horses that made the Rockies crossing possible; a woman and baby traveling with armed men also signaled peace.
- **Real beats used below:** the Teton Sioux (Lakota) standoff on the Missouri, 1804; winter at **Fort Mandan**; the squall that nearly sank the white pirogue — Sacagawea calmly saving instruments and papers; the month-long portage around the **Great Falls**; near-starvation in the **Bitterroots** (the men ate candles and horses); rescue by the **Nez Perce**, who also kept the Corps' horse herd until the return; Clark's *"Ocian in view! O! the joy"*; the **November 1805 vote** on where to winter, in which York (an enslaved Black man held by Clark) and Sacagawea both voted — decades before U.S. law allowed either; winter at Fort Clatsop.
- **Outcome:** no all-water passage existed — but the Corps returned with the first accurate maps of the West, hundreds of documented species (grizzly, prairie dog, pronghorn), and diplomatic contact with dozens of nations. One death: Sgt. Charles Floyd, of illness, 1804.
- **Vocabulary:** *expedition* — a long journey with a mission. *keelboat* — a big flat river boat, pushed upstream. *portage* — carrying boats and cargo around water you can't sail. *interpreter* — a translator between languages. *pirogue* — a large canoe-style boat.

---

## 3. Core Mechanics

### 3.1 Meters (each 0–100, start 50)
- **Supplies** 🎒 — food, trade goods, powder, medicine.
- **Crew** 💪 — the health and spirit of the roughly three dozen members.
- **Trust** 🤝 — your standing with the Native nations whose lands you cross.

### 3.2 Structure
**12 decisions × 3 choices = 12 graded actions**, in route order. Right = 1, partial = 0.5, wrong = 0, server-side. Client flourish: the route map inches west each step, and a **journal page unlocks at each real milestone** (Fable writes these from the record, Clark's spelling included).

### 3.3 Endings
Meter sum → tiers: **"Captains of Discovery"** / **"Hard Road Home"** / **"Lost in the High Country."** All debriefs land the same facts: 8,000+ miles, one death, no water route — and maps, species, and diplomacy that reshaped the nation's idea of the West. The debrief adds, honestly: the nations that fed, guided, and saved the Corps would within decades face broken treaties and removal.

---

## 4. Reference Content — the Answer Key (all 12 steps)

Feedback voice: a seasoned sergeant's journal — plain, warm, unsentimental.

**1. St. Louis: pack the keelboat.** A) Heavy on trade goods, gifts, medicine, and tools ✅ (Supplies +10, Trust +5) — *"Lewis spent months packing gifts and trade stock. Out there, goods are words."* B) Heavy on whiskey and fine uniforms ❌ (Crew +5, Supplies −10). C) All food, no trade goods ⚠️ (Supplies +5, Trust −5) — *"You can hunt food. You cannot hunt friendship."*

**2. Lower Missouri: how do you run the crew?** A) Army discipline — watches, drills, courts-martial when earned ✅ (Crew +10) — *"The captains ran it military-tight. Loose crews die on rivers."* B) Let the men govern themselves ❌ (Crew −10). C) Punish nothing until real trouble ⚠️ (Crew −5).

**3. Standoff with the Teton Sioux, 1804.** *Warriors demand a steep toll; bows are strung; Clark has drawn his sword.* A) Hold steady — no firing, let the chiefs talk it down, offer respect and some gifts ✅ (Trust +10) — *"That's what happened — both sides lowered their weapons. One volley would have ended the expedition and poisoned the plains."* B) Fire the swivel gun ❌ (Trust −20, Crew −5). C) Hand over a full boatload of goods ⚠️ (Supplies −15, Trust +5) — *"Paying heavy toll buys one mile. Empty hands can't make allies upriver."*

**4. Winter is coming.** A) Build Fort Mandan beside the Mandan-Hidatsa villages; trade and learn all winter ✅ (Supplies +10, Trust +10) — *"The villages were the plains' great market. The Corps wintered as neighbors and left smarter."* B) Push on through the freeze ❌ (Crew −20). C) Winter alone, far from the villages ⚠️ (Crew −5, Trust −5).

**5. Two interpreters ask to join — Charbonneau, and his Shoshone wife Sacagawea, with a baby due.** A) Take them both ✅ (Trust +15) — *"Best hire of the age. Her languages, her knowledge — and her very presence read as peace."* B) No place for a mother and infant ❌ (Trust −10). C) Hire only Charbonneau ⚠️ — *"He was hired FOR her. Half the value, none of the trust."*

**6. A squall knocks the white pirogue on its side — cargo floating away.** A) Steady the boat; trust the calm hands already saving the journals and instruments ✅ (Supplies +5) — *"That calm hand was Sacagawea, baby on her back, catching the expedition's brain as it floated past. Lewis named a river for her."* B) Save the personal baggage first ❌ (Supplies −10). C) Cut everything loose and save only the crew ⚠️ (Crew +5, Supplies −10).

**7. The Great Falls: five waterfalls block the Missouri.** A) Portage — haul boats and tons of cargo overland ✅ (Crew −5, Supplies +5) — *"About a month of brutal hauling. There was no shortcut."* B) Try to run the falls ❌ (Supplies −20, Crew −10). C) Abandon the boats and walk ⚠️ (Supplies −10) — *"You'll need boats again above the falls."*

**8. You must have horses to cross the Rockies. A Shoshone band appears.** A) Let Sacagawea speak — and the chief turns out to be Cameahwait, her own brother ✅ (Trust +15, Supplies +10) — *"One of history's great reunions. Horses followed. Without them, the story ends here."* B) Seize the horses ❌ (Trust −25). C) Offer rifles in trade ⚠️ (Trust +5, Supplies −10) — *"Desperate, dangerous, and not the deal that was struck."*

**9. The Bitterroots: eleven days of snow, no game, men eating candle wax.** A) Push through behind your Shoshone guide toward Nez Perce country ✅ (Crew −10) — *"Worst stretch of the whole trail — and the only way was through."* B) Stop and hunt until strength returns ❌ (Crew −20) — *"There is nothing to hunt. Waiting is starving."* C) Turn back to the Shoshone ⚠️ (Crew −5) — *"Alive, but the mission dies in the snow."*

**10. The Nez Perce find you — starving, weak, at their mercy. They offer food and help.** A) Trust them: accept food and rest, learn to burn out dugout canoes, leave your horses in their care ✅ (Trust +15, Crew +15) — *"They could have ended the expedition with a shrug. Instead they saved it — and kept the horse herd safe for a year. Remember who the Corps owed."* B) Camp apart and trust no one ⚠️ (Crew +5, Trust −10). C) Push straight to the river without resting ❌ (Crew −15).

**11. The Pacific — "Ocian in view! O! the joy." Now: where to spend the winter?** A) Put it to a vote of the whole Corps — including York and Sacagawea ✅ (Crew +10, Trust +5) — *"The real vote, November 1805. A Black man and a Native woman voted on the expedition's future — decades before the law allowed either anywhere else. They chose Fort Clatsop."* B) The captains decide alone ⚠️ (Crew −5). C) Start home immediately, in December ❌ (Crew −15).

**12. Home, 1806. What do you lay on Jefferson's desk?** A) The truth: maps, journals, species, word of dozens of nations — and the honest news that no all-water passage exists ✅ (all meters +5) — *"The mission wasn't the fantasy river. It was knowledge, and you brought back a continent's worth."* B) Tell him the passage exists — it's what he hoped ❌ (Trust −10) — *"Lies drawn on maps kill the people who follow them."* C) Report the geography, skip the diplomacy ⚠️ — *"Half the mission. The nations you met were the mission too."*

---

## 5. Screens & UI Flow

1. **Title** — keelboat at dawn on a gray-blue river; navy gradient panel, brass-gold title rule. 2. **Join** — standard. 3. **Journey loop** — route map strip (St. Louis → Pacific) with moving marker above; scene art + decision card (white on `#F5F7FA`); steel-blue `#2E74B5` choice buttons; meters as labeled bars. 4. **Resolution** — verdict color (green `#2F7D4F` / gold / crimson `#B23A48`), sergeant's feedback; at milestones the **journal page unlock** — the money moment, aged paper *inside the illustration frame*, never as UI skin. 5. **Ending** — tier card, route recap, accuracy debrief, honest closing note (3.3).

**Union Blue throughout; no tan/parchment UI surfaces.**

## 6. Engine Integration

- **Adapter:** `server/src/games/usCorpsOfDiscovery.js` via `createStepGame`; register in `games/index.js`. **Mode: solo**, no variants, `totalActions: 12`, meters `{ supplies, crew, trust }` start 50.
- Map marker + journal unlocks are client flourishes keyed to step index — no engine change; everything else is stock engine.

## 7. Visual & Audio Assets (Higgsfield MCP)

**Art direction (prepend):** *Semi-realistic cinematic historical illustration, American West 1804–1806. Cool natural light, painterly, vast landscapes, dignified and specific depictions of Native nations. No text, no logos. 16:9.*

| # | Asset | Prompt sketch |
|---|---|---|
| 1 | Title / hero | "A loaded keelboat on the wide Missouri at dawn, mist, crew at poles, 1804." |
| 2 | St. Louis outfitting | "A riverfront warehouse: crates, trade goods, rifles, medicine chest being loaded, 1804." |
| 3 | Teton Sioux standoff | "Lakota riders on a bluff meeting the expedition — tense, dignified, weapons lowered, no violence." |
| 4 | Fort Mandan winter | "Log fort glowing at dusk beside earth-lodge villages, deep snow, northern lights." |
| 5 | Sacagawea | "A young Shoshone woman with an infant in a cradleboard, calm, capable, mountains beyond — respectful portrait." |
| 6 | Great Falls portage | "Men hauling canoes on cottonwood-wheel carts across rough prairie, waterfalls thundering behind." |
| 7 | Bitterroot crossing | "A thin file of explorers and horses on a snowy ridgeline, exhaustion conveyed by posture, not injury." |
| 8 | Nez Perce welcome | "Nez Perce hosts sharing food with weary explorers at a river camp — generosity and agency." |
| 9 | Pacific arrival | "Gray breakers and sea stacks under storm light; small figures on the shore, arms raised." |
| 10 | *(Optional)* ambience | River water, wind, distant birdsong loop; muted by default. |

## 8. Model Workflow

Standard order. Deltas: **Fable-heavy** — 12 decisions, feedback, and journal pages (real quotes, kid-level glosses); **Sonnet** builds the route-map strip (simple CSS translate).

## 9. Teacher Command Center

Standard; one class-wide group. PDF: Students (Name · Status · Accuracy %) + per-step class accuracy. Footer: "Made for 8th Grade U.S. History · TEKS 8.5C, 8.6B, 8.10A, 8.11A, 8.31B."

## 10. Build Checklist & Test Plan (delta)

- [ ] 12 steps match Section 4; verdicts spot-checked against Section 2
- [ ] Trust meter gates nothing (no soft-locks) — drama only; grade never depends on meter state
- [ ] Journal pages unlock at steps 4, 6, 8, 11 minimum; "Ocian in view!" spelling preserved with a kid-gloss
- [ ] All-right = 100%, all-wrong = 0% verified server-side
- [ ] Route map reaches the Pacific only after step 11
- [ ] Palette check: no tan UI; parchment only inside journal illustrations
- [ ] Debrief includes the honest closing note about the nations who helped

## 11. Teacher / Sensitivity Notes

- **Native nations are hosts, diplomats, and rescuers — the record says so.** The Teton Sioux standoff is two powers negotiating passage, not an ambush; the Nez Perce and Shoshone save the expedition, and the text says so plainly.
- **York was enslaved.** The voting scene names it — he voted while enslaved. Never soften to "Clark's servant."
- **Sacagawea is a skilled expert, not a mascot** — and a teenager married young; the game states facts without romanticizing.
- The debrief's forward-look (broken treaties, removal) links to The Trail Where They Cried app; sequence them deliberately.

---
*Companion to Hall of the First Seven Presidents, Precedent Maker, Supreme Court Case Files, War of 1812 Story Map, and The Trail Where They Cried (apps), and You Be the President, Cabinet Battle, and Jackson: Hero or Villain? (games). Shared engine, Union Blue palette, same GitHub → Render/Pages → Wix workflow.*
