document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load specialties for the default path
    updatePathSpecialties();
    
    // Update pool maximums
    updatePoolMaximums();
});

// Global character data object
let characterData = {
    basics: {
        name: '',
        ancestry: 'human',
        path: 'agent',
        specialty: ''
    },
    attributes: {
        might: 2,
        coordination: 2,
        perception: 2,
        intelligence: 2,
        presence: 2,
        connection: 2
    },
    skills: {
        athletics: 0,
        authority: 0,
        endurance: 0,
        legerdemain: 0,
        lore: 0
    },
    talents: [],
    investiture: {
        type: 'none',
        abilities: []
    },
    goals: [''],
    equipment: [{ name: '', description: '' }],
    pools: {
        physical: 0,
        mental: 0,
        social: 0
    },
    notes: '',
    points: {
        attributePoints: 12,
        skillXP: 5,
        talentXP: 8,
        investitureXP: 7
    }
};

// Path specialties mapping
const pathSpecialties = {
    agent: ['Investigator', 'Spy', 'Thief'],
    envoy: ['Diplomat', 'Merchant', 'Representative'],
    hunter: ['Archer', 'Assassin', 'Tracker'],
    leader: ['Champion', 'Officer', 'Politico'],
    scholar: ['Archivist', 'Strategist', 'Surgeon'],
    warrior: ['Dualist', 'Shardbearer', 'Soldier']
};

// Investiture types and abilities
const investitureOptions = {
    allomancy: [
        'Iron', 'Steel', 'Tin', 'Pewter', 'Zinc', 'Brass', 'Copper', 'Bronze',
        'Aluminum', 'Duralumin', 'Chromium', 'Nicrosil', 'Gold', 'Electrum', 'Cadmium', 'Bendalloy'
    ],
    feruchemy: [
        'Iron', 'Steel', 'Tin', 'Pewter', 'Zinc', 'Brass', 'Copper', 'Bronze',
        'Aluminum', 'Duralumin', 'Chromium', 'Nicrosil', 'Gold', 'Electrum', 'Cadmium', 'Bendalloy'
    ],
    surgebinding: [
        'Adhesion', 'Gravitation', 'Division', 'Abrasion', 'Progression', 'Illumination',
        'Transformation', 'Transportation', 'Cohesion', 'Tension'
    ],
    awakening: ['First Heightening', 'Second Heightening', 'Third Heightening', 'Fourth Heightening', 'Fifth Heightening']
};

// Talent tree based on ancestry
const talentOptions = {
    human: ['Adaptable', 'Versatile', 'Quick Learner', 'Resilient', 'Ambitious'],
    singer: ['Form of War', 'Form of Art', 'Nimble Form', 'Scholar Form', 'Work Form']
};

function initializeApp() {
    // Populate saved characters dropdown
    populateSavedCharacters();
    
    // Initialize form with default values
    document.getElementById('character-name').value = characterData.basics.name;
    document.getElementById('ancestry').value = characterData.basics.ancestry;
    document.getElementById('path').value = characterData.basics.path;
    
    // Set attribute values
    for (const [attr, value] of Object.entries(characterData.attributes)) {
        document.getElementById(`attr-${attr}`).value = value;
    }
    
    // Set skill values
    for (const [skill, value] of Object.entries(characterData.skills)) {
        document.getElementById(`skill-${skill}`).value = value;
    }
    
    // Update point displays
    updatePointsDisplay();
}

function setupEventListeners() {
    // Character controls
    document.getElementById('new-character').addEventListener('click', createNewCharacter);
    document.getElementById('save-character').addEventListener('click', saveCharacter);
    document.getElementById('load-character').addEventListener('change', loadSelectedCharacter);
    
    // Basic info changes
    document.getElementById('ancestry').addEventListener('change', function(e) {
        characterData.basics.ancestry = e.target.value;
    });
    
    document.getElementById('path').addEventListener('change', function(e) {
        characterData.basics.path = e.target.value;
        updatePathSpecialties();
    });
    
    // Attribute changes
    document.querySelectorAll('.attribute input').forEach(input => {
        input.addEventListener('change', handleAttributeChange);
    });
    
    // Skill changes
    document.querySelectorAll('.skill input').forEach(input => {
        input.addEventListener('change', handleSkillChange);
    });
    
    // Add talent button
    document.getElementById('add-talent').addEventListener('click', addTalent);
    
    // Investiture type change
    document.getElementById('investiture-type').addEventListener('change', function(e) {
        characterData.investiture.type = e.target.value;
        updateInvestitureDetails();
    });
    
    // Add goal button
    document.getElementById('add-goal').addEventListener('click', addGoal);
    
    // Add equipment button
    document.getElementById('add-equipment').addEventListener('click', addEquipment);
    
    // Notes changes
    document.getElementById('character-notes').addEventListener('input', function(e) {
        characterData.notes = e.target.value;
    });
}

