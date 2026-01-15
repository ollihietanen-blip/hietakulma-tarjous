/**
 * Load AI analysis instruction from file or use default
 * This allows easy editing of the instruction without code changes
 */

const DEFAULT_INSTRUCTION = `Analysoi nämä rakennussuunnitelmat (pohjapiirustus, julkisivupiirustus, leikkauspiirustus) ja anna suositukset puuelementeistä ja ristikoista.

Tarkista piirustuksista:
- Rakennuksen mitat (leveys, pituus, korkeus, kerrokset)
- Seinärakenteet ja niiden tyypit
- Kattorakenteet ja ristikot
- Aukot (ikkunat, ovet)
- Erikoisrakenteet

Palauta JSON-muodossa suositukset elementeistä ja ristikoista.`;

/**
 * Load AI instruction from markdown file
 * In production, this could fetch from a server or Convex
 */
export async function loadAIInstruction(): Promise<string> {
  try {
    // Try to load from prompts file
    const response = await fetch('/prompts/aiAnalysisInstruction.md');
    if (response.ok) {
      const text = await response.text();
      // Extract the instruction part (skip markdown headers and code blocks)
      const lines = text.split('\n');
      let inCodeBlock = false;
      const instructionLines: string[] = [];
      
      for (const line of lines) {
        // Skip markdown headers
        if (line.startsWith('#')) {
          continue;
        }
        // Skip code blocks
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        // Collect instruction text (skip empty lines at start)
        if (!inCodeBlock && (line.trim() || instructionLines.length > 0)) {
          instructionLines.push(line);
        }
      }
      
      const instruction = instructionLines.join('\n').trim();
      if (instruction && instruction.length > 50) { // Make sure we got actual content
        return instruction;
      }
    }
  } catch (error) {
    console.warn('Could not load AI instruction from file, using default:', error);
  }
  
  // Fallback to default
  return DEFAULT_INSTRUCTION;
}

/**
 * Get AI instruction with project-specific context
 */
export function getAIInstructionWithContext(
  baseInstruction: string,
  projectType?: string,
  previousExamples?: Array<{ input: string; output: string; success: boolean }>
): string {
  let instruction = baseInstruction;
  
  // Add project type context if available
  if (projectType) {
    instruction += `\n\nProjektityyppi: ${projectType}`;
  }
  
  // Add examples if available
  if (previousExamples && previousExamples.length > 0) {
    const successfulExamples = previousExamples.filter(e => e.success);
    if (successfulExamples.length > 0) {
      instruction += `\n\nEsimerkkejä onnistuneista analyyseistä:\n`;
      successfulExamples.slice(-3).forEach((ex, i) => {
        instruction += `\nEsimerkki ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}\n`;
      });
    }
  }
  
  return instruction;
}
