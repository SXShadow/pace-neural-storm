from app.models import Concept, Lesson, Question


def question(prompt, options, answer, explanation):
    return Question(prompt=prompt, options=options, answer=answer, explanation=explanation)


def make_lesson(slug, title, subtitle, category, icon, color, source_label, source_url, entries):
    concepts = []
    for index, entry in enumerate(entries):
        concepts.append(Concept(
            id=f"{slug}-{index + 1}", title=entry[0], summary=entry[1],
            steps=entry[2], example=entry[3], source_quote=entry[4],
            source_index=index, keywords=entry[5], questions=entry[6],
        ))
    source = "\n\n".join(concept.source_quote for concept in concepts)
    return Lesson(
        id=slug, title=title, subtitle=subtitle, category=category, icon=icon,
        color=color, source=source, source_label=source_label, source_url=source_url,
        concepts=concepts, mode="sample", method="Original prepared lesson with Python Bayesian practice adaptation",
        word_count=len(source.split()), created_at="2026-11-03",
    )


WATER = make_lesson("water-cycle", "The water cycle", "A little journey. A big connection.", "EARTH SCIENCE", "water", "blue", "Pace original teaching passage · background reference: USGS", "https://www.usgs.gov/special-topics/water-science-school/science/water-cycle", [
    ("Evaporation", "When liquid water gains energy, it can become a gas called water vapour. This change is called evaporation.",
     ["Water starts as a liquid, in a puddle, lake or ocean.", "Energy, often from the Sun, helps some water molecules escape into the air.", "The water is now water vapour: a gas we cannot see."],
     "A puddle gets smaller on a warm day. Some of its liquid water has become water vapour in the air.",
     "Evaporation is the change of liquid water into water vapour, a gas. Energy from the Sun helps water evaporate from oceans, lakes and wet ground. Water vapour is invisible. Evaporation can happen below the boiling point of water.",
     ["liquid", "water vapour", "energy"], [
         question("A puddle becomes smaller on a warm day. Which process helps explain this?", ["Condensation", "Evaporation", "Precipitation"], 1, "Evaporation changes liquid water in the puddle into water vapour in the air."),
         question("During evaporation, liquid water becomes…", ["A gas", "Ice", "Liquid droplets"], 0, "Liquid water changes into water vapour, which is a gas."),
         question("Does evaporation require water to be boiling?", ["Yes, always", "Only in oceans", "No"], 2, "The passage explains that evaporation can occur below the boiling point.")]),
    ("Condensation", "When water vapour cools enough, it can turn into tiny drops of liquid water. This change is called condensation.",
     ["Water vapour is present in the air.", "Cooling can cause some of that vapour to change into liquid.", "Tiny liquid droplets can gather in clouds or on a cold surface."],
     "Drops appear on the outside of a cold glass. Water vapour from the surrounding air cools and becomes liquid on the glass.",
     "Condensation is the change of water vapour into liquid water. When moist air cools sufficiently, some of its water vapour condenses into droplets. Many clouds contain tiny liquid droplets; some clouds contain ice crystals. Condensation also produces droplets on the outside of a cold glass.",
     ["cooling", "droplets", "gas to liquid"], [
         question("Water vapour changes into droplets on a cold glass. What is this called?", ["Evaporation", "Collection", "Condensation"], 2, "The water is changing from a gas into a liquid. That change is condensation."),
         question("Which change describes condensation?", ["Gas to liquid", "Liquid to gas", "Liquid to solid"], 0, "Condensation turns water vapour, a gas, into liquid water."),
         question("Where does the water on the outside of a cold glass come from?", ["It passes through the glass", "Water vapour in the air", "The glass makes water"], 1, "Water vapour in the surrounding air condenses on the cold surface.")]),
    ("Precipitation", "Water falls from clouds to the ground as rain, snow, sleet or hail. These forms of falling water are called precipitation.",
     ["Water droplets or ice particles grow inside clouds.", "When they are large enough, they fall toward the ground.", "The falling water may be rain, snow, sleet or hail."],
     "Rain on your umbrella and snow on a mountain are both forms of precipitation.",
     "Precipitation is water that falls from clouds toward Earth's surface. It includes rain, snow, sleet and hail. Cloud droplets or ice particles grow and eventually fall. The temperature along their path influences the form of precipitation that reaches the ground.",
     ["rain", "snow", "clouds"], [
         question("Which is an example of precipitation?", ["A puddle drying", "Snow falling", "Droplets forming on a glass"], 1, "Snow falling from clouds is precipitation, just like rain, sleet and hail."),
         question("Precipitation moves water from…", ["Clouds toward the ground", "The ocean into the air", "The ground into plant roots"], 0, "Precipitation is water falling from clouds toward Earth's surface.")]),
    ("Collection & return", "Water collects in rivers, lakes and oceans. Some soaks into the ground. The journey continues as water moves and evaporates again.",
     ["Some precipitation flows across the land as runoff.", "Some water soaks into the ground through infiltration.", "Water gathers in rivers, lakes or oceans and can enter the cycle again."],
     "After rain, you might see water running along a path while nearby soil becomes wet. These show runoff and infiltration.",
     "After precipitation reaches land, some water flows over the surface as runoff into streams, rivers and lakes. Some enters the soil through infiltration and may become groundwater. Water can return to the ocean and evaporate again. The water cycle has many pathways and no single starting point.",
     ["runoff", "infiltration", "groundwater"], [
         question("What is water flowing across the land called?", ["Condensation", "Runoff", "Water vapour"], 1, "Runoff is water moving over the land's surface."),
         question("Water soaking into the soil is called…", ["Precipitation", "Evaporation", "Infiltration"], 2, "Infiltration is the movement of water into the soil.")]),
])

