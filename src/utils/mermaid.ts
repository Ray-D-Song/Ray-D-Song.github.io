import mermaid from 'mermaid'

function setupMermaid(block: HTMLElement) {
  const preBlock = document.createElement('pre')
  preBlock.classList.add('mermaid', 'not-prose', 'mermaid-con')
  const code = block.querySelector('code')?.innerText
  preBlock.textContent = code ?? ''

  block.replaceWith(preBlock)
}

export default setupMermaid