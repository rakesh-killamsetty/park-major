// Educational content about Parkinson's Disease
const parkinsonsInfo = {
    overview: {
        title: "Understanding Parkinson's Disease",
        content: `Parkinson's disease is a progressive neurological disorder that affects movement. It occurs when nerve cells (neurons) in the brain that produce dopamine begin to die. Dopamine is a neurotransmitter that helps control movement and emotional responses.

Key Facts:
• Affects approximately 1% of people over 60 years old
• More common in men than women
• Usually develops after age 50
• Can occur earlier (early-onset Parkinson's)`
    },
    
    symptoms: {
        title: "Common Symptoms",
        content: `Primary Motor Symptoms:
• Tremors (shaking) in hands, arms, legs, jaw, or head
• Muscle stiffness or rigidity
• Slowness of movement (bradykinesia)
• Impaired balance and coordination

Secondary Symptoms:
• Depression and anxiety
• Sleep problems
• Cognitive changes
• Speech and swallowing difficulties
• Constipation
• Fatigue
• Loss of smell`
    },
    
    stages: {
        title: "Disease Progression",
        content: `Parkinson's disease typically progresses through five stages:

Stage 1: Mild symptoms, usually on one side of the body
Stage 2: Symptoms on both sides, but balance is not affected
Stage 3: Balance problems, but still independent
Stage 4: Severe symptoms, but can still walk or stand
Stage 5: Wheelchair-bound or bedridden, requires constant care`
    },
    
    treatment: {
        title: "Treatment Options",
        content: `Current treatment approaches include:

1. Medications:
• Levodopa (most effective)
• Dopamine agonists
• MAO-B inhibitors
• COMT inhibitors

2. Surgical Options:
• Deep Brain Stimulation (DBS)
• Focused ultrasound

3. Lifestyle Management:
• Regular exercise
• Physical therapy
• Occupational therapy
• Speech therapy
• Dietary modifications`
    },
    
    research: {
        title: "Current Research",
        content: `Active areas of research include:

• Early detection methods
• New drug therapies
• Stem cell therapy
• Gene therapy
• Neuroprotective treatments
• Improved surgical techniques
• Digital health monitoring
• AI-assisted diagnosis`
    }
};

// Function to display educational content
function showEducationalContent() {
    const contentContainer = document.getElementById('educationalContent');
    if (!contentContainer) return;

    let html = '';
    for (const [key, section] of Object.entries(parkinsonsInfo)) {
        html += `
            <div class="education-section">
                <h2>${section.title}</h2>
                <div class="education-content">
                    ${section.content.split('\n').map(line => 
                        line.startsWith('•') ? `<p class="bullet-point">${line}</p>` : `<p>${line}</p>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    contentContainer.innerHTML = html;
}

// Initialize educational content
document.addEventListener('DOMContentLoaded', () => {
    showEducationalContent();
}); 