function updatePathSpecialties() {
    const pathSelect = document.getElementById('path');
    const specialtySelect = document.getElementById('specialty');
    const selectedPath = pathSelect.value;
    
    // Clear existing options
    specialtySelect.innerHTML = '';
    
    // Add new options based on selected path
    pathSpecialties[selectedPath].forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty.toLowerCase();
        option.textContent = specialty;
        specialtySelect.appendChild(option);
    });
    
    // Update character data
    characterData.basics.specialty = specialtySelect.value;
    
    // Add change event listener
    specialtySelect.addEventListener('change', function(e) {
        characterData.basics.specialty = e.target.value;
    });
}

function handleAttributeChange(e) {
    const attrName = e.target.id.replace('attr-', '');
    const oldValue = characterData.attributes[attrName];
    const newValue = parseInt(e.target.value);
    
    // Calculate cost or refund
    const pointDiff = oldValue - newValue;
    characterData.points.attributePoints += pointDiff;
    
    // Update character data
    characterData.attributes[attrName] = newValue;
    
    // Update points display
    updatePointsDisplay();
    
    // Update pool maximums
    updatePoolMaximums();
}

function handleSkillChange(e) {
    const skillName = e.target.id.replace('skill-', '');
    const oldValue = characterData.skills[skillName];
    const newValue = parseInt(e.target.value);
    
    // Calculate cost or refund
    const pointDiff = oldValue - newValue;
    characterData.points.skillXP += pointDiff;
    
    // Update character data
    characterData.skills[skillName] = newValue;
    
    // Update points display
    updatePointsDisplay();
}

function addTalent() {
    const talentsContainer = document.getElementById('talents-container');
    const ancestry = characterData.basics.ancestry;
    
    // Create talent div
    const talentDiv = document.createElement('div');
    talentDiv.className = 'talent';
    
    // Create talent select
    const talentSelect = document.createElement('select');
    
    // Add talent options based on ancestry
    talentOptions[ancestry].forEach(talent => {
        const option = document.createElement('option');
        option.value = talent.toLowerCase().replace(' ', '-');
        option.textContent = talent;
        talentSelect.appendChild(option);
    });
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-talent';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', function() {
        talentsContainer.removeChild(talentDiv);
        characterData.points.talentXP += 2; // Refund talent cost
        characterData.talents = Array.from(document.querySelectorAll('.talent select')).map(select => select.value);
        updatePointsDisplay();
    });
    
    // Add elements to talent div
    talentDiv.appendChild(talentSelect);
    talentDiv.appendChild(removeButton);
    
    // Add talent div to container
    talentsContainer.appendChild(talentDiv);
    
    // Update character data
    characterData.talents.push(talentSelect.value);
    characterData.points.talentXP -= 2; // Cost of adding a talent
    
    // Update points display
    updatePointsDisplay();
}

function updateInvestitureDetails() {
    const investitureType = document.getElementById('investiture-type').value;
    const detailsContainer = document.getElementById('investiture-details');
    
    // Clear existing content
    detailsContainer.innerHTML = '';
    
    if (investitureType !== 'none') {
        const abilities = investitureOptions[investitureType];
        
        // Create abilities section
        const abilitiesDiv = document.createElement('div');
        abilitiesDiv.className = 'abilities-section';
        
        const abilitiesHeading = document.createElement('h3');
        abilitiesHeading.textContent = 'Abilities';
        abilitiesDiv.appendChild(abilitiesHeading);
        
        abilities.forEach(ability => {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `ability-${ability.toLowerCase().replace(' ', '-')}`;
            checkbox.addEventListener('change', function(e) {
                if (e.target.checked) {
                    characterData.investiture.abilities.push(ability);
                    characterData.points.investitureXP -= 3; // Cost of adding ability
                } else {
                    const index = characterData.investiture.abilities.indexOf(ability);
                    if (index > -1) {
                        characterData.investiture.abilities.splice(index, 1);
                        characterData.points.investitureXP += 3; // Refund cost
                    }
                }
                updatePointsDisplay();
            });
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = ability;
            
            abilityDiv.appendChild(checkbox);
            abilityDiv.appendChild(label);
            abilitiesDiv.appendChild(abilityDiv);
        });
        
        detailsContainer.appendChild(abilitiesDiv);
    }
}