PLANTS = make_lesson("plant-energy", "How plants make food", "Follow the energy from sunlight to a leaf.", "BIOLOGY", "leaf", "green", "Pace original teaching passage · background reference: NASA", "https://science.nasa.gov/earth/earth-observatory/", [
    ("The ingredients", "Plants use water and carbon dioxide to make sugars. Light supplies the energy for this process, called photosynthesis.", ["Roots take up water.", "Leaves take in carbon dioxide from the air.", "Light provides energy to make sugars."], "A plant needs more than soil: light, water and carbon dioxide all play a part in making its food.", "Photosynthesis is the process by which plants use light energy to make sugars from water and carbon dioxide. Plant roots absorb water. Carbon dioxide enters leaves through small openings called stomata. Light provides energy; it is not a material ingredient.", ["water", "carbon dioxide", "light"], [question("Which gas do plants use to make sugars?", ["Oxygen", "Carbon dioxide", "Nitrogen"], 1, "Plants take in carbon dioxide for photosynthesis."), question("What supplies energy for photosynthesis?", ["Light", "Soil particles", "Oxygen"], 0, "Light supplies the energy used to make sugars.")]),
    ("Inside the leaf", "Chlorophyll absorbs light. This pigment is found in chloroplasts, where photosynthesis takes place.", ["Leaf cells contain structures called chloroplasts.", "Chlorophyll inside them absorbs light.", "That captured energy helps power photosynthesis."], "The green colour of many leaves comes from chlorophyll. Its role in absorbing light supports food production.", "Chloroplasts are structures in plant cells where photosynthesis occurs. They contain chlorophyll, a pigment that absorbs light energy. Chlorophyll contributes to the green appearance of many leaves. The captured energy powers the reactions that make sugars.", ["chlorophyll", "chloroplasts", "pigment"], [question("What is chlorophyll's role?", ["Absorb light", "Store sugars for winter", "Pull water up from the roots"], 0, "Chlorophyll is a pigment that absorbs light energy."), question("Where does photosynthesis occur in plant cells?", ["In the cell wall only", "In chloroplasts", "Outside the cell"], 1, "Chloroplasts contain the machinery for photosynthesis.")]),
    ("Food & oxygen", "Photosynthesis makes sugars that store chemical energy. It also releases oxygen.", ["Captured light energy is stored in sugars.", "Plants use sugars to grow and power their activities.", "Oxygen is released as a product of photosynthesis."], "A growing plant uses the sugars it makes to build new tissues and support its activities.", "Photosynthesis produces sugars and releases oxygen. Sugars store chemical energy and supply materials for plant growth. Plants also carry out cellular respiration to release usable energy from sugars. Plants do not get all their food directly from soil.", ["sugars", "oxygen", "chemical energy"], [question("Which pair is produced by photosynthesis?", ["Water and carbon dioxide", "Soil and minerals", "Sugars and oxygen"], 2, "Photosynthesis produces sugars and releases oxygen."), question("What do sugars store?", ["Chemical energy", "Only water", "Soil particles"], 0, "Sugars store chemical energy that supports plant activities.")]),
])

