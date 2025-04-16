import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const sourceFiles = [
  'smashingapps-architecture.md',
  'smashingapps-detailed-architecture.md',
  'smashingapps-solution-plan.md',
  'smashingapps-executive-summary.md',
  'smashingapps-analysis-summary.md'
];
const outputDir = 'smashingapps-analysis';
const imagesDir = path.join(outputDir, 'images');

// Ensure directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to extract Mermaid diagrams from markdown
function extractMermaidDiagrams(filePath) {
  console.log(`Extracting diagrams from ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.md');
  
  // Regular expression to match Mermaid code blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  
  let match;
  let diagramCount = 0;
  const diagramFiles = [];
  
  // Extract each Mermaid diagram
  while ((match = mermaidRegex.exec(content)) !== null) {
    diagramCount++;
    const diagramContent = match[1];
    const diagramName = `${fileName}-diagram-${diagramCount}`;
    const diagramFile = path.join(outputDir, `${diagramName}.mmd`);
    
    // Save the diagram to a .mmd file
    fs.writeFileSync(diagramFile, diagramContent);
    diagramFiles.push({ name: diagramName, file: diagramFile });
    
    console.log(`  Extracted diagram ${diagramCount} to ${diagramFile}`);
  }
  
  return diagramFiles;
}

// Function to create a Mermaid configuration file for high-quality rendering
function createMermaidConfig() {
  const configFile = path.join(outputDir, 'mermaid-config.json');
  const config = {
    theme: 'default',
    themeVariables: {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      primaryColor: '#4C78DD',
      primaryTextColor: '#fff',
      primaryBorderColor: '#4C78DD',
      lineColor: '#555',
      secondaryColor: '#73C1E8',
      tertiaryColor: '#f9f9f9'
    },
    flowchart: {
      htmlLabels: true,
      curve: 'basis'
    },
    sequence: {
      actorMargin: 50,
      boxMargin: 10,
      mirrorActors: false,
      bottomMarginAdj: 10
    },
    er: {
      layoutDirection: 'TB',
      entityPadding: 15,
      useMaxWidth: true
    },
    gantt: {
      leftPadding: 75,
      rightPadding: 20,
      topPadding: 20,
      bottomPadding: 20,
      gridLineStartPadding: 35
    }
  };
  
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`Created Mermaid configuration file at ${configFile}`);
  return configFile;
}

// Function to convert Mermaid diagrams to PNG with high quality
function convertMermaidToPNG(diagramFiles) {
  console.log('\nConverting diagrams to PNG with high quality settings...');
  
  // Create a Mermaid configuration file
  const configFile = createMermaidConfig();
  
  diagramFiles.forEach(({ name, file }) => {
    const outputFile = path.join(imagesDir, `${name}.png`);
    
    try {
      // Use mmdc (Mermaid CLI) to convert the diagram to PNG with high quality settings
      // -w: width, -H: height, -b: background color, -c: config file, -s: scale factor
      execSync(`mmdc -i "${file}" -o "${outputFile}" -b transparent -c "${configFile}" -w 2000 -s 2`);
      console.log(`  Converted ${file} to ${outputFile} (high quality)`);
    } catch (error) {
      console.error(`  Error converting ${file}: ${error.message}`);
    }
  });
}

// Function to copy markdown files to the output directory
function copyMarkdownFiles() {
  console.log('\nCopying markdown files to output directory...');
  
  sourceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const destFile = path.join(outputDir, file);
      fs.copyFileSync(file, destFile);
      console.log(`  Copied ${file} to ${destFile}`);
    } else {
      console.warn(`  Warning: File ${file} not found`);
    }
  });
}

// Function to update markdown files to reference local images
function updateMarkdownFiles(diagramFiles) {
  console.log('\nUpdating markdown files to reference local images...');
  
  sourceFiles.forEach(file => {
    const outputFile = path.join(outputDir, file);
    
    if (fs.existsSync(outputFile)) {
      let content = fs.readFileSync(outputFile, 'utf8');
      const fileName = path.basename(file, '.md');
      
      // Replace Mermaid code blocks with image references
      let diagramCount = 0;
      content = content.replace(/```mermaid\n[\s\S]*?```/g, () => {
        diagramCount++;
        const diagramName = `${fileName}-diagram-${diagramCount}`;
        return `![${diagramName}](./images/${diagramName}.png)`;
      });
      
      fs.writeFileSync(outputFile, content);
      console.log(`  Updated ${outputFile} with image references`);
    }
  });
}

// Create an index file that links to all the other files
function createIndexFile() {
  console.log('\nCreating index file...');
  
  const indexContent = `# SmashingApps Architecture Analysis

This folder contains a comprehensive analysis of the SmashingApps architecture, focusing on the AI components and how they're shared between Task Smasher and Article Smasher.

## Documents

1. [Overall Architecture](./smashingapps-architecture.md) - Diagrams and explanation of the overall platform architecture
2. [AI Architecture](./smashingapps-detailed-architecture.md) - Detailed analysis of the AI components
3. [Solution Plan](./smashingapps-solution-plan.md) - Comprehensive plan to address the identified issues
4. [Executive Summary](./smashingapps-executive-summary.md) - Concise summary of findings and recommendations
5. [Analysis Summary](./smashingapps-analysis-summary.md) - Summary of all analysis documents with diagrams
6. [Visual Gallery](./gallery.html) - HTML gallery of all diagrams

## Images

All diagrams are available as high-resolution PNG images in the [images](./images) directory.
`;
  
  fs.writeFileSync(path.join(outputDir, 'README.md'), indexContent);
  console.log(`  Created ${path.join(outputDir, 'README.md')}`);
}

// Main execution
try {
  // Extract diagrams from all source files
  let allDiagramFiles = [];
  sourceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const diagramFiles = extractMermaidDiagrams(file);
      allDiagramFiles = [...allDiagramFiles, ...diagramFiles];
    } else {
      console.warn(`Warning: File ${file} not found`);
    }
  });
  
  // Convert diagrams to PNG with high quality
  convertMermaidToPNG(allDiagramFiles);
  
  // Copy markdown files to output directory
  copyMarkdownFiles();
  
  // Update markdown files to reference local images
  updateMarkdownFiles(allDiagramFiles);
  
  // Create index file
  createIndexFile();
  
  console.log('\nProcess completed successfully!');
  console.log(`All files are organized in the '${outputDir}' directory.`);
  console.log(`High-quality images are available in the '${imagesDir}' directory.`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}