function addGoal() {
    const goalsContainer = document.getElementById('goals-container');
    
    // Create goal div
    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal';
    
    // Create goal input
    const goalInput = document.createElement('input');
    goalInput.type = 'text';
    goalInput.placeholder = 'Enter a goal...';
    goalInput.addEventListener('input', function(e) {
        const index = Array.from(goalsContainer.children).indexOf(goalDiv);
        characterData.goals[index] = e.target.value;
    });
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-goal';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', function() {
        goalsContainer.removeChild(goalDiv);
        const index = Array.from(goalsContainer.children).indexOf(goalDiv);
        characterData.goals.splice(index, 1);
    });
    
    // Add elements to goal div
    goalDiv.appendChild(goalInput);
    goalDiv.appendChild(removeButton);
    
    // Add goal div to container
    goalsContainer.appendChild(goalDiv);
    
    // Update character data
    characterData.goals.push('');
}

function addEquipment() {
    const equipmentContainer = document.getElementById('equipment-container');
    
    // Create equipment div
    const equipmentDiv = document.createElement('div');
    equipmentDiv.className = 'equipment-item';
    
    // Create name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Item name';
    nameInput.addEventListener('input', function(e) {
        const index = Array.from(equipmentContainer.children).indexOf(equipmentDiv);
        characterData.equipment[index].name = e.target.value;
    });
    
    // Create description input
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.placeholder = 'Description';
    descInput.addEventListener('input', function(e) {
        const index = Array.from(equipmentContainer.children).indexOf(equipmentDiv);
        characterData.equipment[index].description = e.target.value;
    });
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-equipment';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', function() {
        equipmentContainer.removeChild(equipmentDiv);
        const index = Array.from(equipmentContainer.children).indexOf(equipmentDiv);
        characterData.equipment.splice(index, 1);
    });
    
    // Add elements to equipment div
    equipmentDiv.appendChild(nameInput);
    equipmentDiv.appendChild(descInput);
    equipmentDiv.appendChild(removeButton);
    
    // Add equipment div to container
    equipmentContainer.appendChild(equipmentDiv);
    
    // Update character data
    characterData.equipment.push({ name: '', description: '' });
}

function updatePointsDisplay() {
    document.getElementById('attribute-points').textContent = characterData.points.attributePoints;
    document.getElementById('skill-points').textContent = characterData.points.skillXP;
    document.getElementById('talent-xp').textContent = characterData.points.talentXP;
    document.getElementById('investiture-xp').textContent = characterData.points.investitureXP;
}

function updatePoolMaximums() {
    const might = parseInt(document.getElementById('attr-might').value);
    const coordination = parseInt(document.getElementById('attr-coordination').value);
    const perception = parseInt(document.getElementById('attr-perception').value);
    const intelligence = parseInt(document.getElementById('attr-intelligence').value);
    const presence = parseInt(document.getElementById('attr-presence').value);
    const connection = parseInt(document.getElementById('attr-connection').value);
    
    // Calculate pool maximums
    const physicalMax = might + coordination;
    const mentalMax = perception + intelligence;
    const socialMax = presence + connection;
    
    // Update display
    document.getElementById('max-physical').textContent = physicalMax;
    document.getElementById('max-mental').textContent = mentalMax;
    document.getElementById('max-social').textContent = socialMax;
    
    // Update pool inputs max values
    document.getElementById('pool-physical').max = physicalMax;
    document.getElementById('pool-mental').max = mentalMax;
    document.getElementById('pool-social').max = socialMax;
}