CIRCUITS = make_lesson("simple-circuits", "A spark of electricity", "Discover what makes a simple circuit work.", "PHYSICS", "bolt", "peach", "Pace original teaching passage · background reference: Energy.gov", "https://www.energy.gov/", [
    ("A complete path", "An electric circuit needs a complete conducting path for current to flow. A break in the path stops the current in a simple circuit.", ["A battery provides a potential difference.", "Wires connect the battery and a component, such as a lamp.", "A closed path allows current to flow."], "A torch lights when its switch completes the path between its battery and lamp.", "A simple electric circuit includes a source such as a battery, conducting wires and a component such as a lamp. Electric current flows when there is a complete conducting path and a potential difference. A gap in the path stops current in the simple circuit.", ["circuit", "current", "complete path"], [question("What does a simple circuit need for current to flow?", ["A complete conducting path", "A switch that stays open", "Only a lamp"], 0, "Current needs a complete conducting path and a potential difference."), question("What happens when a wire disconnects in a simple circuit?", ["The current flows faster", "The current stops", "The lamp gets brighter"], 1, "A disconnected wire breaks the path, stopping current.")]),
    ("Conductors & insulators", "Conductors allow electric charge to move relatively easily. Insulators resist this movement.", ["Metals such as copper are good conductors.", "Materials such as plastic are good insulators.", "A wire can have a conducting core and insulating covering."], "Many electrical wires contain copper surrounded by plastic. The two materials have different jobs.", "Conductors allow electric charge to move relatively easily; copper is a common example. Insulators such as plastic strongly resist charge movement under ordinary conditions. Electrical wires often combine a copper conductor with a plastic insulating layer.", ["copper", "conductor", "insulator"], [question("Which material is commonly used as a conductor in wires?", ["Plastic", "Rubber", "Copper"], 2, "Copper allows charge to move relatively easily."), question("Why is plastic used around many wires?", ["It is an insulator", "It creates electricity", "It is a better conductor than copper"], 0, "The plastic acts as an insulating layer.")]),
    ("The switch", "A switch controls a circuit by opening or closing the conducting path.", ["A closed switch connects the path.", "An open switch breaks the path.", "This lets you control a lamp without disconnecting its wires."], "Turning a torch on closes its switch. Turning it off opens the path.", "In a simple circuit, a closed switch completes the conducting path and allows current to flow. An open switch breaks that path and stops current. The terms open and closed describe the electrical path, not whether a lamp is physically covered.", ["switch", "open", "closed"], [question("A closed switch in a complete simple circuit…", ["Breaks the path", "Allows current to flow", "Removes the battery"], 1, "A closed switch completes the path."), question("An open switch makes a lamp turn off because…", ["It changes the lamp's colour", "It closes the circuit", "It breaks the conducting path"], 2, "An open switch breaks the path, so current stops.")]),
])

SAMPLES = {lesson.id: lesson for lesson in [WATER, PLANTS, CIRCUITS]}