function createNewCharacter() {
    if (confirm('Create a new character? Unsaved changes will be lost.')) {
        // Reset character data to defaults
        characterData = {
            basics: {
                name: '',
                ancestry: 'human',
                path: 'agent',
                specialty: ''
            },
            attributes: {
                might: 2,
                coordination: 2,
                perception: 2,
                intelligence: 2,
                presence: 2,
                connection: 2
            },
            skills: {
                athletics: 0,
                authority: 0,
                endurance: 0,
                legerdemain: 0,
                lore: 0
            },
            talents: [],
            investiture: {
                type: 'none',
                abilities: []
            },
            goals: [''],
            equipment: [{ name: '', description: '' }],
            pools: {
                physical: 0,
                mental: 0,
                social: 0
            },
            notes: '',
            points: {
                attributePoints: 12,
                skillXP: 5,
                talentXP: 8,
                investitureXP: 7
            }
        };
        
        // Clear form
        document.getElementById('character-name').value = '';
        document.getElementById('ancestry').value = 'human';
        document.getElementById('path').value = 'agent';
        
        // Reset attributes
        for (const attr in characterData.attributes) {
            document.getElementById(`attr-${attr}`).value = 2;
        }
        
        // Reset skills
        for (const skill in characterData.skills) {
            document.getElementById(`skill-${skill}`).value = 0;
        }
        
        // Clear talents
        document.getElementById('talents-container').innerHTML = '';
        
        // Reset investiture
        document.getElementById('investiture-type').value = 'none';
        document.getElementById('investiture-details').innerHTML = '';
        
        // Clear goals (except first one)
        const goalsContainer = document.getElementById('goals-container');
        goalsContainer.innerHTML = `
            <div class="goal">
                <input type="text" placeholder="Enter a goal...">
                <button class="remove-goal">×</button>
            </div>
        `;
        
        // Clear equipment (except first one)
        const equipmentContainer = document.getElementById('equipment-container');
        equipmentContainer.innerHTML = `
            <div class="equipment-item">
                <input type="text" placeholder="Item name">
                <input type="text" placeholder="Description">
                <button class="remove-equipment">×</button>
            </div>
        `;
        
        // Reset pools
        document.getElementById('pool-physical').value = 0;
        document.getElementById('pool-mental').value = 0;
        document.getElementById('pool-social').value = 0;
        
        // Clear notes
        document.getElementById('character-notes').value = '';
        
        // Update path specialties
        updatePathSpecialties();
        
        // Update point displays
        updatePointsDisplay();
        
        // Update pool maximums
        updatePoolMaximums();
    }
}

function saveCharacter() {
    // Get character name
    const characterName = document.getElementById('character-name').value;
    
    if (!characterName) {
        alert('Please enter a character name before saving.');
        return;
    }
    
    // Update character data with current form values
    characterData.basics.name = characterName;
    characterData.pools.physical = parseInt(document.getElementById('pool-physical').value);
    characterData.pools.mental = parseInt(document.getElementById('pool-mental').value);
    characterData.pools.social = parseInt(document.getElementById('pool-social').value);
    characterData.notes = document.getElementById('character-notes').value;
    
    // Get existing saved characters
    let savedCharacters = JSON.parse(localStorage.getItem('cosmereRpgCharacters') || '{}');
    
    // Save/update character
    savedCharacters[characterName] = characterData;
    localStorage.setItem('cosmereRpgCharacters', JSON.stringify(savedCharacters));
    
    // Update saved characters dropdown
    populateSavedCharacters();
    
    alert(`Character "${characterName}" saved successfully!`);
}

function populateSavedCharacters() {
    const loadSelect = document.getElementById('load-character');
    
    // Clear existing options (except default)
    while (loadSelect.options.length > 1) {
        loadSelect.remove(1);
    }
    
    // Get saved characters
    const savedCharacters = JSON.parse(localStorage.getItem('cosmereRpgCharacters') || '{}');
    
    // Add character options
    Object.keys(savedCharacters).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        loadSelect.appendChild(option);
    });
}

function loadSelectedCharacter() {
    const loadSelect = document.getElementById('load-character');
    const selectedName = loadSelect.value;
    
    if (!selectedName) return;
    
    // Get saved characters
    const savedCharacters = JSON.parse(localStorage.getItem('cosmereRpgCharacters') || '{}');
    const character = savedCharacters[selectedName];
    
    if (character) {
        // Update character data
        characterData = character;
        
        // Update form fields
        document.getElementById('character-name').value = character.basics.name;
        document.getElementById('ancestry').value = character.basics.ancestry;
        document.getElementById('path').value = character.basics.path;
        
        // Update path specialties and select the saved specialty
        updatePathSpecialties();
        if (character.basics.specialty) {
            document.getElementById('specialty').value = character.basics.specialty;
        }
        
        // Update attributes
        for (const [attr, value] of Object.entries(character.attributes)) {
            document.getElementById(`attr-${attr}`).value = value;
        }
        
        // Update skills
        for (const [skill, value] of Object.entries(character.skills)) {
            document.getElementById(`skill-${skill}`).value = value;
        }
        
        // Update pools
        document.getElementById('pool-physical').value = character.pools.physical;
        document.getElementById('pool-mental').value = character.pools.mental;
        document.getElementById('pool-social').value = character.pools.social;
        
        // Update notes
        document.getElementById('character-notes').value = character.notes;
        
        // Rebuild talents
        const talentsContainer = document.getElementById('talents-container');
        talentsContainer.innerHTML = '';
        
        character.talents.forEach(talent => {
            // Create talent div
            const talentDiv = document.createElement('div');
            talentDiv.className = 'talent';
            
            // Create talent select
            const talentSelect = document.createElement('select');
            
            // Add talent options
            talentOptions[character.basics.ancestry].forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.toLowerCase().replace(' ', '-');
                optionEl.textContent = option;
                talentSelect.appendChild(optionEl);
            });
            
            talentSelect.value = talent;
            
            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-talent';
            removeButton.textContent = '×';
            removeButton.addEventListener('click', function() {
                talentsContainer.removeChild(talentDiv);
                const index = characterData.talents.indexOf(talent);
                if (index > -1) {
                    characterData.talents.splice(index, 1);
                    characterData.points.talentXP += 2;
                    updatePointsDisplay();
                }
            });
            
            talentDiv.appendChild(talentSelect);
            talentDiv.appendChild(removeButton);
            talentsContainer.appendChild(talentDiv);
        });
        
        // Set investiture type and rebuild abilities
        document.getElementById('investiture-type').value = character.investiture.type;
        updateInvestitureDetails();
        
        // Check the appropriate ability checkboxes
        character.investiture.abilities.forEach(ability => {
            const checkbox = document.getElementById(`ability-${ability.toLowerCase().replace(' ', '-')}`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Rebuild goals
        const goalsContainer = document.getElementById('goals-container');
        goalsContainer.innerHTML = '';
        
        character.goals.forEach(goal => {
            // Create goal div
            const goalDiv = document.createElement('div');
            goalDiv.className = 'goal';
            
            // Create goal input
            const goalInput = document.createElement('input');
            goalInput.type = 'text';
            goalInput.placeholder = 'Enter a goal...';
            goalInput.value = goal;
            
            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-goal';
            removeButton.textContent = '×';
            
            goalDiv.appendChild(goalInput);
            goalDiv.appendChild(removeButton);
            goalsContainer.appendChild(goalDiv);
            
            // Add event listeners
            goalInput.addEventListener('input', function(e) {
                const index = Array.from(goalsContainer.children).indexOf(goalDiv);
                characterData.goals[index] = e.target.value;
            });
            
            removeButton.addEventListener('click', function() {
                goalsContainer.removeChild(goalDiv);
                const index = Array.from(goalsContainer.children).indexOf(goalDiv);
                characterData.goals.splice(index, 1);
            });
        });
        
        // Rebuild equipment
        const equipmentContainer = document.getElementById('equipment-container');
        equipmentContainer.innerHTML = '';
        
        character.equipment.forEach(item => {
            // Create equipment div
            const equipmentDiv = document.createElement('div');
            equipmentDiv.className = 'equipment-item';
            
            // Create name input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = 'Item name';
            nameInput.value = item.name;
            
            // Create description input
            const descInput = document.createElement('input');
            descInput.type = 'text';
            descInput.placeholder = 'Description';
            descInput.value = item.description;
            
            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-equipment';
            removeButton.textContent = '×';
            
            equipmentDiv.appendChild(nameInput);
            equipmentDiv.appendChild(descInput);
            equipmentDiv.appendChild(removeButton);
            equipmentContainer.appendChild(equipmentDiv);
            
            // Add event listeners
            nameInput.addEventListener('input', function(e) {
                const index = Array.from(equipmentContainer.children).indexOf(equipmentDiv);
                characterData.equipment[index].name = e.target.value;
            });
            
            descInput.addEventListener('input', function(e) {
                const index = Array.from(equipmentContainer.children).indexOf(equipmentDiv);
                characterData.equipment[index].description = e.target.value;
            });
            
            removeButton.addEventListener('click', function() {
                equipmentContainer.removeChild(equipmentDiv);
                const index = Array.from(equipmentContainer.children).indexOf(equipmentDiv);
                characterData.equipment.splice(index, 1);
            });
        });
        
        // Update point displays
        updatePointsDisplay();
        
        // Update pool maximums
        updatePoolMaximums();
        
        alert(`Character "${selectedName}" loaded successfully!`);
        
        // Reset the select to default
        loadSelect.selectedIndex = 0;
    }
}
